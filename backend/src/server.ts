import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { apiRouter, setWebSocketClients } from './routes/api';
import { getDatabase } from './config/database';
import { seedDatabase } from './config/seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'TailorHub Backend Service', time: new Date().toISOString() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Set<WebSocket>();
setWebSocketClients(clients);

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  console.log('[WebSocket] Client connected to TailorHub real-time updates');

  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to TailorHub Realtime Feed' }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log('[WebSocket] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[WebSocket] Socket error:', err);
  });
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
      console.log(`TAILORHUB API BACKEND RUNNING ON PORT ${PORT}`);
      console.log(`HTTP URL: http://localhost:${PORT}/api`);
      console.log(`WEBSOCKET URL: ws://localhost:${PORT}/ws`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Failed to start TailorHub backend server:', err);
    process.exit(1);
  }
}

startServer();
