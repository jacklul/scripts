# telegram-notify

Allows sending text, document and photo messages to Telegram chats.
Configured also to be used as a notification handler for systemd service failures.
Can also optionally inject update checker when installed through install script from this repository.

**[Original script by Nicolas Bernaerts](https://github.com/NicolasBernaerts/debian-scripts/tree/master/telegram), this is just a fork with added functionality.**

## Requirements

- systemd

## Installation

**This script installs into `/usr/local/bin`.**

```bash
wget -O - https://raw.githubusercontent.com/jacklul/scripts/master/telegram-notify/install.sh | sudo bash
```

OR

- Copy this whole directory and transfer it to the device
- Run `install.sh` as root

Pass `alt` as an argument to the install script to also install update checker.

## Systemd service failure handler

Just add override to any service you want to receive failure notifications for:

```bash
sudo systemctl edit your_service.service
```

```
[Unit]
OnFailure=telegram-notify@%n
```
