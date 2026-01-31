@echo off
REM ===== TYSIĄC - SZYBKI START (Windows) =====
REM Ten skrypt instaluje i uruchamia projekt

echo.
echo ======================================
echo    🎴 TYSIĄC - Gra Karciana Online 🎴
echo ======================================
echo.

REM Sprawdź czy Node.js jest zainstalowany
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js nie jest zainstalowany!
    echo Pobierz z: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js znaleziony
echo.

REM Backend
echo 📦 Instaluję Backend...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Błąd instalacji backend
    pause
    exit /b 1
)
cd ..
echo ✓ Backend zainstalowany
echo.

REM Frontend
echo 📦 Instaluję Frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Błąd instalacji frontend
    pause
    exit /b 1
)
cd ..
echo ✓ Frontend zainstalowany
echo.

echo ======================================
echo ✓ Instalacja ukończona!
echo.
echo 🚀 Uruchomienie projektu...
echo.
echo Serwer: http://localhost:3001
echo Gra:    http://localhost:3000
echo.
echo Kliknij START, aby kontynuować...
echo ======================================
echo.

pause

REM Uruchomienie w dwóch oknach
start cmd /k "cd backend && npm run dev"
timeout /t 2
start cmd /k "cd frontend && npm start"

echo.
echo ✓ Projekt uruchomiony w dwóch terminalach
echo Gra powinna się otworzyć automatycznie
echo.
pause
