# ❓ FAQ - Częste Pytania i Odpowiedzi

## Instalacja & Uruchomienie

### P: Jak szybko uruchomić projekt?
**O:** Na Windows kliknij `START.bat`, na Mac/Linux uruchom `./START.sh`

### P: Node.js nie jest zainstalowany, co robić?
**O:** Pobierz z https://nodejs.org/ (LTS version 18+)

### P: Mogę grać na moim telefonie?
**O:** Tak! Wpisz `http://<computer-ip>:3000` w przeglądarce telefonu

### P: Jak zagrać z przyjaciółmi przez internet?
**O:** Umieść aplikację na serwerze (Heroku/AWS) - zobacz DEPLOYMENT.md

---

## Gameplay

### P: Ile kart mam otrzymać na początku?
**O:** 3 karty, potem kolejne 3, na końcu znowu 3. Razem 9 kart.

### P: Kiedy mogę zagrać kartę?
**O:** Gdy jest twoja tura (zaznaczone: "📍 Twoja tura!")

### P: Co to jest "atut"?
**O:** Specjalny kolor karty ustalony dla tej rundy. Atut bije wszystkie inne karty.

### P: Ile punktów daje każda karta?
**O:** 
- 9: 0 pkt
- Walet: 2 pkt
- Dama: 3 pkt
- Król: 4 pkt
- 10: 10 pkt
- As: 11 pkt

### P: Co to znaczy "meldunek"?
**O:** Kombinacja kart (trójka lub sekwencja) za dodatkowe punkty:
- Trójka: 100 pkt
- Sekwencja 3 kart: 30 pkt

### P: Jak wygram grę?
**O:** Pierwszy gracz z 1000+ punktami wygrywa!

### P: Czy mogę przegrać?
**O:** Tak - jeśli spadniesz poniżej -100 punktów, jesteś wyeliminowany.

---

## Multiplayer

### P: Ile graczy może grać?
**O:** 2-4 graczy. Gra wymaga minimum 2 graczy.

### P: Co się stanie, jeśli gracz się rozłączy?
**O:** Jest usuwany z gry, reszta może kontynuować.

### P: Czy mogę stworzyć grę prywatną?
**O:** Tak - zostanie wygenerowany ID gry, którym możesz się podzielić.

### P: Jak zaproponować grę przyjacielowi?
**O:** Podziel się linkiem: `http://localhost:3000?gameId=abc-123`

---

## Techniczne

### P: Jaki browser powinienem używać?
**O:** Chrome, Firefox, Safari, Edge (wszystkie nowoczesne wersje)

### P: Czy mogę grać bez internetu?
**O:** Tak, ale tylko lokalnie (na jednym komputerze lub sieci WiFi)

### P: Jaki jest port serwera?
**O:** Backend: 3001, Frontend: 3000

### P: Gdzie moje karty przechowywane?
**O:** W pamięci serwera (RAM). Tracą się po restarcie serwera.

### P: Mogę zmienić port?
**O:** Tak - w `backend/src/server.ts` zmień `PORT`

### P: Jak dodać bazę danych?
**O:** Zainstaluj MongoDB/PostgreSQL i zmodyfikuj `GameManager.ts`

---

## Rozwiązywanie Problemów

### P: "Cannot find module" - co robić?
**O:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

### P: Port już w użyciu
**O:** 
```bash
# Zmień port w backend/src/server.ts
const PORT = 3002;
```

### P: Socket.io connection refused
**O:** Sprawdź czy backend jest uruchomiony: `npm run dev` w folderze backend

### P: Białe okno w przeglądarce
**O:** Otwórz DevTools (F12) i sprawdź Console pod kątem błędów

### P: Karty się nie wyświetlają
**O:** Sprawdź czy CSS jest załadowany (F12 → Elements → sprawdź style)

### P: "CORS error"
**O:** To oznacza że frontend i backend nie mogą się ze sobą komunikować. Sprawdź:
- Backend na http://localhost:3001
- Frontend na http://localhost:3000
- Czy CORS w `server.ts` jest poprawnie skonfigurowany

---

## Optymalizacja

### P: Gra jest wolna
**O:** 
1. Sprawdź czy backend/frontend działają prawidłowo
2. Zamknij inne applicje zużywające RAM
3. Resetuj stronę (F5)

### P: Animacje karty są szarpane
**O:** Przywróć domyślne ustawienia CSS lub zwiększ wydajność komputera

### P: Połączenie sie utrywa
**O:** 
1. Sprawdź WiFi
2. Uruchom ponownie backend
3. Odczekaj trochę i spróbuj ponownie

---

## Contribution & Improvements

### P: Jak mogę dodać nową funkcję?
**O:** 
1. Fork projekt
2. Stwórz nowy branch
3. Edytuj kod
4. Submit Pull Request

### P: Gdzie znaleźć kod?
**O:** 
- Backend: `backend/src/`
- Frontend: `frontend/src/`

### P: Jak dodać AI bota?
**O:** Stwórz `Bot.ts` w `backend/src/game/` z AI logiką i zarejestruj go w `GameManager.ts`

### P: Mogę zmienić zasady gry?
**O:** Tak! Edytuj `backend/src/game/GameRules.ts` - tam jest cała logika

---

## Tips & Tricks 🎮

### Szybkie Tipy

1. **Zaznaczanie kart** - Możesz kliknąć kartę zamiast jej przeciągać
2. **Licytacja** - Użyj suwaka lub szybkich przycisków
3. **Sortowanie** - Twoje karty się automatycznie sortują po koloru
4. **Multiplayer** - Otwórz kilka okien przeglądarki aby testować
5. **Restart** - F5 aby przeładować grę

### Debug Mode

Otwórz DevTools (F12):
```javascript
// W konsoli
localStorage.getItem('gameId')  // ID obecnej gry
```

---

## Kontakt & Wsparcie

Masz problem? Sprawdzaj:
1. [README.md](README.md) - Główna dokumentacja
2. [DEPLOYMENT.md](DEPLOYMENT.md) - Setup instrukcje
3. [backend/README.md](backend/README.md) - Backend specifics
4. [frontend/README.md](frontend/README.md) - Frontend specifics

---

**Powodzenia w grze! 🎴**

Jeśli chcesz zgłosić bug lub zaproponować feature - zapraszam! 🚀
