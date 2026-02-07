"use strict";
/**
 * Główny serwer aplikacji Tysiąc
 * Node.js + Express + Socket.io
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const handlers_1 = require("./socket/handlers");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 3001;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/build')));
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
(0, handlers_1.initializeSocketHandlers)(io);
// Fallback dla SPA
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/build/index.html'));
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
