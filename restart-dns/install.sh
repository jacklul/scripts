#!/bin/bash

[ "$UID" -eq 0 ] || exec sudo bash "$0" "$@"

SPATH=$(dirname "$0")

set -e

if [ -f "$SPATH/restart-dns.sh" ] && [ -f "$SPATH/restart-dns.service" ]; then
	cp -v "$SPATH/restart-dns.sh" /usr/local/sbin/restart-dns && chmod 755 /usr/local/sbin/restart-dns
		
	cp -v "$SPATH/restart-dns.service" /etc/systemd/system && chmod 644 /etc/systemd/system/restart-dns.service
	
	command -v dos2unix >/dev/null 2>&1 && dos2unix /usr/local/sbin/restart-dns
	
	echo "Enabling and starting restart-dns.service..."
	systemctl enable restart-dns.service && systemctl restart restart-dns.service
else
	echo "Missing required files for installation!"
	exit 1
fi
