/**
 * Klient Socket.io - połączenie z serwerem
 */

import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

/**
 * Singleton instancja Socket.io
 */
let socket: Socket | null = null;

export function initSocket(): Socket {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✓ Połączono z serwerem');
  });

  socket.on('disconnect', () => {
    console.log('✗ Rozłączono z serwerem');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function getSocket(): Socket {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
