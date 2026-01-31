# 🎴 Tysiąc Online - Multiplayer Card Game

**Tysiąc** (1000) to tradycyjna polska gra karciana dostępna teraz w wersji **online multiplayer** z pełnym wsparciem dla 2-4 graczy w czasie rzeczywistym.

## 🎮 Cechy

- ✅ **Multiplayer Online** - gra dla 2-4 graczy przez internet
- ✅ **Real-time Synchronization** - Socket.io dla live updates
- ✅ **Responsive Design** - działa na desktop, tablet, mobile
- ✅ **Intuicyjny UI** - drag & drop kart, jasne wizualizacje
- ✅ **Standardowe Zasady** - pełna implementacja reguł Tysiąca
- ✅ **Meldunki** - automatyczne rozpoznawanie kombinacji kart
- ✅ **Licytacja** - system bidowania z atutami

## 📋 Zasady Gry

### Talia Kart
- **24 karty** w grze: 9, J (Walet), Q (Dama), K (Król), 10, A (As)
- **4 kolory**: ♥ (Kiery), ♦ (Kara), ♣ (Trefle), ♠ (Piki)

### Przebieg Gry
1. **Rozdanie**: Każdy gracz otrzymuje 3+3+3 karty
2. **Licytacja**: Gracze licytują punkty (100, 150, 200...)
3. **Meldunki**: Gracz z najwyższą licytacją (licytant) może meldować kombinacje
4. **Gra**: Gracze grają karty po kolei, biorą lewy
5. **Zliczanie**: Punkty z kart i meldunków
6. **Warunki Zwycięstwa**: 
   - Pierwszy do **1000 punktów** wygrywa
   - Poniżej **-100 punktów** = eliminacja

### Wartość Kart
- **9**: 0 pkt
- **J (Walet)**: 2 pkt
- **Q (Dama)**: 3 pkt
- **K (Król)**: 4 pkt
- **10**: 10 pkt
- **A (As)**: 11 pkt

## 🛠️ Technologia

### Backend
- **Node.js** + Express.js
- **TypeScript** dla bezpieczeństwa typów
- **Socket.io** dla komunikacji real-time
- **UUID** dla ID sesji gier

### Frontend
- **React 18** + TypeScript
- **Socket.io Client** dla live updates
- **CSS3** + Animacje
- **Responsive Design** (Mobile-First)

## 📦 Instalacja i Uruchomienie

### Wymagania
- Node.js 16+ 
- npm lub yarn
- Windows/Mac/Linux

### Krok 1: Klonowanie/Pobranie Projektu
```bash
cd c:\tysiac
```

### Krok 2: Instalacja Backend
```bash
cd backend
npm install
```

### Krok 3: Instalacja Frontend
```bash
cd ../frontend
npm install
```

### Krok 4: Uruchomienie Serwera

W terminalu otwórz folder backend:
```bash
cd backend
npm run dev
```

Serwer uruchomi się na `http://localhost:3001`

### Krok 5: Uruchomienie Frontendu

W **nowym terminalu** otwórz folder frontend:
```bash
cd frontend
npm start
```

Frontend otworzy się w przeglądarce na `http://localhost:3000`

### Krok 6: Gra!

1. Otwórz przeglądarkę: http://localhost:3000
2. Wpisz swoją nazwę
3. Kliknij "Dołącz do gry"
4. Wejdź z kilku przeglądarek/urządzeń (2-4 gracze)
5. Czekaj na dostępność 2+ graczy
6. Gra się rozpocznie automatycznie

## 🎯 Jak Grać

### Licytacja
- Każdy gracz proponuje ilość punktów, którą chce zdobyć
- Gracz z najwyższą licytacją zostaje **licytantem**
- Klient + 10 przycisków do szybkiego wyboru

### Meldowanie
- Licytant może meldować kombinacje kart:
  - **Trójka** = 100 pkt
  - **Sekwencja** 3 kart = 30 pkt (+30 za każdą następną)
- Kliknij karty aby je wybrać, zobacz obliczane punkty

### Zagrywanie Kart
- **Przeciągnij** kartę na stół LUB **kliknij** na kartę
- Muszysz zagrać kolor pierwszej karty lewy
- Jeśli nie masz - zagrań atutem
- Jeśli nie masz żadnego - zagrań dowolną
- **Atut** bije wszystko
- Większa karta żądanego koloru bije mniejszą

### Branie Lew
- Gracz z najsilniejszą kartą bierze lewę
- Następna lewa - zwycięzca lewy zaczyna

## 📁 Struktura Projektu

```
tysiąc/
├── backend/
│   ├── src/
│   │   ├── game/
│   │   │   ├── Card.ts         # Model karty
│   │   │   ├── Player.ts       # Model gracza
│   │   │   ├── GameRules.ts    # Logika gry
│   │   │   └── GameManager.ts  # Menadżer sesji
│   │   ├── socket/
│   │   │   ├── events.ts       # Definicje eventów
│   │   │   └── handlers.ts     # Obsługa Socket.io
│   │   └── server.ts           # Główny serwer
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Game.tsx        # Główny komponent
│   │   │   ├── Card.tsx        # Komponent karty
│   │   │   ├── Board.tsx       # Stół do gry
│   │   │   ├── PlayerHand.tsx  # Ręka gracza
│   │   │   ├── ScoreBoard.tsx  # Tablica wyników
│   │   │   └── BiddingDialog.tsx # Dialog licytacji
│   │   ├── utils/
│   │   │   ├── socketClient.ts # Połączenie Socket.io
│   │   │   └── gameConstants.ts # Stałe
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🚀 Deployment

### Lokalna Sieć
```bash
# Backend na porcie 3001
# Frontend proxy: http://localhost:3001

# Inne urządzenia w sieci mogą się podłączyć:
http://<YOUR_IP>:3000
```

### Production (Heroku/Docker)
```bash
# Backend
npm run build
npm start

# Frontend
npm run build
# Wynik w ./frontend/build
```

## 🔧 Konfiguracja

### Backend (.env - opcjonalnie)
```
PORT=3001
```

### Frontend (.env)
```
REACT_APP_SERVER_URL=http://localhost:3001
```

## 🐛 Troubleshooting

### Problema: "Cannot find module"
```bash
# Reinstaluj dependencje
npm install
```

### Problema: Port już w użyciu
```bash
# Zmień port w backend/src/server.ts
const PORT = 3002; // zamiast 3001
```

### Problema: Socket.io connection refused
- Sprawdź czy backend jest uruchomiony
- Sprawdź firewall
- Sprawdź URL serwera w frontend/.env

## 🎓 Kod Jest Skomentowany

Wszystkie kluczowe części mają komentarze:
- `//` dla jednoliniowych objaśnień
- `/** */` dla dokumentacji funkcji
- `// ===== HEADER =====` dla sekcji

## 📝 Możliwe Rozszerzenia

1. **AI Bot** - Gracz kontrolowany przez komputer
2. **Chat** - Czat w grze
3. **Database** - Zapis wyników, ranking
4. **Animacje** - Więcej efektów wizualnych
5. **Spectator Mode** - Oglądanie gry
6. **Replay** - Odtwarzanie rozgrywek
7. **Mobile App** - React Native/Flutter

## 📄 Licencja

MIT - Wolne do użytku i modyfikacji

## 👨‍💻 Autor

Tysiąc Online v1.0
Stworzono z ❤️ dla miłośników kart

---

**Powodzenia w grze! 🎴**

Jeśli masz pytania lub chcesz rozwinąć projekt - zapraszam! 🚀
