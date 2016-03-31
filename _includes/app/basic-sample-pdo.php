<?php
define('HOST', 'localhost');
define('PORT', '26257');
define('DBNAME', 'bank');
define('USER', 'maxroach');
define('PASS', '');

try {
	# Connect to the "bank" database.
	# sslcert=certs/root.cert;sslkey=certs/root.key
    $pdo = new PDO(sprintf('pgsql:host=%s;port=%s;dbname=%s;sslmode=disable', HOST, PORT, DBNAME), USER, PASS);

    # Insert two rows into the "accounts" table.
    $exec = $pdo->exec("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)");

    # Print out the balances.
    print "Initial balances:\n";
    foreach ($pdo->query('SELECT id, balance FROM accounts', PDO::FETCH_OBJ) as $row) {
        printf("id=%s, balance=%s\n", $row->id, $row->balance);
    }

    # Close the database connection.
    $pdo = null;
} catch (PDOException $e) {
    print "Error: " . $e->getMessage() . "\n";
    exit;
}
