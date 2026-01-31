/**
 * Główny serwer aplikacji Tysiąc
 * Node.js + Express + Socket.io
 */

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { initializeSocketHandlers } from './socket/handlers';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Health check endpoint (must be fast for deployment)
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Tysiąc Game Server',
    version: '1.0.0',
    description: 'Multiplayer online card game'
  });
});

// Inicjalizacja Socket.io
initializeSocketHandlers(io);

// Fallback dla SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Uruchomienie serwera
server.listen(PORT, () => {
  console.log(`\n🎴 Serwer Tysiąc uruchomiony na porcie ${PORT}`);
  console.log(`Otwórz przeglądarkę: http://localhost:${PORT}`);
  console.log(`\n📡 Socket.io gotowy do połączeń\n`);
});

// Obsługa błędów
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
