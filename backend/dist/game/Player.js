"use strict";
/**
 * Model gracza w grze Tysiąc
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(id, name, socketId) {
        this.hand = []; // Karty w ręce gracza
        this.tricks = []; // Wygrane lewy (każda lewa = tablica 3 kart)
        this.score = 0; // Całkowity wynik gracza
        this.roundScore = 0; // Wynik w aktualnej rundzie
        this.melds = []; // Meldunki tego gracza
        this.bid = -1; // Licytacja gracza (-1 = nieoddana jeszcze, 0 = pas)
        this.isBidder = false; // Czy gracz jest licytantem
        this.id = id;
        this.name = name;
        this.socketId = socketId;
    }
    /**
     * Dodaje kartę do ręki gracza
     */
    addCard(card) {
        this.hand.push(card);
    }
    /**
     * Usuwa kartę z ręki gracza
     */
    removeCard(card) {
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
    getHandIds() {
        return this.hand.map(c => c.getId());
    }
    /**
     * Sortuje kartę w ręce gracza
     */
    sortHand() {
        const suitOrder = { hearts: 0, diamonds: 1, clubs: 2, spades: 3 };
        const rankOrder = { '9': 0, 'J': 1, 'Q': 2, 'K': 3, '10': 4, 'A': 5 };
        this.hand.sort((a, b) => {
            const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
            if (suitDiff !== 0)
                return suitDiff;
            return rankOrder[a.rank] - rankOrder[b.rank];
        });
    }
    /**
     * Dodaje wziętą lewę
     */
    addTrick(trick) {
        this.tricks.push(trick);
    }
    /**
     * Oblicza całkowite punkty z kart i meldunków
     */
    calculateRoundScore() {
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
    resetForNewRound() {
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
exports.Player = Player;
