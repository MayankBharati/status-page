import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering to prevent static generation warnings
export const dynamic = 'force-dynamic';

interface StatusData {
  organization: {
    name: string;
    slug: string;
    description: string | null;
  };
  status: {
    overall: string;
    uptime: number;
    services: {
      total: number;
      operational: number;
      degraded: number;
      partial_outage: number;
      major_outage: number;
      maintenance: number;
    };
  };
  services: Array<{
    id: string;
    name: string;
    status: string;
    updated_at: Date;
  }>;
  incidents: Array<{
    id: string;
    title: string;
    status: string;
    severity: string;
    created_at: Date;
    affected_services: Array<{
      id: string;
      name: string;
    }>;
  }>;
  maintenance: Array<{
    id: string;
    title: string;
    status: string;
    scheduled_start: Date;
    scheduled_end: Date;
  }>;
  timestamp: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('org');
    const serviceId = searchParams.get('service');
    const format = searchParams.get('format') || 'json';

    if (!orgSlug) {
      return NextResponse.json(
        { error: 'Organization slug is required' },
        { status: 400 }
      );
    }

    // Get organization
    const organization = await prisma.organizations.findUnique({
      where: { slug: orgSlug },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get services
    const services = await prisma.services.findMany({
      where: { organizationId: organization.id },
      ...(serviceId && { where: { id: serviceId } }),
    });

    // Get active incidents
    const incidents = await prisma.incidents.findMany({
      where: {
        organizationId: organization.id,
        status: { not: 'RESOLVED' },
      },
      include: {
        incident_services: {
          include: {
            services: true,
          },
        },
      },
    });

    // Get scheduled maintenance
    const maintenance = await prisma.maintenances.findMany({
      where: {
        organizationId: organization.id,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
    });

    // Calculate overall status
    const hasOutage = services.some(s => 
      s.status === 'MAJOR_OUTAGE' || s.status === 'PARTIAL_OUTAGE'
    );
    const hasDegraded = services.some(s => s.status === 'DEGRADED_PERFORMANCE');
    const overallStatus = hasOutage ? 'outage' : hasDegraded ? 'degraded' : 'operational';

    // Calculate uptime percentages (simplified)
    const operationalServices = services.filter(s => s.status === 'OPERATIONAL').length;
    const uptimePercentage = services.length > 0 ? (operationalServices / services.length) * 100 : 100;

    const statusData: StatusData = {
      organization: {
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
      },
      status: {
        overall: overallStatus,
        uptime: Math.round(uptimePercentage * 100) / 100,
        services: {
          total: services.length,
          operational: operationalServices,
          degraded: services.filter(s => s.status === 'DEGRADED_PERFORMANCE').length,
          partial_outage: services.filter(s => s.status === 'PARTIAL_OUTAGE').length,
          major_outage: services.filter(s => s.status === 'MAJOR_OUTAGE').length,
          maintenance: services.filter(s => s.status === 'UNDER_MAINTENANCE').length,
        },
      },
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        status: service.status.toLowerCase().replace('_', ' '),
        updated_at: service.updatedAt,
      })),
      incidents: incidents.map(incident => ({
        id: incident.id,
        title: incident.title,
        status: incident.status.toLowerCase(),
        severity: incident.severity.toLowerCase(),
        created_at: incident.createdAt,
        affected_services: incident.incident_services.map(is => ({
          id: is.services.id,
          name: is.services.name,
        })),
      })),
      maintenance: maintenance.map(maint => ({
        id: maint.id,
        title: maint.title,
        status: maint.status.toLowerCase().replace('_', ' '),
        scheduled_start: maint.scheduledStart,
        scheduled_end: maint.scheduledEnd,
      })),
      timestamp: new Date().toISOString(),
    };

    // Return in different formats
    if (format === 'xml') {
      const xml = generateXML(statusData);
      return new NextResponse(xml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    } else if (format === 'txt') {
      const text = generateText(statusData);
      return new NextResponse(text, {
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      return NextResponse.json(statusData);
    }
  } catch (error) {
    console.error('Error in external status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateXML(data: StatusData): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<status>
  <organization>
    <name>${data.organization.name}</name>
    <slug>${data.organization.slug}</slug>
    <description>${data.organization.description || ''}</description>
  </organization>
  <status>
    <overall>${data.status.overall}</overall>
    <uptime>${data.status.uptime}</uptime>
    <services>
      <total>${data.status.services.total}</total>
      <operational>${data.status.services.operational}</operational>
      <degraded>${data.status.services.degraded}</degraded>
      <partial_outage>${data.status.services.partial_outage}</partial_outage>
      <major_outage>${data.status.services.major_outage}</major_outage>
      <maintenance>${data.status.services.maintenance}</maintenance>
    </services>
  </status>
  <services>
    ${data.services.map((service) => `
    <service>
      <id>${service.id}</id>
      <name>${service.name}</name>
      <status>${service.status}</status>
      <updated_at>${service.updated_at}</updated_at>
    </service>`).join('')}
  </services>
  <incidents>
    ${data.incidents.map((incident) => `
    <incident>
      <id>${incident.id}</id>
      <title>${incident.title}</title>
      <status>${incident.status}</status>
      <severity>${incident.severity}</severity>
      <created_at>${incident.created_at}</created_at>
    </incident>`).join('')}
  </incidents>
  <maintenance>
    ${data.maintenance.map((maint) => `
    <maintenance>
      <id>${maint.id}</id>
      <title>${maint.title}</title>
      <status>${maint.status}</status>
      <scheduled_start>${maint.scheduled_start}</scheduled_start>
      <scheduled_end>${maint.scheduled_end}</scheduled_end>
    </maintenance>`).join('')}
  </maintenance>
  <timestamp>${data.timestamp}</timestamp>
</status>`;

  return xml;
}

function generateText(data: StatusData): string {
  const text = `${data.organization.name} Status Page
${'='.repeat(data.organization.name.length + 12)}

Overall Status: ${data.status.overall.toUpperCase()}
Uptime: ${data.status.uptime}%

Services (${data.status.services.total} total):
- Operational: ${data.status.services.operational}
- Degraded: ${data.status.services.degraded}
- Partial Outage: ${data.status.services.partial_outage}
- Major Outage: ${data.status.services.major_outage}
- Under Maintenance: ${data.status.services.maintenance}

${data.services.length > 0 ? '\nService Status:' : ''}
${data.services.map((service) => 
  `- ${service.name}: ${service.status}`
).join('\n')}

${data.incidents.length > 0 ? '\nActive Incidents:' : ''}
${data.incidents.map((incident) => 
  `- ${incident.title} (${incident.severity}): ${incident.status}`
).join('\n')}

${data.maintenance.length > 0 ? '\nScheduled Maintenance:' : ''}
${data.maintenance.map((maint) => 
  `- ${maint.title}: ${maint.status}`
).join('\n')}

Last updated: ${new Date(data.timestamp).toLocaleString()}`;

  return text;
} 
 
 