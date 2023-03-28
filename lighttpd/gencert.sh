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
THISDIR=$(dirname "$(realpath -s "$0")")

TYPE=0
FILENAME=
LIFETIME=
SUBJECT=
CAFILENAME=
FORCE="false"
NOSUBDIR="false"

POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -g|--generic)
            TYPE=1
            shift
            ;;
        -d|--domain)
            TYPE=2
            shift
            ;;
        -c|--ca)
            TYPE=3
            shift
            ;;
        -n|--name)
            FILENAME="${2}"
            shift
            shift
            ;;
        -t|--days)
            LIFETIME="${2}"
            shift
            shift
            ;;
        -o|--subject)
			if [ "$SUBJECT" != "" ]; then
				echo "Error: Subject is already set"
				exit 1
			fi
            SUBJECT="${2}"
            shift
            shift
            ;;
        -a|--ca-certificate)
            CAFILENAME="${2}"
            shift
            shift
            ;;
        -b|--auto-subject)
			if [ "$SUBJECT" != "" ]; then
				echo "Error: Subject is already set"
				exit 1
			fi
            SUBJECT="/CN=$(hostname -s)/O=Internet Widgits Pty Ltd/emailAddress=root@$(hostname -s)/"
            shift
            ;;
        -f|--force)
            FORCE="true"
            shift
            ;;
        -p|--path)
            THISDIR="${2}"
            shift
            shift
            ;;
        -u|--no-subdir)
            NOSUBDIR="true"
            shift
            ;;
        ?|-h|--help)
            echo "Usage: $(basename "$0") [ARGS...]"
            echo "Options:"
            echo " -g, --generic            Generate self-signed certificate"
            echo " -d, --domain             Generate CA-signed certificate for domain"
            echo " -c, --ca                 Generate self-signed CA certificate"
            echo " -n, --name               Set certificate file name (or domain name with --domain)"
            echo " -t, --days               Set certificate expiration time"
            echo " -o, --subject            Set subject data"
            echo " -a, --ca-certificate     Set CA certificate (for use with --domain)"
            echo " -b, --auto-subject       Automatically generate subject fields"
            echo " -f, --force              Do not ask if overwrite file"
            echo " -p, --path               Root path for keeping the certificates (/etc/lighttpd/certs)"
            echo " -u, --no-subdir          Do not store domain certificates in subdirectory (not recommended)"
            echo ""
            exit
            ;;
        -*)
            echo "Unknown option: $1"
            exit 1
            ;;
        *)
            POSITIONAL_ARGS+=("$1")
            shift
            ;;
    esac
done

set -- "${POSITIONAL_ARGS[@]}"

PS3='Please enter your choice: '
options=("Generate self-signed certificate" "Generate CA-signed domain certificate" "Generate self-signed CA certificate" "Quit")

if [ "$TYPE" == "0" ]; then
	echo "For command line arguments use '$(basename "$0") --help'"
	echo ""

	select OPT in "${options[@]}"
	do
		case $OPT in
			"Generate self-signed certificate")
				TYPE=1
				break;
				;;
			"Generate CA-signed domain certificate")
				TYPE=2
				break;
				;;
			"Generate self-signed CA certificate")
				TYPE=3
				break;
				;;
			"Quit")
				exit
				;;
			*)
				echo "Invalid option $OPT"
				exit 1
			;;
		esac
	done
fi

