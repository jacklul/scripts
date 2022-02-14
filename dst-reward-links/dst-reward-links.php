#!/usr/bin/env php
<?php
/**
 * Made by Jack'lul <jacklul.github.io>
 */

$urlsToScan = [
    'https://docs.google.com/spreadsheets/d/1ZZ8JeDjz7C5cRVl8ovYYm2L3E0mjjebCxN7WUK1Nw2A/export?gid=0&format=csv', // Community spreadsheet
    'https://steamcommunity.com/sharedfiles/filedetails/?id=2308653652' // Popular Steam Guide
];

function notify(array $links) {
    // Send message via Telegram if telegram-notify exists in the system
    $sendMessage = static function($message) {
        if (file_exists('/usr/local/bin/telegram-notify')) {
            echo 'Sending notification via Telegram...' . PHP_EOL;
    
            system('/usr/local/bin/telegram-notify --quiet --html --disable_preview --icon 1F381 --title "New DST reward link @ Klei forums ($(hostname -f))" --text "' . str_replace('"', '\"', trim($message)) . '"');
        } else {
            echo $message . PHP_EOL;
        }
    };

    $output = '';
    foreach ($links as $link => $url) {
        $output_this = 'New reward link found: ' . $link . ' in <a href="' . urlencode($url) . '">this URL</a>.' . PHP_EOL;
        
        $tmp = $output;
        $tmp .= $output_this;

        if (strlen($tmp) >= 4096) {
            $sendMessage($output);
            $output = '';
        }

        $output .= $output_this;
    }

    $sendMessage($output);
};

##################################

$known_links = $new_links = [];

if (isset($_SERVER['HOME'])) {
    $known_links_file = $_SERVER['HOME'] . '/.config/dst-reward-links.json';
} else {
    $known_links_file = __DIR__ . '/dst-reward-links.json';
}

if (isset($argv[1])) {
    $known_links_file = $argv[1];

    echo 'Known links file: ' . $known_links_file . PHP_EOL;
}

// Fetch known links from a file if it exists
if (file_exists($known_links_file)) {
    $known_links = file_get_contents($known_links_file);
    $known_links = json_decode($known_links, true);
}

if (!isset($urlsToScan) || !is_array($urlsToScan)) {
    $urlsToScan = [];
}

echo 'Fetching thread listing page...' . PHP_EOL;

// Fetch thread listing page for general discussion section
$data = file_get_contents('https://forums.kleientertainment.com/forums/forum/66-dont-starve-together-general-discussion/');

// Find links to pinned threads
preg_match_all("/title='Pinned'.*ipsContained.*<a href='(.*)'/Us", $data, $matches);

if (isset($matches[1]) && !empty($matches[1])) {
    foreach ($matches[1] as $match) {
        $urlsToScan[] = $match;
    }
} else {
    echo 'No pinned threads found.' . PHP_EOL;
}

if (!empty($urlsToScan)) {
    echo 'Found ' . count($urlsToScan) . ' URLs to scan!' . PHP_EOL;

    // Fetch each thread page
    foreach ($urlsToScan as $url) {
        echo 'Checking URL "' . trim($url) . '"...' . PHP_EOL;
        
        // Fetch thread page
        $data = file_get_contents($url);

        // Search for reward link
        preg_match_all('/(\/\/accounts.klei.com\/link\/[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/', $data, $matches2);

        // If at least one is found, add it to the list of new links
        if (isset($matches2[1]) && !empty($matches2[1])) {
            foreach ($matches2[1] as $match) {
                if (substr($match, 0, 2) == '//') {
                    $match = 'https:' . $match;
                }
    
                if (isset($new_links[$match])) {
                    continue;
                }

                echo 'Found reward link: ' . $match . PHP_EOL;
    
                $new_links[$match] = $url;
            }
        }
    }

    // Check for new links and discard duplicates
    foreach ($new_links as $link => $url) {
        if (!in_array($link, $known_links)) {
            $known_links[] = $link;
        } else {
            unset($new_links[$link]);
        }
    }
    
    // If at least one is found, save the list of known links and send notification
    if (!empty($new_links)) {
        echo 'Saving known links...' . PHP_EOL;
        file_put_contents($known_links_file, json_encode($known_links));
    
        echo 'Sending notification...' . PHP_EOL;
        notify($new_links);
    } else {
        echo 'No new reward links found.' . PHP_EOL;
    }
} else {
    echo 'No URLs to scan.' . PHP_EOL;
}
