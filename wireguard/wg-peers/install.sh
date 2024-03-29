#!/bin/bash

[ "$UID" -eq 0 ] || { echo "This must run as root!"; exit 1; }

set -e
command -v wg >/dev/null 2>&1 || { echo "This script requires Wireguard's 'wg' utility to run!"; }

SPATH=$(dirname "$0")
REMOTE_URL=https://raw.githubusercontent.com/jacklul/scripts/master/wireguard/wg-peers

if [ -f "$SPATH/wg-peers.sh" ]; then
	cp -v "$SPATH/wg-peers.sh" /usr/local/sbin/wg-peers && chmod 755 /usr/local/sbin/wg-peers

	command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/sbin/wg-peers
elif [ "$REMOTE_URL" != "" ]; then
	wget -nv -O /usr/local/sbin/wg-peers "$REMOTE_URL/wg-peers.sh" && chmod +x /usr/local/sbin/wg-peers
else
	echo "Missing required files for installation!"
	exit 1
fi
