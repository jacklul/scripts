# iptables-helper

This utility allows quickly setting up firewall rules for your home Wireguard tunnel.

## Installation

**This script will put it in `/etc/wireguard/iptables-helper.sh`:**

```bash
wget -O - https://raw.githubusercontent.com/jacklul/scripts/main/wireguard/iptables-helper/install.sh | sudo bash
```

OR

- Copy this script manually to the directory of your choice

## Usage:

This script requires specific style of iptables rules - see [example iptables rules](iptables-example/) for details.

Add to `/etc/wireguard/wg0.conf`:
```
PostUp = [ -f /etc/wireguard/iptables-helper.sh ] && /etc/wireguard/iptables-helper.sh -i %i up
PostDown = [ -f /etc/wireguard/iptables-helper.sh ] && /etc/wireguard/iptables-helper.sh -i %i down
```

This assumes `eth0` is your LAN network interface, if it's not set it with `-o` argument.

For full list of available options, see here:

```
Usage: iptables-helper.sh up|down [OPTIONS]
Options:
 -i [IF], --in-interface [IF]   Incoming interface (WireGuard)
 -o [IF], --out-interface [IF]  Outgoing interface (physical)
 -c, --client-isolation         Prevent VPN clients from communicating with each other
 -m, --masquerade               Enable Masquerade NAT
 -s, --samba                    Enable Masquerade NAT for Samba traffic only
 -l, --lan-only                 Prevent clients from accessing internet
 -f, --device-only              Prevent clients from accessing anything but this device
 -p, --dns-only                 Prevent clients from accessing services other than DNS on this device
 -n, --force-dns [DNS]          Force clients to use specified DNS (IPv4 only)
 -6, --ipv6                     Enable IPv6 support
 -b, --no-out-check             Do not verify whenever outgoing interface is connected
 -d, --debug                    Show debug information and log dropped packets
 -v, --verbose                  Show more operational information
 -t, --test                     Test mode - no rules will be executed
 -q, --quiet                    Do not output anything
 -h, --help                     This help message
```
