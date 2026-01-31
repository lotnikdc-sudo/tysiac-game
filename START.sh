#!/bin/bash

# ===== TYSIĄC - SZYBKI START (Mac/Linux) =====
# Ten skrypt instaluje i uruchamia projekt

echo ""
echo "======================================"
echo "   🎴 TYSIĄC - Gra Karciana Online 🎴"
echo "======================================"
echo ""

# Sprawdź czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nie jest zainstalowany!"
    echo "Pobierz z: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js znaleziony"
echo ""

# Backend
echo "📦 Instaluję Backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Błąd instalacji backend"
    exit 1
fi
cd ..
echo "✓ Backend zainstalowany"
echo ""

# Frontend
echo "📦 Instaluję Frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Błąd instalacji frontend"
    exit 1
fi
cd ..
echo "✓ Frontend zainstalowany"
echo ""

echo "======================================"
echo "✓ Instalacja ukończona!"
echo ""
echo "🚀 Uruchomienie projektu..."
echo ""
echo "Serwer: http://localhost:3001"
echo "Gra:    http://localhost:3000"
echo ""
echo "======================================"
echo ""

# Uruchomienie w dwóch oknach (terminale tmux lub osobne)
if command -v tmux &> /dev/null; then
    echo "Używam tmux..."
    tmux new-session -d -s tysiac-backend "cd backend && npm run dev"
    sleep 2
    tmux new-window -t tysiac-backend "cd frontend && npm start"
else
    echo "Używam osobnych terminali..."
    open -a Terminal "cd $(pwd)/backend && npm run dev"
    sleep 2
    open -a Terminal "cd $(pwd)/frontend && npm start"
fi

echo "✓ Projekt uruchomiony"
echo "Gra powinna się otworzyć automatycznie"
echo ""
