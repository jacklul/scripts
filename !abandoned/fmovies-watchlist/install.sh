#!/bin/bash

[ "$UID" -eq 0 ] && { echo "This cannot be run as root!"; exit 1; }
command -v php >/dev/null 2>&1 || { echo "Command 'php' not found!"; exit 1; }

SPATH=$(dirname "$0")
REQUIRED_FILES=( fmovies-watchlist.php fmovies-watchlist.service fmovies-watchlist.timer fmovies-watchlist.conf.example )
DOWNLOAD_PATH=fmovies-watchlist
DOWNLOAD_URL=https://raw.githubusercontent.com/jacklul/scripts/master/fmovies-watchlist

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
cp -v "$SPATH/fmovies-watchlist.php" ~/.local/bin/fmovies-watchlist && chmod 755 ~/.local/bin/fmovies-watchlist

mkdir -pv ~/.config/systemd/user/
cp -v "$SPATH/fmovies-watchlist.service" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/fmovies-watchlist.service
cp -v "$SPATH/fmovies-watchlist.timer" ~/.config/systemd/user/ && chmod 644 ~/.config/systemd/user/fmovies-watchlist.timer

if [ ! -f "/home/$USER/.config/fmovies-watchlist/fmovies-watchlist.conf" ] && [ -f "$SPATH/fmovies-watchlist.conf.example" ]; then
    mkdir -p "/home/$USER/.config/fmovies-watchlist"
	cp -v "$SPATH/fmovies-watchlist.conf.example" "/home/$USER/.config/fmovies-watchlist/fmovies-watchlist.conf"
fi

command -v dos2unix >/dev/null 2>&1 && dos2unix ~/.local/bin/fmovies-watchlist

echo -e "\nTo enable and start the timer use this command: \"systemctl --user enable fmovies-watchlist.timer && systemctl --user start fmovies-watchlist.timer\""
echo "You might also need to run \"loginctl enable-linger $USER\" to enable the launch of timers for not logged in users"

systemctl daemon-reload --user
