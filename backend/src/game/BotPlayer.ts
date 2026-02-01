import { v4 as uuidv4 } from 'uuid';
import { Player } from './Player';
import { Card } from './Card';
import { GameManager } from './GameManager';
import { GameRules } from './GameRules';

/**
 * Prosty AI dla bota - heurystyka oparta na punktach kart
 */
export class BotPlayer extends Player {
  constructor(name?: string) {
    const id = `bot-${uuidv4()}`;
    super(id, name || `Bot-${id.slice(4, 8)}`, id);
  }

  /**
   * Prosty algorytm licytacji: sumuj punkty kart w ręce i biduj progowo
   */
  decideBid(): number {
    // weź pod uwagę meldunki i sumę punktów
    const melds = GameRules.findMelds(this.hand);
    const meldPoints = melds.reduce((s, m) => s + m.points, 0);
    const cardPoints = this.hand.reduce((s, c) => s + c.getPointValue(), 0);
    const strength = meldPoints + cardPoints;

    // proste progi, preferuj meldy
    if (meldPoints >= 40) return 130;
    if (strength > 80) return 120;
    if (strength > 65) return 110;
    if (strength > 50) return 100;
    return 0; // pas
  }

  /**
   * Wybiera kartę do zagrania na podstawie prostego kryterium:
   * - wybierz pierwszą legalną kartę o największej wartości punktowej
   */
  chooseCard(gameManager: GameManager): Card | null {
    // wybierz najpierw legalną kartę o najwyższej wartości punktowej
    const sorted = [...this.hand].sort((a, b) => b.getPointValue() - a.getPointValue());
    for (const card of sorted) {
      // sprawdź czy zagranie tej karty jest legalne
      if (GameRules.isCardPlayValid(card, gameManager.playedCards, this.hand, gameManager.trump!)) {
        return card;
      }
    }
    // jeśli nic nielegalnego, zwróć pierwszą kartę
    return this.hand.length > 0 ? this.hand[0] : null;
  }
}
