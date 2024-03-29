#!/usr/bin/env php
<?php
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/pihole-update-hostnames.php
#
# Assign hostnames (from static DHCP page) when Pi-hole is not used as the DHCP server
#
# Override pihole-FTL.service:
#  [Service]
#  ExecStartPre=-/opt/helpers/pihole-update-hostnames.php
#
# You could also run it hourly: (not required - just clicking Save on static DHCP leases page is enough)
#  sudo ln -s /opt/helpers/pihole-update-hostnames.php /etc/cron.hourly/pihole-update-hostnames

define('CONFIG', '/etc/dnsmasq.d/10-static-hosts.conf');
define('HOSTS', '/etc/pihole/static-hosts.list');
define('DATABASE', '/etc/pihole/pihole-FTL.db');
define('CONFIG_MAIN', '/etc/dnsmasq.d/01-pihole.conf');
define('CONFIG_STATIC', '/etc/dnsmasq.d/04-pihole-static-dhcp.conf');
define('GENERATED_HEADER', '# This file was automatically generated by ' . __FILE__ . PHP_EOL . PHP_EOL);

foreach ([DATABASE, CONFIG_MAIN, CONFIG_STATIC] as $file) {
    if (!file_exists($file)) {
        echo "File not found: " . $file . PHP_EOL;
        exit(1);
    }
}

if (!file_exists(CONFIG) && !file_put_contents(CONFIG, GENERATED_HEADER . '# Include static hostnames from DHCP page' . PHP_EOL . 'addn-hosts=' . HOSTS . PHP_EOL)) {
    echo "Failed to create config: " . CONFIG . PHP_EOL;
    exit(1);
}

if (!file_exists(HOSTS) && !file_put_contents(HOSTS, GENERATED_HEADER)) {
    echo "Failed to create hosts file: " . HOSTS . PHP_EOL;
    exit(1);
}

$main_config = file_get_contents(CONFIG_MAIN);
preg_match('/^server=\/([a-zA-Z0-9-]+)\/\d+.*$/m', $main_config, $matches1);

$domain = '';
if (isset($matches1[1])) {
    $domain = $matches1[1];
    echo 'Using domain name: ' . $domain . PHP_EOL;
}
unset($matches1);

$static_config = file_get_contents(CONFIG_STATIC);
preg_match_all('/^dhcp-host=((?:[a-fA-F0-9]{2}:?){6}),(.*)(?:,(.*))?$/mU', $static_config, $matches2);

$hosts_file_previous = file_get_contents(HOSTS);
$hosts_file = GENERATED_HEADER;

$total_hosts = count($matches2[1]);
if ($total_hosts > 0) {
    echo 'Found ' . $total_hosts . ' static hostname definitions' . PHP_EOL;

    $dbh = new PDO('sqlite:' . DATABASE, null, null, [PDO::SQLITE_ATTR_OPEN_FLAGS => PDO::SQLITE_OPEN_READONLY]);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $mac_to_hostname = [];
    for ($i = 0; $i < $total_hosts; $i++) {
        $mac = $matches2[1][$i];
        $name = !empty($matches2[3][$i]) ? $matches2[3][$i] : $matches2[2][$i];

        $mac_to_hostname[strtolower($mac)] = trim($name);
    }

    $sth = $dbh->prepare('SELECT * FROM network_addresses LEFT JOIN network ON network_addresses.network_id = network.id WHERE network_addresses.ip LIKE "%.%.%.%" ORDER BY network_addresses.lastSeen DESC');

    if ($sth->execute()) {
        foreach ($sth->fetchAll(PDO::FETCH_ASSOC) as $record) {
            $hwaddr = $record['hwaddr'];
            $new_hostname = $mac_to_hostname[strtolower($hwaddr)] ?? null;

            if (!empty($new_hostname)) {
                !empty($domain) && $new_hostname .= '.' . $domain;

                if (!preg_match('/\t' . preg_quote($new_hostname) . '$/', $hosts_file)) {
                    $hosts_file .= $record['ip']. "\t" . $new_hostname . PHP_EOL;
                }
            }
        }
    }

    if ($hosts_file_previous !== $hosts_file) {
        if (file_put_contents(HOSTS, $hosts_file)) {
            echo "Updated hosts file: " . HOSTS . PHP_EOL;

            system('killall -s SIGHUP pihole-FTL');
        } else {
            echo "Failed to update hosts file: " . HOSTS . PHP_EOL;
        }
    }
} else {
    echo "No static hostname definitions found";
}
