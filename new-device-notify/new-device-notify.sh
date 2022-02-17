#!/bin/bash
# Made by Jack'lul <jacklul.github.io>

[ "$UID" -eq 0 ] || { echo "This script must run as root!"; exit 1; }

CONFIG_FILE=/etc/new-device-notify.conf
PIHOLE_FTL_DB=/etc/pihole/pihole-FTL.db
KNOWN_DEVICES_FILE=/var/lib/new-device-notify/known_devices
LOG_FILE=/var/log/new-device-notify.log
SCAN_SUBNETS=--localnet
NOTIFICATION_COMMAND=
RUN_AS_DAEMON=false
LOCKFILE=/var/lock/$(basename $0)

if [ -f "${CONFIG_FILE}" ]; then
	. ${CONFIG_FILE}
fi

LOCKPID=$(cat "$LOCKFILE" 2> /dev/null || echo '')
if [ -e "$LOCKFILE" ] && [ ! -z "$LOCKPID" ] && kill -0 $LOCKPID > /dev/null 2>&1; then
    echo "Script is already running!"
    exit 6
fi

echo $$ > "$LOCKFILE"

function onInterruptOrExit() {
	rm "$LOCKFILE" >/dev/null 2>&1
}
trap onInterruptOrExit EXIT

[ -f "$PIHOLE_FTL_DB" ] || echo "Pi-hole FTL database not found!";
command -v arp-scan >/dev/null 2>&1 || echo "Command 'arp-scan' is missing!";

if [ ! -d "$(dirname $KNOWN_DEVICES_FILE)" ]
then
    mkdir $(dirname $KNOWN_DEVICES_FILE)
fi

function echoLog() {
	if [ "$LOG_FILE" != "" ]; then
		echo [`date +"%Y-%m-%d %H:%M:%S"`] $* >> "$LOG_FILE"
	fi

	echo $*
}

function getDevices() {
	DEVICES=
	
	if [ "$1" == "init" ] && [ -f "$KNOWN_DEVICES_FILE" ]; then
		DEVICES=$(cat "$KNOWN_DEVICES_FILE")
		return
	fi

	if [ -f "$PIHOLE_FTL_DB" ]; then
		DEVICES_PIHOLE=`sqlite3 $PIHOLE_FTL_DB "SELECT hwaddr FROM network WHERE hwaddr != '00:00:00:00:00:00'"`
		
		if [ $? -eq 0 ]; then
			if [ "$DEVICES" != "" ]; then
				DEVICES+=$'\n'
			fi
			
			#echo "PIHOLE RESULT:"
			#echo "$DEVICES_PIHOLE"
			DEVICES+="$DEVICES_PIHOLE"
		fi
	fi
	
	if command -v arp-scan >/dev/null 2>&1; then
		DEVICES_ARPSCAN=`arp-scan --ignoredups --retry 3 --quiet $SCAN_SUBNETS | awk '/.*:.*:.*:.*:.*:.*/{print $2}'`
		
		if [ $? -eq 0 ]; then
			if [ "$DEVICES" != "" ]; then
				DEVICES+=$'\n'
			fi
			
			#echo "ARP SCAN RESULT:"
			#echo "$DEVICES_ARPSCAN"
			DEVICES+="$DEVICES_ARPSCAN"
		fi
	fi

	DEVICES=$(echo "$DEVICES" | sort | uniq)
	
	#echo "RESULT:"
	#echo "$DEVICES"
	
	if [ "$KNOWN_DEVICES_FILE" != "" ] && [ ! -f "$KNOWN_DEVICES_FILE" ]; then
		echo -e "$DEVICES" > "$KNOWN_DEVICES_FILE"
		echo "Saved initial devices list to '$KNOWN_DEVICES_FILE': $(echo $DEVICES)"
	fi
}

