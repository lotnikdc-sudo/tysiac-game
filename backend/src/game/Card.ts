/**
 * Model karty w grze Tysiąc
 * Standardowa talia 24 kart (4 kolory × 6 wartości)
 */

export enum Suit {
  HEARTS = 'hearts',      // ♥ Kiery
  DIAMONDS = 'diamonds',  // ♦ Kara
  CLUBS = 'clubs',        // ♣ Trefle
  SPADES = 'spades'       // ♠ Piki
}

export enum Rank {
  NINE = '9',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  TEN = '10',
  ACE = 'A'
}

export class Card {
  suit: Suit;
  rank: Rank;

  constructor(suit: Suit, rank: Rank) {
    this.suit = suit;
    this.rank = rank;
  }

  /**
   * Zwraca wartość punktów karty dla tego rankingu
   * @param trump - kolor atutowy
   * @returns liczba punktów
   */
  getPointValue(trump?: Suit): number {
    const baseValues: Record<Rank, number> = {
      [Rank.NINE]: 0,
      [Rank.JACK]: 2,
      [Rank.QUEEN]: 3,
      [Rank.KING]: 4,
      [Rank.TEN]: 10,
      [Rank.ACE]: 11
    };
    return baseValues[this.rank];
  }

  /**
   * Zwraca siłę karty do porównania przy braniu lewy
   * @param trump - kolor atutowy
   * @returns liczba reprezentująca siłę
   */
  getStrength(trump?: Suit): number {
    const strengthValues: Record<Rank, number> = {
      [Rank.NINE]: 1,
      [Rank.JACK]: 2,
      [Rank.QUEEN]: 3,
      [Rank.KING]: 4,
      [Rank.TEN]: 5,
      [Rank.ACE]: 6
    };
    return strengthValues[this.rank];
  }

  /**
   * Zwraca unikalny identyfikator karty
   */
  getId(): string {
    return `${this.suit}_${this.rank}`;
  }

  /**
   * Porównuje dwie karty
   */
  equals(other: Card): boolean {
    return this.suit === other.suit && this.rank === other.rank;
  }

  /**
   * Zwraca string reprezentujący kartę
   */
  toString(): string {
    return `${this.rank}${this.suit[0].toUpperCase()}`;
  }
}
