/**
 * Stałe aplikacji
 */

export const SUITS = {
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs',
  SPADES: 'spades'
};

export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

export const SUIT_COLORS = {
  hearts: '#e74c3c',
  diamonds: '#e74c3c',
  clubs: '#2c3e50',
  spades: '#2c3e50'
};

export const RANKS = ['9', 'J', 'Q', 'K', '10', 'A'];

export const RANK_NAMES = {
  '9': 'Dziewiątka',
  'J': 'Walet',
  'Q': 'Dama',
  'K': 'Król',
  '10': 'Dziesiątka',
  'A': 'As'
};

export const GAME_STATES = {
  WAITING: 'waiting',
  BIDDING: 'bidding',
  MUCKING: 'mucking',
  CARD_SELECTION: 'cardSelection',
  MELDING: 'melding',
  PLAYING: 'playing',
  ROUND_END: 'roundEnd',
  GAME_END: 'gameEnd'
};

export const SOCKET_EVENTS = {
  JOIN_GAME: 'joinGame',
  LEAVE_GAME: 'leaveGame',
  GAME_STATE_UPDATE: 'gameStateUpdate',
  PLAYERS_UPDATED: 'playersUpdated',
  GAME_START: 'gameStart',
  PLACE_BID: 'placeBid',
  BID_PLACED: 'bidPlaced',
  BIDDING_COMPLETE: 'biddingComplete',
  DISCARD_TO_MUCK: 'discardToMuck',
  DISCARD_TO_MUCK_COMPLETE: 'discardToMuckComplete',
  RETURN_MUCEK_CARDS: 'returnMucekCards',
  PLAY_CARD: 'playCard',
  CARD_PLAYED: 'cardPlayed',
  TRICK_RESOLVED: 'trickResolved',
  ROUND_END: 'roundEnd',
  GAME_END: 'gameEnd',
  ERROR: 'error',
  ADD_BOT: 'addBot'
};
