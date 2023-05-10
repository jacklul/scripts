#!/usr/bin/env php
<?php
/**
 * Made by Jack'lul <jacklul.github.io>
 */

if (isset($argv[1]) && file_exists($argv[1])) {
    $configfile = realpath($argv[1]);
    $config = parse_ini_file($argv[1], true, INI_SCANNER_TYPED);
} else {
    $default_configfile = $_SERVER['HOME'] . '/.config/twitch-live-notify/twitch-live-notify.conf';

    if (file_exists($default_configfile)) {
        $configfile = realpath($default_configfile);
        $config = parse_ini_file($default_configfile, true, INI_SCANNER_TYPED);
    } else {
        echo 'Config file not found' . PHP_EOL;
        exit(1);
    }
}

$channels = [];
if (!empty($config['channels'])) {
    $channels = explode(',', $config['channels']);
}

$cachefile = pathinfo($configfile);
$cachefile = $cachefile['dirname'] . '/' . $cachefile['filename'] . '.json';

$cache = $cacheprev = [];
if (file_exists($cachefile)) {
    $cache = $cacheprev = json_decode(file_get_contents($cachefile), true);
}

function file_get_contents_($url, $user_agent = null) {
    if (!empty($user_agent)) {
        return file_get_contents($url, false, stream_context_create([
            'http' => [
                'user_agent' => $user_agent
            ]
        ]));
    } else {
        return file_get_contents($url);
    }
}

$live = [];
foreach ($channels as $channel) {
    $channel = trim($channel);

    echo 'Checking channel "' . $channel . '"...';

    $data = file_get_contents_('https://www.twitch.tv/' . $channel, $config['user_agent'] ?? null);

    preg_match('/<script type="application\/ld\+json">(.*)<\/script>/U', $data, $matches);

    if (isset($matches[1])) {
        echo ' live' . PHP_EOL;
    
        $json = json_decode($matches[1], true);

        if (!isset($cache[$channel]['uploadDate']) || $cache[$channel]['uploadDate'] != $json[0]['uploadDate']) {
            if (!isset($cache[$channel]['time']) || $cache[$channel]['time'] + 3600 != time()) {
                $live[] = $channel;
            }

            $cache[$channel] = [
                'time' => time(),
                'uploadDate' => $json[0]['uploadDate']
            ];
        }
    } else {
        echo ' off' . PHP_EOL;
    }

    usleep(500000);
}

if ($cache != $cacheprev) {
    file_put_contents($cachefile, json_encode($cache));
}

if (!empty($live) && isset($config['command'])) {
    echo 'Sending notification...' . PHP_EOL;
    
    $text = 'Live channel(s):' . PHP_EOL;

    foreach ($live as $channel) {
        $text .= '- https://www.twitch.tv/' . $channel . PHP_EOL;
    }

    $command = trim(
        str_replace(
            '#TEXT#',
            str_replace('"', '\"', trim($text)),
            $config['command']
        )
    );

    if (isset($config['debug'])) {
        echo $command . PHP_EOL;
    }

    if (stripos(PHP_OS, 'WIN') !== 0) {
    
        system($command);
    } else {
        throw new RuntimeException('Unable to run command through system() - unsupported OS!');
    }
}
