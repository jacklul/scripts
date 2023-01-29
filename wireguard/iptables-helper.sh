#!/bin/bash
# Made by Jack'lul <jacklul.github.io>
#
# /etc/wireguard/iptables-helper.sh
#
# Use it in WireGuard interface configs (/etc/wireguard/wgX.conf):
#  PostUp = /etc/wireguard/iptables-helper.sh -i %i -o eth0 up
#  PreDown = /etc/wireguard/iptables-helper.sh -i %i -o eth0 down
#
# Check ./iptables-helper.sh --help for more information

[ "$UID" -eq 0 ] || { echo "Root privileges required!"; exit 1; }

IPT="/sbin/iptables"
IPT6="/sbin/ip6tables"

IN_INTERFACE="wg0"
OUT_INTERFACE="eth0"
PORT="51820"
ISOLATION="false"
MASQUERADE="false"
SAMBA="false"
LAN_ONLY="false"
DEVICE_ONLY="false"
DNS_ONLY="false"
IPV6="false"
IN_IPV6="false"
OUT_IPV6="false"
VERBOSE="false"
DEBUG="false"
TEST="false"
QUIET="false"

rule() {
    local CMD=$1
    local MODE=$2
    local LINE=
    local RULE=$3
    local RULERAW=$3

    if is_number $RULE; then
        if [ "$ACTION" == "up" ]; then
            LINE="$RULE"
            RULE=$(echo $4 | awk '{for (i=2; i<NF; i++) printf $i " "; print $NF}')
            LINE="$(echo $4 | awk '{print $1}') $LINE"
            RULERAW=$4
        else
            RULE=$4
            RULERAW=$4
        fi
    fi

    if [ "$CMD" == "" ]; then
        CMD=$IPT
    fi

    if [ "$MODE" == "" ]; then
        echo "${FUNCNAME[0]}: No mode specified"
        return
    fi

    if [ "$RULERAW" == "" ]; then
        echo "${FUNCNAME[0]}: No rule specified"
        return
    fi

    if [ "$CMD" == "$IPT6" ] && [ "$IPV6" == "false" ]; then
        return
    fi

    if [ "$ACTION" == "down" ]; then
        if [ "$MODE" == "-A" ] || [ "$MODE" == "-I" ]; then
            MODE="-D"
        elif [ "$MODE" == "-N" ]; then
            return
        fi
    fi

    local HAS_LINE=
    if [ "$LINE" != "" ]; then
        HAS_LINE=" $LINE"
    fi

    local STATUS=0
    if [ "$MODE" == "-X" ] || [ "$MODE" == "-N" ]; then
        eval "$CMD -L $RULERAW > /dev/null 2>&1"
        STATUS=$?
    else
        eval "$CMD -C $RULERAW > /dev/null 2>&1"
        STATUS=$?
    fi

    if [ "$VERBOSE" == "true" ]; then
        local IS_IPV6=""

        if [ "$IPV6" == "true" ]; then
            IS_IPV6="  (IPv4)"
        fi

        if [ "$CMD" == "$IPT6" ]; then
            IS_IPV6="  (IPv6)"
        fi

        if [ "$STATUS" == "0" ] && [ "$ACTION" == "up" ]; then
            echo "EXISTS: $RULERAW$IS_IPV6"
        elif [ "$STATUS" != "0" ] && [ "$ACTION" == "down" ]; then
            echo "MISSING: $RULERAW$IS_IPV6"
        fi
    fi

    if [ "$ACTION" == "up" ] && [ "$STATUS" != "0" ]; then
        if [ "$VERBOSE" == "true" ]; then
            echo "$CMD $MODE$HAS_LINE $RULE"
        fi

        if [ "$TEST" != "true" ]; then
            eval "$CMD $MODE$HAS_LINE $RULE"
        fi
    elif [ "$ACTION" == "down" ] && [ "$STATUS" == "0" ]; then
        if [ "$MODE" == "-X" ]; then
            if [ "$VERBOSE" == "true" ]; then
                echo "$CMD -F $RULE"
            fi

            if [ "$TEST" != "true" ]; then
                eval "$CMD -F $RULE"
            fi
        fi

        if [ "$VERBOSE" == "true" ]; then
            echo "$CMD $MODE $RULE"
        fi

        if [ "$TEST" != "true" ]; then
            eval "$CMD $MODE $RULE"
        fi
    fi
}

chain_exists() {
    local CMD=$1
    local CHAIN=$2

    $CMD -L $CHAIN > /dev/null 2>&1

    if [ "$?" == "0" ] ; then
        return 0
    fi

    return 1
}

is_chain_empty() {
    local CMD=$1
    local CHAIN=$2

    COUNT=`$CMD -L $CHAIN 2>/dev/null | head -1 | awk '{print $3}' | awk -F '(' '{print $2}'`

    if [ "$COUNT" == "0" ] ; then
        return 0
    fi
    
    return 1
}

