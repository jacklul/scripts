#!/bin/bash

[ "$UID" -eq 0 ] || { echo "This must run as root!"; exit 1; }

SPATH=$(dirname "$0")
REQUIRED_FILES=( iptables-helper.sh )
DOWNLOAD_PATH=iptables-helper
DOWNLOAD_URL=https://raw.githubusercontent.com/jacklul/scripts/master/wireguard/iptables-helper

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

cp -v "$SPATH/iptables-helper.sh" /etc/wireguard/iptables-helper.sh && chmod 755 /etc/wireguard/iptables-helper.sh

command -v dos2unix >/dev/null 2>&1 && dos2unix /etc/wireguard/iptables-helper.sh
