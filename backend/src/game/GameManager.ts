/**
 * Menadżer gry - zarządza stanem gry i przepływem logicznym
 */

import { v4 as uuidv4 } from 'uuid';
import { Card, Suit } from './Card';
import { Player } from './Player';
import { GameRules } from './GameRules';

export enum GameState {
  WAITING_FOR_PLAYERS = 'waiting',
  BIDDING = 'bidding',
  MELDING = 'melding',
  PLAYING = 'playing',
  ROUND_END = 'roundEnd',
  GAME_END = 'gameEnd'
}

export class GameManager {
  gameId: string;
  players: Player[] = [];
  currentPlayerIndex: number = 0;
  currentBidderIndex: number = 0;
  gameState: GameState = GameState.WAITING_FOR_PLAYERS;
  trump?: Suit;
  playedCards: Card[] = [];           // Karty zagrane w obecnej lewie
  tableCards: Map<string, Card> = new Map(); // playerId -> Card
  roundNumber: number = 1;
  maxRounds: number = 9;
  trumpCard?: Card;

  constructor() {
    this.gameId = uuidv4();
  }

  /**
   * Dodaje gracza do gry
   */
  addPlayer(player: Player): void {
    if (this.players.length < 4) {
      this.players.push(player);
      if (this.players.length >= 2) {
        this.gameState = GameState.BIDDING;
      }
    }
  }

  /**
   * Usuwa gracza z gry
   */
  removePlayer(playerId: string): void {
    this.players = this.players.filter(p => p.id !== playerId);
  }

  /**
   * Rozpoczyna nową rundę
   */
  startNewRound(): void {
    // Reset stanu graczy do nowej rundy
    this.players.forEach(p => p.resetForNewRound());

    // Rozdaj karty
    this.trumpCard = GameRules.dealCards(this.players);
    this.gameState = GameState.BIDDING;

    // Przełącz licytanta
    this.currentBidderIndex = (this.currentBidderIndex + 1) % this.players.length;
    this.currentPlayerIndex = this.currentBidderIndex;

    this.roundNumber++;
  }

  /**
   * Gracz składa licytację
   */
  placeBid(playerId: string, bidAmount: number): boolean {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;

    player.bid = bidAmount;

    // Sprawdź czy wszyscy złożyli licytacje
    if (this.players.every(p => p.bid > 0)) {
      this.gameState = GameState.MELDING;
      
      // Licytant to gracz z najwyższą licytacją
      const bidder = this.players.reduce((prev, curr) =>
        curr.bid > prev.bid ? curr : prev
      );
      bidder.isBidder = true;
      this.currentBidderIndex = this.players.indexOf(bidder);
      this.trump = this.trumpCard?.suit;

      return true;
    }

    return false;
  }

  /**
   * Gracz potwierdza meldunki
   */
  confirmMelds(playerId: string, selectedCards: string[]): boolean {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;

    // Konwertuj ID kart na obiekty Card
    const cards = selectedCards
      .map(id => player.hand.find(c => c.getId() === id))
      .filter((c): c is Card => c !== undefined);

    if (cards.length > 0) {
      player.melds = GameRules.findMelds(player.hand);
    }

    // Sprawdź czy wszyscy potwierdzili meldunki
    const allConfirmed = this.players.every(p => p.melds.length >= 0);

    if (allConfirmed) {
      this.gameState = GameState.PLAYING;
      this.currentPlayerIndex = this.currentBidderIndex;
      this.playedCards = [];
      this.tableCards.clear();
    }

    return true;
  }

  /**
   * Gracz zagrywa kartę
   */
  playCard(playerId: string, cardId: string): boolean {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.gameState !== GameState.PLAYING) return false;

    // Sprawdź czy to kolej gracza
    if (this.players[this.currentPlayerIndex].id !== playerId) return false;

    // Znajdź kartę w ręce gracza
    const card = player.hand.find(c => c.getId() === cardId);
    if (!card) return false;

    // Sprawdź legalność ruchu
    if (!GameRules.isCardPlayValid(
      card,
      this.playedCards,
      player.hand,
      this.trump!
    )) {
      return false;
    }

    // Usuń kartę z ręki i dodaj do stołu
    player.removeCard(card);
    this.playedCards.push(card);
    this.tableCards.set(playerId, card);

    // Przejdź do następnego gracza
    this.currentPlayerIndex = GameRules.getNextPlayer(
      this.players,
      this.currentPlayerIndex
    );

    // Sprawdź czy wszyscy zagrali
    if (this.playedCards.length === this.players.length) {
      this.resolveTrick();
    }

    return true;
  }

  /**
   * Rozstrzyga lewę
   */
  private resolveTrick(): void {
    const winnerIndex = GameRules.determineWinner(
      this.playedCards,
      this.players,
      this.trump!
    );

    const winner = this.players[winnerIndex];
    winner.addTrick(this.playedCards);

    // Sprawdzenie czy to koniec rundy
    if (winner.hand.length === 0) {
      this.endRound();
    } else {
      // Następna lewa - zwycięzca zaczyna
      this.currentPlayerIndex = winnerIndex;
      this.playedCards = [];
      this.tableCards.clear();
    }
  }

  /**
   * Kończy rundę i liczy punkty
   */
  private endRound(): void {
    this.players.forEach(player => {
      player.calculateRoundScore();
      player.score += player.roundScore;
    });

    // Sprawdź warunki zwycięstwa/przegranej
    for (const player of this.players) {
      if (GameRules.checkWinCondition(player)) {
        this.gameState = GameState.GAME_END;
        return;
      }
      if (GameRules.checkLoseCondition(player)) {
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
    } else {
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
      currentBidderId: this.players[this.currentBidderIndex]?.id,
      trump: this.trump,
      players: this.players.map(p => p.getPublicState()),
      playedCards: this.playedCards.map(c => ({
        suit: c.suit,
        rank: c.rank,
        playerId: Array.from(this.tableCards.entries()).find(
          ([_, card]) => card.equals(c)
        )?.[0]
      }))
    };
  }

  /**
   * Zwraca widok gry dla konkretnego gracza
   */
  getPlayerView(playerId: string) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;

    return {
      gameState: this.getGameState(),
      playerHand: player.hand.map(c => ({
        id: c.getId(),
        suit: c.suit,
        rank: c.rank
      })),
      playerMelds: player.melds,
      playerTricksCount: player.tricks.length
    };
  }
}
