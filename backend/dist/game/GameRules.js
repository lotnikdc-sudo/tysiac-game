"use strict";
/**
 * Główna logika gry Tysiąc (1000)
 * Implementacja standardowych zasad
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRules = void 0;
const Card_1 = require("./Card");
class GameRules {
    /**
     * Tworzy standardową talię 24 kart
     */
    static createDeck() {
        const deck = [];
        const suits = Object.values(Card_1.Suit);
        const ranks = Object.values(Card_1.Rank);
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push(new Card_1.Card(suit, rank));
            }
        }
        return this.shuffle(deck);
    }
    /**
     * Tasuje talię (shuffle)
     */
    static shuffle(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    /**
     * Rozdaje karty: każdemu graczowi 3 karty
     * Zwraca 2 karty talonu (będą w ręku licytanta po wygraniu aukcji)
     * Pierwsza karta talonu to karta atutowa
     */
    static dealCards(players) {
        const deck = this.createDeck();
        let deckIndex = 0;
        // Rozdaj 3 karty każdemu graczowi
        for (let i = 0; i < 3; i++) {
            for (const player of players) {
                if (deckIndex >= deck.length)
                    break;
                player.addCard(deck[deckIndex++]);
            }
        }
        // Posortuj ręce graczy
        players.forEach(p => p.sortHand());
        // Talon: 2 następne karty (zostają aż do wyboru przez licytanta)
        const talon = [];
        if (deckIndex < deck.length)
            talon.push(deck[deckIndex++]);
        if (deckIndex < deck.length)
            talon.push(deck[deckIndex++]);
        return talon;
    }
    /**
     * Sprawdza, czy gracz może zagrać kartę
     * - Jeśli ma kartę koloru żadanego - musi zagrać tego koloru
     * - Jeśli nie ma - może zagrać atutu
     * - Jeśli nie ma atutu - może zagrać dowolną
     */
    static isCardPlayValid(card, playedCards, playerHand, trump) {
        if (playedCards.length === 0) {
            return true; // Pierwszy gracz może zagrać dowolną kartę
        }
        const leadCard = playedCards[0];
        const leadSuit = leadCard.suit;
        // Sprawdź czy gracz ma kartę żądanego koloru
        const hasLeadSuit = playerHand.some(c => c.suit === leadSuit);
        if (hasLeadSuit) {
            return card.suit === leadSuit; // Musi zagrać żądany kolor
        }
        // Sprawdź czy gracz ma atuty
        const hasTrump = playerHand.some(c => c.suit === trump);
        if (hasTrump) {
            return card.suit === trump; // Musi zagrać atutem
        }
        // Jeśli nie ma żądanego koloru ani atutów - może zagrać dowolną
        return true;
    }
    /**
     * Porównuje karty i zwraca zwycięzcę lewy
     * Zasady: atut bije wszystko, inaczej większa karta żądanego koloru
     */
    static determineWinner(playedCards, playerOrder, trump) {
        let winnerIndex = 0;
        let winningCard = playedCards[0];
        for (let i = 1; i < playedCards.length; i++) {
            const currentCard = playedCards[i];
            // Jeśli obecna karta jest atutowa a wygrana nie - obecna wygrywa
            if (currentCard.suit === trump && winningCard.suit !== trump) {
                winningCard = currentCard;
                winnerIndex = i;
                continue;
            }
            // Jeśli wygrana jest atutowa a obecna nie - wygrana zostaje
            if (winningCard.suit === trump && currentCard.suit !== trump) {
                continue;
            }
            // Jeśli obie mają ten sam kolor - porównaj siłę
            if (currentCard.suit === winningCard.suit) {
                if (currentCard.getStrength() > winningCard.getStrength()) {
                    winningCard = currentCard;
                    winnerIndex = i;
                }
            }
        }
        return winnerIndex;
    }
    /**
     * Identyfikuje i zwraca meldunki gracza
     * Meldunki to kombinacje kart o określonych wartościach
     */
    static findMelds(hand) {
        const melds = [];
        // Sprawdź trójki (każda trójka = 100 punktów)
        const rankCounts = {};
        hand.forEach(card => {
            if (!rankCounts[card.rank]) {
                rankCounts[card.rank] = [];
            }
            rankCounts[card.rank].push(card);
        });
        for (const [rank, cards] of Object.entries(rankCounts)) {
            if (cards.length === 3) {
                melds.push({
                    name: `Trójka ${rank}ów`,
                    cards: cards,
                    points: 100
                });
            }
        }
        // Sprawdź sekwencje (3+ karty tego samego koloru w rosnącym porządku)
        const suitGroups = {};
        hand.forEach(card => {
            if (!suitGroups[card.suit]) {
                suitGroups[card.suit] = [];
            }
            suitGroups[card.suit].push(card);
        });
        const rankOrder = ['9', 'J', 'Q', 'K', '10', 'A'];
        for (const [suit, cards] of Object.entries(suitGroups)) {
            cards.sort((a, b) => {
                return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
            });
            // Szukaj sekwencji
            for (let start = 0; start < cards.length; start++) {
                let sequence = [cards[start]];
                let currentIndex = rankOrder.indexOf(cards[start].rank);
                for (let i = start + 1; i < cards.length; i++) {
                    const nextIndex = rankOrder.indexOf(cards[i].rank);
                    if (nextIndex === currentIndex + 1) {
                        sequence.push(cards[i]);
                        currentIndex = nextIndex;
                    }
                }
                if (sequence.length >= 3) {
                    const points = Math.max(30 * (sequence.length - 2), 30);
                    melds.push({
                        name: `Sekwencja ${sequence.length} kart`,
                        cards: sequence,
                        points: points
                    });
                    break;
                }
            }
        }
        return melds;
    }
    /**
     * Sprawdza, czy gracz osiągnął 1000 punktów i zwycięża
     */
    static checkWinCondition(player) {
        return player.score >= 1000;
    }
    /**
     * Sprawdza, czy gracz spadł poniżej -100 i przegrywa
     */
    static checkLoseCondition(player) {
        return player.score < -100;
    }
    /**
     * Zwraca pozycję następnego gracza
     */
    static getNextPlayer(players, currentIndex) {
        return (currentIndex + 1) % players.length;
    }
}
exports.GameRules = GameRules;
