# twitch-live-notify

This script checks whenever defined channels on [www.twitch.tv](https://www.twitch.tv) are live.

It uses [telegram-notify](/telegram-notify/) script to send the links to the configured Telegram chat.
If you would like to use different delivery method then you will have to modify `command` variable in the configuration file.

## Requirements

- systemd
- `php-cli` (tested with 7.3.31)

## Installation

**This script installs into `/home/$USER/.local/bin/`.**

```bash
wget -O - https://raw.githubusercontent.com/jacklul/scripts/master/twitch-live-notify/install.sh | bash
```

OR

- Copy this whole directory and transfer it to the device
- Run `install.sh`

By default the script runs every 10 minutes, you can change this by overriding [timer file](https://www.freedesktop.org/software/systemd/man/systemd.timer.html) - `systemctl --user edit twitch-live-notify.timer`.

## Configuration

Modify `/home/$USER/.config/twitch-live-notify/twitch-live-notify.conf` to your needs.

See [twitch-live-notify.conf.example](twitch-live-notify.conf.example) for an example configuration.

| Variable | Default | Description |
|---|---|---|
| `channels` | `` | The channel usernames, separated by comma |
| `command` | `null` | The command that sends the notification |
| `user_agent` | `` | HTTP user-agent to use in case you're being blocked |