remove_chain() {
    if [ "$ACTION" == "down" ]; then
        local CMD=$1
        local CHAIN=$2

        if [ "$CHAIN" != "" ]; then
            rule "$1" "-X" "$CHAIN"
        else
            echo "${FUNCNAME[0]}: No chain to remove"
        fi
    fi
}

error() {
    local TEXT="$1"
    local FATAL="$2"

    if [ "$QUIET" == "true" ]; then
        echo "$TEXT" >&2 
    else
        if [ "$FATAL" != "true" ]; then
            >&2 echo "! $TEXT"
            echo ""
        else
            >&2 echo "$TEXT"
        fi
    fi

    if [ "$FATAL" == "true" ]; then
        exit 1
    fi
}

ip2int()
{
    local a b c d
    { IFS=. read a b c d; } <<< $1
    echo $(((((((a << 8) | b) << 8) | c) << 8) | d))
}

int2ip()
{
    local ui32=$1; shift
    local ip n
    for n in 1 2 3 4; do
        ip=$((ui32 & 0xff))${ip:+.}$ip
        ui32=$((ui32 >> 8))
    done
    echo $ip
}

network()
{
    local addr=$(ip2int $1); shift
    local mask=$((0xffffffff << (32 -$1))); shift
    int2ip $((addr & mask))
}

is_number()
{
    local re='^[0-9]+$'
    if [[ $1 =~ $re ]] ; then
        return 0
    fi
    
    return 1
}

POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -i|--in-interface)
            IN_INTERFACE="${2}"
            shift
            shift
            ;;
        -o|--out-interface)
            OUT_INTERFACE="${2}"
            shift
            shift
            ;;
        -c|--client-isolation)
            ISOLATION="true"
            shift
            ;;
        -m|--masquerade)
            MASQUERADE="true"
            shift
            ;;
        -s|--samba)
            SAMBA="true"
            shift
            ;;
        -l|--lan-only)
            LAN_ONLY="true"
            shift
            ;;
        -f|--device-only)
            DEVICE_ONLY="true"
            shift
            ;;
        -p|--dns-only)
            DNS_ONLY="true"
            shift
            ;;
        -6|--ipv6)
            IPV6="true"
            shift
            ;;
        -v|--verbose)
            VERBOSE="true"
            shift
            ;;
        -d|--debug)
            DEBUG="true"
            shift
            ;;
        -t|--test)
            TEST="true"
            shift
            ;;
        -q|--quiet)
            QUIET="true"
            shift
            ;;
        ?|-h|--help)
            echo "Usage: $(basename $0) ACTION [OPTIONS]"
            echo "Actions: up, down"
            echo "Options:"
            echo " -i [IF], --in-interface [IF]   Incoming interface (WireGuard)"
            echo " -o [IF], --out-interface [IF]  Outgoing interface (physical)"
            echo " -c, --client-isolation         Prevent VPN clients from communicating with each other"
            echo " -m, --masquerade               Enable Masquerade NAT"
            echo " -s, --samba                    Enable Masquerade NAT for Samba traffic only"
            echo " -l, --lan-only                 Prevent clients from accessing internet"
            echo " -f, --device-only              Prevent clients from anything but this device"
            echo " -p, --dns-only                 Prevent clients from anything but DNS on this device"
            echo " -6, --ipv6                     Enable IPv6 support"
            echo " -d, --debug                    Show debug information and log dropped packets"
            echo " -v, --verbose                  Show more operational information"
            echo " -t, --test                     Test mode - no rules will be executed"
            echo " -q, --quiet                    Do not output anything"
            echo " -h, --help                     This help message"
            echo ""
            exit
            ;;
        -*|--*)
            error "Unknown option: $1" "true"
            exit 1
            ;;
        *)
            POSITIONAL_ARGS+=("$1")
            shift
            ;;
    esac
done

set -- "${POSITIONAL_ARGS[@]}"

# Verify options
if [ "$MASQUERADE" = "true" ] && [ "$SAMBA" = "true" ]; then
    error "You cannot use --masquerade and --samba together" "true"
fi

if [ "$LAN_ONLY" = "true" ] && [ "$DEVICE_ONLY" = "true" ]; then
    error "You cannot use --lan-only and --device-only together" "true"
fi

if ([ "$VERBOSE" = "true" ] || [ "$DEBUG" = "true" ]) && [ "$QUIET" = "true" ]; then
    VERBOSE="false"
    DEBUG="false"
fi

# Indicate test mode
if [ "$TEST" = "true" ] && [ "$QUIET" != "true" ]; then
    echo "TEST MODE"
    echo ""
fi

# Check for action/mode (up/down)
if [ "$(echo $1 | awk '{print tolower($0)}')" == "up" ]; then
    ACTION="up"
elif [ "$(echo $1 | awk '{print tolower($0)}')" == "down" ]; then
    ACTION="down"
else
    if [ "$1" == "" ]; then
        echo "No action provided"
        echo ""

        bash $0 --help
    else
        echo "Unknown action: $1"
    fi

    exit 1
