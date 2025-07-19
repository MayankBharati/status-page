import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const debugInfo = {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    
    // Environment variables
    hasPostgresUrl: !!process.env.POSTGRES_PRISMA_URL,
    hasPostgresPassword: !!process.env.POSTGRES_PASSWORD,
    hasNextPublicAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    
    // Connection string analysis
    postgresUrlLength: process.env.POSTGRES_PRISMA_URL?.length || 0,
    postgresUrlStartsWith: process.env.POSTGRES_PRISMA_URL?.substring(0, 20) + '...',
    postgresUrlEndsWith: '...' + process.env.POSTGRES_PRISMA_URL?.substring(-20),
    
    // Test different connection methods
    connectionTests: {} as Record<string, { success: boolean; message?: string; error?: string; stack?: string }>,
  };

  // Test 1: Basic Prisma client creation
  try {
    const prisma1 = new PrismaClient({
      datasources: {
        db: {
          url: process.env.POSTGRES_PRISMA_URL,
        },
      },
    });
    await prisma1.$connect();
    debugInfo.connectionTests.basicPrisma = { success: true, message: 'Connected successfully' };
    await prisma1.$disconnect();
  } catch (error) {
    debugInfo.connectionTests.basicPrisma = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    };
  }

  // Test 2: Try with different connection string format
  try {
    const alternativeUrl = process.env.POSTGRES_PRISMA_URL?.replace('?pgbouncer=true&connection_limit=1&pool_timeout=20', '?sslmode=require');
    const prisma2 = new PrismaClient({
      datasources: {
        db: {
          url: alternativeUrl,
        },
      },
    });
    await prisma2.$connect();
    debugInfo.connectionTests.alternativeUrl = { success: true, message: 'Connected with alternative URL' };
    await prisma2.$disconnect();
  } catch (error) {
    debugInfo.connectionTests.alternativeUrl = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Test 3: Try with direct connection (no pooling)
  try {
    const directUrl = process.env.POSTGRES_PRISMA_URL?.replace('?pgbouncer=true&connection_limit=1&pool_timeout=20', '');
    const prisma3 = new PrismaClient({
      datasources: {
        db: {
          url: directUrl,
        },
      },
    });
    await prisma3.$connect();
    debugInfo.connectionTests.directUrl = { success: true, message: 'Connected with direct URL' };
    await prisma3.$disconnect();
  } catch (error) {
    debugInfo.connectionTests.directUrl = { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  return NextResponse.json(debugInfo);
} 