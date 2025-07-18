import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { emitTeamCreated } from '@/lib/socket';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache first
    const cacheKey = `teams_${userId}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Optimized query: Get user's organizations with member count
    const userOrganizations = await prisma.organizations.findMany({
      where: {
        organization_members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        organization_members: {
          select: {
            id: true,
            userId: true,
            role: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Transform data efficiently
    const teams = userOrganizations.map(org => ({
      id: org.id,
      name: `${org.name} Team`,
      description: org.description || 'Team description',
      members: org.organization_members.map(member => {
        // Extract name and email from userId if it follows our pattern
        // userId format: user_email_timestamp
        const userIdParts = member.userId.split('_');
        let name = 'Unknown User';
        let email = 'unknown@example.com';
        
        if (userIdParts.length >= 3 && userIdParts[0] === 'user') {
          // Extract email from userId (remove timestamp)
          const emailPart = userIdParts.slice(1, -1).join('_');
          
          // Find the last underscore which separates email from timestamp
          const lastUnderscoreIndex = emailPart.lastIndexOf('_');
          if (lastUnderscoreIndex !== -1) {
            email = emailPart.substring(0, lastUnderscoreIndex);
            // Generate a name from email
            const emailName = email.split('@')[0];
            name = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, ' ');
          } else {
            email = emailPart;
            const emailName = email.split('@')[0];
            name = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, ' ');
          }
        } else if (member.userId.startsWith('user_')) {
          // Fallback for other user patterns
          name = `User ${member.userId.slice(5, 13)}`;
          email = `user-${member.userId.slice(5, 13)}@example.com`;
        } else {
          // Fallback for any other pattern
          name = `User ${member.userId.slice(0, 8)}`;
          email = `user-${member.userId.slice(0, 8)}@example.com`;
        }
        
        return {
          id: member.id,
          name: name,
          email: email,
          avatar: null,
          role: member.role,
          joinedAt: member.createdAt
        };
      })
    }));

    // Cache the result
    cache.set(cacheKey, {
      data: teams,
      timestamp: Date.now()
    });

    const response = NextResponse.json(teams);
    response.headers.set('Cache-Control', 'public, max-age=30');
    return response;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // Create a new organization (team)
    const newTeam = await prisma.organizations.create({
      data: {
        id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.replace(' Team', ''),
        slug: `team-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        description: description || `Team: ${name}`,
        updatedAt: new Date()
      }
    });

    // Add the current user as the owner of the new team
    await prisma.organization_members.create({
      data: {
        id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        organizationId: newTeam.id,
        role: 'OWNER',
        updatedAt: new Date()
      }
    });

    // Clear cache for this user
    const cacheKey = `teams_${userId}`;
    cache.delete(cacheKey);

    const teamResponse = {
      id: newTeam.id,
      name: `${newTeam.name} Team`,
      description: newTeam.description,
      members: []
    };

    // Emit WebSocket event for real-time updates
    emitTeamCreated('demo', newTeam.id, teamResponse);

    return NextResponse.json(teamResponse);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 