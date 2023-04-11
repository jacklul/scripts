#!/bin/bash
# Made by Jack'lul <jacklul.github.io>
#
# /usr/local/sbin/usb-gadget
#
# Use this to easily turn your PiZero/W into multifunctional USB gadget
# Modify config in /etc/usb-gadget.conf and then execute:
#  `/usr/sbin/usb-gadget up`
# You can also pass a alternative config file in the command line like this:
#  `/usr/sbin/usb-gadget /etc/usb-gadget2.conf up`
# Use `down` instead of `up` to disable the gadget
#
# You need `dtoverlay=dwc2` in /boot/config.txt
# and `modules-load=dwc2` in /boot/cmdline.txt
#
# To create mass storage file:
#  `sudo dd if=/dev/zero of=mass_storage.img bs=1M count=16`
#  `sudo mkfs.ext4 mass_storage.img && sudo tune2fs -c0 -i0 mass_storage.img`
#
# To enable serial you will also need to:
#  `sudo systemctl enable serial-getty@ttyGS0.service`
#

[ "$UID" -eq 0 ] || { echo "This must run as root!"; exit 1; }

CONFIG_FILE="/etc/usb-gadget.conf"
NEW_CONFIG_FILE=""

ID="g0"
PRODUCT="USB Gadget"
MANUFACTURER="Nobody"
SERIAL="$(grep Serial /proc/cpuinfo | sed 's/Serial\s*: 0000\(\w*\)/\1/')"

VENDOR_ID="0x1d6b"
PRODUCT_ID="0x0104"
DEVICE_CLASS="0xef"
DEVICE_SUBCLASS="0x02"
DEVICE_PROTOCOL="0x01"
DEVICE_VERSION="0x0100"
USB_VERSION="0x0200"
ATTRIBUTES="0x80"
MAX_POWER="250"
MAX_PACKET_SIZE="0x40"

MAC_BASE="$(echo "$SERIAL" | sed 's/\(\w\w\)/:\1/g' | cut -b 2-)"
MAC_HOST=""
MAC_DEVICE=""
MAC_HOST_NEXT=""
MAC_DEVICE_NEXT=""

STORAGE_FILE=""
STORAGE_STALL=
STORAGE_CDROM=
STORAGE_REMOVABLE=
STORAGE_RO=
STORAGE_NOFUA=

ADD_RNDIS=false
ADD_ECM=false
ADD_STORAGE=false
ADD_SERIAL=false

##########################

create_configuration() {
    local CONFIG="$1"

    if [ -d "$PATHDIR/configs/$CONFIG" ]; then
        echo "Configuration \"$CONFIG\" already exists"
        exit 1
    fi

    mkdir "$PATHDIR/configs/$CONFIG"
    echo "$ATTRIBUTES" > "$PATHDIR/configs/$CONFIG/bmAttributes"
    echo "$MAX_POWER" > "$PATHDIR/configs/$CONFIG/MaxPower"
    mkdir "$PATHDIR/configs/$CONFIG/strings/0x409"
}

set_mac_addresses() {
    local FUNCTION=$1
    local MAC_HOST=$2
    local MAC_DEVICE=$3

    echo "$MAC_HOST"  > "$PATHDIR/functions/$FUNCTION/dev_addr"
    echo "$MAC_DEVICE" > "$PATHDIR/functions/$FUNCTION/host_addr"
}

