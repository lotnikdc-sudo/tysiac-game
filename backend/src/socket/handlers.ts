/**
 * Obsługa Socket.io - handlery zdarzeń
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { GameManager, GameState } from '../game/GameManager';
import { Player } from '../game/Player';
import { SOCKET_EVENTS, JoinGamePayload, BidPayload, PlayCardPayload } from './events';

interface GameSession {
  gameManager: GameManager;
  players: Map<string, Player>;
}

/**
 * Przechowuje wszystkie aktywne gry
 */
export const activeSessions = new Map<string, GameSession>();

/**
 * Przechowuje mapowanie socketId -> playerId
 */
export const playerSockets = new Map<string, string>();

/**
 * Przechowuje mapowanie playerId -> gameId
 */
export const playerGames = new Map<string, string>();

/**
 * Inicjalizuje obsługę Socket.io
 */
export function initializeSocketHandlers(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Gracz podłączony: ${socket.id}`);

    // ===== DOŁĄCZENIE DO GRY =====
    socket.on(SOCKET_EVENTS.JOIN_GAME, (payload: JoinGamePayload) => {
      handleJoinGame(io, socket, payload);
    });

    // ===== LICYTACJA =====
    socket.on(SOCKET_EVENTS.PLACE_BID, (payload: BidPayload) => {
      handlePlaceBid(io, payload);
    });

    // ===== ZAGRANIE KARTY =====
    socket.on(SOCKET_EVENTS.PLAY_CARD, (payload: PlayCardPayload) => {
      handlePlayCard(io, payload);
    });

    // ===== OPUSZCZENIE GRY =====
    socket.on(SOCKET_EVENTS.LEAVE_GAME, () => {
      handleLeaveGame(io, socket);
    });

    // ===== ROZŁĄCZENIE =====
    socket.on('disconnect', () => {
      handleDisconnect(io, socket);
    });
  });
}

/**
 * Handler: Gracz dołącza do gry
 */
function handleJoinGame(io: SocketIOServer, socket: Socket, payload: JoinGamePayload): void {
  try {
    const { playerName, gameId } = payload;

    // Utwórz nową grę lub dołącz do istniejącej
    let session: GameSession;
    let finalGameId: string;

    if (gameId && activeSessions.has(gameId)) {
      session = activeSessions.get(gameId)!;
      finalGameId = gameId;
    } else {
      // Utwórz nową grę
      const gameManager = new GameManager();
      session = {
        gameManager,
        players: new Map()
      };
      finalGameId = gameManager.gameId;
      activeSessions.set(finalGameId, session);
    }

    // Utwórz gracza
    const player = new Player(socket.id, playerName, socket.id);
    session.players.set(socket.id, player);
    session.gameManager.addPlayer(player);

    // Zapisz mapowania
    playerSockets.set(socket.id, socket.id);
    playerGames.set(socket.id, finalGameId);

    // Dołącz socket do pokoju gry
    socket.join(finalGameId);

    console.log(`${playerName} dołączył do gry ${finalGameId}`);

    // Wyślij aktualny stan gry do gracza
    const gameState = session.gameManager.getGameState();
    socket.emit(SOCKET_EVENTS.GAME_STATE_UPDATE, {
      ...gameState,
      playerView: session.gameManager.getPlayerView(socket.id)
    });

    // Powiadom wszystkich o zmianach w graczach
    io.to(finalGameId).emit(SOCKET_EVENTS.PLAYERS_UPDATED, {
      players: session.gameManager.players.map(p => p.getPublicState()),
      currentPlayerIndex: session.gameManager.currentPlayerIndex,
      gameState: session.gameManager.gameState
    });

    // Jeśli jest wystarczająco graczy, rozpocznij grę
    if (session.gameManager.players.length >= 2) {
      console.log(`Gra ${finalGameId} może się rozpocząć (${session.gameManager.players.length} graczy)`);
    }
  } catch (error) {
    console.error('Błąd przy dołączaniu do gry:', error);
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Błąd dołączenia do gry' });
  }
}

/**
 * Handler: Gracz składa licytację
 */
function handlePlaceBid(io: SocketIOServer, payload: BidPayload): void {
  try {
    const { gameId, playerId, bidAmount } = payload;
    const session = activeSessions.get(gameId);

    if (!session) {
      console.warn(`Gra ${gameId} nie znaleziona`);
      return;
    }

    const success = session.gameManager.placeBid(playerId, bidAmount);

    if (success) {
      // Wysyłka aktualizacji do wszystkich graczy
      io.to(gameId).emit(SOCKET_EVENTS.BID_PLACED, {
        playerId,
        bidAmount,
        gameState: session.gameManager.gameState
      });

      if (session.gameManager.gameState === GameState.PLAYING) {
        io.to(gameId).emit(SOCKET_EVENTS.BIDDING_COMPLETE, {
          bidderId: session.gameManager.players[session.gameManager.currentBidderIndex].id,
          trump: session.gameManager.trump
        });
      }
    }
  } catch (error) {
    console.error('Błąd przy składaniu licytacji:', error);
  }
}

/**
 * Handler: Gracz zagrywa kartę
 */
function handlePlayCard(io: SocketIOServer, payload: PlayCardPayload): void {
  try {
    const { gameId, playerId, cardId } = payload;
    const session = activeSessions.get(gameId);

    if (!session) {
      console.warn(`Gra ${gameId} nie znaleziona`);
      return;
    }

    const success = session.gameManager.playCard(playerId, cardId);

    if (success) {
      // Wysyłka aktualizacji do wszystkich graczy
      io.to(gameId).emit(SOCKET_EVENTS.CARD_PLAYED, {
        playerId,
        cardId,
        gameState: session.gameManager.getGameState()
      });

      // Sprawdź czy lewa się zakończyła
      if (session.gameManager.playedCards.length === 0 && session.gameManager.gameState === GameState.PLAYING) {
        io.to(gameId).emit(SOCKET_EVENTS.TRICK_RESOLVED, {
          gameState: session.gameManager.getGameState()
        });
      }

      // Sprawdź czy gra się skończyła
      if (session.gameManager.gameState === GameState.GAME_END) {
        const winner = session.gameManager.players.reduce((prev, curr) =>
          curr.score > prev.score ? curr : prev
        );

        io.to(gameId).emit(SOCKET_EVENTS.GAME_END, {
          winner: winner.getPublicState(),
          finalScores: session.gameManager.players.map(p => p.getPublicState())
        });

        // Usuń sesję
        activeSessions.delete(gameId);
      }
    }
  } catch (error) {
    console.error('Błąd przy zagrywaniu karty:', error);
  }
}

/**
 * Handler: Gracz opuszcza grę
 */
function handleLeaveGame(io: SocketIOServer, socket: Socket): void {
  try {
    const gameId = playerGames.get(socket.id);

    if (!gameId) return;

    const session = activeSessions.get(gameId);
    if (!session) return;

    session.gameManager.removePlayer(socket.id);
    session.players.delete(socket.id);

    console.log(`Gracz ${socket.id} opuścił grę ${gameId}`);

    socket.leave(gameId);

    // Powiadom pozostałych graczy
    io.to(gameId).emit(SOCKET_EVENTS.PLAYERS_UPDATED, {
      players: session.gameManager.players.map(p => p.getPublicState())
    });

    // Jeśli nikogo nie ma, usuń sesję
    if (session.gameManager.players.length === 0) {
      activeSessions.delete(gameId);
    }

    playerGames.delete(socket.id);
    playerSockets.delete(socket.id);
  } catch (error) {
    console.error('Błąd przy opuszczaniu gry:', error);
  }
}

/**
 * Handler: Gracz się rozłącza
 */
function handleDisconnect(io: SocketIOServer, socket: Socket): void {
  console.log(`Gracz rozłączył się: ${socket.id}`);
  handleLeaveGame(io, socket);
}
