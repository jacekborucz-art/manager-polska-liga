#!/bin/bash
cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "Nie znaleziono Node.js na tym komputerze Mac."
  echo ""
  echo "Aby uruchomic gre, zainstaluj Node.js (wersja 20.x) - zobacz plik"
  echo "mac/INSTRUKCJA_MACOS.txt, w ktorym opisane sa kroki krok po kroku."
  echo ""
  echo "Po instalacji zamknij to okno i uruchom START_GRY.command ponownie."
  echo ""
  read -p "Nacisnij Enter, aby zamknac..." _
  exit 1
fi

if command -v npm >/dev/null 2>&1; then
  echo ""
  echo "Aktualizuje najnowsza wersje gry..."
  echo ""
  npm run build
  if [ $? -ne 0 ]; then
    echo ""
    echo "Nie udalo sie zbudowac najnowszej wersji gry."
    echo "Sprawdz bledy powyzej i sprobuj ponownie."
    echo ""
    read -p "Nacisnij Enter, aby zamknac..." _
    exit 1
  fi
fi

if [ ! -f "dist/index.html" ]; then
  echo ""
  echo "Brak gotowego buildu gry: dist/index.html"
  echo "Uruchom najpierw: npm run build"
  echo ""
  read -p "Nacisnij Enter, aby zamknac..." _
  exit 1
fi

SERVER_PATH="$(pwd)/server.cjs"
for pid in $(pgrep -f "node .*server\.cjs" 2>/dev/null); do
  if [ "$pid" != "$$" ]; then
    kill -9 "$pid" 2>/dev/null
  fi
done

FM_PORT=""
for PORT in $(seq 4173 4273); do
  if ! lsof -i tcp:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    FM_PORT="$PORT"
    break
  fi
done

if [ -z "$FM_PORT" ]; then
  echo ""
  echo "Nie udalo sie znalezc wolnego portu od 4173 do 4273."
  echo "Zamknij inne uruchomione okna gry i sprobuj ponownie."
  echo ""
  read -p "Nacisnij Enter, aby zamknac..." _
  exit 1
fi

FM_URL="http://127.0.0.1:${FM_PORT}"
FM_BROWSER_PROFILE="$(mktemp -d)"

node "$SERVER_PATH" "$FM_PORT" &

for i in $(seq 1 20); do
  if curl -s -o /dev/null "$FM_URL"; then
    break
  fi
  sleep 1
done

BROWSER_OPENED=0
CHROMIUM_BROWSERS=(
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  "/Applications/Opera.app/Contents/MacOS/Opera"
)
for BROWSER_EXE in "${CHROMIUM_BROWSERS[@]}"; do
  if [ -x "$BROWSER_EXE" ]; then
    "$BROWSER_EXE" --user-data-dir="$FM_BROWSER_PROFILE" --no-first-run --disable-session-crashed-bubble --new-window --kiosk "$FM_URL" &
    BROWSER_OPENED=1
    break
  fi
done

if [ "$BROWSER_OPENED" -eq 0 ] && [ -x "/Applications/Firefox.app/Contents/MacOS/firefox" ]; then
  "/Applications/Firefox.app/Contents/MacOS/firefox" --kiosk "$FM_URL" &
  BROWSER_OPENED=1
fi

if [ "$BROWSER_OPENED" -eq 0 ]; then
  open "$FM_URL"
fi