case $TYPE in
	1)
		if [ "$FILENAME" == "" ]; then
			read -rp 'Certificate or domain name [lighttpd]: ' FILENAME

			if [ "$FILENAME" == "" ]; then
				FILENAME=lighttpd
			fi
		fi

		if echo "$FILENAME" | grep -q "\."; then
			# shellcheck disable=SC2174
			mkdir -m 600 -p "$THISDIR/$FILENAME"
			FILENAME=$FILENAME/certificate
		fi

		if [ "$FORCE" == "false" ] && [ -f "$THISDIR/$FILENAME.pem" ]; then
			read -rp "Certificate already exists, overwrite? [y/N] " -n 1 -r
			echo  # new line
			if [[ ! $REPLY =~ ^[Yy]$ ]]; then
				return
			fi
		fi

		if [ "$LIFETIME" == "" ]; then
			while : ; do
				read -rp 'Number of days certificate will be valid for? [365]: ' LIFETIME

				if [ "$LIFETIME" == "" ]; then
					LIFETIME=365
					break
				fi

				is_number "$LIFETIME" && break
			done
		fi

		if [ "$SUBJECT" != "" ]; then
			(set -x; openssl req -nodes -new -x509 -days "$LIFETIME" -keyout "$THISDIR/$FILENAME.pem" -out "$THISDIR/$FILENAME.pem" --subj "$SUBJECT")
		else
			(set -x; openssl req -nodes -new -x509 -days "$LIFETIME" -keyout "$THISDIR/$FILENAME.pem" -out "$THISDIR/$FILENAME.pem")
		fi

		chmod 400 "$THISDIR/$FILENAME.pem"

		echo "ssl.pemfile = \"$THISDIR/$FILENAME.pem\""
		;;
	2)
		if [ "$CAFILENAME" == "" ]; then
			read -rp 'CA certificate file name [ca]: ' CAFILENAME

			if [ "$CAFILENAME" == "" ]; then
				CAFILENAME=ca
			fi
		fi

		if [ ! -f "$THISDIR/$CAFILENAME.pem" ]; then
			echo "Missing CA certificate: $THISDIR/$CAFILENAME.pem"
			exit
		fi

		if [ "$FILENAME" != "" ]; then
			DOMAIN=$FILENAME
		else
			while true
			do
				read -rp 'Domain name [example.com]: ' DOMAIN
				if [ "$DOMAIN" != "" ]; then
					break
				fi
			done
		fi

		TARGETDIR="$THISDIR/$DOMAIN"
		TARGETCERT="$TARGETDIR/certificate.pem"
		TARGETKEY="$TARGETDIR/certificate.key"
		TARGETSIGNED="$TARGETDIR/certificate.signed.pem"
		
		if [ "$NOSUBDIR" == "true" ]; then
			TARGETDIR="$THISDIR"
			TARGETCERT="$THISDIR/$DOMAIN.pem"
			TARGETKEY="$THISDIR/$DOMAIN.key"
			TARGETSIGNED="$THISDIR/$DOMAIN.signed.pem"
		fi

		if [ "$FORCE" == "false" ] && [ -f "$TARGETSIGNED" ]; then
			read -rp "Certificate already exists, overwrite? [y/N] " -n 1 -r
			echo  # new line
			if [[ ! $REPLY =~ ^[Yy]$ ]]; then
				return
			fi
		fi

		if [ "$SUBJECT" == "" ]; then
			read -rp "Certificate common name [$DOMAIN]: " COMMONNAME

			if [ "$COMMONNAME" == "" ]; then
				COMMONNAME="$DOMAIN"
			fi

			SUBJECT="/CN=$COMMONNAME/"
		fi

		if [ "$LIFETIME" == "" ]; then
			while : ; do
				read -rp 'Number of days certificate will be valid for? [365]: ' LIFETIME

				if [ "$LIFETIME" == "" ]; then
					LIFETIME=365
					break
				fi

				is_number "$LIFETIME" && break
			done
		fi

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

		DEFAULT_CA=$(echo "$CNFFILE" | grep "^default_ca\s" | awk '{print $3}')

		if [ "$DEFAULT_CA" != "" ]; then
			CASECTION_START=$(echo "$CNFFILE" | grep -n "^\[\sCA_default\s\]" | cut -d : -f 1)

			if [ "$CASECTION_START" != "" ]; then
				CASECTION_END=$(echo "$CNFFILE" | tail -n +$((CASECTION_START+1)) | grep -n "^\[\s.*\s\]" | cut -d : -f 1 | head -n 1)

				if [ "$CASECTION_END" != "" ]; then
					CASECTION=$(echo "$CNFFILE" | tail -n +$((CASECTION_START+2)) | head -n +$((CASECTION_END-2)))

					TMP=$(echo "$CASECTION" | grep "^dir\s" | awk '{print $3}'| awk -F/ '{for (i=2; i<NF; i++) printf $i " "; print $NF}')
					if [ "$TMP" != "" ]; then
						CA_DIR=$TMP
					fi

					TMP=$(echo "$CASECTION" | grep "^new_certs_dir\s" | awk '{print $3}'| awk -F/ '{for (i=2; i<NF; i++) printf $i " "; print $NF}')
					if [ "$TMP" != "" ]; then
						NEWCERTS_DIR=$TMP
					fi

					TMP=$(echo "$CASECTION" | grep "^database\s" | awk '{print $3}'| awk -F/ '{for (i=2; i<NF; i++) printf $i " "; print $NF}')
					if [ "$TMP" != "" ]; then
						DB_FILE=$TMP
					fi

					TMP=$(echo "$CASECTION" | grep "^serial\s" | awk '{print $3}'| awk -F/ '{for (i=2; i<NF; i++) printf $i " "; print $NF}')
					if [ "$TMP" != "" ]; then
						SERIAL_FILE=$TMP
					fi
				fi
			fi
		fi

		if [ "$NOSUBDIR" == "false" ]; then
			# shellcheck disable=SC2174
			mkdir -m 600 -p "$TARGETDIR"
		fi

		(set -x; openssl req --nodes -x509 -days "$LIFETIME" -newkey rsa:4096 -keyout "$TARGETKEY" -out "$TARGETCERT" --subj "$SUBJECT")

		echo "[v3_req]
