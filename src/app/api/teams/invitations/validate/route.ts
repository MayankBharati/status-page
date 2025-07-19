import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return mock data since the team invitations table isn't available yet
    // In the future, this will:
    // 1. Find the team invitation by token
    // 2. Check if it's expired
    // 3. Return invitation details if valid

    const mockTeamInvitation = {
      id: 'team_inv_123',
      email: 'user@example.com',
      teamName: 'Demo Team',
      organizationName: 'Demo Organization',
      role: 'MEMBER',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    return NextResponse.json(mockTeamInvitation);
  } catch (error) {
    console.error('Error validating team invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 