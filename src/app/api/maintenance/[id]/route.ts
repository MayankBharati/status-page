import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { emitMaintenanceUpdate } from '@/lib/socket';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const maintenance = await prisma.maintenances.findUnique({
      where: { id: params.id },
      include: {
        maintenance_services: {
          include: {
            services: true
          }
        }
      }
    });

    if (!maintenance) {
      return NextResponse.json({ error: 'Maintenance window not found' }, { status: 404 });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance window:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, scheduledStart, scheduledEnd, status, serviceIds } = body;

    // Get the current maintenance to find the organization
    const currentMaintenance = await prisma.maintenances.findUnique({
      where: { id: params.id },
      include: {
        organizations: true,
      },
    });

    if (!currentMaintenance) {
      return NextResponse.json({ error: 'Maintenance window not found' }, { status: 404 });
    }

    // Update maintenance with service associations
    const maintenance = await prisma.maintenances.update({
      where: { id: params.id },
      data: {
        title: title || currentMaintenance.title,
        description: description || currentMaintenance.description,
        scheduledStart: scheduledStart ? new Date(scheduledStart) : currentMaintenance.scheduledStart,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : currentMaintenance.scheduledEnd,
        status: status ? status.toUpperCase() as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' : currentMaintenance.status,
        updatedAt: new Date(),
        // Update service associations if provided
        ...(serviceIds && {
          maintenance_services: {
            deleteMany: {}, // Remove all existing associations
            create: serviceIds.map((serviceId: string) => ({
              id: crypto.randomUUID(),
              serviceId: serviceId,
            }))
          }
        })
      },
      include: {
        maintenance_services: {
          include: {
            services: true
          }
        }
      }
    });

    // Emit WebSocket event for maintenance update
    if (currentMaintenance.organizations) {
      emitMaintenanceUpdate(currentMaintenance.organizations.slug, maintenance.id, maintenance.status);
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.maintenances.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Maintenance deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 