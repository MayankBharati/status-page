import { NextResponse } from 'next/server';
import { prisma, testDatabaseConnection } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const isConnected = await testDatabaseConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        error: 'Database connection failed',
        environment: process.env.NODE_ENV,
        hasPostgresUrl: !!process.env.POSTGRES_PRISMA_URL,
        postgresUrlPrefix: process.env.POSTGRES_PRISMA_URL?.substring(0, 20) + '...',
      }, { status: 500 });
    }

    // Try to query the database
    const serviceCount = await prisma.services.count();
    const incidentCount = await prisma.incidents.count();
    const maintenanceCount = await prisma.maintenances.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      environment: process.env.NODE_ENV,
      hasPostgresUrl: !!process.env.POSTGRES_PRISMA_URL,
      postgresUrlPrefix: process.env.POSTGRES_PRISMA_URL?.substring(0, 20) + '...',
      data: {
        services: serviceCount,
        incidents: incidentCount,
        maintenance: maintenanceCount,
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      error: 'Database test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      hasPostgresUrl: !!process.env.POSTGRES_PRISMA_URL,
      postgresUrlPrefix: process.env.POSTGRES_PRISMA_URL?.substring(0, 20) + '...',
    }, { status: 500 });
  }
} 