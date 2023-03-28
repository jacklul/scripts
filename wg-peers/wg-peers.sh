#!/bin/bash
# Made by Jack'lul <jacklul.github.io>

SELF=$0
if [ "$(dirname "$0")" == "/usr/local/sbin" ]; then
	SELF=$(basename "$0")
fi

set -e
WGPATH=/etc/wireguard

function generateKeys() {
	echo "Generating keys..."
		
	PRIVATE_KEY=$(wg genkey)
	PUBLIC_KEY=$(echo "$PRIVATE_KEY" | wg pubkey)
	PSK_KEY=$(wg genpsk)

	echo -e " Private key:\t $PRIVATE_KEY"
	echo -e " Public key:\t $PUBLIC_KEY"
	echo -e " Pre-shared key: $PSK_KEY"
}

function checkForRequiredFiles() {
	if [ "$1" == "" ]; then
		echo "Interface not provided!"
		exit 1
	fi
	
	if [ "$1" == "" ] || [ ! -f "$WGPATH/$1.conf" ]; then
		echo "You must provide valid and existing interface! ($1.conf)"
		exit 1
	fi
	
	if [ ! -f "$WGPATH/$1-private.key" ]; then
		echo "Interface's private key is missing! ($1-private.key)"
		exit 1
	fi
	
	if [ ! -f "$WGPATH/$1-public.key" ]; then
		echo "Interface's public key is missing! ($1-public.key)"
		exit 1
	fi
	
	if [ ! -f "$WGPATH/$1-peer.conf" ]; then
		echo "Template peer config does not exist! ($1-peer.conf)"
		echo "Use these variables for dynamic substitution: #PEER_PRIVATE_KEY#, #PEER_IP_ADDRESS#, #SERVER_PUBLIC_KEY#, #PEER_PSK_KEY#"
		exit 1
	fi
	
	if [ ! -f "$WGPATH/$1-peers.conf" ]; then
		echo -e "# This file is managed by the script and should not be modified by hand\n" > "$WGPATH/$1-peers.conf"
	fi
}

function checkForRequiredPeerName() {
	if [ "$1" == "" ]; then
		echo "Interface not provided!"
		exit 1
	fi
	
	if [ "$2" == "" ]; then
		echo "You must provide peer name!"
		exit 1
	fi
	
	if [[ "$2" =~ [^a-zA-Z0-9] ]]; then
		echo "Provided peer name is invalid!"
		exit 1
	fi

	if [ "$3" == "add" ]; then
		if grep -q "peer-$2 START" "$WGPATH/$1-peers.conf"; then
			echo "Peer '$2' already exists!"
			exit 1
		fi
	else
		if ! grep -q "peer-$2 START" "$WGPATH/$1-peers.conf"; then
			echo "Peer '$2' does not exist!"
			exit 1
		fi
	fi
}

function substituteVariables() {
	if [ "$1" == "" ]; then
		echo "Source string not provided!"
		exit 1
	fi
	
	if [ "$PRIVATE_KEY" == "" ]; then
		echo "PRIVATE_KEY variable is empty!"
		exit 1
	fi
	
	if [ "$PEER_IP_ADDRESS" == "" ]; then
		echo "PEER_IP_ADDRESS variable is empty!"
		exit 1
	fi
	
	if [ "$SERVER_PUBLIC_KEY" == "" ]; then
		echo "SERVER_PUBLIC_KEY variable is empty!"
		exit 1
	fi
	
	if [ "$PSK_KEY" == "" ]; then
		echo "PSK_KEY variable is empty!"
		exit 1
	fi

	SUBSTITUTED=$(echo -e "$1" | \
	sed "s@#PEER_PRIVATE_KEY#@${PRIVATE_KEY}@g" | \
	sed "s@#PEER_IP_ADDRESS#@${PEER_IP_ADDRESS}@g" | \
	sed "s@#SERVER_PUBLIC_KEY#@${SERVER_PUBLIC_KEY}@g" | \
	sed "s@#PEER_PSK_KEY#@${PSK_KEY}@g")
}

