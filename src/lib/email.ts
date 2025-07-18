import nodemailer from 'nodemailer';

// Global email settings (will be updated from UI)
let globalEmailSettings = {
  emailUser: process.env.EMAIL_USER || 'your-email@gmail.com',
  emailPass: process.env.EMAIL_PASS || 'your-app-password',
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'your-email@gmail.com',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  emailEnabled: true
};

// Function to update email settings
export const updateEmailSettings = (settings: {
  emailUser: string;
  emailPass: string;
  emailFrom: string;
  adminEmail: string;
  emailEnabled: boolean;
}) => {
  globalEmailSettings = { ...settings };
};

// Function to get current email settings
export const getEmailSettings = () => {
  return { ...globalEmailSettings };
};

// Create transporter with current settings
const createTransporter = () => {
  if (!globalEmailSettings.emailEnabled) {
    throw new Error('Email notifications are disabled');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: globalEmailSettings.emailUser,
      pass: globalEmailSettings.emailPass,
    },
  });
};

interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}

export const sendEmailNotification = async (notification: EmailNotification) => {
  try {
    if (!globalEmailSettings.emailEnabled) {
      console.log('Email notifications are disabled');
      return;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: globalEmailSettings.emailFrom,
      to: notification.to,
      subject: notification.subject,
      html: notification.html,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Email templates
export const createServiceStatusEmail = (
  serviceName: string,
  oldStatus: string,
  newStatus: string,
  organizationName: string
) => ({
  subject: `Service Status Update: ${serviceName} - ${newStatus}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Service Status Update</h2>
      <p><strong>Organization:</strong> ${organizationName}</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Previous Status:</strong> <span style="color: #666;">${oldStatus}</span></p>
      <p><strong>Current Status:</strong> <span style="color: ${getStatusColor(newStatus)};">${newStatus}</span></p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated notification from your status page system.
      </p>
    </div>
  `,
});

export const createIncidentEmail = (
  incidentTitle: string,
  status: string,
  severity: string,
  organizationName: string,
  description?: string
) => ({
  subject: `Incident Alert: ${incidentTitle} - ${status}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d32f2f;">Incident Alert</h2>
      <p><strong>Organization:</strong> ${organizationName}</p>
      <p><strong>Incident:</strong> ${incidentTitle}</p>
      <p><strong>Status:</strong> <span style="color: ${getIncidentStatusColor(status)};">${status}</span></p>
      <p><strong>Severity:</strong> <span style="color: ${getSeverityColor(severity)};">${severity}</span></p>
      ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated notification from your status page system.
      </p>
    </div>
  `,
});

export const createMaintenanceEmail = (
  maintenanceTitle: string,
  status: string,
  organizationName: string,
  scheduledStart?: string,
  scheduledEnd?: string
) => ({
  subject: `Maintenance Update: ${maintenanceTitle} - ${status}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Maintenance Update</h2>
      <p><strong>Organization:</strong> ${organizationName}</p>
      <p><strong>Maintenance:</strong> ${maintenanceTitle}</p>
      <p><strong>Status:</strong> <span style="color: ${getMaintenanceStatusColor(status)};">${status}</span></p>
      ${scheduledStart ? `<p><strong>Scheduled Start:</strong> ${new Date(scheduledStart).toLocaleString()}</p>` : ''}
      ${scheduledEnd ? `<p><strong>Scheduled End:</strong> ${new Date(scheduledEnd).toLocaleString()}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated notification from your status page system.
      </p>
    </div>
  `,
});

// Helper functions for colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'operational': return '#4caf50';
    case 'degraded_performance': return '#ff9800';
    case 'partial_outage': return '#ff5722';
    case 'major_outage': return '#f44336';
    case 'under_maintenance': return '#2196f3';
    default: return '#666';
  }
};

const getIncidentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'investigating': return '#ff9800';
    case 'identified': return '#ff5722';
    case 'monitoring': return '#2196f3';
    case 'resolved': return '#4caf50';
    default: return '#666';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'minor': return '#4caf50';
    case 'major': return '#ff9800';
    case 'critical': return '#f44336';
    default: return '#666';
  }
};

const getMaintenanceStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled': return '#2196f3';
    case 'in_progress': return '#ff9800';
    case 'completed': return '#4caf50';
    case 'cancelled': return '#666';
    default: return '#666';
  }
}; 
 
