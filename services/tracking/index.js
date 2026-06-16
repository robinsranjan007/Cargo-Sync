import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import Redis from 'ioredis';
import trackingRoutes from './routes/trackingRoutes.js';
import protect from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3003;

// Create HTTP server from Express app
const server = createServer(app);

// Create WebSocket server on top of HTTP server
const wss = new WebSocketServer({ server });

// Separate Redis subscriber client
const subscriber = new Redis(process.env.REDIS_URL);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Tracking service is running' });
});

// Routes
app.use('/api/tracking', trackingRoutes);

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('New WebSocket client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      ws.loadId = data.loadId;
      console.log(`Client subscribed to load: ${data.loadId}`);
    } catch (error) {
      console.error('Invalid message format');
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to CargoSync tracking'
  }));
});

// Subscribe to Redis channels
subscriber.subscribe('location_updates', 'geofence_events', (err) => {
  if (err) {
    console.error('Redis subscription error:', err);
  } else {
    console.log('Subscribed to Redis channels');
  }
});

// When Redis receives a message broadcast to WebSocket clients
subscriber.on('message', (channel, message) => {
  const data = JSON.parse(message);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      if (channel === 'location_updates') {
        if (!client.loadId || client.loadId === data.loadId) {
          client.send(JSON.stringify({
            type: 'location_update',
            data
          }));
        }
      }

      if (channel === 'geofence_events') {
        client.send(JSON.stringify({
          type: 'geofence_entered',
          data
        }));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Tracking service running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});