# new-device-notify

**To be used with [Pi-hole](https://pi-hole.net/).**

Notifies when a new device is detected in the network.

You will have to set notification function in `/etc/new-device-notify.conf`, placeholder `#DETAILS#` will be replaced with device info.
By default only local network is scanned - to change that use config variable `SCAN_SUBNETS` which will be passed to `arp-scan` command.
This script can either run as a "daemon" (which is in fact just loop with a `sleep 60`) or be triggered every minute by a systemd timer - set `RUN_AS_DAEMON=true|false` (default: `false`) config variable accordingly and re-run `install.sh`.

## Requirements

- systemd
- Pi-hole
- `arp-scan`

## Installation

**This script installs into `/usr/local/sbin/`.**

- Copy this whole directory and transfer it to the device
- Run `install.sh` as root
