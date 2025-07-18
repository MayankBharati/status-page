import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { emitTeamMemberAdded } from '@/lib/socket';

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    // Get the organization (team) by ID
    const organization = await prisma.organizations.findUnique({
      where: { id: params.teamId }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if user is a member of this organization
    const userMembership = await prisma.organization_members.findFirst({
      where: {
        userId: userId,
        organizationId: params.teamId
      }
    });

    if (!userMembership) {
      return NextResponse.json({ error: 'You are not a member of this team' }, { status: 403 });
    }

    // Generate a unique userId for the new member (in a real app, this would be from Clerk)
    // For now, we'll use the email as a unique identifier
    const newUserId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    // Check if member already exists
    const existingMember = await prisma.organization_members.findFirst({
      where: {
        userId: newUserId,
        organizationId: params.teamId
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Member already exists in this team' }, { status: 409 });
    }

    // Add the new member to the organization
    const newMember = await prisma.organization_members.create({
      data: {
        id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: newUserId,
        organizationId: params.teamId,
        role: role as 'OWNER' | 'ADMIN' | 'MEMBER',
        updatedAt: new Date()
      }
    });

    const memberResponse = {
      id: newMember.id,
      name: name,
      email: email,
      avatar: null,
      role: newMember.role,
      joinedAt: newMember.createdAt
    };

    // Emit WebSocket event for real-time updates
    emitTeamMemberAdded('demo', params.teamId, newMember.id, memberResponse);

    return NextResponse.json(memberResponse);
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 