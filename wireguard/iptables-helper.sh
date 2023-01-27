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
    local RULE=$1
    local MODE=$2
    local CMD=$3

    if [ "$RULE" == "" ]; then
        echo ${FUNCNAME[0]}: No rule specified
        return
    fi

    if [ "$MODE" == "" ]; then
        echo ${FUNCNAME[0]}: No mode specified
        return
    fi

    if [ "$CMD" == "$IPT6" ] && [ "$IPV6" == "false" ]; then
        return
    fi

    local IS_IPV6=""
    if [ "$IPV6" == "true" ]; then
        IS_IPV6="  (IPv4)"
    fi
    if [ "$CMD" == "$IPT6" ]; then
        IS_IPV6="  (IPv6)"
    fi

    if [ "$CMD" == "" ]; then
        CMD=$IPT
    fi

    local BASECMD=`basename $CMD`

    $CMD -C $RULE > /dev/null 2>&1
    local STATUS=$?

    if [ "$VERBOSE" == "true" ]; then
        if [ "$STATUS" == "0" ] && [ "$MODE" == "-I" ]; then
            echo "E: $RULE$IS_IPV6"
        elif [ "$STATUS" == "1" ] && [ "$MODE" == "-D" ]; then
            echo "M: $RULE$IS_IPV6"
        fi
    fi

    if [ "$MODE" == "-I" ] && [ "$STATUS" != "0" ]; then
        if [ "$VERBOSE" == "true" ]; then
            echo "A: $RULE$IS_IPV6"
        fi

        if [ "$TEST" != "true" ]; then
            $CMD -I $RULE
        fi
    elif [ "$MODE" == "-D" ] && [ "$STATUS" == "0" ]; then
        if [ "$VERBOSE" == "true" ]; then
            echo "D: $RULE$IS_IPV6"
        fi

        if [ "$TEST" != "true" ]; then
            $CMD -D $RULE
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
        -m|--masquerade)
            MASQUERADE="true"
            shift
            ;;
        -s|--samba)
            SAMBA="true"
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
            echo " -l, --lan-only                 Prevent clients from accessing internet"
            echo " -f, --device-only              Prevent clients from anything but this device"
            echo " -p, --dns-only                 Prevent clients from anything but DNS on this device"
            echo " -m, --masquerade               Enable Masquerade NAT"
            echo " -s, --samba                    Enable Masquerade NAT for Samba traffic only"
            echo " -6, --ipv6                     Enable IPv6 support"
            echo " -d, --debug                    Show debug information"
            echo " -v, --verbose                  Show more information"
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
    MODE="-I"
elif [ "$(echo $1 | awk '{print tolower($0)}')" == "down" ]; then
    MODE="-D"
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
IN_INET=`echo "$INET" | grep " $IN_INTERFACE " | awk '{print $4}'`
OUT_INET=`echo "$INET" | grep " $OUT_INTERFACE " | awk '{print $4}'`

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
    IN_INET6=`echo "$INET6" | grep " $IN_INTERFACE " | awk '{print $4}'`
    OUT_INET6=`echo "$INET6" | grep " $OUT_INTERFACE " | awk '{print $4}'`

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
    error "Unable to find active interface $IN_INTERFACE - addresses read from the configuration file"
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
FORWARD_POLICY=`echo "$POLICIES" | grep "P FORWARD " | awk '{print $3}'`
OUTPUT_POLICY=`echo "$POLICIES" | grep "P OUTPUT " | awk '{print $3}'`
INPUT_POLICY6=`echo "$POLICIES6" | grep "P INPUT " | awk '{print $3}'`
FORWARD_POLICY6=`echo "$POLICIES6" | grep "P FORWARD " | awk '{print $3}'`
OUTPUT_POLICY6=`echo "$POLICIES6" | grep "P OUTPUT " | awk '{print $3}'`

if [ "$OUTPUT_POLICY" != "ACCEPT" ] || [ "$OUTPUT_POLICY6" != "ACCEPT" ]; then
    error "Default OUTPUT policy is not set to ACCEPT - this is not supported by this script and you might run into issues"
fi

[ "$QUIET" != "true" ] && echo "Applying rules..."

# Make sure server port is open
if [ "$INPUT_POLICY" != "ACCEPT" ]; then
    [ "$QUIET" != "true" ] && echo "Server port access"

    rule "INPUT -i $OUT_INTERFACE -p udp --dport $PORT -j ACCEPT" "$MODE" "$IPT"

    if [ "$INPUT_POLICY6" != "ACCEPT" ] && [ "$IPV6" == "true" ]; then
        rule "INPUT -i $OUT_INTERFACE -p udp --dport $PORT -j ACCEPT" "$MODE" "$IPT6"
    fi
fi

