import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { updateEmailSettings, getEmailSettings } from '@/lib/email';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return current settings
    const currentSettings = getEmailSettings();
    return NextResponse.json({
      emailSettings: currentSettings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailSettings: newEmailSettings } = body;

    if (!newEmailSettings) {
      return NextResponse.json({ error: 'Email settings are required' }, { status: 400 });
    }

    // Validate email settings
    if (newEmailSettings.emailEnabled) {
      if (!newEmailSettings.emailUser || !newEmailSettings.emailPass || !newEmailSettings.adminEmail) {
        return NextResponse.json({ 
          error: 'Email user, password, and admin email are required when email is enabled' 
        }, { status: 400 });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmailSettings.emailUser)) {
        return NextResponse.json({ error: 'Invalid email user format' }, { status: 400 });
      }
      if (!emailRegex.test(newEmailSettings.adminEmail)) {
        return NextResponse.json({ error: 'Invalid admin email format' }, { status: 400 });
      }
      if (newEmailSettings.emailFrom && !emailRegex.test(newEmailSettings.emailFrom)) {
        return NextResponse.json({ error: 'Invalid from email format' }, { status: 400 });
      }
    }

    // Update global email settings
    updateEmailSettings(newEmailSettings);

    // In a production environment, you would save these to a database
    // For now, we'll just update the global settings
    console.log('Email settings updated:', {
      emailUser: newEmailSettings.emailUser,
      emailFrom: newEmailSettings.emailFrom,
      adminEmail: newEmailSettings.adminEmail,
      emailEnabled: newEmailSettings.emailEnabled
      // Note: We don't log the password for security
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      emailSettings: {
        emailUser: newEmailSettings.emailUser,
        emailFrom: newEmailSettings.emailFrom,
        adminEmail: newEmailSettings.adminEmail,
        emailEnabled: newEmailSettings.emailEnabled
        // Note: We don't return the password for security
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 