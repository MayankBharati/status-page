import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Function to create Prisma client with proper configuration
const createPrismaClient = () => {
  const databaseUrl = process.env.POSTGRES_PRISMA_URL;
  
  if (!databaseUrl) {
    throw new Error('POSTGRES_PRISMA_URL environment variable is not set');
  }

  console.log('Creating Prisma client with URL:', databaseUrl.replace(/:[^:@]*@/, ':****@')); // Hide password in logs

  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

// Create the Prisma client instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// In development, use a global instance to prevent multiple connections
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Add connection test function
export const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}; 