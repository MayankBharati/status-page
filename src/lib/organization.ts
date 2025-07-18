import { prisma } from '@/lib/prisma';

export async function getOrCreateDefaultOrganization(userId: string) {
  try {
    // First, try to find the demo organization
    let organization = await prisma.organizations.findUnique({
      where: { slug: 'demo' },
    });

    // If demo organization doesn't exist, create it
    if (!organization) {
      organization = await prisma.organizations.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Demo Company',
          slug: 'demo',
          description: 'This is a demo status page showing various service states',
          updatedAt: new Date(),
        },
      });
    }

    // Check if user is already a member of this organization
    const existingMember = await prisma.organization_members.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: userId,
        },
      },
    });

    // If user is not a member, add them
    if (!existingMember) {
      await prisma.organization_members.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: organization.id,
          userId: userId,
          role: 'OWNER',
          updatedAt: new Date(),
        },
      });
    }

    return organization;
  } catch (error) {
    console.error('Error getting or creating demo organization:', error);
    throw error;
  }
} 