/**
 * Definicje zdarzeń Socket.io dla gry Tysiąc
 */

export const SOCKET_EVENTS = {
  // Połączenie gracza
  PLAYER_CONNECT: 'playerConnect',
  PLAYER_DISCONNECT: 'playerDisconnect',
  
  // Lobby
  JOIN_GAME: 'joinGame',
  LEAVE_GAME: 'leaveGame',
  GAME_START: 'gameStart',
  PLAYERS_UPDATED: 'playersUpdated',
  
  // Licytacja
  PLACE_BID: 'placeBid',
  BID_PLACED: 'bidPlaced',
  BIDDING_COMPLETE: 'biddingComplete',
  
  // Meldunki
  CONFIRM_MELDS: 'confirmMelds',
  MELDS_CONFIRMED: 'meldsConfirmed',
  
  // Gra
  PLAY_CARD: 'playCard',
  CARD_PLAYED: 'cardPlayed',
  TRICK_RESOLVED: 'trickResolved',
  ROUND_END: 'roundEnd',
  GAME_END: 'gameEnd',
  
  // Stan gry
  GAME_STATE_UPDATE: 'gameStateUpdate',
  
  // Błędy
  ERROR: 'error'
};

export interface JoinGamePayload {
  playerName: string;
  gameId?: string;
}

export interface BidPayload {
  gameId: string;
  playerId: string;
  bidAmount: number;
}

export interface PlayCardPayload {
  gameId: string;
  playerId: string;
  cardId: string;
}

export interface GameStateUpdate {
  gameId: string;
  state: string;
  roundNumber: number;
  currentPlayerIndex: number;
  currentBidderId: string;
  trump?: string;
  players: any[];
  playedCards: any[];
}
