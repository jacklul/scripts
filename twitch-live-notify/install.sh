#!/bin/bash

[ "$UID" -eq 0 ] && { echo "This cannot be run as root!"; exit 1; }
command -v php >/dev/null 2>&1 || { echo "Command 'php' not found!"; exit 1; }

SPATH=$(dirname "$0")
REQUIRED_FILES=( twitch-live-notify.php twitch-live-notify.service twitch-live-notify.timer twitch-live-notify.conf.example )
DOWNLOAD_PATH=twitch-live-notify
DOWNLOAD_URL=https://raw.githubusercontent.com/jacklul/scripts/master/twitch-live-notify

set -e

MISSING_FILES=0
for FILE in "${REQUIRED_FILES[@]}"; do
    [ ! -f "$SPATH/$FILE" ] && MISSING_FILES=$((MISSING_FILES+1))
done

if [ "$MISSING_FILES" -gt 0 ]; then
    if [ "$MISSING_FILES" != "${#MISSING_FILES[@]}" ]; then
        mkdir -v "$SPATH/$DOWNLOAD_PATH"
        SPATH="$SPATH/$DOWNLOAD_PATH"
    fi

    for FILE in "${REQUIRED_FILES[@]}"; do
        [ ! -f "$SPATH/$FILE" ] && wget -nv -O "$SPATH/$FILE" "$DOWNLOAD_URL/$FILE"
    done
fi

for FILE in "${REQUIRED_FILES[@]}"; do
    [ ! -f "$SPATH/$FILE" ] && { echo "Missing required file for installation: $FILE"; exit 1; }
done

mkdir -pv ~/.local/bin
cp -v "$SPATH/twitch-live-notify.php" ~/.local/bin/twitch-live-notify && chmod 755 ~/.local/bin/twitch-live-notify

mkdir -pv ~/.config/systemd/user/
cp -v "$SPATH/twitch-live-notify.service" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/twitch-live-notify.service
cp -v "$SPATH/twitch-live-notify.timer" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/twitch-live-notify.timer

if [ ! -f "/home/$USER/.config/twitch-live-notify.conf" ] && [ -f "$SPATH/twitch-live-notify.conf.example" ]; then
	cp -v "$SPATH/twitch-live-notify.conf.example" "/home/$USER/.config/twitch-live-notify.conf"
fi

command -v dos2unix >/dev/null 2>&1 && dos2unix ~/.local/bin/twitch-live-notify

echo -e "\nTo enable and start the timer use this command: \"systemctl --user enable twitch-live-notify.timer && systemctl --user start twitch-live-notify.timer\""
echo "You might also need to run \"loginctl enable-linger $USER\" to enable the launch of timers for not logged in users"

systemctl daemon-reload --user
