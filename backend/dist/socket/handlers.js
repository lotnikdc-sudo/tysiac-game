"use strict";
/**
 * Obsługa Socket.io - handlery zdarzeń
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerGames = exports.playerSockets = exports.activeSessions = void 0;
exports.initializeSocketHandlers = initializeSocketHandlers;
const GameManager_1 = require("../game/GameManager");
const Player_1 = require("../game/Player");
const BotPlayer_1 = require("../game/BotPlayer");
const events_1 = require("./events");
/**
 * Przechowuje wszystkie aktywne gry
 */
exports.activeSessions = new Map();
/**
 * Przechowuje mapowanie socketId -> playerId
 */
exports.playerSockets = new Map();
/**
 * Przechowuje mapowanie playerId -> gameId
 */
exports.playerGames = new Map();
/**
 * Inicjalizuje obsługę Socket.io
 */
function initializeSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`Gracz podłączony: ${socket.id}`);
        // ===== DOŁĄCZENIE DO GRY =====
        socket.on(events_1.SOCKET_EVENTS.JOIN_GAME, (payload) => {
            handleJoinGame(io, socket, payload);
        });
        // ===== LICYTACJA =====
        socket.on(events_1.SOCKET_EVENTS.PLACE_BID, (payload) => {
            handlePlaceBid(io, payload);
        });
        // ===== WYBÓR KART DO MUCKA (po aukcji) =====
        socket.on(events_1.SOCKET_EVENTS.DISCARD_TO_MUCK, (payload) => {
            handleReturnMucekCards(io, socket, payload);
        });
        // ===== LEGACY: MUCZEK (deprecated) =====
        socket.on(events_1.SOCKET_EVENTS.RETURN_MUCEK_CARDS, (payload) => {
            handleReturnMucekCards(io, socket, payload);
        });
        // ===== ZAGRANIE KARTY =====
        socket.on(events_1.SOCKET_EVENTS.PLAY_CARD, (payload) => {
            handlePlayCard(io, payload);
        });
        // ===== OPUSZCZENIE GRY =====
        socket.on(events_1.SOCKET_EVENTS.LEAVE_GAME, () => {
            handleLeaveGame(io, socket);
        });
        // ===== DODAJ BOTA =====
        socket.on(events_1.SOCKET_EVENTS.ADD_BOT, (payload) => {
            handleAddBot(io, socket, payload);
        });
        // ===== ROZPOCZNIJ GRĘ =====
        socket.on(events_1.SOCKET_EVENTS.GAME_START, (payload) => {
            handleStartGame(io, socket, payload);
        });
        // ===== ROZŁĄCZENIE =====
        socket.on('disconnect', () => {
            handleDisconnect(io, socket);
        });
    });
}
function processBots(io, session) {
    const gm = session.gameManager;
    // krótkie opóźnienie między ruchami
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    (async () => {
        while (true) {
            const current = gm.players[gm.currentPlayerIndex];
            if (!current)
                break;
            console.log(`[processBots] state=${gm.gameState} currentIndex=${gm.currentPlayerIndex} currentId=${current?.id}`);
            // CARD_SELECTION phase: licytant (bot) musi oddać 2 karty do mucka
            if (gm.gameState === GameManager_1.GameState.CARD_SELECTION) {
                const bidder = gm.players.find(p => p.id === gm.bidderId);
                if (bidder && bidder.id.startsWith('bot-')) {
                    console.log(`[processBots] CARD_SELECTION - bot bidder ${bidder.id} discarding to muck`);
                    const bot = bidder;
                    // Bot musi wybrać 2 karty do oddania
                    const cardsToDiscard = bot.selectCardsToDiscard(gm);
                    if (cardsToDiscard && cardsToDiscard.length === 2) {
                        const discardIds = cardsToDiscard.map(c => c.getId());
                        if (gm.discardToMuck(bot.id, discardIds)) {
                            io.to(gm.gameId).emit('discardToMuckComplete', {
                                gameState: gm.gameState,
                                bidderId: gm.bidderId,
                                muckPlayerId: gm.muckPlayerId,
                                players: gm.players.map(p => p.getPublicState())
                            });
                            console.log(`[processBots] Bot ${bot.id} discarded cards, moving to PLAYING`);
                        }
                    }
                    await delay(400);
                    continue;
                }
                break; // current is human waiting for card selection
            }
            // If we're in bidding phase, allow bots to place bids automatically
            if (gm.gameState === GameManager_1.GameState.BIDDING) {
                if (current.id && current.id.startsWith('bot-')) {
                    console.log(`[processBots] bidding loop - bot at index ${gm.currentPlayerIndex}`);
                    const bot = current;
                    const bid = bot.decideBid();
                    console.log(`[processBots] bot ${bot.id} decided bid=${bid}`);
                    // place bid
                    session.gameManager.placeBid(bot.id, bid);
                    // emit bid placed
                    io.to(session.gameManager.gameId).emit(events_1.SOCKET_EVENTS.BID_PLACED, {
                        playerId: bot.id,
                        bidAmount: bid,
                        gameState: session.gameManager.gameState,
                        players: session.gameManager.players.map(p => p.getPublicState())
                    });
                    // if bidding finished and game moved to CARD_SELECTION, notify clients
                    if (session.gameManager.gameState === GameManager_1.GameState.CARD_SELECTION) {
                        io.to(session.gameManager.gameId).emit('selectCardsTiDiscard', {
                            playerId: session.gameManager.bidderId,
                            gameState: session.gameManager.gameState,
                            players: session.gameManager.players.map(p => p.getPublicState())
                        });
                    }
                    // wait then continue loop (next player may be bot)
                    await delay(400);
                    continue;
                }
                break; // current is human, stop automated bidding
            }
            // rozpoznaj bota po id starting with 'bot-'
            if (current.id && current.id.startsWith('bot-')) {
                // wybierz kartę przez bota
                const bot = current;
                const chosen = bot.chooseCard(gm);
                if (!chosen) {
                    // jeśli brak karty, zakończ
                    break;
                }
                // wykonaj ruch
                gm.playCard(bot.id, chosen.getId());
                // Wyślij eventy aktualizacji do pokoju
                io.to(session.gameManager.gameId).emit(events_1.SOCKET_EVENTS.CARD_PLAYED, {
                    playerId: bot.id,
                    cardId: chosen.getId(),
                    gameState: gm.getGameState()
                });
                if (gm.playedCards.length === 0 && gm.gameState === GameManager_1.GameState.PLAYING) {
                    io.to(gm.gameId).emit(events_1.SOCKET_EVENTS.TRICK_RESOLVED, { gameState: gm.getGameState() });
                }
                if (gm.gameState === GameManager_1.GameState.GAME_END) {
                    const winner = gm.players.reduce((prev, curr) => curr.score > prev.score ? curr : prev);
                    io.to(gm.gameId).emit(events_1.SOCKET_EVENTS.GAME_END, {
                        winner: winner.getPublicState(),
                        finalScores: gm.players.map(p => p.getPublicState())
                    });
                    exports.activeSessions.delete(gm.gameId);
                    break;
                }
                // poczekaj chwilę przed kolejnym botem
                await delay(500);
                continue; // sprawdź następnego gracza
            }
            break; // obecny gracz nie jest botem
        }
    })();
}
/** Handler: Dodaje bota do gry */
function handleAddBot(io, socket, payload) {
    try {
        const gameId = payload.gameId || exports.playerGames.get(socket.id);
        if (!gameId)
            return;
        const session = exports.activeSessions.get(gameId);
        if (!session)
            return;
        const bot = new BotPlayer_1.BotPlayer(payload.botName);
        session.players.set(bot.id, bot);
        session.gameManager.addPlayer(bot);
        // powiadom graczy
        io.to(gameId).emit(events_1.SOCKET_EVENTS.PLAYERS_UPDATED, {
            players: session.gameManager.players.map(p => p.getPublicState()),
            currentPlayerIndex: session.gameManager.currentPlayerIndex,
            gameState: session.gameManager.gameState
        });
        // jeśli gra już w toku, spróbuj uruchomić bota gdy przyjdzie kolej
        processBots(io, session);
    }
    catch (err) {
        console.error('Błąd przy dodawaniu bota:', err);
    }
}
/** Handler: Rozpocznij grę (rozdanie, meldunki, licytacja) */
function handleStartGame(io, socket, payload) {
    try {
        const gameId = payload?.gameId || exports.playerGames.get(socket.id);
        if (!gameId)
            return;
        const session = exports.activeSessions.get(gameId);
        if (!session)
            return;
        // Rozpocznij nową rundę (rozdaj karty, ustaw licytację)
        session.gameManager.startNewRound();
        // Ustaw stan na PLAYING aby pokazać karty graczom
        // Licytacja zacznie się po 15 sekundach
        session.gameManager.gameState = GameManager_1.GameState.PLAYING;
        // Wyślij zaktualizowany stan gry do każdego połączonego klienta z widokiem gracza
        const gameState = session.gameManager.getGameState();
        // DEBUG: log liczby graczy i rozmiarów rąk po rozdaniu
        try {
            console.log(`[GAME_START] gameId=${gameId} managerPlayers=${session.gameManager.players.length}`);
            session.gameManager.players.forEach((p, idx) => {
                console.log(`[GAME_START] player[${idx}] id=${p.id} name=${p.name} hand=${p.hand.length}`);
            });
            console.log(`[GAME_START] trumpCard=${session.gameManager.trumpCard ? session.gameManager.trumpCard.toString() : 'none'}`);
        }
        catch (e) {
            console.error('Error logging game start debug info', e);
        }
        for (const [sockId, player] of session.players.entries()) {
            if (!sockId.startsWith('bot-')) {
                const targetSocket = io.sockets.sockets.get(sockId);
                if (targetSocket) {
                    targetSocket.emit(events_1.SOCKET_EVENTS.GAME_STATE_UPDATE, {
                        ...gameState,
                        playerView: session.gameManager.getPlayerView(player.id)
                    });
                }
            }
        }
        // Powiadom wszystkich o aktualnej liście graczy
        io.to(gameId).emit(events_1.SOCKET_EVENTS.PLAYERS_UPDATED, {
            players: session.gameManager.players.map(p => p.getPublicState()),
            currentPlayerIndex: session.gameManager.currentPlayerIndex,
            gameState: session.gameManager.gameState
        });
        // Poczekaj 15 sekund, potem rozpocznij licytację
        setTimeout(() => {
            try {
                // Przejdź do CARD_SELECTION - licytant musi oddać 2 karty do mucka
                session.gameManager.gameState = GameManager_1.GameState.CARD_SELECTION;
                io.to(gameId).emit(events_1.SOCKET_EVENTS.PLAYERS_UPDATED, {
                    players: session.gameManager.players.map(p => p.getPublicState()),
                    currentPlayerIndex: session.gameManager.currentPlayerIndex,
                    gameState: session.gameManager.gameState,
                    bidderId: session.gameManager.bidderId,
                    muckPlayerId: session.gameManager.muckPlayerId
                });
                // Powiadom licytanta, aby wybrał 2 karty do oddania
                const bidder = session.gameManager.players.find(p => p.id === session.gameManager.bidderId);
                if (bidder) {
                    io.to(gameId).emit('selectCardsTiDiscard', {
                        playerId: bidder.id,
                        gameState: session.gameManager.gameState,
                        players: session.gameManager.players.map(p => p.getPublicState())
                    });
                }
                processBots(io, session);
            }
            catch (e) {
                console.error('Error transitioning to CARD_SELECTION', e);
            }
        }, 15000);
        // Wyślij do wszystkich pierwszego licytanta
        const bidder = session.gameManager.players[session.gameManager.currentBidderIndex];
        if (bidder) {
            io.to(gameId).emit(events_1.SOCKET_EVENTS.BID_PLACED, {
                playerId: bidder.id,
                players: session.gameManager.players.map(p => p.getPublicState()),
                gameState: session.gameManager.gameState
            });
        }
        processBots(io, session);
    }
    catch (err) {
        console.error('Błąd przy rozpoczynaniu gry:', err);
    }
}
/**
 * Handler: Gracz dołącza do gry
 */
