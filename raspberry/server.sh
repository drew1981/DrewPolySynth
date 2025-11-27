#!/usr/bin/env bash
#
# This script starts the local web server for the DrewPolySynth
# application on a Raspberry Pi.  It handles installing dependencies,
# building the app if necessary, and launching a Vite preview server.
#
# The intent is to let the synth run as a self‑contained “app” on
# Raspberry Pi hardware.  The script uses a production build rather than
# the development server for better performance on the Pi’s limited
# resources.  Logs are redirected to `/tmp/drewpolysynth_server.log`.

set -euo pipefail

########################################
# Determine project directories
########################################
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# The root of the repository is one level up from this script
ROOT_DIR="$( dirname "$SCRIPT_DIR" )"

cd "$ROOT_DIR"

########################################
# Ensure Node dependencies are installed
########################################
if [[ ! -d node_modules ]]; then
  echo "[server.sh] Installing dependencies..."
  # Install all dependencies.  Building the app requires devDependencies
  # (e.g. Vite).  Use --no-audit and --no-fund to avoid extraneous
  # network calls and npm messages.
  npm install --no-audit --no-fund
fi

########################################
# Build the project if it hasn't been built yet
########################################
if [[ ! -d dist ]]; then
  echo "[server.sh] Building application..."
  npm run build
fi

########################################
# Start the Vite preview server
########################################
# Allow overriding the port with the PORT environment variable; default to 3000
PORT="${PORT:-3000}"

echo "[server.sh] Starting Vite preview server on port $PORT..."
# Launch the preview server in the background.  The `nohup` ensures the
# process keeps running after this script exits.  All output is
# redirected to a log file for troubleshooting.
nohup npx vite preview --port "$PORT" --host 0.0.0.0 \
  > /tmp/drewpolysynth_server.log 2>&1 &

echo "[server.sh] Server is launching.  Logs: /tmp/drewpolysynth_server.log"