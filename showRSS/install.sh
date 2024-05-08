#!/bin/bash

[ "$UID" -eq 0 ] && { echo "This cannot be run as root!"; exit 1; }
command -v php >/dev/null 2>&1 || { echo "Command 'php' not found!"; exit 1; }

SPATH=$(dirname "$0")
REQUIRED_FILES=( showRSS.php showRSS.service showRSS.timer showRSS.conf.example )
DOWNLOAD_PATH=/tmp/showRSS
DOWNLOAD_URL=https://raw.githubusercontent.com/jacklul/scripts/master/showRSS

set -e

MISSING_FILES=0
for FILE in "${REQUIRED_FILES[@]}"; do
    [ ! -f "$SPATH/$FILE" ] && MISSING_FILES=$((MISSING_FILES+1))
done

if [ "$MISSING_FILES" -gt 0 ]; then
    if [ "$MISSING_FILES" = "${#REQUIRED_FILES[@]}" ]; then
        mkdir -pv "$DOWNLOAD_PATH"
        SPATH="$DOWNLOAD_PATH"
    fi

    for FILE in "${REQUIRED_FILES[@]}"; do
        [ ! -f "$SPATH/$FILE" ] && wget -nv -O "$SPATH/$FILE" "$DOWNLOAD_URL/$FILE"
    done
fi

for FILE in "${REQUIRED_FILES[@]}"; do
    [ ! -f "$SPATH/$FILE" ] && { echo "Missing required file for installation: $FILE"; exit 1; }
done

mkdir -pv ~/.local/bin
cp -v "$SPATH/showRSS.php" ~/.local/bin/showRSS && chmod 755 ~/.local/bin/showRSS

mkdir -pv ~/.config/systemd/user/
cp -v "$SPATH/showRSS.service" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/showRSS.service
cp -v "$SPATH/showRSS.timer" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/showRSS.timer

if [ ! -f "/home/$USER/.config/showRSS/showRSS.conf" ] && [ -f "$SPATH/showRSS.conf.example" ]; then
    mkdir -p "/home/$USER/.config/showRSS"
	cp -v "$SPATH/showRSS.conf.example" "/home/$USER/.config/showRSS/showRSS.conf"
fi

command -v dos2unix >/dev/null 2>&1 && dos2unix ~/.local/bin/showRSS

echo -e "\nTo enable and start the timer use this command: \"systemctl --user enable showRSS.timer && systemctl --user start showRSS.timer\""
echo "You might also need to run \"loginctl enable-linger $USER\" to enable the launch of timers for not logged in users"

systemctl daemon-reload --user