function getDeviceInfo() {
	DEVICE_HWADDR=$1
	DEVICE_INTERFACE=
	DEVICE_IP=
	DEVICE_MACVENDOR=
	DEVICE_NAME=
	DEVICE_TIMESTAMP=
	DEVICE_DATE=

	if [ -f "$PIHOLE_FTL_DB" ]; then
		DEVICE_INFO=`sqlite3 $PIHOLE_FTL_DB "SELECT hwaddr, interface, ip, macVendor, name, firstSeen FROM network LEFT JOIN network_addresses ON network.id = network_addresses.network_id WHERE hwaddr = '$1'"`
		
		if [ $? == 0 ]; then
			IFS='|'
			i=0

			for line_info in $(echo "$DEVICE_INFO" | sed -e 's/$/|/' | sed -e 's/^/|/'); do
				if [ "$i" == "1" ]; then
					DEVICE_HWADDR=$line_info
				elif [ "$i" == "2" ]; then
					DEVICE_INTERFACE=$line_info
				elif [ "$i" == "3" ]; then
					DEVICE_IP=$line_info
				elif [ "$i" == "4" ]; then
					DEVICE_MACVENDOR=$line_info
				elif [ "$i" == "5" ]; then
					DEVICE_NAME=$line_info
				elif [ "$i" == "6" ]; then
					DEVICE_TIMESTAMP=$line_info
					DEVICE_DATE=$(date -d "@$line_info" +"%Y-%m-%d %H:%M:%S %Z")
				fi

				i=$((i+1))
			done
		fi
	fi

	if [[ $mac_address == ??:??:??:??:??:?? ]]; then
		if command -v arp-scan >/dev/null 2>&1 && [ "$DEVICE_INFO" == "" ] ; then
			DEVICE_INFO=`arp-scan --localnet --ignoredups --quiet --destaddr=$1`
			DEVICE_INTERFACE=$(echo $DEVICE_INFO | sed -e 's/.*Interface: \(.*\),.*/\1/' | head -1)
			DEVICE_IP=$(echo $DEVICE_INFO | grep "$1" | awk -F' ' '{print $1}')
			DEVICE_MACVENDOR=$(echo $DEVICE_INFO | grep "$1" | awk -F' ' '{print $3}')
			DEVICE_NAME=$(host $DEVICE_IP | sed -n "s/^.*pointer \(.*\).$/\1/p")
			DEVICE_DATE=$(date +"%Y-%m-%d %H:%M:%S %Z")
		fi
	fi

	if [ "$DEVICE_INFO" == "" ] ; then
		DEVICE_DATE=$(date +"%Y-%m-%d %H:%M:%S %Z")
	fi
}

if [ "$KNOWN_DEVICES_FILE" != "" ]; then
	mkdir -p "$(dirname "$KNOWN_DEVICES_FILE")"
fi

if [ "$RUN_AS_DAEMON" == "true" ]; then
	echoLog "Getting initial devices list..."
fi

getDevices init
DEVICES_PREVIOUS=$DEVICES

if [ "$RUN_AS_DAEMON" == "true" ]; then
	echoLog "Waiting for new devices..."
fi

while true ; do
	getDevices

	if [ "$DEVICES" != "" ] && [ "$DEVICES_PREVIOUS" != "$DEVICES" ]; then
		#echo "DEVICES_PREVIOUS:"
		#echo "$DEVICES_PREVIOUS"
		#echo "DEVICES:"
		#echo "$DEVICES"
	
		DIFF=`diff <(echo "$DEVICES_PREVIOUS") <(echo "$DEVICES") | grep "^>" | sed -e 's/> //'`
		DEVICES_PREVIOUS_NEW=$DEVICES_PREVIOUS
		DEVICES_PREVIOUS_NEW+=$'\n'"$DIFF"
		DEVICES_PREVIOUS_NEW=$(echo "$DEVICES_PREVIOUS_NEW" | sed '/^[[:space:]]*$/d' | sort)

		#echo "DIFF:"
		#echo "$DIFF"
		#echo "DEVICES_PREVIOUS_NEW:"
		#echo "$DEVICES_PREVIOUS_NEW"
		
		if [ "$DEVICES_PREVIOUS_NEW" != "$DEVICES_PREVIOUS" ]; then
			if [ "$KNOWN_DEVICES_FILE" != "" ]; then
				echo -e "$DEVICES_PREVIOUS_NEW" > "$KNOWN_DEVICES_FILE"
			fi
			
			DEVICES_PREVIOUS=$DEVICES_PREVIOUS_NEW
		fi
		
		if [ "$DIFF" != "" ]; then
			j=0
			for line_diff in $(echo "$DIFF"); do
				getDeviceInfo $line_diff
				
				if [ "$DEVICE_INFO" == "" ]; then
					echoLog "Failed to get informations about device: $line_diff"
					continue
				fi

				echoLog "New Device: NAME: $DEVICE_NAME | HWADDR: $DEVICE_HWADDR | IP: $DEVICE_IP | IF: $DEVICE_INTERFACE | MACVENDOR: $DEVICE_MACVENDOR | DATE: $DEVICE_DATE"

				if [ "$NOTIFICATION_COMMAND" != "" ]; then
					TEXT="Name:  $DEVICE_NAME\nMAC:  $DEVICE_HWADDR\nIP:  $DEVICE_IP\nInterface:  $DEVICE_INTERFACE\nMAC Vendor:  $DEVICE_MACVENDOR\nFirst Seen:  $DEVICE_DATE\n"
					eval "${NOTIFICATION_COMMAND//#DETAILS#/$TEXT}"
				fi

				j=$((j+1))
			done
		fi
	fi

	if [ "$RUN_AS_DAEMON" == "true" ]; then
		sleep 60
	else
		break
	fi
done