# Forward traffic between interfaces
if [ "$FORWARD_POLICY" != "ACCEPT" ] && ([ "$ISOLATION" == "false" ] || [ "$DEVICE_ONLY" == "false" ]); then
    [ "$QUIET" != "true" ] && echo "Traffic forwarding"

    if [ "$ISOLATION" == "false" ]; then
        rule "FORWARD -i $IN_INTERFACE -o $IN_INTERFACE -j ACCEPT" "$MODE" "$IPT"
    fi

    #if [ "$DEVICE_ONLY" == "false" ] && [ "$DNS_ONLY" == "false" ]; then
    if [ "$DEVICE_ONLY" == "false" ] ; then
        rule "FORWARD -i $IN_INTERFACE -o $OUT_INTERFACE -j ACCEPT" "$MODE" "$IPT"
        rule "FORWARD -i $OUT_INTERFACE -o $IN_INTERFACE -j ACCEPT" "$MODE" "$IPT"
    fi

    if [ "$FORWARD_POLICY6" != "ACCEPT" ] && [ "$IN_IPV6" == "true" ] && [ "$OUT_IPV6" == "true" ]; then
        if [ "$ISOLATION" == "false" ]; then
            rule "FORWARD -i $IN_INTERFACE -o $IN_INTERFACE -j ACCEPT" "$MODE" "$IPT6"
        fi

        rule "FORWARD -i $IN_INTERFACE -o $OUT_INTERFACE -j ACCEPT" "$MODE" "$IPT6"
        rule "FORWARD -i $OUT_INTERFACE -o $IN_INTERFACE -j ACCEPT" "$MODE" "$IPT6"
    fi
fi

