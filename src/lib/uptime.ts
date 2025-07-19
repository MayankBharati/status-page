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

// Calculate uptime for a service over a given period (optimized)
export const calculateServiceUptime = async (
  serviceId: string,
  days: number = 30
): Promise<UptimeData[]> => {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  
  // Get all incidents for the service in one query
  const incidents = await prisma.incidents.findMany({
    where: {
      incident_services: {
        some: {
          serviceId: serviceId
        }
      },
      createdAt: {
        gte: startDate
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
  
  // Get all maintenance for the service in one query
  const maintenance = await prisma.maintenances.findMany({
    where: {
      scheduledStart: {
        gte: startDate
      },
      status: {
        in: ['SCHEDULED', 'IN_PROGRESS']
      }
    }
  });
  
  const uptimeData: UptimeData[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    // Calculate downtime minutes for this day
    let downtimeMinutes = 0;
    
    // Add incident downtime for this day
    incidents.forEach(incident => {
      const incidentStart = new Date(incident.createdAt);
      const incidentEnd = incident.resolvedAt ? new Date(incident.resolvedAt) : dayEnd;
      
      const start = incidentStart > dayStart ? incidentStart : dayStart;
      const end = incidentEnd < dayEnd ? incidentEnd : dayEnd;
      
      if (start < end) {
        downtimeMinutes += differenceInMinutes(end, start);
      }
    });
    
    // Add maintenance downtime for this day
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

// Calculate overall uptime for a service (optimized)
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
  
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  
  // Get total downtime minutes in one query
  const incidents = await prisma.incidents.findMany({
    where: {
      incident_services: {
        some: {
          serviceId: serviceId
        }
      },
      createdAt: {
        gte: startDate
      }
    },
    select: {
      createdAt: true,
      resolvedAt: true
    }
  });
  
  const maintenance = await prisma.maintenances.findMany({
    where: {
      scheduledStart: {
        gte: startDate
      },
      status: {
        in: ['SCHEDULED', 'IN_PROGRESS']
      }
    },
    select: {
      scheduledStart: true,
      scheduledEnd: true
    }
  });
  
  // Calculate total downtime
  let totalDowntimeMinutes = 0;
  
  incidents.forEach(incident => {
    const incidentStart = new Date(incident.createdAt);
    const incidentEnd = incident.resolvedAt ? new Date(incident.resolvedAt) : endDate;
    
    const start = incidentStart > startDate ? incidentStart : startDate;
    const end = incidentEnd < endDate ? incidentEnd : endDate;
    
    if (start < end) {
      totalDowntimeMinutes += differenceInMinutes(end, start);
    }
  });
  
  maintenance.forEach(maint => {
    const maintStart = new Date(maint.scheduledStart);
    const maintEnd = new Date(maint.scheduledEnd);
    
    const start = maintStart > startDate ? maintStart : startDate;
    const end = maintEnd < endDate ? maintEnd : endDate;
    
    if (start < end) {
      totalDowntimeMinutes += differenceInMinutes(end, start);
    }
  });
  
  const totalMinutes = days * 24 * 60; // Total minutes in the period
  const totalUptimeMinutes = totalMinutes - totalDowntimeMinutes;
  const uptimePercentage = (totalUptimeMinutes / totalMinutes) * 100;
  
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
    },
    select: {
      title: true
    }
  });
  
  return {
    serviceId,
    serviceName: service.name,
    uptimePercentage: Math.round(uptimePercentage * 100) / 100,
    totalUptime: Math.round(uptimePercentage * 100) / 100,
    totalDowntime: Math.round((100 - uptimePercentage) * 100) / 100,
    lastIncident: lastIncident?.title,
    currentStatus: service.status
  };
};

// Get uptime data for all services (optimized)
export const getAllServicesUptime = async (days: number = 30): Promise<ServiceUptime[]> => {
  const services = await prisma.services.findMany();
  
  if (services.length === 0) {
    return [];
  }
  
  const uptimePromises = services.map(service => 
    calculateOverallUptime(service.id, days)
  );
  
  return Promise.all(uptimePromises);
}; 