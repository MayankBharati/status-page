import { useEffect, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  organizationSlug?: string;
  onServiceStatusChange?: (data: { serviceId: string; status: string; updatedAt: string }) => void;
  onIncidentUpdate?: (data: { incidentId: string; status: string; message?: string; updatedAt: string }) => void;
  onMaintenanceUpdate?: (data: { maintenanceId: string; status: string; updatedAt: string }) => void;
  onTeamMemberUpdate?: (data: { teamId: string; memberId: string; action: string; memberData?: Record<string, unknown> }) => void;
  onTeamUpdate?: (data: { teamId: string; action: string; teamData?: Record<string, unknown> }) => void;
}

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null;

export const useSocket = (options: UseSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const { 
    organizationSlug, 
    onServiceStatusChange, 
    onIncidentUpdate, 
    onMaintenanceUpdate,
    onTeamMemberUpdate,
    onTeamUpdate
  } = options;

  const connect = useCallback(() => {
    if (globalSocket?.connected) {
      setIsConnected(true);
      return;
    }

    if (globalSocket) {
      globalSocket.disconnect();
    }

    // Fix the WebSocket URL to prevent incorrect connections
    let socketUrl = 'http://localhost:3000';
    
    if (typeof window !== 'undefined') {
      // In browser, use the current origin
      socketUrl = window.location.origin;
    } else if (process.env.NEXT_PUBLIC_WS_URL) {
      socketUrl = process.env.NEXT_PUBLIC_WS_URL;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      socketUrl = process.env.NEXT_PUBLIC_APP_URL;
    }
    
    console.log('Connecting to WebSocket at:', socketUrl);
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      
      // Join organization room if slug is provided
      if (organizationSlug) {
        socket.emit('join-organization', organizationSlug);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Listen for service status changes
    socket.on('service-status-changed', (data) => {
      console.log('Service status changed:', data);
      onServiceStatusChange?.(data);
    });

    // Listen for incident updates
    socket.on('incident-updated', (data) => {
      console.log('Incident updated:', data);
      onIncidentUpdate?.(data);
    });

    // Listen for maintenance updates
    socket.on('maintenance-updated', (data) => {
      console.log('Maintenance updated:', data);
      onMaintenanceUpdate?.(data);
    });

    // Listen for team member updates
    socket.on('team-member-added', (data) => {
      console.log('Team member added:', data);
      onTeamMemberUpdate?.({ 
        teamId: data.teamId, 
        memberId: data.memberId, 
        action: 'added',
        memberData: data.memberData
      });
    });

    socket.on('team-member-removed', (data) => {
      console.log('Team member removed:', data);
      onTeamMemberUpdate?.({ 
        teamId: data.teamId, 
        memberId: data.memberId, 
        action: 'removed'
      });
    });

    socket.on('team-member-role-changed', (data) => {
      console.log('Team member role changed:', data);
      onTeamMemberUpdate?.({ 
        teamId: data.teamId, 
        memberId: data.memberId, 
        action: 'role-changed',
        memberData: { role: data.newRole }
      });
    });

    // Listen for team updates
    socket.on('team-created', (data) => {
      console.log('Team created:', data);
      onTeamUpdate?.({ 
        teamId: data.teamId, 
        action: 'created',
        teamData: data.teamData
      });
    });

    socket.on('team-deleted', (data) => {
      console.log('Team deleted:', data);
      onTeamUpdate?.({ 
        teamId: data.teamId, 
        action: 'deleted'
      });
    });

    socket.on('team-updated', (data) => {
      console.log('Team updated:', data);
      onTeamUpdate?.({ 
        teamId: data.teamId, 
        action: 'updated',
        teamData: data.teamData
      });
    });

    globalSocket = socket;
  }, [organizationSlug, onServiceStatusChange, onIncidentUpdate, onMaintenanceUpdate, onTeamMemberUpdate, onTeamUpdate]);

  const disconnect = useCallback(() => {
    if (globalSocket) {
      if (organizationSlug) {
        globalSocket.emit('leave-organization', organizationSlug);
      }
      globalSocket.disconnect();
      globalSocket = null;
    }
    setIsConnected(false);
  }, [organizationSlug]);

  useEffect(() => {
    // Only connect if we don't have a global socket
    if (!globalSocket) {
      connect();
    } else {
      setIsConnected(globalSocket.connected);
    }

    return () => {
      // Don't disconnect on unmount to keep the global connection
    };
  }, [connect]);

  // Reconnect when organization slug changes
  useEffect(() => {
    if (globalSocket?.connected && organizationSlug) {
      globalSocket.emit('join-organization', organizationSlug);
    }
  }, [organizationSlug]);

  return {
    socket: globalSocket,
    isConnected,
    connect,
    disconnect,
  };
}; 