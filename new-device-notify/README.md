# new-device-notify

**To be used with [Pi-hole](https://pi-hole.net/).**

Notifies when a new device is detected in the network.

It uses [telegram-notify](/telegram-notify/) script to send the notifications to the configured Telegram chat.
If you would like to use different delivery method then you will have to adjust top side of `new-device-notify.sh`.

## Requirements

- systemd
- Pi-hole
- `arp-scan`

## Installation

**This script installs into `/usr/local/sbin/`.**

- Copy this whole directory and transfer it to the device
- Run `install.sh` as root
