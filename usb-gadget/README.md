# usb-gadget

Extremely simple script to set up Raspberry Pi Zero (and possibly others) as a USB gadget device.

**Supports modes: RNDIS, ECM, USB Storage, ACM.**

## Requirements

- systemd
- `dtoverlay=dwc2` in /boot/config.txt
- `modules-load=dwc2` in /boot/cmdline.txt

## Installation

**This script installs into `/usr/local/sbin/`.**

```bash
wget -O - https://raw.githubusercontent.com/jacklul/scripts/master/usb-gadget/install.sh | sudo bash
```

OR

- Copy this whole directory and transfer it to the device
- Run `install.sh` as root

Configuration is in `/etc/usb-gadget.conf` file.

## Usage

You can either use `/etc/usb-gadget.conf` to configure the gadget then run `usb-gadget up` (or use the systemd service) or use command line:

```
Usage: usb-gadget up|down|status|mount|umount [OPTIONS]
Options:
 -c [CONFIG], --config [CONFIG]     Use different config file
 -i [ID], --id [ID]                 Gadget identifier
 -p [NAME], --product [NAME]        Product name
 -m [NAME], --manufacturer [NAME]   Manufacturer name
 -f [FILE], --file [FILE]           Mass storage file
 -r, --rndis                        Add RNDIS function
 -e, --ecm                          Add ECM function
 -s, --storage                      Add Mass Storage function
 -t, --serial                       Add Serial Console function
 -l, --ro                           Make mounted storage file read only
 -h, --help                         This help message
```
