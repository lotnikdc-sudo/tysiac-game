/**
 * Komponent tablicy wyników
 */

import React from 'react';
import './ScoreBoard.css';

interface Player {
  id: string;
  name: string;
  score: number;
  roundScore: number;
  bid: number;
  isBidder: boolean;
  handCount: number;
}

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIndex?: number;
}

/**
 * Wyświetla tabelę wyników wszystkich graczy
 */
const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentPlayerIndex = -1
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard">
      <h2 className="scoreboard-title">📊 WYNIKI</h2>

      <div className="scoreboard-table">
        <div className="table-header">
          <div className="col-rank">#</div>
          <div className="col-name">Gracz</div>
          <div className="col-score">Wynik</div>
          <div className="col-bid">Licytacja</div>
          <div className="col-status">Status</div>
        </div>

        <div className="table-body">
          {sortedPlayers.map((player, index) => {
            const isCurrentPlayer = players[currentPlayerIndex]?.id === player.id;
            return (
              <div
                key={player.id}
                className={`table-row ${isCurrentPlayer ? 'current' : ''}`}
              >
                <div className="col-rank">{index + 1}</div>
                <div className="col-name">
                  {isCurrentPlayer && <span className="current-badge">→</span>}
                  {player.name}
                </div>
                <div className="col-score">
                  <span className={player.score >= 1000 ? 'win' : player.score < 0 ? 'lose' : ''}>
                    {player.score}
                  </span>
                </div>
                <div className="col-bid">
                  {player.bid > 0 ? `${player.bid}` : '-'}
                  {player.isBidder && <span className="bidder-badge">🎯</span>}
                </div>
                <div className="col-status">
                  {player.handCount} kart
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
