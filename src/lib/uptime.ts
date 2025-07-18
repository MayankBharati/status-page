import { PrismaClient } from '@prisma/client';
import { subDays, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';

const prisma = new PrismaClient();

export interface UptimeData {
  date: string;
  uptime: number;
  downtime: number;
  totalMinutes: number;
}

export interface ServiceUptime {
  serviceId: string;
  serviceName: string;
  uptimePercentage: number;
  totalUptime: number;
  totalDowntime: number;
  lastIncident?: string;
  currentStatus: string;
}

// Calculate uptime for a service over a given period
export const calculateServiceUptime = async (
  serviceId: string,
  days: number = 30
): Promise<UptimeData[]> => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  const uptimeData: UptimeData[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    // Get incidents for this day
    const incidents = await prisma.incidents.findMany({
      where: {
        incident_services: {
          some: {
            serviceId: serviceId
          }
        },
        createdAt: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      include: {
        incident_services: {
          where: {
            serviceId: serviceId
          }
        }
      }
    });
    
    // Get maintenance for this day
    const maintenance = await prisma.maintenances.findMany({
      where: {
        scheduledStart: {
          lte: dayEnd
        },
        scheduledEnd: {
          gte: dayStart
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS']
        }
      }
    });
    
    // Calculate downtime minutes
    let downtimeMinutes = 0;
    
    // Add incident downtime
    incidents.forEach(incident => {
      const incidentStart = new Date(incident.createdAt);
      const incidentEnd = incident.resolvedAt ? new Date(incident.resolvedAt) : dayEnd;
      
      const start = incidentStart > dayStart ? incidentStart : dayStart;
      const end = incidentEnd < dayEnd ? incidentEnd : dayEnd;
      
      if (start < end) {
        downtimeMinutes += differenceInMinutes(end, start);
      }
    });
    
    // Add maintenance downtime
    maintenance.forEach(maint => {
      const maintStart = new Date(maint.scheduledStart);
      const maintEnd = new Date(maint.scheduledEnd);
      
      const start = maintStart > dayStart ? maintStart : dayStart;
      const end = maintEnd < dayEnd ? maintEnd : dayEnd;
      
      if (start < end) {
        downtimeMinutes += differenceInMinutes(end, start);
      }
    });
    
    const totalMinutes = 24 * 60; // 24 hours in minutes
    const uptimeMinutes = totalMinutes - downtimeMinutes;
    const uptimePercentage = (uptimeMinutes / totalMinutes) * 100;
    
    uptimeData.push({
      date: date.toISOString().split('T')[0],
      uptime: uptimePercentage,
      downtime: 100 - uptimePercentage,
      totalMinutes
    });
  }
  
  return uptimeData.reverse(); // Return in chronological order
};

// Calculate overall uptime for a service
export const calculateOverallUptime = async (
  serviceId: string,
  days: number = 30
): Promise<ServiceUptime> => {
  const service = await prisma.services.findUnique({
    where: { id: serviceId }
  });
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  const uptimeData = await calculateServiceUptime(serviceId, days);
  
  const totalUptime = uptimeData.reduce((sum, day) => sum + day.uptime, 0);
  const totalDowntime = uptimeData.reduce((sum, day) => sum + day.downtime, 0);
  const uptimePercentage = totalUptime / uptimeData.length;
  
  // Get last incident
  const lastIncident = await prisma.incidents.findFirst({
    where: {
      incident_services: {
        some: {
          serviceId: serviceId
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return {
    serviceId,
    serviceName: service.name,
    uptimePercentage: Math.round(uptimePercentage * 100) / 100,
    totalUptime: Math.round(totalUptime * 100) / 100,
    totalDowntime: Math.round(totalDowntime * 100) / 100,
    lastIncident: lastIncident?.title,
    currentStatus: service.status
  };
};

// Get uptime data for all services
export const getAllServicesUptime = async (days: number = 30): Promise<ServiceUptime[]> => {
  const services = await prisma.services.findMany();
  const uptimePromises = services.map(service => 
    calculateOverallUptime(service.id, days)
  );
  
  return Promise.all(uptimePromises);
}; 