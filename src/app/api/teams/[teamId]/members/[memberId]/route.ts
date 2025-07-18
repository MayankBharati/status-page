import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { emitTeamMemberRoleChanged, emitTeamMemberRemoved } from '@/lib/socket';

export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    // Check if the member exists
    const existingMember = await prisma.organization_members.findUnique({
      where: { id: params.memberId }
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
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

    // Only OWNER or ADMIN can change roles
    if (userMembership.role !== 'OWNER' && userMembership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You do not have permission to change member roles' }, { status: 403 });
    }

    // Update the member's role
    const updatedMember = await prisma.organization_members.update({
      where: { id: params.memberId },
      data: {
        role: role as 'OWNER' | 'ADMIN' | 'MEMBER',
        updatedAt: new Date()
      }
    });

    // Emit WebSocket event for real-time updates
    emitTeamMemberRoleChanged('demo', params.teamId, params.memberId, updatedMember.role);

    return NextResponse.json({
      id: updatedMember.id,
      role: updatedMember.role
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== 'transfer-ownership') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Check if the member exists
    const existingMember = await prisma.organization_members.findUnique({
      where: { id: params.memberId }
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if user is the current owner
    const userMembership = await prisma.organization_members.findFirst({
      where: {
        userId: userId,
        organizationId: params.teamId
      }
    });

    if (!userMembership || userMembership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only the current owner can transfer ownership' }, { status: 403 });
    }

    // Transfer ownership to the specified member
    const updatedMember = await prisma.organization_members.update({
      where: { id: params.memberId },
      data: {
        role: 'OWNER',
        updatedAt: new Date()
      }
    });

    // Emit WebSocket event for real-time updates
    emitTeamMemberRoleChanged('demo', params.teamId, params.memberId, updatedMember.role);

    return NextResponse.json({
      id: updatedMember.id,
      role: updatedMember.role,
      message: 'Ownership transferred successfully'
    });
  } catch (error) {
    console.error('Error transferring ownership:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the member exists before trying to delete
    const existingMember = await prisma.organization_members.findUnique({
      where: { id: params.memberId }
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
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

    // Only OWNER or ADMIN can remove members
    if (userMembership.role !== 'OWNER' && userMembership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You do not have permission to remove members' }, { status: 403 });
    }

    // If trying to remove an OWNER, check if it's the last owner
    if (existingMember.role === 'OWNER') {
      // Count how many owners are in the team
      const ownerCount = await prisma.organization_members.count({
        where: {
          organizationId: params.teamId,
          role: 'OWNER'
        }
      });

      // If this is the last owner, prevent removal
      if (ownerCount <= 1) {
        return NextResponse.json({ 
          error: 'Cannot remove the last owner. Please transfer ownership to another member first.' 
        }, { status: 400 });
      }
    }

    // If user is trying to remove themselves, add a warning but allow it
    const isRemovingSelf = existingMember.userId === userId;
    
    // Delete the member from the organization
    await prisma.organization_members.delete({
      where: { id: params.memberId }
    });

    // Emit WebSocket event for real-time updates
    emitTeamMemberRemoved('demo', params.teamId, params.memberId);

    const message = isRemovingSelf 
      ? 'You have been removed from the team successfully' 
      : 'Member removed successfully';

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 