#!/usr/bin/env php
<?php
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/pihole-firebog.php
#
# This scripts outputs contents of 'https://v.firebog.net/hosts/lists.php?type='
# but replaces any mirrored list with their original URL.
#
# Calling without argument will fetch all lists.

define('DATA_PATH', '/etc/pihole'); // We store cache (firebog.cache) and result (firebog_$type.list) file here
define('CACHE_TIME', 601200); // How long to cache replaced URLs? 601200 = 7 days - 1 hour

function fail(string $message, bool $fatal = true) {
    echo $message . PHP_EOL;
    $fatal && exit(1);
}

function save(string $file, $new_data) {
    if (file_exists($file)) {
        $old_data = file_get_contents($file);

        if ($old_data === false) {
            exit(1);
        }
    }

    if (!isset($old_data) || $old_data != $new_data) {
        if (!file_put_contents($file, $new_data)) {
            exit(1);
        }
    }
}

if (!is_dir(DATA_PATH)) {
    fail('Data directory not found: ' . DATA_PATH);
}

$supported_types = ['tick', 'nocross', 'adult', 'all'];
$types = $supported_types;

if (isset($_GET['type'])) {
    $types = [strtolower($_GET['type'])];
} elseif (isset($argv[1])) {
    $types = [strtolower($argv[1])];
}

if (empty($types)) {
    fail('Type not provided!');
}

if (!in_array($types[0], $supported_types)) {
    fail('Invalid type: ' . $types[0]);
}

if (file_exists(DATA_PATH . '/firebog.cache')) {
    $cache = json_decode(file_get_contents(DATA_PATH . '/firebog.cache'), true);
}

if (!isset($cache) || !is_array($cache)) {
    $cache = [];
}

$time = time();

foreach ($types as $type) {
    $url = 'https://v.firebog.net/hosts/lists.php?type=' . $type;

    echo 'Processing "' . $url . '"...' . PHP_EOL;
    $data = file_get_contents($url);

    if (!empty($data)) {
        $lines = preg_split("/(\r\n|\n|\r)/", $data);

        foreach ($lines as &$line) {
            if (stripos($line, 'static/w3kbl.txt') !== false) {
                continue; // Ignore WaLLy3K's personal list
            }

            $line = trim($line);

            if (stripos($line, 'v.firebog.net') !== false) {
                if (!isset($cache[$line]) || $cache[$line]['date'] + CACHE_TIME < $time) {
                    $list_data = file_get_contents($line, false, null, 0, 1000);

                    if (!empty($list_data)) {
                        preg_match('/^# Updated .* from (.*)$/m', $list_data, $matches);

                        if (isset($matches[1])) {
                            $cache[$line] = [
                                'url' => $matches[1],
                                'date' => $time,
                            ];
                            $line = $matches[1];
                        }
                    } else {
                        fail('Unable to fetch ' . $line, false);
                    }
                } else {
                    $line = $cache[$line]['url'];
                }
            }
        }

        save(DATA_PATH . '/firebog_' . $type . '.list', implode(PHP_EOL, $lines));
        save(DATA_PATH . '/firebog.cache', json_encode($cache));
    } else {
        fail('Unable to fetch ' . $url);
    }
}
