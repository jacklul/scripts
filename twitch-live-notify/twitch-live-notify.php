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

if (empty($config['client_id']) || empty($config['client_secret'])) {
	echo 'Authentication credentials not set' . PHP_EOL;
	exit(1);
}

$channels = [];
if (!empty($config['channels'])) {
    $channels = preg_split('/\s+|,/', strtolower($config['channels']));
}

$cachefile = pathinfo($configfile);
$cachefile = $cachefile['dirname'] . '/' . $cachefile['filename'] . '.json';

$cache = $cacheprev = [];
if (file_exists($cachefile)) {
    $cache = $cacheprev = json_decode(file_get_contents($cachefile), true);
}

$saveCache = function(array $cache) use ($cachefile, $cacheprev, $config): ?bool {
	if ($cache != $cacheprev) {
		foreach ($cache as $key => $val) {
			if (substr($key, 0, 1) !== '_' && strpos($config['channels'], $key) === false) {
				unset($cache[$key]);
			}
		}

		return file_put_contents($cachefile, json_encode($cache));
	}
	
	return null;
};

$access_token = $cache['__access_token'] ?? null;
$access_token_expires = $cache['__access_token_expires'] ?? 0;

$authorize = function() use ($config, &$cache, $saveCache): void {
	$data = file_get_contents('https://id.twitch.tv/oauth2/token?client_id=' . $config['client_id'] . '&client_secret=' . $config['client_secret'] . '&grant_type=client_credentials', false, stream_context_create([
		'http' => [
			'method'  => 'POST',
		]
	]));

	if (strpos($data, 'access_token') !== false) {
		$auth_json = json_decode($data, true);
		
		$cache['__access_token'] = $auth_json['access_token'];
		$cache['__access_token_expires'] = time() + $auth_json['expires_in'] - 60;
		
		$saveCache($cache);
	} else {
		exit(1);
	}
};

if (empty($access_token) || time() >= $access_token_expires) {
	$authorize();
	$access_token = $cache['__access_token'];
	$access_token_expires = $cache['__access_token_expires'];
}

$getLiveChannels = function() use ($access_token, $channels, $config): ?array {
	$retry = false;

	do {
		$query = '';
		foreach ($channels as $channel) {
			if (!empty($query)) $query .= '&';
			$channel = trim($channel);
			$query .= 'user_login=' . $channel;
		}
	
		$data = file_get_contents('https://api.twitch.tv/helix/streams?' . $query, false, stream_context_create([
			'http' => [
				'method'  => 'GET',
				'header' => 'Authorization: Bearer ' . $access_token . PHP_EOL . 'Client-Id: ' . $config['client_id']
			]
		]));
		
		if (empty($data) && strpos(error_get_last()['message'], '401 Unauthorized') !== false) {
			if ($retry) {
				return null;
			}
			
			$retry = true;
			continue;
		}
		
		$json = json_decode($data, true);
		
		$live = [];
		foreach ($json['data'] as $stream) {
			$live[$stream['user_login']] = $stream['started_at'];
		}
		
		return $live;
	} while ($retry);
};

$live = $getLiveChannels();
$notify_live = [];

foreach ($live as $channel => $started_at) {
	if (!isset($cache[$channel]) || $cache[$channel] < $started_at) {
		if (!isset($cache[$channel]) || $cache[$channel] + 3600 < time()) {
			$notify_live[] = $channel;
		}

		$cache[$channel] = $started_at;
	}
}

$saveCache($cache);

if (count($live) > 0) {
	echo 'Live channel(s): ' . implode(', ', array_keys($live)) . PHP_EOL;
}

if (!empty($notify_live) && isset($config['command'])) {
    echo 'Sending notification...' . PHP_EOL;
    
    $text = 'Live channel(s):' . PHP_EOL;

    foreach ($notify_live as $channel) {
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
        echo 'Unable to run command through system() - unsupported OS!';
		exit(1);
    }
}
