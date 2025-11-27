Per utilizzarli su Raspberry Pi:

Copia questi file nella cartella raspberry del tuo progetto.

Rendi eseguibili gli script con chmod +x raspberry/server.sh raspberry/start-synth.sh.

Installa Node.js e Chromium (sudo apt install nodejs npm chromium-browser se non presenti).

Avvia il synth con ./raspberry/start-synth.sh (o crea un servizio di systemd per l’avvio automatico).
