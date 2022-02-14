#!/bin/bash
# Made by Jack'lul <jacklul.github.io>

PIHOLE_FTL_DB=/etc/pihole/pihole-FTL.db
KNOWN_DEVICES_FILE=/var/lib/new-device-notify/known_devices
LOG_FILE=/var/log/new-device-notify.log

# You can modify this function to your needs
function notify() {
	TEXT="Name:  $1\nMAC:  $2\nIP:  $3\nInterface:  $4\nMAC Vendor:  $5\nFirst Seen:  $6\n"

	/usr/local/bin/telegram-notify --quiet --icon 1F5A5 --html \
	--title "New device detected on the network ($(hostname -f))" \
	--text $(echo "$TEXT" | sed -e 's/<[^>]*>//g')
}

############################################################

[ "$UID" -eq 0 ] || { echo "This script must run as root!"; exit 1; }

LOCKFILE=/var/lock/$(basename $0)
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
command -v arp-scan >/dev/null 2>&1 || echo "Install 'arp-scan' package for better efficiency!";

function echoLog() {
	if [ "$LOG_FILE" != "" ]; then
		echo [`date +"%Y-%m-%d %H:%M:%S %Z"`] $* >> "$LOG_FILE"
	fi

	echo $*
}

function getDevices() {
	if [ "$1" == "init" ] && [ -f "$KNOWN_DEVICES_FILE" ]; then
		DEVICES=$(cat "$KNOWN_DEVICES_FILE")
		return
	fi

	DEVICES=
	
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
		DEVICES_ARPSCAN=`arp-scan --localnet --ignoredups --quiet | awk '/.*:.*:.*:.*:.*:.*/{print $2}'`
		
		if [ $? -eq 0 ]; then
			if [ "$DEVICES" != "" ]; then
				DEVICES+=$'\n'
			fi
			
			#echo "ARP SCAN RESULT:"
			#echo "$DEVICES_ARPSCAN"
			DEVICES+="$DEVICES_ARPSCAN"
		fi
	fi

	#if [ "$1" != "init" ]; then
	#	DEVICES+=$'\n'"e0:46:9a:80:f2:63"
	#fi
	
	DEVICES=$(echo "$DEVICES" | sort | uniq)
	
	#echo "RESULT:"
	#echo "$DEVICES"
	
	if [ "$KNOWN_DEVICES_FILE" != "" ] && [ ! -f "$KNOWN_DEVICES_FILE" ]; then
		echo -e "$DEVICES" > "$KNOWN_DEVICES_FILE"
	fi
}

function getDeviceInfo() {
	if [ -f "$PIHOLE_FTL_DB" ]; then
		DEVICE_INFO=`sqlite3 $PIHOLE_FTL_DB "SELECT hwaddr, interface, ip, macVendor, name, firstSeen FROM network LEFT JOIN network_addresses ON network.id = network_addresses.network_id WHERE hwaddr = '$1'"`
		
		if [ $? != 0 ]; then
			DEVICE_INFO=
			return
		fi
		
		DEVICE_HWADDR=
		DEVICE_INTERFACE=
		DEVICE_IP=
		DEVICE_MACVENDOR=
		DEVICE_NAME=
		DEVICE_TIMESTAMP=
		DEVICE_DATE=

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
	
	if command -v arp-scan >/dev/null 2>&1 && [ "$DEVICE_INFO" == "" ] ; then
		DEVICE_INFO=`arp-scan --localnet --ignoredups --quiet --destaddr=$1`
		DEVICE_HWADDR=$1
		DEVICE_INTERFACE=$(echo $DEVICE_INFO | sed -e 's/.*Interface: \(.*\),.*/\1/' | head -1)
		DEVICE_IP=$(echo $DEVICE_INFO | grep "$1" | awk -F' ' '{print $1}')
		DEVICE_MACVENDOR=$(echo $DEVICE_INFO | grep "$1" | awk -F' ' '{print $3}')
		DEVICE_NAME=$(host $DEVICE_IP | sed -n "s/^.*pointer \(.*\).$/\1/p")
		DEVICE_TIMESTAMP=
		DEVICE_DATE=$(date +"%Y-%m-%d %H:%M:%S %Z")
	fi
}

if [ "$KNOWN_DEVICES_FILE" != "" ]; then
	mkdir -p "$(dirname "$KNOWN_DEVICES_FILE")"
fi

echoLog "Getting initial devices list..."
getDevices init
#DEVICES=`sqlite3 $PIHOLE_FTL_DB "SELECT hwaddr FROM network WHERE hwaddr != 'ip-10.6.0.2'"`
DEVICES_PREVIOUS=$DEVICES

echoLog "Waiting for new devices..."
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

				if [ "$j" != "0" ]; then
					sleep 1
				fi

				notify "$DEVICE_NAME" "$DEVICE_HWADDR" "$DEVICE_IP" "$DEVICE_INTERFACE" "$DEVICE_MACVENDOR" "$DEVICE_DATE"

				j=$((j+1))
			done
		fi
	fi

	sleep 60
done