subjectAltName = @alt_names
[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
" > "$TARGETDIR/alt.txt"

		# shellcheck disable=SC2174
		mkdir -m 600 -p "$TARGETDIR/$CA_DIR/$NEWCERTS_DIR"
		touch "$TARGETDIR/$CA_DIR/$DB_FILE"
		echo '01' > "$TARGETDIR/$CA_DIR/$SERIAL_FILE"

		cd "$TARGETDIR"

		(set -x; openssl ca -batch -policy policy_anything -keyfile "$THISDIR/$CAFILENAME.key" -cert "$THISDIR/$CAFILENAME.pem" -ss_cert "$TARGETCERT" -out "$TARGETSIGNED" -extensions v3_req -extfile "$TARGETDIR/alt.txt")

		rm -fr "${TARGETDIR:?}/$CA_DIR/" "$TARGETDIR/alt.txt"

		chmod 400 "$TARGETKEY" "$TARGETCERT" "$TARGETSIGNED"

		echo "ssl.pemfile = \"$TARGETSIGNED\"
ssl.privkey = \"$TARGETKEY\"
ssl.ca-file = \"$THISDIR/$CAFILENAME.pem\""
		;;
	3)
		if [ "$FILENAME" == "" ]; then
			read -rp 'Certificate name [ca]: ' FILENAME

			if [ "$FILENAME" == "" ]; then
				FILENAME=ca
			fi
		fi

		if [ "$FORCE" == "false" ] && [ -f "$THISDIR/$FILENAME.pem" ]; then
			read -rp "Certificate already exists, overwrite? [y/N] " -n 1 -r
			echo  # new line
			if [[ ! $REPLY =~ ^[Yy]$ ]]; then
				return
			fi
		fi

		if [ "$SUBJECT" == "" ]; then
			read -rp "Certificate common name [$(hostname -s)-ca]: " COMMONNAME

			if [ "$COMMONNAME" == "" ]; then
				COMMONNAME=$(hostname -s)-ca
			fi

			SUBJECT="/CN=$COMMONNAME/"
		fi

		if [ "$LIFETIME" == "" ]; then
			while : ; do
				read -rp 'Number of days certificate will be valid for? [365]: ' LIFETIME

				if [ "$LIFETIME" == "" ]; then
					LIFETIME=365
					break
				fi

				is_number "$LIFETIME" && break
			done
		fi

		(set -x; openssl req --nodes -new -x509 -days "$LIFETIME" -extensions v3_ca -keyout "$THISDIR/$FILENAME.key" -out "$THISDIR/$FILENAME.pem" -config /etc/ssl/openssl.cnf --subj "$SUBJECT")

		chmod 400 "$THISDIR/$FILENAME.key" "$THISDIR/$FILENAME.pem"

		echo "ssl.ca-file = \"$THISDIR/$FILENAME.pem\""
		;;
	*) 
		echo "Invalid option type $TYPE"
		exit 1
	;;
esac