fi

# Grab data from the configuration file
WG_CONF=`cat /etc/wireguard/$IN_INTERFACE.conf`

PORT_CONF=`echo "$WG_CONF" | grep -Po 'ListenPort\s?+=\s?+(\d+)' | grep -Po '\d+'`
if [ "$PORT_CONF" != "" ]; then
    PORT=$PORT_CONF
fi

# Print configuration
if [ "$DEBUG" == "true" ]; then
    echo "CONFIGURATION:"
    CONFIG_VARS=(IN_INTERFACE OUT_INTERFACE PORT ISOLATION MASQUERADE SAMBA LAN_ONLY DEVICE_ONLY DNS_ONLY IPV6 DEBUG VERBOSE TEST QUIET IPT IPT6)

    for i in "${CONFIG_VARS[@]}"; do
        : 
        echo " $i = ${!i}"
    done

    echo ""
fi

# Detect addresses and their netmasks
INET=`ip -o -f inet addr show`
IN_INET=`echo "$INET" | grep " $IN_INTERFACE " | grep "global" | awk '{print $4}'`
OUT_INET=`echo "$INET" | grep " $OUT_INTERFACE " | grep "global" | awk '{print $4}'`

# If we can't find the interface we try reading the address from the config file
if [ "$IN_INET" == "" ]; then
    IN_INET_CONF=`echo "$WG_CONF" | grep "^Address" | grep -Po '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}'`

    if [ "$IN_INET_CONF" != "" ]; then
        IN_INET=$IN_INET_CONF
    fi
fi

# IPv4
if [ "$IN_INET" != "" ]; then
    IN_ADDRESS=`echo $IN_INET | awk -F '\/' '{print $1}'`
    IN_NETMASK=`echo $IN_INET | awk -F '\/' '{print $2}'`
    IN_NETWORK=$(network $IN_ADDRESS $IN_NETMASK)
else
    error "Unable to obtain IPv4 address of interface $IN_INTERFACE" "true"
fi

if [ "$OUT_INET" != "" ]; then
    OUT_ADDRESS=`echo $OUT_INET | awk -F '\/' '{print $1}'`
    OUT_NETMASK=`echo $OUT_INET | awk -F '\/' '{print $2}'`
    OUT_NETWORK=$(network $OUT_ADDRESS $OUT_NETMASK)
else
    error "Unable to obtain IPv4 address of interface $OUT_INTERFACE" "true"
fi

# IPv6
if [ "$IPV6" == "true" ]; then
    if ! command -v subnetcalc >/dev/null 2>&1; then
        error "Calculation of IPv6 network address require 'subnetcalc' program to be installed" "true"
    fi

    IN_IPV6="true"
    OUT_IPV6="true"

    INET6=`ip -o -f inet6 addr show`
    IN_INET6=`echo "$INET6" | grep " $IN_INTERFACE " | grep "global" | awk '{print $4}'`
    OUT_INET6=`echo "$INET6" | grep " $OUT_INTERFACE " | grep "global" | awk '{print $4}'`

    # If we can't find the interface we try reading the address from the config file
    if [ "$IN_INET6" == "" ]; then
        IN_INET6_CONF=`echo "$WG_CONF" | grep "^Address" | grep -Po '[0-9a-fA-F]{1,4}:(?:[0-9a-fA-F]{0,4}:?){1,7}\/\d{1,3}'`

        if [ "$IN_INET6_CONF" != "" ]; then
            IN_INET6=$IN_INET6_CONF
        fi
    fi

    if [ "$IN_INET6" != "" ]; then
        IN_ADDRESS6=`echo $IN_INET6 | awk -F '\/' '{print $1}'`
        IN_NETMASK6=`echo $IN_INET6 | awk -F '\/' '{print $2}'`
        IN_NETWORK6=`subnetcalc $IN_ADDRESS6/$IN_NETMASK6 -n | grep "Network" | awk '{print $3}'`
    else
        IPV6="false"
        IN_IPV6="false"
    fi

    if [ "$OUT_INET6" != "" ]; then
        OUT_ADDRESS6=`echo $OUT_INET6 | awk -F '\/' '{print $1}'`
        OUT_NETMASK6=`echo $OUT_INET6 | awk -F '\/' '{print $2}'`
        OUT_NETWORK6=`subnetcalc $OUT_ADDRESS6/$OUT_NETMASK6 -n | grep "Network" | awk '{print $3}'`
    else
        OUT_IPV6="false"
    fi

    if [ "$IPV6" == "false" ]; then
        error "Unable to obtain IPv6 address of interface $IN_INTERFACE - IPv6 support disabled"
    fi
fi

if ([ "$IN_INET_CONF" != "" ] || [ "$IN_INET_CONF" != "" ]); then
    error "Unable to find interface $IN_INTERFACE - reading from configuration file /etc/wireguard/$IN_INTERFACE.conf"
fi

