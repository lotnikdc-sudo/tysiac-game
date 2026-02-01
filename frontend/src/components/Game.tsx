/**
 * Główny komponent gry
 */

import React, { useState, useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '../utils/socketClient';
import { SOCKET_EVENTS, GAME_STATES } from '../utils/gameConstants';
import Card from './Card';
import PlayerHand from './PlayerHand';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import BiddingDialog from './BiddingDialog';
import './Game.css';

interface CardObj {
  id: string;
  suit: string;
  rank: string;
}

interface PlayerObj {
  id: string;
  name: string;
  score: number;
  roundScore: number;
  bid: number;
  isBidder: boolean;
  handCount: number;
  tricksCount: number;
}

interface PlayedCard {
  playerId: string;
  cardId: string;
  suit: string;
  rank: string;
  playerName: string;
}

/**
 * Główny komponent gry
 */
const Game: React.FC = () => {
  const socketRef = useRef(getSocket());
  const [gameId, setGameId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [gameState, setGameState] = useState<string>(GAME_STATES.WAITING);
  const [players, setPlayers] = useState<PlayerObj[]>([]);
  const [playerHand, setPlayerHand] = useState<CardObj[]>([]);
  const [playedCards, setPlayedCards] = useState<PlayedCard[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);
  const [trump, setTrump] = useState<string>('');
  const [showBiddingDialog, setShowBiddingDialog] = useState<boolean>(false);
  const [myId, setMyId] = useState<string>('');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [disabledCards, setDisabledCards] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [joining, setJoining] = useState<boolean>(false);

  // Inicjalizacja Socket.io
  useEffect(() => {
    const socket = socketRef.current;

    socket.on(SOCKET_EVENTS.GAME_STATE_UPDATE, (data) => {
      console.log('Game state update:', data);
      setGameId(data.gameId);
      setGameState(data.state);
      setPlayers(data.players);
      setCurrentPlayerIndex(data.currentPlayerIndex);
      setTrump(data.trump || '');
      setRoundNumber(data.roundNumber);
      setMyId(socket.id || '');
      // we've received an update from server - stop showing joining state
      setJoining(false);
      setMessage('');

      if (data.playerView) {
        setPlayerHand(data.playerView.playerHand);
      }
    });

    socket.on(SOCKET_EVENTS.PLAYERS_UPDATED, (data) => {
      setPlayers(data.players);
      setCurrentPlayerIndex(data.currentPlayerIndex);
      setGameState(data.gameState);
      setJoining(false);
      setMessage('');
    });

    socket.on(SOCKET_EVENTS.BID_PLACED, (data) => {
      setPlayers(data.players);
      if (data.gameState === GAME_STATES.BIDDING) {
        setShowBiddingDialog(true);
      }
    });

    socket.on(SOCKET_EVENTS.BIDDING_COMPLETE, (data) => {
      setShowBiddingDialog(false);
      setTrump(data.trump);
      setGameState(GAME_STATES.PLAYING);
      setMessage('Licytacja zakończona! Zaczyna się gra.');
    });

    socket.on(SOCKET_EVENTS.CARD_PLAYED, (data) => {
      setGameState(data.gameState.state);
      setPlayedCards(data.gameState.playedCards);
      setCurrentPlayerIndex(data.gameState.currentPlayerIndex);
    });

    socket.on(SOCKET_EVENTS.TRICK_RESOLVED, (data) => {
      setTimeout(() => {
        setPlayedCards([]);
      }, 1500);
    });

    socket.on(SOCKET_EVENTS.ROUND_END, (data) => {
      setMessage('Runda zakończona!');
    });

    socket.on(SOCKET_EVENTS.GAME_END, (data) => {
      setMessage(`Gra zakończona! Zwycięzca: ${data.winner.name}`);
      setGameState(GAME_STATES.GAME_END);
    });

    socket.on(SOCKET_EVENTS.ERROR, (data) => {
      setMessage(`Błąd: ${data.message}`);
    });

    return () => {
      // Cleanup listeners
    };
  }, []);

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      setMessage('Wpisz swoją nazwę!');
      return;
    }

    const socket = socketRef.current;
    if (joining) return; // prevent double submit
    setJoining(true);
    socket.emit(SOCKET_EVENTS.JOIN_GAME, {
      playerName,
      gameId: gameId || undefined
    });

    setMessage('Dołączanie do gry...');
  };

  const handlePlaceBid = (bidAmount: number) => {
    const socket = socketRef.current;
    socket.emit(SOCKET_EVENTS.PLACE_BID, {
      gameId,
      playerId: myId,
      bidAmount
    });
    setShowBiddingDialog(false);
  };

  const handlePlayCard = (cardId: string) => {
    // Sprawdź czy to moja tura
    if (players[currentPlayerIndex]?.id !== myId) {
      setMessage('To nie twoja tura!');
      return;
    }

    const socket = socketRef.current;
    socket.emit(SOCKET_EVENTS.PLAY_CARD, {
      gameId,
      playerId: myId,
      cardId
    });
  };

  const handleLeaveGame = () => {
    const socket = socketRef.current;
    socket.emit(SOCKET_EVENTS.LEAVE_GAME);
    setPlayerName('');
    setGameState(GAME_STATES.WAITING);
    setPlayers([]);
    setPlayerHand([]);
  };

  const handleAddBot = (botName?: string) => {
    const socket = socketRef.current;
    socket.emit(SOCKET_EVENTS.ADD_BOT, { gameId, botName });
    setMessage('Dodano bota...');
  };

  const handleFillWithBots = () => {
    const socket = socketRef.current;
    // calculate how many bots to add
    const needed = Math.max(0, 4 - players.length);
    for (let i = 0; i < needed; i++) {
      socket.emit(SOCKET_EVENTS.ADD_BOT, { gameId, botName: `Bot${i + 1}` });
    }
    setMessage(`Dodano ${needed} bota(ów)`);
  };

  // Gra jeszcze się nie rozpoczęła
  if (!gameState || gameState === GAME_STATES.WAITING) {
    return (
      <div className="game-container lobby">
        <div className="lobby-box">
          <h1>🎴 Tysiąc Online</h1>
          <p className="subtitle">Karciana gra dla 2-4 graczy</p>

          <div className="lobby-form">
            <input
              type="text"
              placeholder="Wpisz swoją nazwę"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              maxLength={20}
            />
            <input
              type="text"
              placeholder="ID gry (opcjonalne)"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              maxLength={36}
            />
            <button onClick={handleJoinGame} className="btn-primary" disabled={joining}>
              {joining ? 'Dołączanie...' : '🎮 Dołącz do gry'}
            </button>
            <button onClick={() => handleAddBot('JanBot')} className="btn-secondary" style={{marginLeft:8}}>
              ➕ Dodaj bota
            </button>
            <button onClick={handleFillWithBots} className="btn-secondary" style={{marginLeft:8}}>
              🔥 Dopełnij do 4 graczy
            </button>
          </div>

          {players.length > 0 && (
            <div className="players-list">
              <h3>Gracze ({players.length}/4)</h3>
              {players.map((p) => (
                <div key={p.id} className="player-item">
                  {p.name}
                </div>
              ))}
            </div>
          )}

          {message && <div className="message">{message}</div>}

          <div className="rules-info">
            <h3>📋 Zasady:</h3>
            <ul>
              <li>Gra dla 2-4 graczy</li>
              <li>24 karty (9, J, Q, K, 10, A)</li>
              <li>Licytacja, meldunki, atuty</li>
              <li>Pierwszy do 1000 punktów wygrywa!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const isMyTurn = players[currentPlayerIndex]?.id === myId;
  const myPlayer = players.find(p => p.id === myId);

  return (
    <div className="game-container playing">
      {/* Header */}
      <div className="game-header">
        <div className="game-info">
          <span className="info-item">🎴 Runda {roundNumber}/9</span>
          <span className="info-item">🎯 Stan: {gameState}</span>
          {trump && <span className="info-item">Atut: {trump}</span>}
        </div>
        <div className="game-controls">
          <button onClick={handleLeaveGame} className="btn-leave">
            Opuść grę
          </button>
          <button onClick={() => handleAddBot('JanBot')} className="btn-secondary" style={{marginLeft:8}}>
            ➕ Dodaj bota
          </button>
          <button onClick={handleFillWithBots} className="btn-secondary" style={{marginLeft:8}}>
            🔥 Dopełnij do 4 graczy
          </button>
        </div>
      </div>

      {/* Main game area */}
      <div className="game-main">
        {/* Left sidebar */}
        <div className="game-sidebar-left">
          <ScoreBoard players={players} currentPlayerIndex={currentPlayerIndex} />
        </div>

        {/* Center board */}
        <div className="game-center">
          <Board playedCards={playedCards} trump={trump} />
        </div>

        {/* Right sidebar */}
        <div className="game-sidebar-right">
          {myPlayer && (
            <div className="player-info">
              <h3>{myPlayer.name}</h3>
              <p>Wynik: <strong>{myPlayer.score}</strong></p>
              <p>Licytacja: <strong>{myPlayer.bid}</strong></p>
              {isMyTurn && <div className="your-turn">📍 Twoja tura!</div>}
            </div>
          )}
        </div>
      </div>

      {/* Player hand */}
      <div className="game-footer">
        <PlayerHand
          cards={playerHand}
          onCardPlay={handlePlayCard}
          disabledCards={!isMyTurn ? playerHand.map(c => c.id) : disabledCards}
          currentPlayer={true}
        />
      </div>

      {/* Dialogs */}
      <BiddingDialog
        isOpen={showBiddingDialog}
        onBidSubmit={handlePlaceBid}
        playerName={myPlayer?.name}
      />

      {/* Messages */}
      {message && (
        <div className="message-overlay">
          <div className="message-box">{message}</div>
        </div>
      )}
    </div>
  );
};

export default Game;
