import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL,
      },
    },
  })
}

export const db = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db 
 
 