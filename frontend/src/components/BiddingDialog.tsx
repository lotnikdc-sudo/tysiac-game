/**
 * Dialog do licytacji
 */

import React, { useState } from 'react';
import './BiddingDialog.css';

interface BiddingDialogProps {
  isOpen: boolean;
  onBidSubmit: (bidAmount: number) => void;
  currentBid?: number;
  minBid?: number;
  playerName?: string;
}

/**
 * Dialog pozwalający graczowi złożyć licytację
 */
const BiddingDialog: React.FC<BiddingDialogProps> = ({
  isOpen,
  onBidSubmit,
  currentBid = 0,
  minBid = 100,
  playerName = 'Gracz'
}) => {
  const [bidAmount, setBidAmount] = useState(minBid);

  const handleSubmit = () => {
    if (bidAmount >= minBid) {
      onBidSubmit(bidAmount);
      setBidAmount(minBid);
    }
  };

  const handlePass = () => {
    onBidSubmit(0);
    setBidAmount(minBid);
  };

  const increaseBid = () => {
    setBidAmount(Math.min(bidAmount + 10, 1000));
  };

  const decreaseBid = () => {
    setBidAmount(Math.max(bidAmount - 10, minBid));
  };

  if (!isOpen) return null;

  return (
    <div className="bidding-overlay">
      <div className="bidding-dialog">
        <h2>Licytacja</h2>
        <p className="bidding-player">
          Tura: <strong>{playerName}</strong>
        </p>

        <div className="bidding-controls">
          <div className="bid-display">
            <span className="bid-label">Twoja licytacja:</span>
            <span className="bid-value">{bidAmount} pkt</span>
          </div>

          <div className="bid-buttons">
            <button
              className="bid-btn decrease"
              onClick={decreaseBid}
              disabled={bidAmount <= minBid}
            >
              −10
            </button>

            <input
              type="range"
              min={minBid}
              max="1000"
              value={bidAmount}
              onChange={(e) => setBidAmount(parseInt(e.target.value))}
              className="bid-slider"
            />

            <button
              className="bid-btn increase"
              onClick={increaseBid}
              disabled={bidAmount >= 1000}
            >
              +10
            </button>
          </div>

          <div className="bid-quick">
            <button
              className="quick-btn"
              onClick={() => setBidAmount(100)}
            >
              100
            </button>
            <button
              className="quick-btn"
              onClick={() => setBidAmount(200)}
            >
              200
            </button>
            <button
              className="quick-btn"
              onClick={() => setBidAmount(300)}
            >
              300
            </button>
            <button
              className="quick-btn"
              onClick={() => setBidAmount(500)}
            >
              500
            </button>
          </div>
        </div>

        <div className="bidding-actions">
          <button
            className="bid-confirm-btn"
            onClick={handleSubmit}
          >
            ✓ Potwierdź licytację
          </button>
          <button
            className="bid-pass-btn"
            onClick={handlePass}
          >
            ✗ Pas
          </button>
        </div>
      </div>
    </div>
  );
};

export default BiddingDialog;