if [ "$DEBUG" == "true" ]; then
    echo "INTERFACES:";

    IS_IPV4=""
    IS_IPV6=""
    if [ "$IPV6" == "true" ]; then
        IS_IPV4="  (IPv4)"
        IS_IPV6="  (IPv6)"
    fi

    echo " $IN_INTERFACE = $IN_ADDRESS ($IN_NETWORK/$IN_NETMASK)$IS_IPV4"
    [ "$IPV6" == "true" ] && echo " $IN_INTERFACE = $IN_ADDRESS6 ($IN_NETWORK6/$IN_NETMASK6)$IS_IPV6"
    echo " $OUT_INTERFACE = $OUT_ADDRESS ($OUT_NETWORK/$OUT_NETMASK)$IS_IPV4"
    [ "$IPV6" == "true" ] && echo " $OUT_INTERFACE = $OUT_ADDRESS6 ($OUT_NETWORK6/$OUT_NETMASK6)$IS_IPV6"

    echo ""
fi

# Get default firewall policies
POLICIES=`iptables -S`
POLICIES6=`ip6tables -S`
INPUT_POLICY=`echo "$POLICIES" | grep "P INPUT " | awk '{print $3}'`
INPUT_POLICY6=`echo "$POLICIES6" | grep "P INPUT " | awk '{print $3}'`
FORWARD_POLICY=`echo "$POLICIES" | grep "P FORWARD " | awk '{print $3}'`
FORWARD_POLICY6=`echo "$POLICIES6" | grep "P FORWARD " | awk '{print $3}'`
OUTPUT_POLICY=`echo "$POLICIES" | grep "P OUTPUT " | awk '{print $3}'`
OUTPUT_POLICY6=`echo "$POLICIES6" | grep "P OUTPUT " | awk '{print $3}'`

if [ "$OUTPUT_POLICY" != "ACCEPT" ] || [ "$OUTPUT_POLICY6" != "ACCEPT" ]; then
    error "Default OUTPUT policy is not set to ACCEPT - this is not supported by this script and you might run into issues"
fi

# Grab last chain line numbers
LIST_INPUT=`iptables -L INPUT -nv --line-numbers`
LIST_INPUT6=`ip6tables -L INPUT -nv --line-numbers`
LIST_FORWARD=`iptables -L FORWARD -nv --line-numbers`
LIST_FORWARD6=`ip6tables -L FORWARD -nv --line-numbers`
INPUT_LASTLINE=`echo "$LIST_INPUT" | tail -1 | awk '{print $1}'`
INPUT_LASTLINE6=`echo "$LIST_INPUT6" | tail -1 | awk '{print $1}'`
FORWARD_LASTLINE=`echo "$LIST_FORWARD" | tail -1 | awk '{print $1}'`
FORWARD_LASTLINE6=`echo "$LIST_FORWARD6" | tail -1 | awk '{print $1}'`

# Some chains might be empty and above commands will produce "num" instead of number, correct that
is_number $INPUT_LASTLINE || INPUT_LASTLINE=0
is_number $INPUT_LASTLINE6 || INPUT_LASTLINE6=0
is_number $FORWARD_LASTLINE || FORWARD_LASTLINE=0
is_number $FORWARD_LASTLINE6 || FORWARD_LASTLINE6=0

# Store incremented line numbers for later use
INPUT_NEWLINE=$((INPUT_LASTLINE+1))
INPUT_NEWLINE6=$((INPUT_LASTLINE6+1))
FORWARD_NEWLINE=$((FORWARD_LASTLINE+1))
FORWARD_NEWLINE6=$((FORWARD_LASTLINE6+1))

# For later use
IN_INTERFACE_UPPER=$(echo $IN_INTERFACE | tr '[:lower:]' '[:upper:]')
OUT_INTERFACE_UPPER=$(echo $OUT_INTERFACE | tr '[:lower:]' '[:upper:]')

[ "$QUIET" != "true" ] && echo "Applying rules..."

# Look for existing ACCEPT rule for server port
CHECK_FOR_PORT_RULE=`iptables -L | grep :$PORT | grep ACCEPT`

# Make sure server port is open, only add new rule if ACCEPT rule for the PORT does not exist
if [ "$INPUT_POLICY" != "ACCEPT" ] && [ "$CHECK_FOR_PORT_RULE" == "" ]; then
    [ "$QUIET" != "true" ] && echo "Server port"

    rule "$IPT" "-A" "INPUT -i $OUT_INTERFACE -p udp --dport $PORT -j ACCEPT"

    CHECK_FOR_PORT_RULE6=`ip6tables -L | grep :$PORT | grep ACCEPT`
    if [ "$CHECK_FOR_PORT_RULE6" == "" ] && [ "$INPUT_POLICY6" != "ACCEPT" ] && [ "$IPV6" == "true" ]; then
        rule "$IPT6" "-A" "INPUT -i $OUT_INTERFACE -p udp --dport $PORT -j ACCEPT"
    fi
fi

