import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { emitIncidentUpdate } from '@/lib/socket';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, status } = body;

    // Get the incident to find the organization
    const incident = await prisma.incidents.findUnique({
      where: { id: params.id },
      include: {
        organizations: true,
      },
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    // Create the update
    const update = await prisma.incident_updates.create({
      data: {
        id: crypto.randomUUID(),
        incidentId: params.id,
        message,
        status: status.toUpperCase() as 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED',
      },
    });

    // Update the incident status if it's being resolved
    if (status.toUpperCase() === 'RESOLVED') {
      await prisma.incidents.update({
        where: { id: params.id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Update the incident status to match the update
      await prisma.incidents.update({
        where: { id: params.id },
        data: {
          status: status.toUpperCase() as 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED',
          updatedAt: new Date(),
        },
      });
    }

    // Emit WebSocket event for incident update
    if (incident.organizations) {
      emitIncidentUpdate(incident.organizations.slug, params.id, status.toUpperCase(), message);
    }

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error('Error adding incident update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 