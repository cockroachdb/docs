<?php
try {
  $dbh = new PDO('pgsql:host=localhost;port=26257;dbname=bank;sslmode=disable',
    'maxroach', null, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));

  $dbh->exec('INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)');

  print "Account balances:\n";
  foreach ($dbh->query('SELECT id, balance FROM accounts') as $row) {
      print $row['id'] . ': ' . $row['balance'] . "\n";
  }
} catch (Exception $e) {
	print $e->getMessage();
	exit(1);
}
?>
