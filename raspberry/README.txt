RASPBERRY PI SYNTHESIZER SETUP GUIDE
====================================

This guide explains how to turn your Raspberry Pi (3 or 4) into a dedicated Polyphonic Synthesizer using this web app.

PREREQUISITES
-------------
1. Raspberry Pi 3 Model B+ or Raspberry Pi 4 (Recommended for better audio performance).
2. Raspberry Pi OS (Legacy or Bullseye/Bookworm) with Desktop environment.
3. Audio Output (Jack or HDMI or USB DAC).
4. (Optional) USB Microphone or Audio Interface for Live Input.

STEP 1: INSTALLATION
--------------------
1. Create a folder in your home directory:
   mkdir /home/pi/synth-app

2. Copy all project files (index.html, styles.css, main.js, etc.) and the 'raspberry' scripts into this folder.
   If you generated this via an AI tool, ensure the build output (the HTML/JS) is in:
   /home/pi/synth-app/

3. Make the scripts executable:
   cd /home/pi/synth-app/raspberry
   chmod +x server.sh start-synth.sh

STEP 2: AUDIO CONFIGURATION (RASPBERRY PI OS)
---------------------------------------------
1. Right-click the Speaker icon in the top-right menu bar.
2. Select your desired Output Device (AV Jack, HDMI, or USB Audio Device).
3. If using Live Input, ensure your Input Device is selected in "Device Settings".

STEP 3: MANUAL START
--------------------
To test if everything works:

1. Open a terminal.
2. Run the start script:
   /home/pi/synth-app/raspberry/start-synth.sh

Chromium should open in fullscreen. 
- Try clicking a key.
- Toggle "ECO (Pi)" mode in the top right if you hear crackling/glitching.

STEP 4: AUTOSTART (KIOSK MODE)
------------------------------
To make the Pi boot directly into the Synth:

OPTION A: Using LXDE Autostart (Easiest for Desktop OS)
1. Open the autostart config:
   nano /home/pi/.config/lxsession/LXDE-pi/autostart

   (If this file doesn't exist, try: /etc/xdg/lxsession/LXDE-pi/autostart)

2. Add this line to the END of the file:
   @/home/pi/synth-app/raspberry/start-synth.sh

3. Save (Ctrl+O) and Exit (Ctrl+X).
4. Reboot: sudo reboot

OPTION B: Using Systemd (Robust)
1. Create a service file:
   sudo nano /etc/systemd/system/synth-app.service

2. Paste this content:
   [Unit]
   Description=PolySynth Kiosk
   After=network.target sound.target

   [Service]
   User=pi
   Group=pi
   Environment=DISPLAY=:0
   ExecStart=/home/pi/synth-app/raspberry/start-synth.sh
   Restart=always

   [Install]
   WantedBy=multi-user.target

3. Enable and start:
   sudo systemctl enable synth-app.service
   sudo systemctl start synth-app.service

USAGE TIPS
----------
- PERFORMANCE: The "ECO (Pi)" button in the app header is crucial. It limits polyphony to 6 voices and simplifies the Reverb. If you use a Pi 4, you might get away with "HQ", but on Pi 3, stick to "ECO".
- INPUT: To use the microphone, click "Enable Mic/Line" in the Utility Rack. Chromium might ask for permission once; afterwards, the script flag --autoplay-policy handles the rest.
- EXIT: To exit Kiosk mode, press Alt+F4 or plug in a keyboard and press F11/Esc.
