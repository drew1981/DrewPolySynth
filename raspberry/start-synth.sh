#!/usr/bin/env bash
#
# This script starts the DrewPolySynth server (if it is not already
# running) and launches a Chromium‑based browser in kiosk mode to
# display the synth.  Running Chromium in `--app` mode hides the
# address bar and window chrome so the user sees only the synth UI.
#
# Use this script on a Raspberry Pi to turn the DrewPolySynth React
# application into a dedicated, appliance‑like instrument.

set -euo pipefail

########################################
# Determine directories
########################################
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( dirname "$SCRIPT_DIR" )"

########################################
# Start the server
########################################
# Delegate server startup to the companion script.  This script uses
# `nohup` so it returns immediately.  It is safe to call multiple
# times; if the server is already running, it will simply spawn
# another instance bound to the same port and one will fail.  You can
# customise the port via the PORT environment variable before calling
# this script.
"$SCRIPT_DIR/server.sh"

########################################
# Wait for the server to become reachable
########################################
PORT="${PORT:-3000}"
URL="http://localhost:$PORT"

echo "[start-synth.sh] Waiting for server at $URL..."
for i in {1..60}; do
  if curl -fs "${URL}" >/dev/null 2>&1; then
    echo "[start-synth.sh] Server is up."
    break
  fi
  sleep 1
done

########################################
# Determine the available browser
########################################
if command -v chromium-browser >/dev/null 2>&1; then
  BROWSER="chromium-browser"
elif command -v chromium >/dev/null 2>&1; then
  BROWSER="chromium"
elif command -v google-chrome >/dev/null 2>&1; then
  BROWSER="google-chrome"
else
  echo "[start-synth.sh] No supported Chromium browser found. Please install 'chromium-browser' or 'google-chrome'." >&2
  exit 1
fi

########################################
# Launch the synth UI in kiosk/app mode
########################################
# We use `--kiosk` to make the window full‑screen and `--app` to
# suppress the address bar and tabs.  Additional flags disable
# infobars and allow autoplay of audio without user interaction.

echo "[start-synth.sh] Launching $BROWSER in kiosk mode..."
$BROWSER \
  --new-window \
  --kiosk \
  --app="${URL}" \
  --disable-infobars \
  --autoplay-policy=no-user-gesture-required \
  --start-fullscreen \
  --noerrdialogs \
  --disable-features=Translate,ExtensionsToolbarMenu \
  --disable-restore-session-state \
  --disable-session-crashed-bubble \
  --overscroll-history-navigation=0 \
  >/dev/null 2>&1 &

echo "[start-synth.sh] Synth launched.  Close the browser or kill the process to exit."