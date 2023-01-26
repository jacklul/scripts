#!/usr/bin/env php
<?php
# Made by Jack'lul <jacklul.github.io>
#
# /opt/helpers/pihole-updatelists-report.php
#
# To be used wit https://github.com/jacklul/pihole-updatelists
#
# Override pihole-updatelists.service:
#  [Service]
#  Type=oneshot
#  ExecStartPost=-/bin/sh -c "/usr/local/bin/telegram-notify --icon 1F4CA --title \"Pi-hole's Scheduled Lists Update @ %H\" --text \"$(/opt/helpers/pihole-updatelists-report.php)\" --html --silent"

$command = "journalctl _SYSTEMD_INVOCATION_ID=$(systemctl show -p InvocationID --value pihole-updatelists.service) | grep \"Fetching\|Merging\|Processing\|Number of \|Finished.*in.*seconds\" | sed 's/^.*]://' | sed 's/\[i\]//' | sed 's/^ *//;s/ *$//'";

$output = shell_exec($command);

if (empty($output)) {
	echo 'Failed to execute journalctl command or read and parse the log!' . PHP_EOL;
	die();
}

$anyOutput = false;
foreach (['ADLISTS', 'WHITELIST', 'REGEX_WHITELIST', 'BLACKLIST', 'REGEX_BLACKLIST'] as $type) {
	preg_match_all('/Fetching (' . $type . ').*\((\d+ entries)\).*Processing\.{3} (.*)$/Ums', $output, $matches);

	if (isset($matches[1][0])) {
		echo ucwords(strtolower(str_replace('_', ' ', $matches[1][0]))) . ' - ' . $matches[2][0] . ' - ' . $matches[3][0] . PHP_EOL;
		$anyOutput = true;
	}
}

if ($anyOutput) {
	echo PHP_EOL;
}

preg_match_all('/Number of .*/', $output, $matches);

echo implode(PHP_EOL, $matches[0]) . PHP_EOL;

preg_match_all('/Finished.*seconds/', $output, $matches);

echo PHP_EOL . implode(PHP_EOL, $matches[0]) . PHP_EOL;
