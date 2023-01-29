# simple-upnpd

Convenient build and install scripts for making simple-upnpd work as a systemd service.

**[Original program by Jeroen Hofstee](https://github.com/victronenergy/simple-upnpd).**

## Requirements

- systemd

## Installation

**This program installs into `/usr/local/bin`.**

- Copy this whole directory and transfer it to the device
- Run `build.sh`
- Run `install.sh` as root

If `simple-upnpd.xml` is present during execution of `install.sh` then new UUID will be generated for UDN field.
