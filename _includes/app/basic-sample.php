<?php
function kill($msg) {
	echo($msg);
	exit(1);
}

$dbconn = pg_connect('') or kill('Could not connect: ' . pg_last_error());

$query = <<<EOF
CREATE DATABASE IF NOT EXISTS bank;
SET DATABASE = bank;
CREATE TABLE accounts (id INT PRIMARY KEY, balance INT);
EOF;

pg_query($query)
    or kill('Query failed: ' . pg_last_error());

pg_query('INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)')
    or kill('Insert failed: ' . pg_last_error());

$result = pg_query('SELECT id, balance FROM accounts')
    or kill('Select failed: ' . pg_last_error());

echo "Account balances:\n";
while ($line = pg_fetch_array($result, null, PGSQL_NUM)) {
    echo join(' ', $line) . "\n";
}

pg_free_result($result);
pg_close($dbconn);
?>