function getPeerInfo() {
	PEER=$(sed -n -e "/# peer\-$2 START/,/# peer\-$2 END/ p" < "$WGPATH/$1-peers.conf")

	PRIVATE_KEY=$(echo "$PEER" | grep "PrivateKey" | cut -d "=" -f2- | xargs)
	PEER_IP_ADDRESS=$(echo "$PEER" | grep "AllowedIPs" | cut -d "=" -f2- | cut -d "/" -f1 | xargs)
	PSK_KEY=$(echo "$PEER" | grep "PresharedKey" | cut -d "=" -f2- | xargs)
}

function getNextIPAddress() {
	if [ "$1" == "" ]; then
		echo "Interface not provided!"
		exit 1
	fi

	SERVER_IP_ADDRESS=$(grep "Address" < "$WGPATH/$1.conf" | cut -d "=" -f2 | cut -d "/" -f1 | xargs)
	SERVER_IP_BASE=$(echo "$SERVER_IP_ADDRESS" | rev | cut -d"." -f2- | rev).
	PEERS_IPS=$(grep "$SERVER_IP_BASE" < "$WGPATH/$1-peers.conf" | grep "AllowedIPs" | cut -d "=" -f2 | cut -d "/" -f1 | awk '{$1=$1;print}')
	#shellcheck disable=SC2001
	PEERS_IPS_PARTS=$(echo "$PEERS_IPS" | sed "s/$SERVER_IP_BASE//")
	
	if [ "$PEERS_IPS" == "" ]; then
		PEER_IP_ADDRESS=${SERVER_IP_BASE}2
		return
	fi
	
	# Find first available IP
	for i in $(seq 2 254); do 
		for line in $PEERS_IPS_PARTS; do
			if [ "$i" == "$line" ]; then
				continue 2
			fi
		done
			
		PEER_IP_ADDRESS=$SERVER_IP_BASE$i
		break 2
	done

	if [ "$PEER_IP_ADDRESS" == "" ]; then
		echo "Failed to assign IP address!"
		exit 1
	fi
}

function reloadInterface() {
	if [ "$1" == "" ]; then
		echo "Interface not provided!"
		exit 1
	fi
	
	echo "Reloading WireGuard interface %s..." "$1"
	wg syncconf "$1" <(wg-quick strip "$1")
	STATUS_1=$?
	
	wg set "$1" private-key "/etc/wireguard/$1-private.key"
	STATUS_2=$?
	
	wg addconf "$1" "$WGPATH/$1-peers.conf"
	STATUS_3=$?
	
	if [ $STATUS_1 -eq 0 ] && [ $STATUS_2 -eq 0 ] && [ $STATUS_3 -eq 0 ]; then
		echo " ok"
	else
		echo -e " failed\nYou might have to reload the service manually."
	fi
}

function restartInterface() {
	if [ "$1" == "" ]; then
		echo "Interface not provided!"
		exit 1
	fi
	
	printf "Restarting WireGuard interface %s..." "$1"
	
	#shellcheck disable=SC2086
	if systemctl restart wg-quick@$1; then
		echo " ok"
	else
		echo -e " failed\nYou might have to restart the service manually."
	fi
}

if [ "$1" == "" ] || [ "$1" == "help" ]; then
	echo -e "Usage:"
	echo -e " $SELF list [if]          - list peers"
	echo -e " $SELF add [if] [name]    - add peer"
	echo -e " $SELF remove [if] [name] - remove peer"
	echo -e " $SELF show [if] [name]   - show peer config"
	echo -e " $SELF reload [if]        - reload interface"
	echo -e " $SELF restart [if]       - restart interface"
