import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.io server
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        : 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join organization room
    socket.on('join-organization', (organizationSlug) => {
      socket.join(`org-${organizationSlug}`);
      console.log(`Client ${socket.id} joined organization: ${organizationSlug}`);
    });

    // Leave organization room
    socket.on('leave-organization', (organizationSlug) => {
      socket.leave(`org-${organizationSlug}`);
      console.log(`Client ${socket.id} left organization: ${organizationSlug}`);
    });

    // Handle service status updates
    socket.on('service-status-update', (data) => {
      const { organizationSlug, serviceId, status, updatedAt } = data;
      io.to(`org-${organizationSlug}`).emit('service-status-changed', {
        serviceId,
        status,
        updatedAt
      });
      console.log(`Service status update: ${serviceId} -> ${status}`);
    });

    // Handle incident updates
    socket.on('incident-update', (data) => {
      const { organizationSlug, incidentId, status, message } = data;
      io.to(`org-${organizationSlug}`).emit('incident-updated', {
        incidentId,
        status,
        message,
        updatedAt: new Date().toISOString()
      });
      console.log(`Incident update: ${incidentId} -> ${status}`);
    });

    // Handle maintenance updates
    socket.on('maintenance-update', (data) => {
      const { organizationSlug, maintenanceId, status } = data;
      io.to(`org-${organizationSlug}`).emit('maintenance-updated', {
        maintenanceId,
        status,
        updatedAt: new Date().toISOString()
      });
      console.log(`Maintenance update: ${maintenanceId} -> ${status}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Make io available globally for API routes
  global.io = io;

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 