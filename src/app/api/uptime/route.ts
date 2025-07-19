import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAllServicesUptime, calculateServiceUptime } from '@/lib/uptime';

// Force dynamic rendering to prevent static generation warnings
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');
    const days = parseInt(searchParams.get('days') || '30');

    // Limit days to prevent excessive computation
    const limitedDays = Math.min(days, 90);

    if (serviceId) {
      // Get uptime data for specific service
      const uptimeData = await calculateServiceUptime(serviceId, limitedDays);
      return NextResponse.json({ uptimeData });
    } else {
      // Get uptime data for all services
      const servicesUptime = await getAllServicesUptime(limitedDays);
      return NextResponse.json({ servicesUptime });
    }
  } catch (error) {
    console.error('Error fetching uptime data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 