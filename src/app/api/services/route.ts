import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultOrganization } from '@/lib/organization';
import { emitServiceStatusUpdate } from '@/lib/socket';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const services = await prisma.services.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
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
    const { name, description, status } = body;

    // Ensure database connection
    try {
      await prisma.$connect();
    } catch (connectionError) {
      console.error('Database connection error:', connectionError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }

    // Get or create default organization
    const organization = await getOrCreateDefaultOrganization(userId);

    const service = await prisma.services.create({
      data: {
        id: crypto.randomUUID(),
        name,
        description,
        status: (status || 'OPERATIONAL').toUpperCase() as 'OPERATIONAL' | 'DEGRADED_PERFORMANCE' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE' | 'UNDER_MAINTENANCE',
        organizationId: organization.id,
        updatedAt: new Date(),
      },
    });

    // Emit WebSocket event for new service
    emitServiceStatusUpdate(organization.slug, service.id, service.status);

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again in a moment.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 