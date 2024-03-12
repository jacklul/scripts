# fmovies-watchlist

### WARNING: THIS SCRIPT NO LONGER WORKS AS THEY ADDED LOGIN CAPTCHA TO THE SITE AND CHANGED SITE LAYOUT.

This script checks [fmovies.to](https://fmovies.to/) watchlist for new releases of specified quality.

It uses [telegram-notify](/telegram-notify/) script to send the notifications to the configured Telegram chat.
If you would like to use different delivery method then you will have to modify `command` variable in the configuration file.

## Requirements

- systemd
- `php-cli` (tested with 7.3.31)

## Installation

**This script installs into `/home/$USER/.local/bin/`.**

```bash
wget -O - https://raw.githubusercontent.com/jacklul/scripts/master/fmovies-watchlist/install.sh | bash
```

OR

- Copy this whole directory and transfer it to the device
- Run `install.sh`

By default the script runs every 10 minutes, you can change this by overriding [timer file](https://www.freedesktop.org/software/systemd/man/systemd.timer.html) - `systemctl --user edit fmovies-watchlist.timer`.

## Configuration

Modify `/home/$USER/.config/showRSS/showRSS.conf` to your needs.

See [fmovies-watchlist.conf.example](fmovies-watchlist.conf.example) for an example configuration.

| Section | Variable | Default | Description |
|---|---|---|---|
| `notification` | `command` | `null` | The command that sends the notification |
| `notification` | `maxlength` | `1024` | Maximum length of a single notifications, multiple will be send if this value is exceeded |
| `notification` | `format` | `#TITLE# - #URL#` | Format of the entries in the notification |
| `notification` | `failure_timeout` | `86400` | After how long give up on sending failed notifications |
| `fmovies` | `endpoint` | `https://fmovies.to` | The website domain to use |
| `fmovies` | `username` | `null` | Obviously |
| `fmovies` | `password` | `null` | Obviously |
| `fmovies` | `data_file` | `[LOCATION OF THE CONFIG FILE]/fmovies_watchlist_data.json` | Where to store last known watchlist data |
| `fmovies` | `format_tv` | `#TITLE# #SEASON#x#EPISODEP# #QUALITY#` | Format for TV series |
| `fmovies` | `format_movie` | `#TITLE# #QUALITY#` | Format for movies |
| `fmovies` | `quality` | `HD` | Minimum wanted quality, must be one of `HD, HDRip, SD, TS, CAM` |
| `http` | `user_agent` | `FMovies Watchlist Checker [curl/version PHP/version]` | HTTP user-agent to use in case you're being blocked |