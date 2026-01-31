# Frontend Setup

## Szybki Start

### 1. Instalacja zależności
```bash
cd frontend
npm install
```

### 2. Uruchomienie development serwera
```bash
npm start
```

Frontend otworzy się w przeglądarce na **http://localhost:3000**

### 3. Build do produkcji
```bash
npm run build
```

Wynik w `./build` - gotowy do deployment

## Struktura Komponentów

```
src/
├── components/
│   ├── Game.tsx            # 🎮 Główny komponent gry
│   ├── Card.tsx            # 🎴 Pojedyncza karta
│   ├── PlayerHand.tsx      # 🖐️ Ręka gracza (9 kart)
│   ├── Board.tsx           # 📊 Stół z zagranym kartami
│   ├── ScoreBoard.tsx      # 📈 Tablica wyników
│   └── BiddingDialog.tsx   # 💰 Dialog licytacji
├── utils/
│   ├── socketClient.ts     # Socket.io klient
│   └── gameConstants.ts    # Stałe (karty, eventy)
├── App.tsx
└── index.tsx
```

## Komponenty

### Game Component
- Główny kontener dla całej gry
- Obsługuje Socket.io eventy
- Zarządza stanami gry
- Renderuje komponenty interfejsu

### Card Component
- Wyświetla kartę (front lub back)
- Obsługuje drag & drop
- Obsługuje click selection
- CSS animacje

### PlayerHand Component
- Wyświetla 9 kart gracza
- Sortowanie kart
- Zaznaczanie kart
- Drag & drop do stołu

### Board Component
- Wyświetla zagrane karty
- Drop zone dla drag & drop
- Wyświetla atut
- Labelki z imionami graczy

### ScoreBoard Component
- Lista wszystkich graczy
- Wyniki (Score)
- Status licytacji
- Zaznaczenie obecnego gracza

### BiddingDialog Component
- Modal do licytacji
- Suwak do wyboru kwoty
- Szybkie przyciski (100, 200, 300...)
- Przyciski Potwierdź/Pas

## Style

```
CSS Architecture:
├── Global (App.css)
├── Component styles
│   ├── Card.css
│   ├── PlayerHand.css
│   ├── Board.css
│   ├── ScoreBoard.css
│   ├── BiddingDialog.css
│   └── Game.css
```

### Kolory
- Primary: `#ffd700` (Złoty)
- Background: `#1a3a3a` (Ciemno zielony)
- Success: `#2ecc71` (Zielony)
- Danger: `#e74c3c` (Czerwony)

### Responsive Design
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## Socket.io Events

### Emitowanie (Client → Server)

```javascript
socket.emit('joinGame', {
  playerName: 'Jan',
  gameId: 'abc-123'
});

socket.emit('placeBid', {
  gameId: 'abc-123',
  playerId: 'socket-id',
  bidAmount: 150
});

socket.emit('playCard', {
  gameId: 'abc-123',
  playerId: 'socket-id',
  cardId: 'hearts_A'
});
```

### Słuchanie (Server → Client)

```javascript
socket.on('gameStateUpdate', (data) => {
  // Aktualizuj stan gry
});

socket.on('cardPlayed', (data) => {
  // Animacja karty na stole
});
```

## State Management

Główny stan gry w `Game.tsx`:

```typescript
const [gameState, setGameState] = useState<string>();
const [players, setPlayers] = useState<PlayerObj[]>([]);
const [playerHand, setPlayerHand] = useState<CardObj[]>([]);
const [playedCards, setPlayedCards] = useState<PlayedCard[]>([]);
const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>();
```

## Animacje

- **Karty**: slide & scale na pojawieniu
- **Dialog**: fade in + slide up
- **Przejścia**: smooth transitions (0.2s)
- **Pulsing**: "Twoja tura" efekt

## Testowanie

### Lokalnie (1 gracz)
```bash
npm start
# Otwórz http://localhost:3000
```

### Multiplayer (2-4 graczy)
```bash
# Terminal 1: npm start
# Terminal 2: npm start (na innym porcie: localhost:3001)
# Lub: otwórz kilka okien przeglądarki
```

## Optimizacja

- Lazy loading komponentów
- Memoization gdzie potrzeba
- CSS minimalization w produkcji
- Bundle size monitoring

## Build i Deployment

### Development Build
```bash
npm start
```

### Production Build
```bash
npm run build
```

Wygeneruje folder `build/` z zoptymalizowanym kodem.

### Serve Production Build
```bash
npm install -g serve
serve -s build -l 3000
```

## Environment Variables

`.env` w folderze frontend:

```
REACT_APP_SERVER_URL=http://localhost:3001
```

## Troubleshooting

| Problem | Rozwiązanie |
|---------|------------|
| "Cannot find module" | `npm install` |
| Port 3000 zajęty | `PORT=3001 npm start` |
| Socket.io error | Sprawdź backend na :3001 |
| Białe okno | Sprawdź `console.log` (F12 Dev Tools) |
| Karty się nie wyświetlają | Sprawdź CSS i ścieżki |

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

---

Gotowo! 🚀
