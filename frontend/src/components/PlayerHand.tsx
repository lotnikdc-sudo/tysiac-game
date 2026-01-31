/**
 * Komponent ręki gracza
 */

import React, { useState } from 'react';
import Card from './Card';
import './PlayerHand.css';

interface CardObj {
  id: string;
  suit: string;
  rank: string;
}

interface PlayerHandProps {
  cards: CardObj[];
  onCardPlay?: (cardId: string) => void;
  disabledCards?: string[];
  currentPlayer?: boolean;
}

/**
 * Wyświetla rękę gracza z możliwością zagrania karty
 */
const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onCardPlay,
  disabledCards = [],
  currentPlayer = false
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    if (disabledCards.includes(cardId)) return;

    setSelectedCard(selectedCard === cardId ? null : cardId);

    if (currentPlayer && onCardPlay) {
      onCardPlay(cardId);
      setSelectedCard(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (disabledCards.includes(cardId)) {
      e.preventDefault();
      return;
    }
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', cardId);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  return (
    <div className={`player-hand ${currentPlayer ? 'current-player' : ''}`}>
      <div className="hand-title">
        {currentPlayer ? '🎯 Twoja ręka' : 'Ręka'}
      </div>
      <div className="cards-container">
        {cards.length === 0 ? (
          <div className="empty-hand">Brak kart</div>
        ) : (
          cards.map((card, index) => (
            <Card
              key={card.id}
              suit={card.suit}
              rank={card.rank}
              selected={selectedCard === card.id}
              disabled={disabledCards.includes(card.id)}
              onClick={() => handleCardClick(card.id)}
              draggable={currentPlayer && !disabledCards.includes(card.id)}
              onDragStart={(e) => handleDragStart(e, card.id)}
              onDragEnd={handleDragEnd}
              className={draggedCard === card.id ? 'dragging' : ''}
              style={{
                transform: draggedCard === card.id ? 'opacity(0.5)' : undefined
              }}
            />
          ))
        )}
      </div>
      <div className="hand-info">
        Kart: {cards.length}
      </div>
    </div>
  );
};

export default PlayerHand;
