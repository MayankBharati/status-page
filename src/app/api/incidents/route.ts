import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { getOrCreateDefaultOrganization } from '@/lib/organization';
import { emitIncidentUpdate } from '@/lib/socket';
import { sendEmailNotification, createIncidentEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incidents = await prisma.incidents.findMany({
      include: {
        incident_services: {
          include: {
            services: true
          }
        },
        incident_updates: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
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
    const { title, description, status, severity, serviceIds } = body;

    // Get or create default organization
    const organization = await getOrCreateDefaultOrganization(userId);

    const incident = await prisma.incidents.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description,
        status: (status || 'INVESTIGATING').toUpperCase() as 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED',
        severity: (severity || 'MINOR').toUpperCase() as 'MINOR' | 'MAJOR' | 'CRITICAL',
        organizationId: organization.id,
        updatedAt: new Date(),
      },
    });

    // If serviceIds are provided, create incident_services relationships
    if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      const incidentServices = serviceIds.map((serviceId: string) => ({
        id: crypto.randomUUID(),
        incidentId: incident.id,
        serviceId,
      }));

      await prisma.incident_services.createMany({
        data: incidentServices,
      });
    }

    // Emit WebSocket event for new incident
    emitIncidentUpdate(organization.slug, incident.id, incident.status, `New incident: ${incident.title}`);

    // Send email notification for new incident
    const emailContent = createIncidentEmail(
      incident.title,
      incident.status,
      incident.severity,
      organization.name,
      incident.description
    );
    
    if (process.env.ADMIN_EMAIL) {
      await sendEmailNotification({
        to: process.env.ADMIN_EMAIL,
        ...emailContent,
      });
    }

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 