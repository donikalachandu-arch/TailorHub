import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { apiRouter, setWebSocketClients, broadcastWebSocketEvent } from './routes/api';
import { getDatabase } from './config/database';
import { seedDatabase } from './config/seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Allow modern frontend asset fetching
  })
);

// 2. Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use(globalLimiter);

// 3. Sensitive Auth Rate Limiter (Brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 login attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth', authLimiter);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API routes
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TailorHub Production Backend Service',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'production',
    time: new Date().toISOString()
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Enhanced Room-based WebSocket state
interface ExtendedWebSocket extends WebSocket {
  rooms?: Set<string>;
  userId?: string;
  isAlive?: boolean;
}

const clients = new Set<ExtendedWebSocket>();
setWebSocketClients(clients as unknown as Set<WebSocket>);

wss.on('connection', (ws: ExtendedWebSocket) => {
  ws.rooms = new Set<string>();
  ws.isAlive = true;
  clients.add(ws);

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'Connected to TailorHub Realtime Feed v2.0',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'SUBSCRIBE_ROOM' && data.room) {
        ws.rooms?.add(data.room);
        ws.send(JSON.stringify({ type: 'ROOM_SUBSCRIBED', room: data.room }));
      } else if (data.type === 'UNSUBSCRIBE_ROOM' && data.room) {
        ws.rooms?.delete(data.room);
        ws.send(JSON.stringify({ type: 'ROOM_UNSUBSCRIBED', room: data.room }));
      } else if (data.type === 'IDENTIFY' && data.userId) {
        ws.userId = data.userId;
        ws.rooms?.add(`user:${data.userId}`);
        ws.send(JSON.stringify({ type: 'IDENTIFIED', userId: data.userId }));
      }
    } catch (e) {
      // Ignored malformed messages
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('[WebSocket] Socket error:', err);
  });
});

// Periodic heartbeat to clean dead connections
const heartbeatInterval = setInterval(() => {
  clients.forEach((ws) => {
    if (ws.isAlive === false) {
      clients.delete(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

async function startServer() {
  try {
    const db = await getDatabase();
    // Check if seeded
    const userCount = await db.get('SELECT COUNT(*) as cnt FROM users');
    if (!userCount || userCount.cnt === 0) {
      await seedDatabase();
    }

    server.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`TAILORHUB PRODUCTION API BACKEND RUNNING ON PORT ${PORT}`);
      console.log(`HTTP URL: http://localhost:${PORT}/api`);
      console.log(`WEBSOCKET URL: ws://localhost:${PORT}/ws`);
      console.log(`SECURITY: Helmet + Rate Limiting Active`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Failed to start TailorHub backend server:', err);
    process.exit(1);
  }
}

startServer();
