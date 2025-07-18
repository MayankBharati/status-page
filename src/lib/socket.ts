import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    socket = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinStatusPage = (slug: string) => {
  const socket = getSocket();
  socket.emit('join-status-page', slug);
};

export const leaveStatusPage = (slug: string) => {
  const socket = getSocket();
  socket.emit('leave-status-page', slug);
};

export const onServiceStatusUpdate = (callback: (data: unknown) => void) => {
  const socket = getSocket();
  socket.on('service-status-updated', callback);
};

export const onIncidentUpdate = (callback: (data: unknown) => void) => {
  const socket = getSocket();
  socket.on('incident-updated', callback);
};

export const onMaintenanceUpdate = (callback: (data: unknown) => void) => {
  const socket = getSocket();
  socket.on('maintenance-updated', callback);
};

export const onTeamMemberUpdate = (callback: (data: unknown) => void) => {
  const socket = getSocket();
  socket.on('team-member-updated', callback);
};

export const offServiceStatusUpdate = (callback: (data: unknown) => void) => {
  const socket = getSocket();
  socket.off('service-status-updated', callback);
};

export const offIncidentUpdate = (callback: (data: unknown) => void) => {
  const socket = getSocket();
  socket.off('incident-updated', callback);
};

export const offMaintenanceUpdate = (callback: (data: unknown) => void) => {
  const socket = getSocket();
  socket.off('maintenance-updated', callback);
};

export const offTeamMemberUpdate = (callback: (data: unknown) => void) => {
  const socket = getSocket();
  socket.off('team-member-updated', callback);
};

// Utility function to emit WebSocket events from API routes
export const emitSocketEvent = (event: string, data: Record<string, unknown>) => {
  try {
    // Access the global io instance from the custom server
    const io = (global as { io?: { emit: (event: string, data: Record<string, unknown>) => void } }).io;
    if (io) {
      io.emit(event, data);
    }
  } catch (error) {
    console.error('Error emitting socket event:', error);
  }
};

// Specific event emitters for different types of updates
export const emitServiceStatusUpdate = (organizationSlug: string, serviceId: string, status: string) => {
  emitSocketEvent('service-status-update', {
    organizationSlug,
    serviceId,
    status,
    updatedAt: new Date().toISOString()
  });
};

export const emitIncidentUpdate = (organizationSlug: string, incidentId: string, status: string, message?: string) => {
  emitSocketEvent('incident-update', {
    organizationSlug,
    incidentId,
    status,
    message
  });
};

export const emitMaintenanceUpdate = (organizationSlug: string, maintenanceId: string, status: string) => {
  emitSocketEvent('maintenance-update', {
    organizationSlug,
    maintenanceId,
    status
  });
};

// Team member event emitters
export const emitTeamMemberAdded = (organizationSlug: string, teamId: string, memberId: string, memberData: Record<string, unknown>) => {
  emitSocketEvent('team-member-added', {
    organizationSlug,
    teamId,
    memberId,
    memberData,
    updatedAt: new Date().toISOString()
  });
};

export const emitTeamMemberRemoved = (organizationSlug: string, teamId: string, memberId: string) => {
  emitSocketEvent('team-member-removed', {
    organizationSlug,
    teamId,
    memberId,
    updatedAt: new Date().toISOString()
  });
};

export const emitTeamMemberRoleChanged = (organizationSlug: string, teamId: string, memberId: string, newRole: string) => {
  emitSocketEvent('team-member-role-changed', {
    organizationSlug,
    teamId,
    memberId,
    newRole,
    updatedAt: new Date().toISOString()
  });
};

export const emitTeamCreated = (organizationSlug: string, teamId: string, teamData: Record<string, unknown>) => {
  emitSocketEvent('team-created', {
    organizationSlug,
    teamId,
    teamData,
    updatedAt: new Date().toISOString()
  });
};

export const emitTeamDeleted = (organizationSlug: string, teamId: string) => {
  emitSocketEvent('team-deleted', {
    organizationSlug,
    teamId,
    updatedAt: new Date().toISOString()
  });
};

export const emitTeamUpdated = (organizationSlug: string, teamId: string, teamData: Record<string, unknown>) => {
  emitSocketEvent('team-updated', {
    organizationSlug,
    teamId,
    teamData,
    updatedAt: new Date().toISOString()
  });
}; 
 