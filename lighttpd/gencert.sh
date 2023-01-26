#!/bin/bash
# Made by Jack'lul <jacklul.github.io>
#
# /etc/lighttpd/certs/gencert.sh
#
# Helper for generating certificates

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
	exec sudo -- "$0" "$@"
	exit
fi

set -e
THISDIR=$(dirname $(realpath -s $0))

PS3='Please enter your choice: '
options=("Generate self-signed certificate for domain" "Generate self-signed CA certificate" "Generate self-signed server certificate" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "Generate self-signed certificate for domain")
			if [ ! -f "$THISDIR/ca.pem" ]; then
				echo "Missing CA certificate: $THISDIR/ca.pem"
				break
			fi
			
			while true
			do
				read -p 'Domain name [example.com]: ' DOMAIN
				if [ "$DOMAIN" != "" ]; then
					break
				fi
			done
			
			read -p 'Certificate file name [cert]: ' FILENAME
			if [ "$FILENAME" == "" ]; then
				FILENAME=cert
			fi
			
			if [ -f "$THISDIR/$DOMAIN/$FILENAME.pem" ]; then
				read -p "Certificate already exists, overwrite? [y/N] " -n 1 -r
				echo  # new line
				if [[ ! $REPLY =~ ^[Yy]$ ]]; then
					break
				fi
			fi
			
			mkdir -m 755 -p "$THISDIR/$DOMAIN"
			
			openssl req --nodes -x509 -days 3650 -newkey rsa:4096 -subj "/CN=$DOMAIN/" -keyout "$THISDIR/$DOMAIN/$FILENAME.key" -out "$THISDIR/$DOMAIN/$FILENAME.pem"

			echo "[v3_req]
subjectAltName = @alt_names
[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
" > "$THISDIR/$DOMAIN/alt.txt"
						
			mkdir -m 755 -p "$THISDIR/$DOMAIN/demoCA/newcerts"
			touch "$THISDIR/$DOMAIN/demoCA/index.txt"
			echo '01' > "$THISDIR/$DOMAIN/demoCA/serial"
			
			cd "$THISDIR/$DOMAIN"
			
			openssl ca -policy policy_anything -keyfile "$THISDIR/ca.key" -cert "$THISDIR/ca.pem" -ss_cert "$THISDIR/$DOMAIN/$FILENAME.pem" -out "$THISDIR/$DOMAIN/$FILENAME.signed.pem" -extensions v3_req -extfile "$THISDIR/$DOMAIN/alt.txt"
			
			rm -fr "$THISDIR/$DOMAIN/demoCA/" "$THISDIR/$DOMAIN/alt.txt"
			
			chmod 400 "$THISDIR/$DOMAIN/*.key" "$THISDIR/$DOMAIN/*.pem"
			
			echo "ssl.pemfile = \"$THISDIR/$DOMAIN/$FILENAME.signed.pem\"
ssl.privkey = \"$THISDIR/$DOMAIN/$FILENAME.key\"
ssl.ca-file = \"$THISDIR/ca.pem\""

            break
            ;;
        "Generate self-signed CA certificate")
			read -p 'Certificate file name [ca]: ' FILENAME
			
			if [ "$FILENAME" == "" ]; then
				FILENAME=ca
			fi
			
			if [ -f "$THISDIR/$FILENAME.pem" ]; then
				read -p "Certificate already exists, overwrite? [y/N] " -n 1 -r
				echo  # new line
				if [[ ! $REPLY =~ ^[Yy]$ ]]; then
					break
				fi
			fi
			
			openssl req --nodes -new -x509 -days 3650 -extensions v3_ca -subj "/CN=$(hostname -s)-ca/" -keyout "$THISDIR/$FILENAME.key" -out "$THISDIR/$FILENAME.pem" -config /etc/ssl/openssl.cnf
			chmod 400 "$THISDIR/*.key" "$THISDIR/*.pem"
			
			echo "ssl.ca-file = \"$THISDIR/$FILENAME.pem\""

            break
            ;;
        "Generate self-signed server certificate")
			read -p 'Certificate file name [lighttpd]: ' FILENAME
			
			if [ "$FILENAME" == "" ]; then
				FILENAME=lighttpd
			fi
			
			if [ -f "$THISDIR/$FILENAME.pem" ]; then
				read -p "Certificate already exists, overwrite? [y/N] " -n 1 -r
				echo  # new line
				if [[ ! $REPLY =~ ^[Yy]$ ]]; then
					break
				fi
			fi
			
			openssl req -nodes -new -x509 -days 3650 -keyout "$THISDIR/*.pem" -out "$THISDIR/*.pem"
			chmod 400 "$THISDIR/$FILENAME.pem"
			
			echo "ssl.pemfile = \"$THISDIR/$FILENAME.pem\""

            break
            ;;
        "Quit")
            break
            ;;
        *) echo "Invalid option $REPLY";;
    esac
done