else
	[ "$UID" -eq 0 ] || { echo "Root privileges required!"; exit 1; }

	if [ "$1" == "list" ]; then
		checkForRequiredFiles "$2"
		
		if [ ! -f "$WGPATH/$2-peers.conf" ]; then
			echo "Peers file does not exist!"
			exit 1
		fi
	
		# Extract peers information for peers file
		PEERS=$(grep "^# peer-.* START" < "$WGPATH/$2-peers.conf" | sed -e 's/^.*peer\-\(.*\)START/\1/')

		echo "List of peers for interface '$2':"
		
		for line in $PEERS; do
			echo " $line"
		done
	elif [ "$1" == "show" ]; then
		checkForRequiredFiles "$2"
		checkForRequiredPeerName "$2" "$3" show
		
		if [ ! -f "$WGPATH/$2-peers.conf" ]; then
			echo "Peers file does not exist!"
			exit 1
		fi
	
		SERVER_PUBLIC_KEY=$(cat "$WGPATH/$2-public.key")
		
		getPeerInfo "$2" "$3"
		substituteVariables "$(cat "$WGPATH/$2-peer.conf")"
	
		if [ "$4" == "qr" ]; then
			if ! command -v qrencode >/dev/null 2>&1; then
				echo "Unable to find 'qrencode' command!"
				exit 1
			fi
			
			echo "$SUBSTITUTED" | qrencode -t ansiutf8
			exit
		fi
		
		echo -e "###################################################################"
		echo "$SUBSTITUTED"
		echo -e "###################################################################"
		echo -e "\nTo show config as QR code use '$SELF $1 $2 $3 qr'."
	elif [ "$1" == "add" ]; then
		checkForRequiredFiles "$2"
		checkForRequiredPeerName "$2" "$3" add
		
		echo "Adding peer '$3'..."
		
		# Generate all required keys
		generateKeys
		SERVER_PUBLIC_KEY=$(cat "$WGPATH/$2-public.key")
		
		# Get available IP address to assign
		printf "Assigning IP address..."
		getNextIPAddress "$2"
		echo " $PEER_IP_ADDRESS"
		
		# Generate configuration
		echo "Generating configuration..."
		substituteVariables "$(cat "$WGPATH/$2-peer.conf")"
		
		# Insert peer entry to interface config
		cat <<EOT >> "$WGPATH/$2-peers.conf"
# peer-$3 START
[Peer]
PublicKey = $PUBLIC_KEY
#PrivateKey = $PRIVATE_KEY
PresharedKey = $PSK_KEY
AllowedIPs = $PEER_IP_ADDRESS/32
# peer-$3 END
EOT

		if [ -f "$WGPATH/$2-hosts.list" ] && ! grep -q "$PEER_IP_ADDRESS" "$WGPATH/$2-hosts.list" ; then
			echo "Adding hosts entry..."
			echo -e "$PEER_IP_ADDRESS\t$3.$2" >> "$WGPATH/$2-hosts.list"
		fi
		
		echo "Peer '$3' was successfully added!"

		reloadInterface "$2"
		
		echo
		$SELF show "$2" "$3"
	elif [ "$1" == "remove" ]; then
		checkForRequiredFiles "$2"
		checkForRequiredPeerName "$2" "$3" remove
	
		echo "Removing peer '$3'..."
		
		# We need peer IP later
		getPeerInfo "$2" "$3"
		
		# Remove peer block from configuration
		sed -i "/# peer\-$3 START/,/# peer\-$3 END/d" "$WGPATH/$2-peers.conf"
		
		# Remove entry from hosts file if it exists and IP is not empty
		if [ -f "$WGPATH/$2-hosts.list" ] && [ "$PEER_IP_ADDRESS" != "" ]; then
			echo "Removing hosts entry..."
			sed -i "/$PEER_IP_ADDRESS/d" "$WGPATH/$2-hosts.list"
		fi
		
		echo "Peer '$3' was successfully removed!"

		reloadInterface "$2"
	elif [ "$1" == "reload" ]; then
		checkForRequiredFiles "$2"
		reloadInterface "$2"
	elif [ "$1" == "restart" ]; then
		checkForRequiredFiles "$2"
		restartInterface "$2"
	else
		echo "Unrecognized command!"
		echo "See '$SELF help' for help"
	fi
fi
