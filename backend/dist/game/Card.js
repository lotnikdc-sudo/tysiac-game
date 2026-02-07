"use strict";
/**
 * Model karty w grze Tysiąc
 * Standardowa talia 24 kart (4 kolory × 6 wartości)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = exports.Rank = exports.Suit = void 0;
var Suit;
(function (Suit) {
    Suit["HEARTS"] = "hearts";
    Suit["DIAMONDS"] = "diamonds";
    Suit["CLUBS"] = "clubs";
    Suit["SPADES"] = "spades"; // ♠ Piki
})(Suit || (exports.Suit = Suit = {}));
var Rank;
(function (Rank) {
    Rank["NINE"] = "9";
    Rank["JACK"] = "J";
    Rank["QUEEN"] = "Q";
    Rank["KING"] = "K";
    Rank["TEN"] = "10";
    Rank["ACE"] = "A";
})(Rank || (exports.Rank = Rank = {}));
class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
    /**
     * Zwraca wartość punktów karty dla tego rankingu
     * @param trump - kolor atutowy
     * @returns liczba punktów
     */
    getPointValue(trump) {
        const baseValues = {
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
    getStrength(trump) {
        const strengthValues = {
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
    getId() {
        return `${this.suit}_${this.rank}`;
    }
    /**
     * Porównuje dwie karty
     */
    equals(other) {
        return this.suit === other.suit && this.rank === other.rank;
    }
    /**
     * Zwraca string reprezentujący kartę
     */
    toString() {
        return `${this.rank}${this.suit[0].toUpperCase()}`;
    }
}
exports.Card = Card;
