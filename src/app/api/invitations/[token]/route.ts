import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // For now, return mock data since the invitations table isn't available yet
    // In the future, this will fetch from the invitations table
    const mockInvitation = {
      id: 'inv_123',
      email: 'user@example.com',
      teamName: 'Demo Team',
      organizationName: 'Demo Organization',
      role: 'MEMBER',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    return NextResponse.json(mockInvitation);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 