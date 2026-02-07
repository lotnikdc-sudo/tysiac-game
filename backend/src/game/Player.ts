/**
 * Model gracza w grze Tysiąc
 */

import { Card } from './Card';

export interface Meld {
  name: string;        // Nazwa meldunku (np. "Sto trzydzieści cztery")
  cards: Card[];       // Karty tworzące meldunek
  points: number;      // Punkty za meldunek
}

export class Player {
  id: string;
  name: string;
  socketId: string;
  hand: Card[] = [];           // Karty w ręce gracza
  tricks: Card[][] = [];       // Wygrane lewy (każda lewa = tablica 3 kart)
  score: number = 0;           // Całkowity wynik gracza
  roundScore: number = 0;      // Wynik w aktualnej rundzie
  melds: Meld[] = [];         // Meldunki tego gracza
  bid: number = -1;             // Licytacja gracza (-1 = nieoddana jeszcze, 0 = pas)
  isBidder: boolean = false;   // Czy gracz jest licytantem
  trump?: string;              // Kolor atutowy (jeśli gracz jest licytantem)

  constructor(id: string, name: string, socketId: string) {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
  }

  /**
   * Dodaje kartę do ręki gracza
   */
  addCard(card: Card): void {
    this.hand.push(card);
  }

  /**
   * Usuwa kartę z ręki gracza
   */
  removeCard(card: Card): boolean {
    const index = this.hand.findIndex(c => c.equals(card));
    if (index > -1) {
      this.hand.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Zwraca karty w ręce (dla wysyłania do klienta)
   */
  getHandIds(): string[] {
    return this.hand.map(c => c.getId());
  }

  /**
   * Sortuje kartę w ręce gracza
   */
  sortHand(): void {
    const suitOrder = { hearts: 0, diamonds: 1, clubs: 2, spades: 3 };
    const rankOrder = { '9': 0, 'J': 1, 'Q': 2, 'K': 3, '10': 4, 'A': 5 };
    
    this.hand.sort((a, b) => {
      const suitDiff = suitOrder[a.suit as keyof typeof suitOrder] - suitOrder[b.suit as keyof typeof suitOrder];
      if (suitDiff !== 0) return suitDiff;
      return rankOrder[a.rank as keyof typeof rankOrder] - rankOrder[b.rank as keyof typeof rankOrder];
    });
  }

  /**
   * Dodaje wziętą lewę
   */
  addTrick(trick: Card[]): void {
    this.tricks.push(trick);
  }

  /**
   * Oblicza całkowite punkty z kart i meldunków
   */
  calculateRoundScore(): number {
    let total = 0;
    
    // Punkty z meldunków
    this.melds.forEach(meld => {
      total += meld.points;
    });

    // Punkty z kart w wziętych lewach
    this.tricks.forEach(trick => {
      trick.forEach(card => {
        total += card.getPointValue();
      });
    });

    this.roundScore = total;
    return total;
  }

  /**
   * Resetuje stan gracza do nowej rundy
   */
  resetForNewRound(): void {
    this.hand = [];
    this.tricks = [];
    this.melds = [];
    this.bid = -1;
    this.isBidder = false;
    this.roundScore = 0;
  }

  /**
   * Zwraca stan gracza dla klienta (bez wrażliwych danych)
   */
  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      handCount: this.hand.length,
      score: this.score,
      roundScore: this.roundScore,
      bid: this.bid < 0 ? 0 : this.bid,
      isBidder: this.isBidder,
      tricksCount: this.tricks.length,
      meldsCount: this.melds.length
    };
  }
}