# Forward traffic between interfaces
if [ "$FORWARD_POLICY" != "ACCEPT" ]; then
    [ "$QUIET" != "true" ] && echo "Traffic forwarding"

    if ! chain_exists "$IPT" "FORWARD_$IN_INTERFACE_UPPER"; then
        rule "$IPT" "-N" "FORWARD_$IN_INTERFACE_UPPER"
        rule "$IPT" "-A" "FORWARD_$IN_INTERFACE_UPPER -m state --state RELATED,ESTABLISHED -j ACCEPT"
        rule "$IPT" "-A" "FORWARD_$IN_INTERFACE_UPPER -m state --state NEW -s $IN_NETWORK/$IN_NETMASK -j ACCEPT"
        rule "$IPT" "-A" "FORWARD_$IN_INTERFACE_UPPER -m state --state NEW -d $IN_NETWORK/$IN_NETMASK -j ACCEPT"
        [ "$DEBUG" == "true" ] && rule "$IPT" "-A" "FORWARD_$IN_INTERFACE_UPPER -m limit --limit 1/sec -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
        rule "$IPT" "-A" "FORWARD_$IN_INTERFACE_UPPER -j DROP"
    fi

    rule "$IPT" "-A" "FORWARD -i $IN_INTERFACE -j FORWARD_$IN_INTERFACE_UPPER"
    rule "$IPT" "-A" "FORWARD -o $IN_INTERFACE -j FORWARD_$IN_INTERFACE_UPPER"

    if [ "$ACTION" == "down" ]; then
        remove_chain "$IPT" "FORWARD_$IN_INTERFACE_UPPER"
    fi

    if [ "$FORWARD_POLICY6" != "ACCEPT" ] && [ "$IN_IPV6" == "true" ]; then
        if ! chain_exists "$IPT6" "FORWARD_$IN_INTERFACE_UPPER"; then
            rule "$IPT6" "-N" "FORWARD_$IN_INTERFACE_UPPER"
            rule "$IPT6" "-A" "FORWARD_$IN_INTERFACE_UPPER -m state --state RELATED,ESTABLISHED -j ACCEPT"
            rule "$IPT6" "-A" "FORWARD_$IN_INTERFACE_UPPER -m state --state NEW -s $IN_NETWORK6/$IN_NETMASK6 -j ACCEPT"
            rule "$IPT6" "-A" "FORWARD_$IN_INTERFACE_UPPER -m state --state NEW -d $IN_NETWORK6/$IN_NETMASK6 -j ACCEPT"
            [ "$DEBUG" == "true" ] && rule "$IPT6" "-A" "FORWARD_$IN_INTERFACE_UPPER -m limit --limit 1/sec -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
            rule "$IPT6" "-A" "FORWARD_$IN_INTERFACE_UPPER -j DROP"
        fi

        rule "$IPT6" "-A" "FORWARD -i $IN_INTERFACE -j FORWARD_$IN_INTERFACE_UPPER"
        rule "$IPT6" "-A" "FORWARD -o $IN_INTERFACE -j FORWARD_$IN_INTERFACE_UPPER"

        if [ "$ACTION" == "down" ]; then
            remove_chain "$IPT6" "FORWARD_$IN_INTERFACE_UPPER"
        fi
    fi
fi