usb_gadget_up() {
    grep -q dtoverlay=dwc2 /boot/config.txt || echo "Add the 'dtoverlay=dwc2' to /boot/config.txt"
    grep -q modules-load=dwc2 /boot/cmdline.txt || echo "Add the 'modules-load=dwc2' to /boot/cmdline.txt"

    if [ -d "$PATHDIR" ]; then
        [ "$(cat "$PATHDIR/UDC")" != "" ] && { echo "Gadget \"$ID\" is already up"; exit 1; }

        echo "Cleaning up old gadget \"$ID\"...";
        usb-gadget_down
    fi

    set -e
    modprobe libcomposite

    CONFIG="c.1"
    CONFIG_NEXT="$CONFIG"
    INSTANCE="0"

    echo "Setting up gadget \"$ID\"..."

    mkdir "$PATHDIR"
    echo "$VENDOR_ID" > "$PATHDIR/idVendor"
    echo "$PRODUCT_ID" > "$PATHDIR/idProduct"
    echo "$USB_VERSION" > "$PATHDIR/bcdUSB"
    echo "$DEVICE_VERSION" > "$PATHDIR/bcdDevice"

    echo "$DEVICE_CLASS" > "$PATHDIR/bDeviceClass"
    echo "$DEVICE_SUBCLASS" > "$PATHDIR/bDeviceSubClass"
    echo "$DEVICE_PROTOCOL" > "$PATHDIR/bDeviceProtocol"
    echo "$MAX_PACKET_SIZE" > "$PATHDIR/bMaxPacketSize0"

    mkdir "$PATHDIR/strings/0x409"
    echo "$PRODUCT" > "$PATHDIR/strings/0x409/product"
    echo "$MANUFACTURER" > "$PATHDIR/strings/0x409/manufacturer"
    echo "$SERIAL" > "$PATHDIR/strings/0x409/serialnumber"

    if [ "$ADD_RNDIS" = true ]; then
        echo "Adding RNDIS function..."

        mkdir "$PATHDIR/functions/rndis.$INSTANCE"

        # OS descriptors for Windows to use newer driver
        echo "1" > "$PATHDIR/os_desc/use"
        echo "0xcd" > "$PATHDIR/os_desc/b_vendor_code"
        echo "MSFT100" > "$PATHDIR/os_desc/qw_sign"
        echo "RNDIS" > "$PATHDIR/functions/rndis.$INSTANCE/os_desc/interface.rndis/compatible_id"
        echo "5162001" > "$PATHDIR/functions/rndis.$INSTANCE/os_desc/interface.rndis/sub_compatible_id"
    fi

    if [ "$ADD_ECM" = true ]; then
        echo "Adding ECM function..."

        mkdir "$PATHDIR/functions/ecm.$INSTANCE"
    fi

    if [ "$ADD_STORAGE" = true ]; then
        echo "Adding Mass Storage function..."

        mkdir "$PATHDIR/functions/mass_storage.$INSTANCE"

        [ "$STORAGE_STALL" != "" ] && echo "$STORAGE_STALL" > "$PATHDIR/functions/mass_storage.$INSTANCE/stall"

        [ ! -d "$PATHDIR/functions/mass_storage.$INSTANCE/lun.0" ] && mkdir "$PATHDIR/functions/mass_storage.$INSTANCE/lun.0"

        { [ "$STORAGE_FILE" != "" ] && [ ! -f "$STORAGE_FILE" ]; } && { echo "Image file does not exist: $STORAGE_FILE"; exit 1; }

        [ "$STORAGE_CDROM" != "" ] && echo "$STORAGE_CDROM" > "$PATHDIR/functions/mass_storage.$INSTANCE/lun.0/cdrom"
        [ "$STORAGE_REMOVABLE" != "" ] && echo "$STORAGE_REMOVABLE" > "$PATHDIR/functions/mass_storage.$INSTANCE/lun.0/removable"
        [ "$STORAGE_RO" != "" ] && echo "$STORAGE_RO" > "$PATHDIR/functions/mass_storage.$INSTANCE/lun.0/ro"
        [ "$STORAGE_NOFUA" != "" ] && echo "$STORAGE_NOFUA" > "$PATHDIR/functions/mass_storage.$INSTANCE/lun.0/nofua"
        [ "$STORAGE_FILE" != "" ] && echo "$STORAGE_FILE" > "$PATHDIR/functions/mass_storage.$INSTANCE/lun.0/file"
    fi

    if [ "$ADD_SERIAL" = true ]; then
        echo "Adding Serial Console function..."

        mkdir "$PATHDIR/functions/acm.$INSTANCE"
    fi

    echo "Configuring functions..."

    MAC_PART="$(echo "$MAC_BASE" | cut -b 3-)"
    [ -z "$MAC_HOST" ] && MAC_HOST="02$MAC_PART"
    [ -z "$MAC_DEVICE" ] && MAC_DEVICE="12$MAC_PART"

    if [ "$CONFIG_NEXT" != "$CONFIG" ]; then
        [ -z "$MAC_HOST_NEXT" ] && MAC_HOST_NEXT="22$MAC_PART"
        [ -z "$MAC_DEVICE_NEXT" ] && MAC_DEVICE_NEXT="32$MAC_PART"
    else
        [ -z "$MAC_HOST_NEXT" ] && MAC_HOST_NEXT="$MAC_HOST"
        [ -z "$MAC_DEVICE_NEXT" ] && MAC_DEVICE_NEXT="$MAC_DEVICE"
    fi

    create_configuration "$CONFIG"

    if [ "$ADD_RNDIS" = true ]; then
        echo "RNDIS" > "$PATHDIR/configs/$CONFIG/strings/0x409/configuration"

        set_mac_addresses "rndis.$INSTANCE" "$MAC_HOST" "$MAC_DEVICE"

        ln -s "$PATHDIR/functions/rndis.$INSTANCE" "$PATHDIR/configs/$CONFIG"

        [ "$(cat "$PATHDIR/os_desc/use")" = "1" ] && ln -s "$PATHDIR/configs/$CONFIG" "$PATHDIR/os_desc"
    fi

    if [ "$ADD_ECM" = true ]; then
        if [ "$CONFIG_NEXT" != "$CONFIG" ]; then
            create_configuration "$CONFIG_NEXT"
        fi

        echo "ECM" > "$PATHDIR/configs/$CONFIG_NEXT/strings/0x409/configuration"

        set_mac_addresses "ecm.$INSTANCE" "$MAC_HOST_NEXT" "$MAC_DEVICE_NEXT"

        ln -s "$PATHDIR/functions/ecm.$INSTANCE" "$PATHDIR/configs/$CONFIG_NEXT"
    fi

    if [ "$ADD_STORAGE" = true ]; then
        ln -s "$PATHDIR/functions/mass_storage.$INSTANCE" "$PATHDIR/configs/$CONFIG"
        [ "$CONFIG_NEXT" != "$CONFIG" ] && ln -s "$PATHDIR/functions/mass_storage.$INSTANCE" "$PATHDIR/configs/$CONFIG_NEXT"
    fi

    if [ "$ADD_SERIAL" = true ]; then
        ln -s "$PATHDIR/functions/acm.$INSTANCE" "$PATHDIR/configs/$CONFIG"
        [ "$CONFIG_NEXT" != "$CONFIG" ] && ln -s "$PATHDIR/functions/acm.$INSTANCE" "$PATHDIR/configs/$CONFIG_NEXT"
    fi

    echo "Enabling device..."

    # @TODO making sure there is device to bind to
    udevadm settle -t 5 || :
    ls /sys/class/udc > "$PATHDIR/UDC"

    if [ "$ADD_RNDIS" = true ] && [ -f "$PATHDIR/functions/rndis.$INSTANCE/ifname" ]; then
        IDENT="$(cat "$PATHDIR/functions/rndis.$INSTANCE/ifname")"

        echo "Bringing network interface \"$IDENT\" up..."

        ifconfig "$IDENT" up
    fi

    if [ "$ADD_ECM" = true ] && [ -f "$PATHDIR/functions/ecm.$INSTANCE/ifname" ]; then
        IDENT="$(cat "$PATHDIR/functions/ecm.$INSTANCE/ifname")"

        echo "Bringing network interface \"$IDENT\" up..."

        ifconfig "$IDENT" up
    fi

    if [ "$ADD_SERIAL" = true ] && [ -f "$PATHDIR/functions/acm.$INSTANCE/port_num" ] && systemctl is-system-running --quiet; then
        IDENT="GS$(cat "$PATHDIR/functions/acm.$INSTANCE/port_num")"

        echo "Starting serial terminal \"$IDENT\"..."

        systemctl start "serial-getty@tty$IDENT.service"
    fi

    echo "Done"
}