# Enable global Masquerade NAT
if [ "$MASQUERADE" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Masquerade NAT"

    rule "POSTROUTING -t nat -s $IN_NETWORK/$IN_NETMASK -o $OUT_INTERFACE -j MASQUERADE" "$MODE" "$IPT"

    if [ "$IN_IPV6" == "true" ]; then
        rule "POSTROUTING -t nat -s $IN_NETWORK6/$IN_NETMASK6 -o $OUT_INTERFACE -j MASQUERADE" "$MODE" "$IPT6"
    fi
fi

# Allow accessing Samba shares in LAN by routing through Masquerade NAT
if [ "$SAMBA" == "true" ] && [ "$MASQUERADE" == "false" ]; then
    [ "$QUIET" != "true" ] && echo "Samba access in LAN (through Masquerade NAT)"

    rule "POSTROUTING -t nat -s $IN_NETWORK/$IN_NETMASK -o $OUT_INTERFACE -d $OUT_NETWORK/$OUT_NETMASK -p tcp --dport 445 -j MASQUERADE" "$MODE" "$IPT"
    rule "POSTROUTING -t nat -s $IN_NETWORK/$IN_NETMASK -o $OUT_INTERFACE -d $OUT_NETWORK/$OUT_NETMASK -p tcp --dport 139 -j MASQUERADE" "$MODE" "$IPT"
    rule "POSTROUTING -t nat -s $IN_NETWORK/$IN_NETMASK -o $OUT_INTERFACE -d $OUT_NETWORK/$OUT_NETMASK -p udp --dport 138 -j MASQUERADE" "$MODE" "$IPT"
    rule "POSTROUTING -t nat -s $IN_NETWORK/$IN_NETMASK -o $OUT_INTERFACE -d $OUT_NETWORK/$OUT_NETMASK -p udp --dport 137 -j MASQUERADE" "$MODE" "$IPT"
    rule "POSTROUTING -t nat -s $IN_NETWORK/$IN_NETMASK -o $OUT_INTERFACE -d $OUT_NETWORK/$OUT_NETMASK -p icmp --icmp-type 1 -j MASQUERADE" "$MODE" "$IPT"

    if [ "$IN_IPV6" == "true" ] && [ "$OUT_IPV6" == "true" ]; then
        rule "POSTROUTING -t nat -s $IN_NETWORK6/$IN_NETMASK6 -o $OUT_INTERFACE -d $OUT_NETWORK6/$OUT_NETMASK6 -p tcp --dport 445 -j MASQUERADE" "$MODE" "$IPT6"
        rule "POSTROUTING -t nat -s $IN_NETWORK6/$IN_NETMASK6 -o $OUT_INTERFACE -d $OUT_NETWORK6/$OUT_NETMASK6 -p tcp --dport 139 -j MASQUERADE" "$MODE" "$IPT6"
        rule "POSTROUTING -t nat -s $IN_NETWORK6/$IN_NETMASK6 -o $OUT_INTERFACE -d $OUT_NETWORK6/$OUT_NETMASK6 -p udp --dport 138 -j MASQUERADE" "$MODE" "$IPT6"
        rule "POSTROUTING -t nat -s $IN_NETWORK6/$IN_NETMASK6 -o $OUT_INTERFACE -d $OUT_NETWORK6/$OUT_NETMASK6 -p udp --dport 137 -j MASQUERADE" "$MODE" "$IPT6"
        rule "POSTROUTING -t nat -s $IN_NETWORK6/$IN_NETMASK6 -o $OUT_INTERFACE -d $OUT_NETWORK6/$OUT_NETMASK6 -p ipv6-icmp --icmpv6-type 58 -j MASQUERADE" "$MODE" "$IPT6"
    fi
fi

# Restricted access preparation - block forwarding to everything
if [ "$LAN_ONLY" == "true" ] || [ "$DEVICE_ONLY" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Block forwarding to everything"

    rule "FORWARD -i $IN_INTERFACE -d 0.0.0.0/0 -j DROP" "$MODE" "$IPT"

    if [ "$IN_IPV6" == "true" ] && [ "$OUT_IPV6" == "true" ]; then
        rule "FORWARD -i $IN_INTERFACE -d ::/0 -j DROP" "$MODE" "$IPT6"
    fi
fi

# Prevent VPN clients from communicating with each other
if [ "$ISOLATION" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Client isolation"

    # Add DROP rule for VPN network when not using any restriction option
    if [ "$LAN_ONLY" == "false" ] && [ "$DEVICE_ONLY" == "false" ]; then
        rule "FORWARD -i $IN_INTERFACE -d $IN_NETWORK/$IN_NETMASK -j DROP" "$MODE" "$IPT"
    fi

    rule "FORWARD -i $IN_INTERFACE -d $IN_ADDRESS/32 -j ACCEPT" "$MODE" "$IPT"

    if [ "$IN_IPV6" == "true" ]; then
        # Add DROP rule for VPN network when not using any restriction options
        if [ "$LAN_ONLY" == "false" ] && [ "$DEVICE_ONLY" == "false" ]; then
            rule "FORWARD -i $IN_INTERFACE -d $IN_NETWORK6/$IN_NETMASK6 -j DROP" "$MODE" "$IPT6"
        fi

        rule "FORWARD -i $IN_INTERFACE -d $IN_ADDRESS6/128 -j ACCEPT" "$MODE" "$IPT6"
    fi
# When using any restriction option we need to allow access to VPN network
elif [ "$LAN_ONLY" == "true" ] || [ "$DEVICE_ONLY" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Access to VPN network while restricting rules are used"

    rule "FORWARD -i $IN_INTERFACE -d $IN_NETWORK/$IN_NETMASK -j ACCEPT" "$MODE" "$IPT"

    if [ "$IN_IPV6" == "true" ]; then
        rule "FORWARD -i $IN_INTERFACE -d $IN_NETWORK6/$IN_NETMASK6 -j ACCEPT" "$MODE" "$IPT"
    fi
fi

# Prevent VPN clients from accessing internet
if [ "$LAN_ONLY" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Access to LAN only"

    rule "FORWARD -i $IN_INTERFACE -d $OUT_NETWORK/$OUT_NETMASK -j ACCEPT" "$MODE" "$IPT"

    if [ "$IN_IPV6" == "true" ] && [ "$OUT_IPV6" == "true" ]; then
        rule "FORWARD -i $IN_INTERFACE -d $OUT_NETWORK6/$OUT_NETMASK6 -j ACCEPT" "$MODE" "$IPT6"
    fi
fi

# Prevent VPN clients from accessing anything but this device
if [ "$DEVICE_ONLY" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Access to this device only"

    rule "FORWARD -i $IN_INTERFACE -d $OUT_ADDRESS/32 -j ACCEPT" "$MODE" "$IPT"

    if [ "$IN_IPV6" == "true" ]; then
        rule "FORWARD -i $IN_INTERFACE -d $OUT_ADDRESS6/128 -j ACCEPT" "$MODE" "$IPT6"
    fi
fi

# Prevent VPN clients from accessing anything but DNS on this device
if [ "$DNS_ONLY" == "true" ]; then
    [ "$QUIET" != "true" ] && echo "Access to DNS only on this device"

    if [ "$INPUT_POLICY" != "DROP" ]; then
        rule "INPUT -i $IN_INTERFACE -d $IN_ADDRESS/32 -j DROP" "$MODE" "$IPT"

        # This rule might not be necessary... needs verification
        rule "INPUT -i $OUT_INTERFACE -s $IN_NETWORK/$IN_NETMASK -j DROP" "$MODE" "$IPT"
    fi

    rule "INPUT -i $IN_INTERFACE -d $IN_ADDRESS/32 -p udp --dport 53 -j ACCEPT" "$MODE" "$IPT"
    rule "INPUT -i $IN_INTERFACE -d $IN_ADDRESS/32 -p tcp --dport 53 -j ACCEPT" "$MODE" "$IPT"

    if [ "$IN_IPV6" == "true" ]; then
        if [ "$INPUT_POLICY6" != "DROP" ]; then
            rule "INPUT -i $IN_INTERFACE -d $IN_ADDRESS/32 -j DROP" "$MODE" "$IPT6"

            # This rule might not be necessary... needs verification
            rule "INPUT -i $OUT_INTERFACE -s $IN_NETWORK6/$IN_NETMASK6 -j DROP" "$MODE" "$IPT6"
        fi

        rule "INPUT -i $IN_INTERFACE -d $IN_ADDRESS6/128 -p udp --dport 53 -j ACCEPT" "$MODE" "$IPT6"
        rule "INPUT -i $IN_INTERFACE -d $IN_ADDRESS6/128 -p tcp --dport 53 -j ACCEPT" "$MODE" "$IPT6"
    fi
fi
