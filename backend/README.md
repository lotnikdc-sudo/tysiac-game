# Backend Setup

## Szybki Start

### 1. Instalacja zależności
```bash
cd backend
npm install
```

### 2. Uruchomienie w trybie development
```bash
npm run dev
```

Serwer uruchomi się na **http://localhost:3001**

### 3. Build do produkcji
```bash
npm run build
npm start
```

## Struktura Plików

```
backend/
├── src/
│   ├── game/
│   │   ├── Card.ts         # Warianty kart, ich wartości
│   │   ├── Player.ts       # Stan gracza, ręka, meldunki
│   │   ├── GameRules.ts    # Zasady: branie lew, validacja ruchów
│   │   └── GameManager.ts  # Zarządzanie stanem gry i rundami
│   ├── socket/
│   │   ├── events.ts       # Definicje zdarzeń
│   │   └── handlers.ts     # Obsługa Socket.io
│   └── server.ts           # Express + Socket.io server
├── package.json
└── tsconfig.json
```

## Architektura

```
Klient (React) 
    ↓ (Socket.io)
GameManager (Node.js)
    ↓
GameRules + Player + Card
```

## API Events

### Client → Server
- `joinGame` - Dołączenie do gry
- `placeBid` - Złożenie licytacji
- `playCard` - Zagranie karty
- `leaveGame` - Opuszczenie gry

### Server → Client
- `gameStateUpdate` - Aktualizacja stanu
- `playersUpdated` - Lista graczy
- `cardPlayed` - Karta zagrana
- `trickResolved` - Lewa rozstrzygnięta
- `gameEnd` - Koniec gry

## Logika Gry

```
START
├── BIDDING (każdy gracz proponuje punkty)
├── PLAYING (zagry walania kart)
│   ├── Każdy gracz zagra kartę
│   ├── Serwer sprawdza legalność
│   ├── Serwer rozstrzyga lewę
│   ├── Zwycięzca lewy zaczyna nową
│   └── Powtarzaj aż wszystkie karty się skończy
├── ROUND_END (liczenie punktów)
└── Powtarzaj jeśli ktoś nie ma 1000+ punktów

WIN: Pierwszy gracz z 1000+ punktów
LOSE: Gracz poniżej -100 punktów
```

## Testy

```bash
# Otwórz 2-4 przeglądarki na http://localhost:3000
# Każdy gracz się rejestruje i dołącza do gry
# Czekaj na 2+ graczy - gra się rozpocznie
```

## Debugowanie

### Logi Socket.io
Wszystkie zdarzenia są logowane w konsoli serwera:
```
✓ Połączono z serwerem
Gracz podłączony: socket-id
Gracz dołączył do gry
```

### TypeScript Errors
```bash
npm run build  # Sprawdź błędy typów
```

## Troubleshooting

| Problem | Rozwiązanie |
|---------|------------|
| `npm install` się zawiesza | Usun `node_modules`, `package-lock.json` i spróbuj ponownie |
| Port 3001 zajęty | `lsof -i :3001` (Mac) lub zmień port w `server.ts` |
| Socket.io nie łączy | Sprawdź CORS w `server.ts` |
| TypeScript errory | `npm install --save-dev @types/express` |

---

Powodzenia! 🎮
