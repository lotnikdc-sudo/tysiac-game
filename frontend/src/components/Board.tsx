/**
 * Komponent stołu do gry
 */

import React from 'react';
import Card from './Card';
import './Board.css';

interface PlayedCard {
  playerId: string;
  cardId: string;
  suit: string;
  rank: string;
  playerName: string;
}

interface BoardProps {
  playedCards: PlayedCard[];
  trump?: string;
  onCardDropped?: (cardId: string) => void;
}

/**
 * Wyświetla stół z zagranym kartami
 */
const Board: React.FC<BoardProps> = ({
  playedCards,
  trump,
  onCardDropped
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (onCardDropped && cardId) {
      onCardDropped(cardId);
    }
  };

  return (
    <div
      className="board"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="board-header">
        <div className="board-title">STÓŁ</div>
        {trump && (
          <div className="trump-info">
            Atut: <span className="trump-symbol">♠</span>
          </div>
        )}
      </div>

      <div className="board-cards">
        {playedCards.length === 0 ? (
          <div className="empty-board">
            Przeciągnij kartę na stół lub kliknij na kartę
          </div>
        ) : (
          playedCards.map((pc, index) => (
            <div key={`${pc.playerId}-${index}`} className="played-card-wrapper">
              <Card
                suit={pc.suit}
                rank={pc.rank}
                className="board-card"
              />
              <div className="player-label">{pc.playerName}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
