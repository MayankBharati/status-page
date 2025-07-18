import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { emitTeamDeleted, emitTeamUpdated } from '@/lib/socket';

export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Get the organization (teamId is actually the organization ID)
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

    // Update the organization
    const updatedOrganization = await prisma.organizations.update({
      where: { id: params.teamId },
      data: {
        name: name ? name.replace(' Team', '') : organization.name,
        description: description || organization.description,
        updatedAt: new Date()
      }
    });

    const teamResponse = {
      id: updatedOrganization.id,
      name: `${updatedOrganization.name} Team`,
      description: updatedOrganization.description
    };

    // Emit WebSocket event for real-time updates
    emitTeamUpdated('demo', params.teamId, teamResponse);

    return NextResponse.json(teamResponse);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the organization to check if it exists
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

    // Check if user has permission to delete (should be OWNER or ADMIN)
    if (userMembership.role !== 'OWNER' && userMembership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You do not have permission to delete this team' }, { status: 403 });
    }

    // Delete all organization members first (due to foreign key constraints)
    await prisma.organization_members.deleteMany({
      where: { organizationId: params.teamId }
    });

    // Delete all services associated with this organization
    await prisma.services.deleteMany({
      where: { organizationId: params.teamId }
    });

    // Delete all incidents associated with this organization
    await prisma.incidents.deleteMany({
      where: { organizationId: params.teamId }
    });

    // Delete all maintenance associated with this organization
    await prisma.maintenances.deleteMany({
      where: { organizationId: params.teamId }
    });

    // Finally, delete the organization itself
    await prisma.organizations.delete({
      where: { id: params.teamId }
    });

    // Emit WebSocket event for real-time updates
    emitTeamDeleted('demo', params.teamId);

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 