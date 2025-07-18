import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultOrganization } from '@/lib/organization';
import { emitMaintenanceUpdate } from '@/lib/socket';
import { sendEmailNotification, createMaintenanceEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const maintenances = await prisma.maintenances.findMany({
      include: {
        maintenance_services: {
          include: {
            services: true
          }
        }
      },
      orderBy: { scheduledStart: 'desc' },
    });

    return NextResponse.json(maintenances);
  } catch (error) {
    console.error('Error fetching maintenance windows:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, scheduledStart, scheduledEnd, serviceIds } = body;

    // Get or create default organization
    const organization = await getOrCreateDefaultOrganization(userId);

    // Create maintenance with service associations
    const maintenance = await prisma.maintenances.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description,
        status: 'SCHEDULED',
        organizationId: organization.id,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        updatedAt: new Date(),
        maintenance_services: {
          create: serviceIds?.map((serviceId: string) => ({
            id: crypto.randomUUID(),
            serviceId: serviceId,
          })) || []
        }
      },
      include: {
        maintenance_services: {
          include: {
            services: true
          }
        }
      }
    });

    // Emit WebSocket event for new maintenance
    emitMaintenanceUpdate(organization.slug, maintenance.id, maintenance.status);

    // Send email notification for new maintenance
    const emailContent = createMaintenanceEmail(
      maintenance.title,
      maintenance.status,
      organization.name,
      maintenance.scheduledStart.toISOString(),
      maintenance.scheduledEnd.toISOString()
    );
    
    if (process.env.ADMIN_EMAIL) {
      await sendEmailNotification({
        to: process.env.ADMIN_EMAIL,
        ...emailContent,
      });
    }

    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance window:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 