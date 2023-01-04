# telegram-notify

Allows sending text, document and photo messages to Telegram chats.
Configured also to be used as a notification handler for systemd service failures.
Will also inject update checker when installed through install script from this repository .

**[Original script by Nicolas Bernaerts](https://github.com/NicolasBernaerts/debian-scripts/tree/master/telegram), this is just a fork with added functionality.**

## Requirements

- systemd

## Installation

**This script installs into `/usr/local/bin`.**

- Copy this whole directory and transfer it to the device
- Run `install.sh` as root

## Systemd service failure handler

Just add override to any service you want to receive failure notifications for:

```bash
sudo systemctl edit your_service.service
```

```
[Unit]
OnFailure=telegram-notify@%n
```
