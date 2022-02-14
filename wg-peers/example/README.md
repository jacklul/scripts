Interface's public and private keys should be stored in separate files - `wg0-public.key` and `wg0-private.key` respectively.

#### `wg0-peer.conf`

This is the base template for configuration you give to the users

####  `wg0.conf` 

This is example interface configuration, you can modify it however you want but **do not remove the line loading `%i-peers.conf` file!**
