"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotPlayer = void 0;
const uuid_1 = require("uuid");
const Player_1 = require("./Player");
const GameRules_1 = require("./GameRules");
/**
 * Prosty AI dla bota - heurystyka oparta na punktach kart
 */
class BotPlayer extends Player_1.Player {
    constructor(name) {
        const id = `bot-${(0, uuid_1.v4)()}`;
        super(id, name || `Bot-${id.slice(4, 8)}`, id);
    }
    /**
     * Prosty algorytm licytacji: sumuj punkty kart w ręce i biduj progowo
     */
    decideBid() {
        // weź pod uwagę meldunki i sumę punktów
        const melds = GameRules_1.GameRules.findMelds(this.hand);
        const meldPoints = melds.reduce((s, m) => s + m.points, 0);
        const cardPoints = this.hand.reduce((s, c) => s + c.getPointValue(), 0);
        const strength = meldPoints + cardPoints;
        // proste progi, preferuj meldy
        if (meldPoints >= 40)
            return 130;
        if (strength > 80)
            return 120;
        if (strength > 65)
            return 110;
        if (strength > 50)
            return 100;
        return 0; // pas
    }
    /**
     * Wybiera 2 karty do oddania do mucka (dla bota licytanta)
     * Strategia: oddaj najgłupsze karty (bez punktów, najniżej oceniane)
     */
    selectCardsToDiscard(gameManager) {
        // Posortuj karty po wartości punktowej - oddaj najpierw najgorszsze
        const sorted = [...this.hand].sort((a, b) => a.getPointValue() - b.getPointValue());
        return sorted.slice(0, 2);
    }
    /**
     * Wybiera kartę do zagrania na podstawie prostego kryterium:
     * - wybierz pierwszą legalną kartę o największej wartości punktowej
     */
    chooseCard(gameManager) {
        // wybierz najpierw legalną kartę o najwyższej wartości punktowej
        const sorted = [...this.hand].sort((a, b) => b.getPointValue() - a.getPointValue());
        for (const card of sorted) {
            // sprawdź czy zagranie tej karty jest legalne
            if (GameRules_1.GameRules.isCardPlayValid(card, gameManager.playedCards, this.hand, gameManager.trump)) {
                return card;
            }
        }
        // jeśli nic nielegalnego, zwróć pierwszą kartę
        return this.hand.length > 0 ? this.hand[0] : null;
    }
}
exports.BotPlayer = BotPlayer;
