"use strict";
/**
 * Menadżer gry - zarządza stanem gry i przepływem logicznym
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = exports.GameState = void 0;
const uuid_1 = require("uuid");
const GameRules_1 = require("./GameRules");
var GameState;
(function (GameState) {
    GameState["WAITING_FOR_PLAYERS"] = "waiting";
    GameState["BIDDING"] = "bidding";
    GameState["CARD_SELECTION"] = "cardSelection";
    GameState["PLAYING"] = "playing";
    GameState["ROUND_END"] = "roundEnd";
    GameState["GAME_END"] = "gameEnd";
})(GameState || (exports.GameState = GameState = {}));
class GameManager {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentBidderIndex = 0;
        this.gameState = GameState.WAITING_FOR_PLAYERS;
        this.playedCards = [];
        this.tableCards = new Map();
        this.roundNumber = 1;
        this.maxRounds = 9;
        this.muckCards = []; // 2 karty oddane do mucka
        this.talonCards = []; // 2 dodatkowe karty z talonu (dla zwycięzcy aukcji)
        this.gameId = (0, uuid_1.v4)();
    }
    /**
     * Dodaje gracza do gry
     */
    addPlayer(player) {
        // Avoid adding the same player twice
        if (this.players.findIndex(p => p.id === player.id) !== -1)
            return;
        if (this.players.length < 4) {
            this.players.push(player);
        }
    }
    /**
     * Usuwa gracza z gry
     */
    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
    }
    /**
     * Rozpoczyna nową rundę:
     * 1. Reset state graczy
     * 2. Rozdaj 3 karty każdemu + zachowaj 2 na talon
     * 3. Ustaw następnego licytanta
     * 4. Wyznacz gracza na mucku (prawo od licytanta)
     * 5. Przejdź do licytacji
     */
    startNewRound() {
        this.players.forEach(p => p.resetForNewRound());
        // Rozdaj 3 karty każdemu, zachowaj 2 karty (talon + atut)
        this.talonCards = GameRules_1.GameRules.dealCards(this.players);
        this.trumpCard = this.talonCards[0]; // Pierwsza karta talonu to atut
        // Następny licytant
        this.currentBidderIndex = (this.currentBidderIndex + 1) % this.players.length;
        this.currentPlayerIndex = this.currentBidderIndex;
        this.bidderId = undefined;
        // Gracz na mucku (prawo od licytanta) - nie bierze udziału w lewach
        this.muckPlayerId = this.players[(this.currentBidderIndex + 1) % this.players.length].id;
        this.muckCards = [];
        this.gameState = GameState.BIDDING;
        this.roundNumber++;
    }
    /**
     * Gracz składa licytację
     * Awans do następnego gracza lub zakończenie aukcji
     */
    placeBid(playerId, bidAmount) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || this.gameState !== GameState.BIDDING)
            return false;
        player.bid = bidAmount;
        // Sprawdź czy wszyscy oddali licytację
        const allSubmitted = this.players.every(p => p.bid >= 0);
        if (!allSubmitted) {
            // Jeszcze są gracze, którzy nie licytowali - przejdź do następnego
            this.currentPlayerIndex = GameRules_1.GameRules.getNextPlayer(this.players, this.currentPlayerIndex);
            return true;
        }
        // Wszyscy złożyli licytacje - wybierz zwycięzcę
        const bidder = this.players.reduce((prev, curr) => curr.bid > prev.bid ? curr : prev);
        if (bidder.bid > 0) {
            // Ktoś wygrał aukcję
            bidder.isBidder = true;
            this.bidderId = bidder.id;
            this.currentBidderIndex = this.players.indexOf(bidder);
            this.trump = this.trumpCard?.suit;
            // Daj zwycięzcy aukcji 2 karty z talonu
            bidder.hand.push(...this.talonCards);
            bidder.sortHand();
            // Przejdź do fazy wyboru kart do oddania na muck
            this.gameState = GameState.CARD_SELECTION;
            this.currentPlayerIndex = this.currentBidderIndex;
        }
        else {
            // Wszyscy spasowali - rozdanie od nowa
            this.startNewRound();
        }
        return true;
    }
    /**
     * Licytant oddaje 2 karty do mucka
     * Po tej akcji gra przechodzi do PLAYING
     */
    discardToMuck(playerId, cardIds) {
        if (this.gameState !== GameState.CARD_SELECTION || cardIds.length !== 2)
            return false;
        if (this.bidderId !== playerId)
            return false;
        const player = this.players.find(p => p.id === playerId);
        if (!player)
            return false;
        // Usuń wybrane karty i dodaj do mucka
        const cardsToDiscard = [];
        for (const cardId of cardIds) {
            const card = player.hand.find(c => c.getId() === cardId);
            if (!card)
                return false;
            cardsToDiscard.push(card);
            player.removeCard(card);
        }
        this.muckCards = cardsToDiscard;
        // Przejdź do gry - licytant zaczyna pierwszą lewę
        this.gameState = GameState.PLAYING;
        this.currentPlayerIndex = this.currentBidderIndex;
        this.playedCards = [];
        this.tableCards.clear();
        return true;
    }
    /**
     * Gracz zagrywa kartę
     * Waliduje legalność zagrania (follow suit, trump rules)
     * Pomija gracza na mucku (nie bierze udziału w grze)
     */
    playCard(playerId, cardId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || this.gameState !== GameState.PLAYING)
            return false;
        // Pomiń gracza na mucku - on nie gra
        let currentPlayer = this.players[this.currentPlayerIndex];
        while (currentPlayer.id === this.muckPlayerId) {
            this.currentPlayerIndex = GameRules_1.GameRules.getNextPlayer(this.players, this.currentPlayerIndex);
            currentPlayer = this.players[this.currentPlayerIndex];
        }
        if (currentPlayer.id !== playerId)
            return false;
        // Znajdź kartę w ręce gracza
        const card = player.hand.find(c => c.getId() === cardId);
        if (!card)
            return false;
        // Sprawdź legalność ruchu (follow suit, use trump)
        if (!GameRules_1.GameRules.isCardPlayValid(card, this.playedCards, player.hand, this.trump)) {
            return false;
        }
        // Usuń kartę z ręki i dodaj do stołu
        player.removeCard(card);
        this.playedCards.push(card);
        this.tableCards.set(playerId, card);
        // Przejdź do następnego gracza (pomiń muck)
        do {
            this.currentPlayerIndex = GameRules_1.GameRules.getNextPlayer(this.players, this.currentPlayerIndex);
        } while (this.players[this.currentPlayerIndex].id === this.muckPlayerId);
        // Sprawdź czy wszyscy (poza muckiem) zagrali
        const activePlayers = this.players.filter(p => p.id !== this.muckPlayerId);
        if (this.playedCards.length === activePlayers.length) {
            this.resolveTrick();
        }
        return true;
    }
    /**
     * Rozstrzyga lewę:
     * 1. Znajdź zwycięzcę (najwyższa karta koloru lub atut)
     * 2. Przyznaj lewę zwycięzcy
     * 3. Przejdź do następnej lewy lub koniec rundy
     */
    resolveTrick() {
        // Oblicz zwycięzcę pomijając gracza na mucku
        const activePlayers = this.players.filter(p => p.id !== this.muckPlayerId);
        const winnerIndexInActive = GameRules_1.GameRules.determineWinner(this.playedCards, activePlayers, this.trump);
        const winner = activePlayers[winnerIndexInActive];
        winner.addTrick(this.playedCards);
        // Sprawdzenie czy to koniec rundy
        if (winner.hand.length === 0) {
            this.endRound();
        }
        else {
            // Następna lewa - zwycięzca zaczyna
            this.currentPlayerIndex = this.players.indexOf(winner);
            this.playedCards = [];
            this.tableCards.clear();
        }
    }
    /**
     * Kończy rundę i liczy punkty:
     * - Gracz na mucku dostaje 0 punktów
     * - Reszta graczy: suma punktów z kart w lewach + meldunki
     * - Sprawdź warunki zwycięstwa/przegranej
     */
    endRound() {
        this.players.forEach(player => {
            if (player.id === this.muckPlayerId) {
                // Gracz na mucku nie bierze punktów
                player.roundScore = 0;
            }
            else {
                // Reszta graczy liczy punkty
                player.calculateRoundScore();
            }
            player.score += player.roundScore;
        });
        // Sprawdź warunki zwycięstwa/przegranej
        for (const player of this.players) {
            if (GameRules_1.GameRules.checkWinCondition(player)) {
                this.gameState = GameState.GAME_END;
                return;
            }
            if (GameRules_1.GameRules.checkLoseCondition(player)) {
                // Gracz został wyeliminowany
                this.removePlayer(player.id);
                if (this.players.length === 1) {
                    this.gameState = GameState.GAME_END;
                    return;
                }
            }
        }
        if (this.roundNumber >= this.maxRounds) {
            this.gameState = GameState.GAME_END;
        }
        else {
            this.gameState = GameState.ROUND_END;
        }
    }
    /**
     * Zwraca aktualny stan gry
     */
    getGameState() {
        return {
            gameId: this.gameId,
            state: this.gameState,
            roundNumber: this.roundNumber,
            currentPlayerIndex: this.currentPlayerIndex,
            currentBidderId: this.bidderId || this.players[this.currentBidderIndex]?.id,
            muckPlayerId: this.muckPlayerId,
            trump: this.trump,
            players: this.players.map(p => p.getPublicState()),
            playedCards: this.playedCards.map(c => ({
                suit: c.suit,
                rank: c.rank,
                playerId: Array.from(this.tableCards.entries()).find(([_, card]) => card.equals(c))?.[0]
            }))
        };
    }
    /**
     * Zwraca widok gry dla konkretnego gracza
     * Jeśli gracz jest na mucku i gra trwa - zwraca puste karty (obserwator)
     */
    getPlayerView(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player)
            return null;
        const isMuckPlayer = player.id === this.muckPlayerId && this.gameState === GameState.PLAYING;
        return {
            gameState: this.getGameState(),
            playerHand: isMuckPlayer ? [] : player.hand.map(c => ({
                id: c.getId(),
                suit: c.suit,
                rank: c.rank
            })),
            playerMelds: player.melds,
            playerTricksCount: isMuckPlayer ? 0 : player.tricks.length,
            isMuckPlayer
        };
    }
}
exports.GameManager = GameManager;
