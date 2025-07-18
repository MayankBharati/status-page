import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailSettings } = body;

    if (!emailSettings) {
      return NextResponse.json({ error: 'Email settings are required' }, { status: 400 });
    }

    // Validate required fields
    if (!emailSettings.emailUser || !emailSettings.emailPass || !emailSettings.adminEmail) {
      return NextResponse.json({ 
        error: 'Email user, password, and admin email are required' 
      }, { status: 400 });
    }

    // Create transporter with provided settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailSettings.emailUser,
        pass: emailSettings.emailPass,
      },
    });

    // Create test email content
    const testEmailContent = {
      from: emailSettings.emailFrom || emailSettings.emailUser,
      to: emailSettings.adminEmail,
      subject: 'Status Page - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Configuration Test</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li><strong>From:</strong> ${emailSettings.emailFrom || emailSettings.emailUser}</li>
            <li><strong>To:</strong> ${emailSettings.adminEmail}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            If you received this email, your email configuration is working correctly!
          </p>
        </div>
      `,
    };

    // Send test email
    await transporter.sendMail(testEmailContent);

    return NextResponse.json({
      message: 'Test email sent successfully',
      details: {
        from: emailSettings.emailFrom || emailSettings.emailUser,
        to: emailSettings.adminEmail,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        return NextResponse.json({ 
          error: 'Invalid email credentials. Please check your email and app password.' 
        }, { status: 400 });
      }
      if (error.message.includes('Username and Password not accepted')) {
        return NextResponse.json({ 
          error: 'Gmail authentication failed. Make sure you\'re using an App Password, not your regular password.' 
        }, { status: 400 });
      }
      if (error.message.includes('Less secure app access')) {
        return NextResponse.json({ 
          error: 'Less secure app access is not supported. Please use an App Password with 2FA enabled.' 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to send test email. Please check your configuration.' 
    }, { status: 500 });
  }
} 