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

is_number()
{
	local re='^[0-9]+$'
	if [[ $1 =~ $re ]] ; then
		return 0
	fi

	return 1
}

set -e
THISDIR=$(dirname $(realpath -s $0))

PS3='Please enter your choice: '
options=("Generate self-signed certificate for domain" "Generate self-signed CA certificate" "Generate self-signed server certificate" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "Generate self-signed certificate for domain")
			read -p 'CA certificate file name [ca]: ' FILENAME

			if [ "$FILENAME" == "" ]; then
				FILENAME=ca
			fi

			if [ ! -f "$THISDIR/$FILENAME.pem" ]; then
				echo "Missing CA certificate: $THISDIR/$FILENAME.pem"
				break
			fi

			while true
			do
				read -p 'Domain name [example.com]: ' DOMAIN
				if [ "$DOMAIN" != "" ]; then
					break
				fi
			done

			if [ -f "$THISDIR/$DOMAIN/certificate.signed.pem" ]; then
				read -p "Certificate already exists, overwrite? [y/N] " -n 1 -r
				echo  # new line
				if [[ ! $REPLY =~ ^[Yy]$ ]]; then
					break
				fi
			fi

			while : ; do
				read -p 'Number of days certificate will be valid for? [365]: ' LIFETIME

				if [ "$LIFETIME" == "" ]; then
					LIFETIME=365
					break
				fi

				is_number $LIFETIME && break
			done

			if [ ! -f "/usr/lib/ssl/openssl.cnf" ]; then
				echo "Missing /usr/lib/ssl/openssl.cnf file!"
				exit 1
			fi

			CNFFILE="$(cat /usr/lib/ssl/openssl.cnf)"

			# These are the defaults
			CA_DIR=demoCA
			NEWCERTS_DIR=newcerts
			DB_FILE=index.txt
			SERIAL_FILE=serial

			DEFAULT_CA=`echo "$CNFFILE" | grep "^default_ca\s" | awk '{print $3}'`

			if [ "$DEFAULT_CA" != "" ]; then
				CASECTION_START=`echo "$CNFFILE" | grep -n "^\[\sCA_default\s\]" | cut -d : -f 1`

				if [ "$CASECTION_START" != "" ]; then
					CASECTION_END=`echo "$CNFFILE" | tail -n +$((CASECTION_START+1)) | grep -n "^\[\s.*\s\]" | cut -d : -f 1 | head -n 1`

					if [ "$CASECTION_END" != "" ]; then
						CASECTION=`echo "$CNFFILE" | tail -n +$((CASECTION_START+2)) | head -n +$((CASECTION_END-2))`

						TMP=`echo "$CASECTION" | grep "^dir\s" | awk '{print $3}'| awk -F/ '{for (i=2; i<NF; i++) printf $i " "; print $NF}'`
						if [ "$TMP" != "" ]; then
							CA_DIR=$TMP
						fi

						TMP=`echo "$CASECTION" | grep "^new_certs_dir\s" | awk '{print $3}'| awk -F/ '{for (i=2; i<NF; i++) printf $i " "; print $NF}'`
						if [ "$TMP" != "" ]; then
							NEWCERTS_DIR=$TMP
						fi

						TMP=`echo "$CASECTION" | grep "^database\s" | awk '{print $3}'| awk -F/ '{for (i=2; i<NF; i++) printf $i " "; print $NF}'`
						if [ "$TMP" != "" ]; then
							DB_FILE=$TMP
						fi

						TMP=`echo "$CASECTION" | grep "^serial\s" | awk '{print $3}'| awk -F/ '{for (i=2; i<NF; i++) printf $i " "; print $NF}'`
						if [ "$TMP" != "" ]; then
							SERIAL_FILE=$TMP
						fi
					fi
				fi
			fi

			mkdir -m 755 -p "$THISDIR/$DOMAIN"

			openssl req --nodes -x509 -days $LIFETIME -newkey rsa:4096 -subj "/CN=$DOMAIN/" -keyout "$THISDIR/$DOMAIN/certificate.key" -out "$THISDIR/$DOMAIN/certificate.pem"

			echo "[v3_req]
subjectAltName = @alt_names
[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
" > "$THISDIR/$DOMAIN/alt.txt"

			mkdir -m 755 -p "$THISDIR/$DOMAIN/$CA_DIR/$NEWCERTS_DIR"
			touch "$THISDIR/$DOMAIN/$CA_DIR/$DB_FILE"
			echo '01' > "$THISDIR/$DOMAIN/$CA_DIR/$SERIAL_FILE"

			cd "$THISDIR/$DOMAIN"

			openssl ca -policy policy_anything -keyfile "$THISDIR/$FILENAME.key" -cert "$THISDIR/$FILENAME.pem" -ss_cert "$THISDIR/$DOMAIN/certificate.pem" -out "$THISDIR/$DOMAIN/certificate.signed.pem" -extensions v3_req -extfile "$THISDIR/$DOMAIN/alt.txt"

			rm -fr "$THISDIR/$DOMAIN/$CA_DIR/" "$THISDIR/$DOMAIN/alt.txt"

			chmod 400 "$THISDIR/$DOMAIN/certificate.key" "$THISDIR/$DOMAIN/certificate.pem" "$THISDIR/$DOMAIN/certificate.signed.pem"

			echo "ssl.pemfile = \"$THISDIR/$DOMAIN/certificate.signed.pem\"
ssl.privkey = \"$THISDIR/$DOMAIN/certificate.key\"
ssl.ca-file = \"$THISDIR/$FILENAME.pem\""

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

			while : ; do
				read -p 'Number of days certificate will be valid for? [365]: ' LIFETIME

				if [ "$LIFETIME" == "" ]; then
					LIFETIME=365
					break
				fi

				is_number $LIFETIME && break
			done

			openssl req --nodes -new -x509 -days $LIFETIME -extensions v3_ca -subj "/CN=$(hostname -s)-ca/" -keyout "$THISDIR/$FILENAME.key" -out "$THISDIR/$FILENAME.pem" -config /etc/ssl/openssl.cnf
			chmod 400 "$THISDIR/$FILENAME.key" "$THISDIR/$FILENAME.pem"

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

			while : ; do
				read -p 'Number of days certificate will be valid for? [365]: ' LIFETIME

				if [ "$LIFETIME" == "" ]; then
					LIFETIME=365
					break
				fi

				is_number $LIFETIME && break
			done

			openssl req -nodes -new -x509 -days $LIFETIME -keyout "$THISDIR/$FILENAME.pem" -out "$THISDIR/$FILENAME.pem"
			chmod 400 "$THISDIR/$FILENAME.pem"

			echo "ssl.pemfile = \"$THISDIR/$FILENAME.pem\""

            break
            ;;
        "Quit")
            break
            ;;
        *) 
			echo "Invalid option $REPLY"
			exit 1
		;;
    esac
done
