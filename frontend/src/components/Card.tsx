/**
 * Komponent karty
 */

import React from 'react';
import { SUIT_SYMBOLS, SUIT_COLORS, RANK_NAMES } from '../utils/gameConstants';
import './Card.css';

interface CardProps {
  suit?: string;
  rank?: string;
  faceDown?: boolean;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  selected?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Komponent karty
 */
const Card: React.FC<CardProps> = ({
  suit,
  rank,
  faceDown = false,
  onClick,
  draggable = false,
  onDragStart,
  onDragEnd,
  selected = false,
  disabled = false,
  style,
  className = ''
}) => {
  if (faceDown) {
    return (
      <div
        className={`card card-facedown ${className}`}
        style={style}
        onClick={onClick}
      >
        <div className="card-back">
          <div className="card-pattern">🎴</div>
        </div>
      </div>
    );
  }

  const suitSymbol = suit ? SUIT_SYMBOLS[suit as keyof typeof SUIT_SYMBOLS] : '';
  const suitColor = suit ? SUIT_COLORS[suit as keyof typeof SUIT_COLORS] : '#000';
  const rankName = rank ? RANK_NAMES[rank as keyof typeof RANK_NAMES] : '';

  return (
    <div
      className={`card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      style={{
        ...style,
        color: suitColor,
        borderColor: selected ? '#ffd700' : suitColor,
        cursor: disabled ? 'not-allowed' : draggable ? 'grab' : 'pointer'
      }}
      onClick={onClick}
      draggable={draggable && !disabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title={`${rank} ${suitSymbol}`}
    >
      <div className="card-corner card-corner-top">
        <div className="card-rank">{rank}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>

      <div className="card-center">
        <div className="card-suit-large">{suitSymbol}</div>
      </div>

      <div className="card-corner card-corner-bottom">
        <div className="card-rank">{rank}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
    </div>
  );
};

export default Card;