function handleJoinGame(io, socket, payload) {
    try {
        const { playerName, gameId } = payload;
        // Utwórz nową grę lub dołącz do istniejącej
        let session;
        let finalGameId;
        if (gameId && exports.activeSessions.has(gameId)) {
            session = exports.activeSessions.get(gameId);
            finalGameId = gameId;
        }
        else {
            // Utwórz nową grę
            const gameManager = new GameManager_1.GameManager();
            session = {
                gameManager,
                players: new Map()
            };
            finalGameId = gameManager.gameId;
            exports.activeSessions.set(finalGameId, session);
        }
        // Utwórz gracza
        const player = new Player_1.Player(socket.id, playerName, socket.id);
        session.players.set(socket.id, player);
        session.gameManager.addPlayer(player);
        // Zapisz mapowania
        exports.playerSockets.set(socket.id, socket.id);
        exports.playerGames.set(socket.id, finalGameId);
        // Dołącz socket do pokoju gry
        socket.join(finalGameId);
        console.log(`${playerName} dołączył do gry ${finalGameId}`);
        // Wyślij aktualny stan gry do gracza
        const gameState = session.gameManager.getGameState();
        socket.emit(events_1.SOCKET_EVENTS.GAME_STATE_UPDATE, {
            ...gameState,
            playerView: session.gameManager.getPlayerView(socket.id)
        });
        // Broadcast updated players list to room (ensure frontend updates)
        io.to(finalGameId).emit(events_1.SOCKET_EVENTS.PLAYERS_UPDATED, {
            players: session.gameManager.players.map(p => p.getPublicState()),
            currentPlayerIndex: session.gameManager.currentPlayerIndex,
            gameState: session.gameManager.gameState
        });
        // Jeśli jest wystarczająco graczy, rozpocznij grę
        if (session.gameManager.players.length >= 2) {
            console.log(`Gra ${finalGameId} może się rozpocząć (${session.gameManager.players.length} graczy)`);
        }
    }
    catch (error) {
        console.error('Błąd przy dołączaniu do gry:', error);
        socket.emit(events_1.SOCKET_EVENTS.ERROR, { message: 'Błąd dołączenia do gry' });
    }
}
/**
 * Handler: Gracz składa licytację
 */