# Enable global Masquerade NAT
if [ "$MASQUERADE" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Masquerade NAT"

    rule "$IPT" "-A" "POSTROUTING -t nat -s $IN_NETWORK/$IN_NETMASK -o $OUT_INTERFACE -j MASQUERADE"

    if [ "$IN_IPV6" == "true" ] && [ "$OUT_IPV6" == "true" ]; then
        rule "$IPT6" "-A" "POSTROUTING -t nat -s $IN_NETWORK6/$IN_NETMASK6 -o $OUT_INTERFACE -j MASQUERADE"
    fi
fi

# Allow accessing Samba shares in LAN by routing through Masquerade NAT
if [ "$SAMBA" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Samba access in LAN through Masquerade NAT"

    if ! chain_exists "$IPT" "SAMBA_MASQUERADE -t nat"; then
        rule "$IPT" "-N" "SAMBA_MASQUERADE -t nat"
        rule "$IPT" "-A" "SAMBA_MASQUERADE -t nat -p tcp --dport 445 -j MASQUERADE"
        rule "$IPT" "-A" "SAMBA_MASQUERADE -t nat -p tcp --dport 139 -j MASQUERADE"
        rule "$IPT" "-A" "SAMBA_MASQUERADE -t nat -p udp --dport 138 -j MASQUERADE"
        rule "$IPT" "-A" "SAMBA_MASQUERADE -t nat -p udp --dport 137 -j MASQUERADE"
        rule "$IPT" "-A" "SAMBA_MASQUERADE -t nat -p icmp --icmp-type 1 -j MASQUERADE"
        rule "$IPT" "-A" "SAMBA_MASQUERADE -t nat -j RETURN"
    fi

    rule "$IPT" "-A" "POSTROUTING -t nat -s $IN_NETWORK/$IN_NETMASK -o $OUT_INTERFACE -d $OUT_NETWORK/$OUT_NETMASK -j SAMBA_MASQUERADE"

    if [ "$ACTION" == "down" ] && is_chain_empty "$IPT" "SAMBA_MASQUERADE -t nat"; then
        remove_chain "$IPT" "SAMBA_MASQUERADE -t nat"
    fi

    if [ "$IN_IPV6" == "true" ] && [ "$OUT_IPV6" == "true" ]; then
        if ! chain_exists "$IPT6" "SAMBA_MASQUERADE -t nat"; then
            rule "$IPT6" "-N" "SAMBA_MASQUERADE -t nat"
            rule "$IPT6" "-A" "SAMBA_MASQUERADE -t nat -p tcp --dport 445 -j MASQUERADE"
            rule "$IPT6" "-A" "SAMBA_MASQUERADE -t nat -p tcp --dport 139 -j MASQUERADE"
            rule "$IPT6" "-A" "SAMBA_MASQUERADE -t nat -p udp --dport 138 -j MASQUERADE"
            rule "$IPT6" "-A" "SAMBA_MASQUERADE -t nat -p udp --dport 137 -j MASQUERADE"
            rule "$IPT6" "-A" "SAMBA_MASQUERADE -t nat -p icmp --icmp-type 1 -j MASQUERADE"
            rule "$IPT6" "-A" "SAMBA_MASQUERADE -t nat -j RETURN"
        fi

        rule "$IPT6" "-A" "POSTROUTING -t nat -s $IN_NETWORK6/$IN_NETMASK6 -o $OUT_INTERFACE -d $OUT_NETWORK6/$OUT_NETMASK6 -j SAMBA_MASQUERADE"

        if [ "$ACTION" == "down" ] && is_chain_empty "$IPT6" "SAMBA_MASQUERADE -t nat"; then
            remove_chain "$IPT6" "SAMBA_MASQUERADE -t nat"
        fi
    fi
fi

# Prevent VPN clients from communicating with each other
if [ "$ISOLATION" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Client isolation"

    if ! chain_exists "$IPT" "ISOLATE_$IN_INTERFACE_UPPER"; then
        rule "$IPT" "-N" "ISOLATE_$IN_INTERFACE_UPPER"
        [ "$DEBUG" == "true" ] && rule "$IPT" "-A" "ISOLATE_$IN_INTERFACE_UPPER -m limit --limit 1/sec ! -d $IN_ADDRESS/32 -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
        rule "$IPT" "-A" "ISOLATE_$IN_INTERFACE_UPPER ! -d $IN_ADDRESS/32 -j DROP"
        rule "$IPT" "-A" "ISOLATE_$IN_INTERFACE_UPPER -j RETURN"
    fi

    rule "$IPT" "-I" 1 "FORWARD -i $IN_INTERFACE -d $IN_NETWORK/$IN_NETMASK -j ISOLATE_$IN_INTERFACE_UPPER"

    if [ "$ACTION" == "down" ] && is_chain_empty "$IPT" "ISOLATE_$IN_INTERFACE_UPPER"; then
        remove_chain "$IPT" "ISOLATE_$IN_INTERFACE_UPPER"
    fi

    if [ "$IN_IPV6" == "true" ]; then
        if ! chain_exists "$IPT6" "ISOLATE_$IN_INTERFACE_UPPER"; then
            rule "$IPT6" "-N" "ISOLATE_$IN_INTERFACE_UPPER"
            [ "$DEBUG" == "true" ] && rule "$IPT6" "-A" "ISOLATE_$IN_INTERFACE_UPPER -m limit --limit 1/sec ! -d $IN_ADDRESS6/128 -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
            rule "$IPT6" "-A" "ISOLATE_$IN_INTERFACE_UPPER ! -d $IN_ADDRESS6/128 -j DROP"
            rule "$IPT6" "-A" "ISOLATE_$IN_INTERFACE_UPPER -j RETURN"
        fi

        rule "$IPT6" "-I" 1 "FORWARD -i $IN_INTERFACE -d $IN_NETWORK6/$IN_NETMASK6 -j ISOLATE_$IN_INTERFACE_UPPER"

        if [ "$ACTION" == "down" ] && is_chain_empty "$IPT6" "ISOLATE_$IN_INTERFACE_UPPER"; then
            remove_chain "$IPT6" "ISOLATE_$IN_INTERFACE_UPPER"
        fi
    fi
fi

# Prevent VPN clients from accessing internet
if [ "$LAN_ONLY" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Access to LAN only"

    if ! chain_exists "$IPT" "LANONLY_$IN_INTERFACE_UPPER"; then
        rule "$IPT" "-N" "LANONLY_$IN_INTERFACE_UPPER"
        [ "$ISOLATION" == "false" ] && rule "$IPT" "-A" "LANONLY_$IN_INTERFACE_UPPER -d $IN_NETWORK/$IN_NETMASK -j RETURN"
        [ "$DEBUG" == "true" ] && rule "$IPT" "-A" "LANONLY_$IN_INTERFACE_UPPER -m limit --limit 1/sec ! -d $OUT_NETWORK/$OUT_NETMASK -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
        rule "$IPT" "-A" "LANONLY_$IN_INTERFACE_UPPER ! -d $OUT_NETWORK/$OUT_NETMASK -j DROP"
        rule "$IPT" "-A" "LANONLY_$IN_INTERFACE_UPPER -j RETURN"
    fi

    rule "$IPT" "-I" 1 "FORWARD -i $IN_INTERFACE -j LANONLY_$IN_INTERFACE_UPPER"

    if [ "$ACTION" == "down" ] && is_chain_empty "$IPT" "LANONLY_$IN_INTERFACE_UPPER"; then
        remove_chain "$IPT" "LANONLY_$IN_INTERFACE_UPPER"
    fi

    if [ "$IN_IPV6" == "true" ] && [ "$OUT_IPV6" == "true" ]; then
        if ! chain_exists "$IPT6" "LANONLY_$IN_INTERFACE_UPPER"; then
            rule "$IPT6" "-N" "LANONLY_$IN_INTERFACE_UPPER"
            [ "$ISOLATION" == "false" ] && rule "$IPT6" "-A" "LANONLY_$IN_INTERFACE_UPPER -d $IN_NETWORK6/$IN_NETMASK6 -j RETURN"
            [ "$DEBUG" == "true" ] && rule "$IPT6" "-A" "LANONLY_$IN_INTERFACE_UPPER -m limit --limit 1/sec ! -d $OUT_NETWORK6/$OUT_NETMASK6 -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
            rule "$IPT6" "-A" "LANONLY_$IN_INTERFACE_UPPER ! -d $OUT_NETWORK6/$OUT_NETMASK6 -j DROP"
            rule "$IPT6" "-A" "LANONLY_$IN_INTERFACE_UPPER -j RETURN"
        fi

        rule "$IPT6" "-I" 1 "FORWARD -i $IN_INTERFACE -j LANONLY_$IN_INTERFACE_UPPER"

        if [ "$ACTION" == "down" ] && is_chain_empty "$IPT6" "LANONLY_$IN_INTERFACE_UPPER"; then
            remove_chain "$IPT6" "LANONLY_$IN_INTERFACE_UPPER"
        fi
    fi
fi

# Prevent VPN clients from accessing anything but this device
if [ "$DEVICE_ONLY" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Access to this device only"

    if ! chain_exists "$IPT" "DEVONLY_$IN_INTERFACE_UPPER"; then
        rule "$IPT" "-N" "DEVONLY_$IN_INTERFACE_UPPER"
        [ "$DEBUG" == "true" ] && rule "$IPT" "-A" "DEVONLY_$IN_INTERFACE_UPPER -m limit --limit 1/sec ! -d $IN_ADDRESS/32 -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
        rule "$IPT" "-A" "DEVONLY_$IN_INTERFACE_UPPER ! -d $IN_ADDRESS/32 -j DROP"
        rule "$IPT" "-A" "DEVONLY_$IN_INTERFACE_UPPER -j RETURN"
    fi

    rule "$IPT" "-I" 1 "FORWARD -i $IN_INTERFACE ! -d $IN_NETWORK/$IN_NETMASK -j DEVONLY_$IN_INTERFACE_UPPER"

    if [ "$ACTION" == "down" ] && is_chain_empty "$IPT" "DEVONLY_$IN_INTERFACE_UPPER"; then
        remove_chain "$IPT" "DEVONLY_$IN_INTERFACE_UPPER"
    fi

    if [ "$IN_IPV6" == "true" ]; then
        if ! chain_exists "$IPT6" "DEVONLY_$IN_INTERFACE_UPPER"; then
            rule "$IPT6" "-N" "DEVONLY_$IN_INTERFACE_UPPER"
            [ "$DEBUG" == "true" ] && rule "$IPT6" "-A" "DEVONLY_$IN_INTERFACE_UPPER -m limit --limit 1/sec ! -d $IN_ADDRESS6/128 -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
            rule "$IPT6" "-A" "DEVONLY_$IN_INTERFACE_UPPER ! -d $IN_ADDRESS6/128 -j DROP"
            rule "$IPT6" "-A" "DEVONLY_$IN_INTERFACE_UPPER -j RETURN"
        fi

        rule "$IPT6" "-I" 1 "FORWARD -i $IN_INTERFACE ! -d $IN_NETWORK6/$IN_NETMASK6 -j DEVONLY_$IN_INTERFACE_UPPER"

        if [ "$ACTION" == "down" ] && is_chain_empty "$IPT6" "DEVONLY_$IN_INTERFACE_UPPER"; then
            remove_chain "$IPT6" "DEVONLY_$IN_INTERFACE_UPPER"
        fi
    fi
fi

# Prevent VPN clients from accessing anything but DNS on this device
if [ "$DNS_ONLY" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Access to DNS only on this device"

    # Look for "state RELATED,ESTABLISHED" and "state INVALID" rules at the beggining
    get_line_number_dns_only() {
        local CMD=$1
        local HAS_ACCEPT_STATE=`$CMD -L INPUT -nv --line-numbers | grep "state RELATED,ESTABLISHED" | awk '{print $1}' | head -1`
        local HAS_INVALID_STATE=`$CMD -L INPUT -nv --line-numbers | grep "state INVALID" | awk '{print $1}' | head -1`
        local LINE=1

        if [ "$HAS_ACCEPT_STATE" != "" ]; then
            if [ "$HAS_INVALID_STATE" != "" ]; then
                if [ "$HAS_INVALID_STATE" -gt "$HAS_ACCEPT_STATE" ]; then
                    LINE=$((HAS_INVALID_STATE+1))
                elif [ "$HAS_ACCEPT_STATE" -gt "$HAS_INVALID_STATE" ]; then
                    error "Rule for state=INVALID is before state=RELATED,ESTABLISHED - consider swapping them around for better performance"

                    LINE=$((HAS_ACCEPT_STATE+1))
                else
                    error "Failed to compare line numbers for state=INVALID and state=RELATED,ESTABLISHED - this shouldn't happen"
                fi
            else # No INVALID state rule
                LINE=$((HAS_ACCEPT_STATE+1))
            fi
        fi

        return $LINE
    }
    
    get_line_number_dns_only "$IPT"
    LINE=$?

    if ! chain_exists "$IPT" "DNSONLY_$IN_INTERFACE_UPPER"; then
        rule "$IPT" "-N" "DNSONLY_$IN_INTERFACE_UPPER"

        if [ "$LINE" -gt "1" ]; then
            rule "$IPT" "-A" "DNSONLY_$IN_INTERFACE_UPPER -m state --state NEW -p udp --dport 53 -j ACCEPT"
            rule "$IPT" "-A" "DNSONLY_$IN_INTERFACE_UPPER -m state --state NEW -p tcp --dport 53 -j ACCEPT"
        else
            rule "$IPT" "-A" "DNSONLY_$IN_INTERFACE_UPPER -p udp --dport 53 -j ACCEPT"
            rule "$IPT" "-A" "DNSONLY_$IN_INTERFACE_UPPER -p tcp --dport 53 -j ACCEPT"
        fi

        [ "$DEBUG" == "true" ] && rule "$IPT" "-A" "DNSONLY_$IN_INTERFACE_UPPER -m limit --limit 1/sec -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
        rule "$IPT" "-A" "DNSONLY_$IN_INTERFACE_UPPER -j DROP"
    fi

    rule "$IPT" "-I" $LINE "INPUT -i $IN_INTERFACE -s $IN_NETWORK/$IN_NETMASK -j DNSONLY_$IN_INTERFACE_UPPER"

    if [ "$ACTION" == "down" ] && is_chain_empty "$IPT" "DNSONLY_$IN_INTERFACE_UPPER"; then
        remove_chain "$IPT" "DNSONLY_$IN_INTERFACE_UPPER"
    fi

    if [ "$IN_IPV6" == "true" ]; then
        get_line_number_dns_only "$IPT6"
        LINE=$?

        if ! chain_exists "$IPT6" "DNSONLY_$IN_INTERFACE_UPPER"; then
            rule "$IPT6" "-N" "DNSONLY_$IN_INTERFACE_UPPER"

            if [ "$LINE" -gt "1" ]; then
                rule "$IPT6" "-A" "DNSONLY_$IN_INTERFACE_UPPER -m state --state NEW -p udp --dport 53 -j ACCEPT"
                rule "$IPT6" "-A" "DNSONLY_$IN_INTERFACE_UPPER -m state --state NEW -p tcp --dport 53 -j ACCEPT"
            else
                rule "$IPT6" "-A" "DNSONLY_$IN_INTERFACE_UPPER -p udp --dport 53 -j ACCEPT"
                rule "$IPT6" "-A" "DNSONLY_$IN_INTERFACE_UPPER -p tcp --dport 53 -j ACCEPT"
            fi

            [ "$DEBUG" == "true" ] && rule "$IPT6" "-A" "DNSONLY_$IN_INTERFACE_UPPER -m limit --limit 1/sec -j LOG --log-prefix=\"[$IN_INTERFACE_UPPER-DROP] \" --log-level debug"
            rule "$IPT6" "-A" "DNSONLY_$IN_INTERFACE_UPPER -j DROP"
        fi

        rule "$IPT6" "-I" $LINE "INPUT -i $IN_INTERFACE -s $IN_NETWORK6/$IN_NETMASK6 -j DNSONLY_$IN_INTERFACE_UPPER"

        if [ "$ACTION" == "down" ] && is_chain_empty "$IPT6" "DNSONLY_$IN_INTERFACE_UPPER"; then
            remove_chain "$IPT6" "DNSONLY_$IN_INTERFACE_UPPER"
        fi
    fi
fi
