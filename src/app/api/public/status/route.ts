import { NextRequest, NextResponse } from 'next/server';
import { services as Service, maintenance_services as MaintenanceService } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering to prevent static generation warnings
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationSlug = searchParams.get('org');

    if (!organizationSlug) {
      return NextResponse.json(
        { error: 'Organization slug is required' },
        { status: 400 }
      );
    }

    // Get organization with services
    const organization = await prisma.organizations.findUnique({
      where: { slug: organizationSlug },
      include: {
        services: true,
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get all active incidents for the org
    const incidents = await prisma.incidents.findMany({
      where: {
        organizationId: organization.id,
        status: {
          in: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING']
        }
      },
      include: {
        incident_services: {
          include: {
            services: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all scheduled maintenance for the org
    const maintenances = await prisma.maintenances.findMany({
      where: {
        organizationId: organization.id,
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS']
        }
      },
      include: {
        maintenance_services: {
          include: {
            services: true
          }
        }
      },
      orderBy: { scheduledStart: 'asc' }
    });

    // Calculate overall status
    const services: Service[] = organization.services as Service[];
    const operationalServices = services.filter((s) => s.status === 'OPERATIONAL').length;
    const totalServices = services.length;
    const overallStatus = totalServices > 0 ? (operationalServices / totalServices) * 100 : 100;

    // Determine overall health
    let health = 'operational';
    if (overallStatus < 50) {
      health = 'major_outage';
    } else if (overallStatus < 75) {
      health = 'partial_outage';
    } else if (overallStatus < 95) {
      health = 'degraded';
    }

    const response = {
      organization: {
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
      },
      status: {
        overall: health,
        uptime: Math.round(overallStatus * 100) / 100,
        services: {
          total: totalServices,
          operational: operationalServices,
          degraded: services.filter((s) => s.status === 'DEGRADED_PERFORMANCE').length,
          partial_outage: services.filter((s) => s.status === 'PARTIAL_OUTAGE').length,
          major_outage: services.filter((s) => s.status === 'MAJOR_OUTAGE').length,
          maintenance: services.filter((s) => s.status === 'UNDER_MAINTENANCE').length,
        }
      },
      services: services.map((service) => {
        // Find incidents affecting this service
        const serviceIncidents = incidents.filter(incident => 
          incident.incident_services.some(link => link.serviceId === service.id)
        );
        
        // Find maintenance affecting this specific service
        const serviceMaintenance = maintenances.find(maintenance => 
          maintenance.maintenance_services.some((link: MaintenanceService & { services: Service }) => link.serviceId === service.id)
        );
        
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          status: service.status.toLowerCase().replace(/_/g, ' '),
          incidents: serviceIncidents.map(incident => ({
            id: incident.id,
            title: incident.title,
            status: incident.status.toLowerCase(),
            severity: incident.severity.toLowerCase(),
            created_at: incident.createdAt,
          })),
          maintenance: serviceMaintenance ? {
            id: serviceMaintenance.id,
            title: serviceMaintenance.title,
            status: serviceMaintenance.status.toLowerCase().replace(/_/g, ' '),
            scheduled_start: serviceMaintenance.scheduledStart,
            scheduled_end: serviceMaintenance.scheduledEnd,
          } : null,
        };
      }),
      incidents: incidents.map(incident => ({
        id: incident.id,
        title: incident.title,
        status: incident.status.toLowerCase(),
        severity: incident.severity.toLowerCase(),
        created_at: incident.createdAt,
        affected_services: incident.incident_services.map(link => ({
          id: link.services.id,
          name: link.services.name
        }))
      })),
      maintenance: maintenances.map(maintenance => ({
        id: maintenance.id,
        title: maintenance.title,
        status: maintenance.status.toLowerCase().replace(/_/g, ' '),
        scheduled_start: maintenance.scheduledStart,
        scheduled_end: maintenance.scheduledEnd,
        affected_services: maintenance.maintenance_services.map((link: MaintenanceService & { services: Service }) => ({
          id: link.services.id,
          name: link.services.name
        }))
      })),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching public status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 