function handlePlaceBid(io, payload) {
    try {
        const { gameId, playerId, bidAmount } = payload;
        const session = exports.activeSessions.get(gameId);
        if (!session) {
            console.warn(`Gra ${gameId} nie znaleziona`);
            return;
        }
        const success = session.gameManager.placeBid(playerId, bidAmount);
        if (success) {
            // Wysyłka aktualizacji do wszystkich graczy
            io.to(gameId).emit(events_1.SOCKET_EVENTS.BID_PLACED, {
                playerId,
                bidAmount,
                gameState: session.gameManager.gameState,
                players: session.gameManager.players.map(p => p.getPublicState())
            });
            if (session.gameManager.gameState === GameManager_1.GameState.PLAYING) {
                io.to(gameId).emit(events_1.SOCKET_EVENTS.BIDDING_COMPLETE, {
                    bidderId: session.gameManager.players[session.gameManager.currentBidderIndex].id,
                    trump: session.gameManager.trump
                });
            }
            // Po złożeniu licytacji, spróbuj uruchomić boty (jeśli następny jest bot)
            processBots(io, session);
        }
    }
    catch (error) {
        console.error('Błąd przy składaniu licytacji:', error);
    }
}
function handleReturnMucekCards(io, socket, payload) {
    try {
        const { gameId, cardIds } = payload;
        const session = exports.activeSessions.get(gameId);
        if (!session)
            return;
        const gameManager = session.gameManager;
        // Licytant oddaje 2 karty do mucka
        if (!gameManager.discardToMuck(gameManager.bidderId, cardIds)) {
            io.to(socket.id).emit('error', { message: 'Invalid card discard' });
            return;
        }
        // Przejdź do gry
        io.to(gameId).emit('discardToMuckComplete', {
            gameState: gameManager.gameState,
            bidderId: gameManager.bidderId,
            muckPlayerId: gameManager.muckPlayerId,
            players: gameManager.players.map(p => p.getPublicState())
        });
        // Rozpocznij grę
        processBots(io, session);
    }
    catch (err) {
        console.error('Błąd przy oddawaniu kart muczka:', err);
    }
}
/**
 * Handler: Gracz zagrywa kartę
 */
