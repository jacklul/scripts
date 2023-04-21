#!/usr/bin/env php
<?php
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/pihole-missing-names.php
#
# Assign hostnames (from static DHCP page) when Pi-hole is not used as the DHCP server
#
# Run it hourly:
# sudo ln -s /opt/helpers/pihole-missing-names.php /etc/cron.hourly/pihole-missing-names

define('DATABASE', '/etc/pihole/pihole-FTL.db');
define('CONFIG_MAIN', '/etc/dnsmasq.d/01-pihole.conf');
define('CONFIG_STATIC', '/etc/dnsmasq.d/04-pihole-static-dhcp.conf');

if (!file_exists(DATABASE)) {
    echo "Database not found: " . DATABASE . PHP_EOL;
    exit(1);
}

if (!file_exists(CONFIG_MAIN)) {
    echo "Main config not found: " . CONFIG_MAIN . PHP_EOL;
    exit(1);
}

if (!file_exists(CONFIG_STATIC)) {
    echo "Static assignments config not found: " . CONFIG_STATIC . PHP_EOL;
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

$hosts = count($matches2[1]);
if ($hosts > 0) {
    echo 'Found ' . $hosts . ' static hostname definitions' . PHP_EOL;

    $dbh = new PDO('sqlite:' . DATABASE);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $mac_to_hostname = [];
    for ($i = 0; $i < $hosts; $i++) {
        $mac = $matches2[1][$i];
        $name = !empty($matches2[3][$i]) ? $matches2[3][$i] : $matches2[2][$i];

        $mac_to_hostname[strtolower($mac)] = trim($name);
    }

    $sth = $dbh->prepare('SELECT * FROM network_addresses LEFT JOIN network ON network_addresses.network_id = network.id WHERE network_addresses.ip LIKE "%.%.%.%"');

    if ($sth->execute()) {
        foreach ($sth->fetchAll(PDO::FETCH_ASSOC) as $record) {
            $hwaddr = $record['hwaddr'];
            $hostname = $mac_to_hostname[strtolower($hwaddr)] ?? null;

            if (empty($hostname)) {
                continue;
            }

            !empty($domain) && $hostname .= '.' . $domain;

            if (
                empty($record['name']) ||
                (!empty($record['name']) && $record['name'] != $hostname)
            ) {
                try {
                    $sth = $dbh->prepare('UPDATE network_addresses SET name = :name WHERE network_id = :network_id AND network_addresses.ip LIKE "%.%.%.%"');
                    $sth->bindParam(':network_id', $record['network_id'], PDO::PARAM_INT);
                    $sth->bindParam(':name', $hostname, PDO::PARAM_STR);

                    if ($sth->execute()) {
                        echo 'Updated hostname for MAC address: ' . $hwaddr . ' -> ' . $hostname . PHP_EOL;
                    } else {
                        echo 'Failed to update hostname: ' . $dbh->errorInfo()[2] . PHP_EOL;
                    }
                } catch (\Exception $e) {
                    echo 'Failed to update hostname: ' . $e . PHP_EOL;
                }
            }
        }
    }
} else {
    echo "No static hostname definitions found";
}
