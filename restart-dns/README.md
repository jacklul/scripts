# restart-dns

**To be used with [Pi-hole](https://pi-hole.net/).**

Restarts the DNS server when `pihole-FTL` also restarts.

Supports `unbound`, `dnscrypt-proxy` and `cloudflared`.

## Requirements

- systemd
- Pi-hole

## Installation

**This script installs into `/usr/local/sbin/`.**

- Copy this whole directory and transfer it to the device
- Run `install.sh` as root
