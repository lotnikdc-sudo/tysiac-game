# ⚡ QUICK START - Uruchomienie w 2 minuty

## 🪟 Windows

```bash
# Krok 1: Otwórz terminal w folderze c:\tysiac
cd c:\tysiac

# Krok 2: Uruchom start script
START.bat

# Krok 3: Czekaj - wszystko się zainstaluje i uruchomi

# Krok 4: Otwórz przeglądarkę
http://localhost:3000
```

---

## 🍎 Mac / 🐧 Linux

```bash
# Krok 1: Otwórz terminal w folderze projektu
cd /ścieżka/do/tysiac

# Krok 2: Uczyń skrypt uruchamialnym
chmod +x START.sh

# Krok 3: Uruchom start script
./START.sh

# Krok 4: Otwórz przeglądarkę
http://localhost:3000
```

---

## 🎮 Gra

1. **Wpisz swoją nazwę** w polu tekstowym
2. **Kliknij "Dołącz do gry"**
3. **Czekaj** aż będzie 2-4 graczy
4. **Gra się zaczyna!**

---

## 🚀 Manualny Start (jeśli script nie działa)

### Terminal 1 - Backend:
```bash
cd backend
npm install
npm run dev
```
→ Serwer na `http://localhost:3001`

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm start
```
→ Gra na `http://localhost:3000`

---

## 📱 Multiplayer Lokalnie

Otwórz wiele okien przeglądarki:
- `http://localhost:3000` (Gracz 1)
- `http://localhost:3000` (Gracz 2)
- `http://localhost:3000` (Gracz 3)
- `http://localhost:3000` (Gracz 4)

---

## 🌐 Multiplayer Online

1. Deploy aplikacji (zobacz [DEPLOYMENT.md](DEPLOYMENT.md))
2. Podziel się linkiem z przyjaciółmi
3. Każdy gracz otwiera link w przeglądarce
4. Gra się synchronizuje w real-time

---

## 🆘 Pomocy!

| Problem | Rozwiązanie |
|---------|------------|
| Node.js nie znaleziony | Pobierz z https://nodejs.org/ |
| "npm: command not found" | Zainstaluj Node.js |
| Port 3000/3001 zajęty | Zmień port lub zamknij inne aplikacje |
| Białe okno | Otwórz F12 DevTools i sprawdź błędy |
| Timeout | Serwer się nie uruchomił - sprawdzaj terminal |

---

## 📚 Więcej Informacji

- **Pełna dokumentacja**: [README.md](README.md)
- **Zasady gry**: [README.md#zasady-gry](README.md#zasady-gry)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **FAQ**: [FAQ.md](FAQ.md)
- **Backend**: [backend/README.md](backend/README.md)
- **Frontend**: [frontend/README.md](frontend/README.md)

---

**Gotowy? 🎴 START!**