function handlePlayCard(io, payload) {
    try {
        const { gameId, playerId, cardId } = payload;
        const session = exports.activeSessions.get(gameId);
        if (!session) {
            console.warn(`Gra ${gameId} nie znaleziona`);
            return;
        }
        const success = session.gameManager.playCard(playerId, cardId);
        if (success) {
            // Wysyłka aktualizacji do wszystkich graczy
            io.to(gameId).emit(events_1.SOCKET_EVENTS.CARD_PLAYED, {
                playerId,
                cardId,
                gameState: session.gameManager.getGameState()
            });
            // Sprawdź czy lewa się zakończyła
            if (session.gameManager.playedCards.length === 0 && session.gameManager.gameState === GameManager_1.GameState.PLAYING) {
                io.to(gameId).emit(events_1.SOCKET_EVENTS.TRICK_RESOLVED, {
                    gameState: session.gameManager.getGameState()
                });
            }
            // Sprawdź czy gra się skończyła
            if (session.gameManager.gameState === GameManager_1.GameState.GAME_END) {
                const winner = session.gameManager.players.reduce((prev, curr) => curr.score > prev.score ? curr : prev);
                io.to(gameId).emit(events_1.SOCKET_EVENTS.GAME_END, {
                    winner: winner.getPublicState(),
                    finalScores: session.gameManager.players.map(p => p.getPublicState())
                });
                // Usuń sesję
                exports.activeSessions.delete(gameId);
            }
        }
    }
    catch (error) {
        console.error('Błąd przy zagrywaniu karty:', error);
    }
}
/**
 * Handler: Gracz opuszcza grę
 */
function handleLeaveGame(io, socket) {
    try {
        const gameId = exports.playerGames.get(socket.id);
        if (!gameId)
            return;
        const session = exports.activeSessions.get(gameId);
        if (!session)
            return;
        session.gameManager.removePlayer(socket.id);
        session.players.delete(socket.id);
        console.log(`Gracz ${socket.id} opuścił grę ${gameId}`);
        socket.leave(gameId);
        // Powiadom pozostałych graczy
        io.to(gameId).emit(events_1.SOCKET_EVENTS.PLAYERS_UPDATED, {
            players: session.gameManager.players.map(p => p.getPublicState())
        });
        // Jeśli nikogo nie ma, usuń sesję
        if (session.gameManager.players.length === 0) {
            exports.activeSessions.delete(gameId);
        }
        exports.playerGames.delete(socket.id);
        exports.playerSockets.delete(socket.id);
    }
    catch (error) {
        console.error('Błąd przy opuszczaniu gry:', error);
    }
}
/**
 * Handler: Gracz się rozłącza
 */
function handleDisconnect(io, socket) {
    console.log(`Gracz rozłączył się: ${socket.id}`);
    handleLeaveGame(io, socket);
}
