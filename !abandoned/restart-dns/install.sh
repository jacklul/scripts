#!/bin/bash

[ "$UID" -eq 0 ] || { echo "This must run as root!"; exit 1; }

SPATH=$(dirname "$0")
REQUIRED_FILES=( restart-dns.sh restart-dns.service )

set -e

for FILE in "${REQUIRED_FILES[@]}"; do
	if [ ! -f "$SPATH/$FILE" ]; then
		echo "Missing required file for installation: $FILE"
		exit 1
	fi
done

cp -v "$SPATH/restart-dns.sh" /usr/local/sbin/restart-dns && chmod 755 /usr/local/sbin/restart-dns
	
cp -v "$SPATH/restart-dns.service" /etc/systemd/system && chmod 644 /etc/systemd/system/restart-dns.service

command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/sbin/restart-dns

echo "Enabling and starting restart-dns.service..."
systemctl enable restart-dns.service && systemctl restart restart-dns.service
