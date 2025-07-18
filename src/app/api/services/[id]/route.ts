import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { emitServiceStatusUpdate } from '@/lib/socket';
import { sendEmailNotification, createServiceStatusEmail, getEmailSettings } from '@/lib/email';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = await prisma.services.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, status } = body;

    // Get the current service to find the organization
    const currentService = await prisma.services.findUnique({
      where: { id: params.id },
      include: {
        organizations: true,
      },
    });

    if (!currentService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = await prisma.services.update({
      where: { id: params.id },
      data: {
        name,
        description,
        status: status?.toUpperCase() as 'OPERATIONAL' | 'DEGRADED_PERFORMANCE' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE' | 'UNDER_MAINTENANCE',
        updatedAt: new Date(),
      },
    });

    // Emit WebSocket event for service status update
    if (status && currentService.organizations) {
      emitServiceStatusUpdate(currentService.organizations.slug, service.id, service.status);
      
      // Send email notification for status change
      if (status !== currentService.status) {
        try {
          const emailContent = createServiceStatusEmail(
            service.name,
            currentService.status,
            service.status,
            currentService.organizations.name
          );
          
          // Get current email settings and send notification
          const emailSettings = getEmailSettings();
          if (emailSettings.emailEnabled && emailSettings.adminEmail) {
            await sendEmailNotification({
              to: emailSettings.adminEmail,
              ...emailContent,
            });
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't fail the entire request if email fails
        }
      }
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.services.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 
 