import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { emitIncidentUpdate } from '@/lib/socket';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incident = await prisma.incidents.findUnique({
      where: { id: params.id },
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
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
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
    const { status } = body;

    // Get the current incident to find the organization
    const currentIncident = await prisma.incidents.findUnique({
      where: { id: params.id },
      include: {
        organizations: true,
      },
    });

    if (!currentIncident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const updateData = {
      status: status.toUpperCase() as 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED',
      updatedAt: new Date(),
      ...(status.toUpperCase() === 'RESOLVED' && { resolvedAt: new Date() }),
    };

    const incident = await prisma.incidents.update({
      where: { id: params.id },
      data: updateData,
    });

    // Emit WebSocket event for incident status update
    if (currentIncident.organizations) {
      emitIncidentUpdate(currentIncident.organizations.slug, incident.id, incident.status, `Incident status updated to ${incident.status}`);
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
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

    await prisma.incidents.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 
 