#shellcheck disable=SC2086
usb_gadget_down() {
    [ ! -d "$PATHDIR" ] && { echo "Gadget \"$ID\" is already down"; exit 1; }

    set -e
    echo "Taking down gadget \"$ID\"...";

    if [ -d "$PATHDIR" ]; then
        if [ "$(cat "$PATHDIR/UDC")" != "" ]; then
            echo "Disabling device..."
            echo "" > "$PATHDIR/UDC"
            udevadm settle -t 5 || :
        fi

        INSTANCE_RNDIS=$(find $PATHDIR/functions/ -maxdepth 1 -name "rndis.*" | grep -o '[^.]*$' || echo "")
        INSTANCE_ECM=$(find $PATHDIR/functions/ -maxdepth 1 -name "ecm.*" | grep -o '[^.]*$' || echo "")
        INSTANCE_ACM=$(find $PATHDIR/functions/ -maxdepth 1 -name "acm.*" | grep -o '[^.]*$' || echo "")

        if [ "$INSTANCE_RNDIS" != "" ] && [ -f "$PATHDIR/functions/rndis.$INSTANCE_RNDIS/ifname" ]; then
            IDENT="$(cat "$PATHDIR/functions/rndis.$INSTANCE_RNDIS/ifname")"

            if [ -d "/sys/class/net/$IDENT" ]; then
                echo "Bringing network interface \"$IDENT\" down..."

                ifconfig "$IDENT" down
            fi
        fi

        if [ "$INSTANCE_ECM" != "" ] && [ -f "$PATHDIR/functions/ecm.$INSTANCE_ECM/ifname" ]; then
            IDENT="$(cat "$PATHDIR/functions/ecm.$INSTANCE_ECM/ifname")"

            if [ -d "/sys/class/net/$IDENT" ]; then
                echo "Bringing network interface \"$IDENT\" down..."

                ifconfig "$IDENT" down
            fi
        fi

        if [ "$INSTANCE_ACM" != "" ] && [ -f "$PATHDIR/functions/acm.$INSTANCE_ACM/port_num" ]; then
            IDENT="GS$(cat "$PATHDIR/functions/acm.$INSTANCE_ACM/port_num")"

            if [ -d "/sys/class/tty/tty$IDENT" ] && systemctl is-active --quiet "serial-getty@tty$IDENT.service"; then
                echo "Shutting down serial terminal \"$IDENT\"..."

                systemctl stop "serial-getty@tty$IDENT.service"
            fi
        fi

        echo "Removing configuration..."

        find $PATHDIR/configs/*/* -maxdepth 0 -type l -exec rm {} \; 2> /dev/null || true
        find $PATHDIR/configs/*/strings/* -maxdepth 0 -type d -exec rmdir {} \; 2> /dev/null || true
        find $PATHDIR/os_desc/* -maxdepth 0 -type l -exec rm {} \; 2> /dev/null || true
        find $PATHDIR/functions/* -maxdepth 0 -type d -exec rmdir {} \; 2> /dev/null || true
        find $PATHDIR/strings/* -maxdepth 0 -type d -exec rmdir {} \; 2> /dev/null || true
        find $PATHDIR/configs/* -maxdepth 0 -type d -exec rmdir {} \; 2> /dev/null || true

        rmdir "$PATHDIR"
    fi

    echo "Done"
}

#shellcheck disable=SC2086
usb_gadget_status() {
    [ ! -d "$PATHDIR" ] && { echo "Gadget \"$ID\" does not exist"; exit 1; }

    INSTANCE_RNDIS=$(find $PATHDIR/functions -maxdepth 1 -name "rndis.*" | grep -o '[^.]*$' || echo "")
    INSTANCE_ECM=$(find $PATHDIR/functions -maxdepth 1 -name "ecm.*" | grep -o '[^.]*$' || echo "")
    INSTANCE_ACM=$(find $PATHDIR/functions -maxdepth 1 -name "acm.*" | grep -o '[^.]*$' || echo "")
    INSTANCE_MS=$(find $PATHDIR/functions -maxdepth 1 -name "mass_storage.*" | grep -o '[^.]*$' || echo "")

    FUNCTIONS=""
    [ "$INSTANCE_RNDIS" != "" ] && FUNCTIONS="$FUNCTIONS rndis"
    [ "$INSTANCE_ECM" != "" ] && FUNCTIONS="$FUNCTIONS ecm"
    [ "$INSTANCE_ACM" != "" ] && FUNCTIONS="$FUNCTIONS acm"
    [ "$INSTANCE_MS" != "" ] && FUNCTIONS="$FUNCTIONS mass_storage"

    echo "Active functions: $(echo "$FUNCTIONS" | awk '{$1=$1;print}')"

    [ "$INSTANCE_RNDIS" != "" ] && [ -f "$PATHDIR/functions/rndis.$INSTANCE_RNDIS/ifname" ] && echo "RNDIS interface: $(cat "$PATHDIR/functions/rndis.$INSTANCE_RNDIS/ifname")"
    [ "$INSTANCE_ECM" != "" ] && [ -f "$PATHDIR/functions/ecm.$INSTANCE_ECM/ifname" ] && echo "ECM interface: $(cat "$PATHDIR/functions/ecm.$INSTANCE_ECM/ifname")"
    [ "$INSTANCE_ACM" != "" ] && [ -f "$PATHDIR/functions/acm.$INSTANCE_ACM/ifname" ] && echo "ACM terminal: ttyGS$(cat "$PATHDIR/functions/ecm.$INSTANCE_ACM/port_num")"
    [ "$INSTANCE_MS" != "" ] && [ -f "$PATHDIR/functions/mass_storage.$INSTANCE_MS/lun.0/file" ] && echo "Mass Storage \"file\": $(cat "$PATHDIR/functions/mass_storage.$INSTANCE_MS/lun.0/file")"
}

usb_gadget_mount() {
    INSTANCE_MS=$(find "$PATHDIR/functions" -maxdepth 1 -name "mass_storage.*" | grep -o '[^.]*$' || echo "")

    [ -z "$INSTANCE_MS" ] && { echo "Gadget \"$ID\" does not have mass storage function"; exit 1; }
    [ ! -f "$ARG2" ] && { echo "Image file does not exist: $ARG2"; exit 1; }

    echo "Mounting..."

    set -e
    echo "1" > "$PATHDIR/functions/mass_storage.$INSTANCE_MS/lun.0/forced_eject"
    echo "$ARG2" > "$PATHDIR/functions/mass_storage.$INSTANCE_MS/lun.0/file"

    echo "Done"
}

usb_gadget_umount() {
    INSTANCE_MS=$(find "$PATHDIR/functions" -maxdepth 1 -name "mass_storage.*" | grep -o '[^.]*$' || echo ""/)

    [ -z "$INSTANCE_MS" ] && { echo "Gadget \"$ID\" does not have mass storage function"; exit 1; }

    echo "Unmounting..."

    set -e
    echo "1" > "$PATHDIR/functions/mass_storage.$INSTANCE_MS/lun.0/forced_eject"
    [ "$(cat "$PATHDIR/functions/mass_storage.$INSTANCE_MS/lun.0/file")" != "" ] && echo "" > "$PATHDIR/functions/mass_storage.$INSTANCE_MS/lun.0/file"

    echo "Done"
}

##########################

POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -c|--config)
            NEW_CONFIG_FILE="${2}"
            shift
            shift
        ;;
        -i|--id)
            CMDLINE_ID="${2}"
            shift
            shift
        ;;
        -p|--product)
            CMDLINE_PRODUCT="${2}"
            shift
            shift
        ;;
        -m|--manufacturer)
            CMDLINE_MANUFACTURER="${2}"
            shift
            shift
        ;;
        -f|--file)
            CMDLINE_STORAGE_FILE="${2}"
            shift
            shift
        ;;
        -r|--rndis)
            CMDLINE_ADD_RNDIS=true
            shift
        ;;
        -e|--ecm)
            CMDLINE_ADD_ECM=true
            shift
        ;;
        -s|--storage)
            CMDLINE_ADD_STORAGE=true
            shift
        ;;
        -t|--serial)
            CMDLINE_ADD_SERIAL=true
            shift
        ;;
        -l|--ro)
            CMDLINE_STORAGE_RO=1
            shift
        ;;
        ?|-h|--help)
            echo "Usage: $0 up|down|status|mount|umount [OPTIONS]"
            echo "Options:"
            echo " -c [CONFIG], --config [CONFIG]     Use different config file"
            echo " -i [ID], --id [ID]                 Gadget identifier"
            echo " -p [NAME], --product [NAME]        Product name"
            echo " -m [NAME], --manufacturer [NAME]   Manufacturer name"
            echo " -f [FILE], --file [FILE]           Mass storage file"
            echo " -r, --rndis                        Add RNDIS function"
            echo " -e, --ecm                          Add ECM function"
            echo " -s, --storage                      Add Mass Storage function"
            echo " -t, --serial                       Add Serial Console function"
            echo " -l, --ro                           Make mounted storage file read only"
            echo " -h, --help                         This help message"
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

if [ -n "$NEW_CONFIG_FILE" ] && [ -f "$NEW_CONFIG_FILE" ]; then
    #shellcheck disable=SC1090
    . "$NEW_CONFIG_FILE"
elif [ -f "$CONFIG_FILE" ]; then # Load default configuration
    #shellcheck disable=SC1090
    . "$CONFIG_FILE"
fi

[ -n "$CMDLINE_ID" ] && ID="$CMDLINE_ID"
[ -n "$CMDLINE_PRODUCT" ] && PRODUCT="$CMDLINE_PRODUCT"
[ -n "$CMDLINE_MANUFACTURER" ] && MANUFACTURER="$CMDLINE_MANUFACTURER"

if [ -n "$CMDLINE_ADD_RNDIS" ] || [ -n "$CMDLINE_ADD_ECM" ] || [ -n "$CMDLINE_ADD_STORAGE" ] || [ -n "$CMDLINE_ADD_SERIAL" ]; then
    # Override config, disable everything
    ADD_RNDIS=false
    ADD_ECM=false
    ADD_STORAGE=false
    ADD_SERIAL=false

    if [ -n "$CMDLINE_STORAGE_FILE" ]; then
        [ -n "$CMDLINE_STORAGE_FILE" ] && STORAGE_FILE="$CMDLINE_STORAGE_FILE"
        [ -n "$CMDLINE_STORAGE_RO" ] && STORAGE_RO=$CMDLINE_STORAGE_RO
        STORAGE_CDROM=0
        STORAGE_REMOVABLE=1
        STORAGE_NOFUA=0
    fi

    [ -n "$CMDLINE_ID" ] && ID="$CMDLINE_ID"
    [ -n "$CMDLINE_PRODUCT" ] && PRODUCT="$CMDLINE_PRODUCT"
    [ -n "$CMDLINE_MANUFACTURER" ] && MANUFACTURER="$CMDLINE_MANUFACTURER"

    [ -n "$CMDLINE_ADD_RNDIS" ] && ADD_RNDIS=$CMDLINE_ADD_RNDIS
    [ -n "$CMDLINE_ADD_ECM" ] && ADD_ECM=$CMDLINE_ADD_ECM
    [ -n "$CMDLINE_ADD_STORAGE" ] && ADD_STORAGE=$CMDLINE_ADD_STORAGE
    [ -n "$CMDLINE_ADD_SERIAL" ] && ADD_SERIAL=$CMDLINE_ADD_SERIAL
fi

set -- "${POSITIONAL_ARGS[@]}"

ARG1="$1"
ARG2="$2"

[ -n "$DEBUG" ] && [ "$DEBUG" != "0" ] && set -x

PATHDIR="/sys/kernel/config/usb_gadget/$ID"

case "$ARG1" in
    "up")
        usb_gadget_up
    ;;
    "down")
        usb_gadget_down
    ;;
    "status")
        usb_gadget_status
    ;;
    "mount")
        usb_gadget_mount
    ;;
    "umount")
        usb_gadget_umount
    ;;
    *)
        echo "Usage: $0 [config] up|down|status|mount|umount"
        echo "Use \"$0 --help\" for more information."
        exit 1
    ;;
esac
