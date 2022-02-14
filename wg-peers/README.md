# wg-peers

Simple script to manage your WireGuard peers.

```
Usage:
 wg-peers list [if]          - list peers
 wg-peers add [if] [name]    - add peer
 wg-peers remove [if] [name] - remove peer
 wg-peers show [if] [name]   - show peer config
 wg-peers reload [if]        - reload interface
 wg-peers restart [if]       - restart interface
```

This script requires specific style of configuration - see [example directory](example/) for details.

All peers data is stored in `wg0-peers.conf` like this:
```
# peer-peer1 START
[Peer]
PublicKey = pubkey
#PrivateKey = privkey
PresharedKey = pskkey
AllowedIPs = 10.0.0.2/32
# peer-peer1 END
# peer-peer2 START
[Peer]
PublicKey = pubkey
#PrivateKey = pubkey
PresharedKey = pskkey
AllowedIPs = 10.0.0.3/32
# peer-peer2 END
# peer-peer3 START
[Peer]
PublicKey = pubkey
#PrivateKey = pubkey
PresharedKey = pskkey
AllowedIPs = 10.0.0.3/32
# peer-peer3 END
```