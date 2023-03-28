#!/bin/bash
# Made by Jack'lul <jacklul.github.io>

LOG_FILE=/var/log/restart-dns.log

# You can modify this function to your needs
function restartDNS() {
	if systemctl is-active --quiet unbound.service; then
		systemctl restart unbound.service
	fi

	if systemctl is-active --quiet dnscrypt-proxy.service; then
		systemctl restart dnscrypt-proxy.service
	fi

	if systemctl is-active --quiet cloudflared.service; then
		systemctl restart cloudflared.service
	fi
}

############################################################

[ "$UID" -eq 0 ] || { echo "This script must run as root!"; exit 1; }

LOCKFILE=/var/lock/$(basename "$0")
LOCKPID=$(cat "$LOCKFILE" 2> /dev/null || echo '')

if [ -e "$LOCKFILE" ] && [ -n "$LOCKPID" ] && kill -0 "$LOCKPID" > /dev/null 2>&1; then
    echo "Script is already running!"
    exit 6
fi

echo $$ > "$LOCKFILE"

function onInterruptOrExit() {
	rm "$LOCKFILE" >/dev/null 2>&1
}
trap onInterruptOrExit EXIT

function echoLog() {
	if [ "$LOG_FILE" != "" ]; then
		echo ["$(date +"%Y-%m-%d %H:%M:%S %Z")"] "$@" >> "$LOG_FILE"
	fi

	echo "$@"
}

function getPid() {
	PID=
	#PID=`ps axf | grep /usr/bin/pihole-FTL | grep -v "grep\|systemctl\|sh -c" | awk '{print $1}'`
	#PID=`pidof /usr/bin/pihole-FTL`
	if test -f "/var/run/pihole-FTL.pid"; then
		PID=$(cat /var/run/pihole-FTL.pid)
	fi
}

echoLog "Getting initial process PID..."
while : ; do
	getPid
	[ "$PID" = "" ] || break
	sleep 1
done
LastPID=$PID
echoLog "PID is $PID"

echoLog "Waiting for PID change..."
while true ; do
	getPid

	if [ "$PID" != "" ] && [ "$LastPID" != "$PID" ]; then
		if systemctl is-active --quiet pihole-FTL; then
			echoLog "New PID is $PID"
			LastPID=$PID
			echoLog "Restarting DNS services..."
			restartDNS
		fi
	fi

	sleep 5
done

