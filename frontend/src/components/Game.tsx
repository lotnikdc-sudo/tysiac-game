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
  const [mucekCards, setMucekCards] = useState<CardObj[]>([]);
  const [showMucekSelection, setShowMucekSelection] = useState<boolean>(false);
  const [selectedMucekCards, setSelectedMucekCards] = useState<string[]>([]);
  const [muckPlayerId, setMuckPlayerId] = useState<string>('');
  const [bidderId, setBidderId] = useState<string>('');
  const [showCardSelection, setShowCardSelection] = useState<boolean>(false);
  const [selectedCardsTiDiscard, setSelectedCardsTiDiscard] = useState<string[]>([]);

  // Inicjalizacja Socket.io
  useEffect(() => {
    const socket = socketRef.current;

    socket.on(SOCKET_EVENTS.GAME_STATE_UPDATE, (data) => {
      console.log('Game state update:', data);
      setGameId(data.gameId);
      setGameState(data.state);
      setPlayers(data.players || []);
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
      setPlayers(data.players || []);
      setCurrentPlayerIndex(data.currentPlayerIndex);
      setGameState(data.gameState);
      setJoining(false);
      setMessage('');
    });

    socket.on(SOCKET_EVENTS.BID_PLACED, (data) => {
      setPlayers(data.players || []);
      setBidderId(data.playerId || '');
      setMuckPlayerId(data.muckPlayerId || '');
      // Show bidding dialog only if it's for this client
      if (data.gameState === GAME_STATES.BIDDING) {
        if (data.playerId === (socketRef.current?.id)) {
          setShowBiddingDialog(true);
        } else {
          setShowBiddingDialog(false);
        }
      }
    });

    socket.on('selectCardsTiDiscard', (data) => {
      // Only show dialog if this client is the bidder
      if (data.playerId === socketRef.current?.id) {
        setShowCardSelection(true);
        setMessage('Licytacja zakończona! Wybierz 2 karty do oddania do mucka.');
      }
    });

    socket.on(SOCKET_EVENTS.DISCARD_TO_MUCK_COMPLETE, (data) => {
      setShowCardSelection(false);
      setMuckPlayerId(data.muckPlayerId || '');
      setBidderId(data.bidderId || '');
      setGameState(GAME_STATES.PLAYING);
      setMessage('Karty oddane! Zaczyna się gra.');
      setSelectedCardsTiDiscard([]);
    });

    socket.on('discardToMuckComplete', (data) => {
      setShowCardSelection(false);
      setMuckPlayerId(data.muckPlayerId || '');
      setBidderId(data.bidderId || '');
      setGameState(data.gameState);
      setMessage('Karty oddane! Zaczyna się gra.');
      setSelectedCardsTiDiscard([]);
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

    socket.on('showMucekCards', (data) => {
      setMucekCards(data.mucekCards);
      setShowMucekSelection(true);
      setMessage('Wybierz 2 karty do oddania z muczka');
    });

    socket.on('mucekReturned', (data) => {
      setShowMucekSelection(false);
      setMessage('Karty oddane, za chwilę zacznie się licytacja...');
    });

    socket.on('showMucekPhase', (data) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setMessage('Muczek ujawniony! Licytacja się zaczyna.');
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

  const handleStartGame = () => {
    const socket = socketRef.current;
    socket.emit(SOCKET_EVENTS.GAME_START, { gameId });
    setMessage('Rozpoczynanie gry...');
  };

  const handleFillWithBots = () => {
    const socket = socketRef.current;
    const needed = Math.max(0, 4 - ((players?.length) ?? 0));
    for (let i = 0; i < needed; i++) {
      socket.emit(SOCKET_EVENTS.ADD_BOT, { gameId, botName: `Bot${i + 1}` });
    }
    setMessage(`Dodano ${needed} bota(ów)`);
  };

  const handleReturnMucekCards = () => {
    if (selectedMucekCards.length !== 2) {
      setMessage('Musisz wybrać dokładnie 2 karty!');
      return;
    }
    const socket = socketRef.current;
    socket.emit(SOCKET_EVENTS.RETURN_MUCEK_CARDS, {
      gameId,
      cardIds: selectedMucekCards
    });
    setSelectedMucekCards([]);
  };

  const handleDiscardToMuck = () => {
    if (selectedCardsTiDiscard.length !== 2) {
      setMessage('Musisz wybrać dokładnie 2 karty do oddania do mucka!');
      return;
    }
    const socket = socketRef.current;
    socket.emit(SOCKET_EVENTS.DISCARD_TO_MUCK, {
      gameId,
      cardIds: selectedCardsTiDiscard
    });
    setSelectedCardsTiDiscard([]);
  };

  const toggleCardToDiscard = (cardId: string) => {
    setSelectedCardsTiDiscard(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else if (prev.length < 2) {
        return [...prev, cardId];
      }
      return prev;
    });
  };

  const toggleMucekCard = (cardId: string) => {
    setSelectedMucekCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else if (prev.length < 2) {
        return [...prev, cardId];
      }
      return prev;
    });
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
            <button onClick={handleStartGame} className="btn-primary" style={{marginLeft:8}} disabled={((players?.length) ?? 0) < 2}>
              ▶️ Start
            </button>
            <button onClick={() => handleAddBot('JanBot')} className="btn-secondary" style={{marginLeft:8}}>
              ➕ Dodaj bota
            </button>
            <button onClick={handleFillWithBots} className="btn-secondary" style={{marginLeft:8}}>
              🔥 Dopełnij do 4 graczy
            </button>
          </div>

          {(players?.length ?? 0) > 0 && (
            <div className="players-list">
              <h3>Gracze ({(players?.length ?? 0)}/4)</h3>
              {(players || []).map((p) => (
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

  const isMyTurn = (currentPlayerIndex >= 0 && currentPlayerIndex < players.length) ? players[currentPlayerIndex]?.id === myId : false;
  const myPlayer = players ? players.find(p => p.id === myId) : undefined;

  return (
    <div className="game-container playing">
      {/* Header */}
      <div className="game-header">
        <div className="game-info">
          <span className="info-item">🎴 Runda {roundNumber}{/* total rounds hidden — game ends at 1000 pkt */}</span>
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
              <p>Licytacja: <strong>{myPlayer ? (myPlayer.bid ?? 0) : 0}</strong></p>
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
      {showCardSelection && (
        <div className="message-overlay">
          <div className="card-selection-dialog">
            <h3>🎴 Wybór kart do oddania - Mucek</h3>
            <p>Wybrales licytację! Teraz musisz oddać 2 karty do mucka.</p>
            <div className="selection-cards">
              {playerHand.map(card => (
                <div
                  key={card.id}
                  className={`selection-card ${selectedCardsTiDiscard.includes(card.id) ? 'selected' : ''}`}
                  onClick={() => toggleCardToDiscard(card.id)}
                  title={`${card.rank} ${card.suit}`}
                >
                  <span className="card-rank">{card.rank}</span>
                  <span className="card-suit">{card.suit}</span>
                </div>
              ))}
            </div>
            <div className="selection-info">
              Wybrane: {selectedCardsTiDiscard.length}/2
            </div>
            <button
              onClick={handleDiscardToMuck}
              disabled={selectedCardsTiDiscard.length !== 2}
              className="btn-primary"
            >
              Potwierdź - Oddaj karty
            </button>
          </div>
        </div>
      )}

      {showMucekSelection && (
        <div className="message-overlay">
          <div className="mucek-dialog">
            <h3>🎴 Muczek - Wybierz 2 karty do oddania</h3>
            <div className="mucek-cards">
              {mucekCards.map(card => (
                <div
                  key={card.id}
                  className={`mucek-card ${selectedMucekCards.includes(card.id) ? 'selected' : ''}`}
                  onClick={() => toggleMucekCard(card.id)}
                >
                  {card.rank}{card.suit}
                </div>
              ))}
            </div>
            <div className="mucek-info">
              Wybrane: {selectedMucekCards.length}/2
            </div>
            <button
              onClick={handleReturnMucekCards}
              disabled={selectedMucekCards.length !== 2}
              className="btn-primary"
            >
              Zatwierdź
            </button>
          </div>
        </div>
      )}

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
