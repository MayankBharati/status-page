import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all services
    const services = await prisma.services.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true
      }
    });

    // Get all incidents
    const incidents = await prisma.incidents.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        resolvedAt: true
      }
    });

    // Get all maintenance
    const maintenance = await prisma.maintenances.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true
      }
    });

    return NextResponse.json({
      services: services,
      incidents: incidents,
      maintenance: maintenance,
      counts: {
        services: services.length,
        incidents: incidents.length,
        maintenance: maintenance.length
      }
    });

  } catch (error) {
    console.error('Error fetching test data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 