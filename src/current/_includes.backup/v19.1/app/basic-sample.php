<?php
try {
    $dbh = new PDO('pgsql:host=localhost;port=26257;dbname=bank;sslmode=require;sslrootcert=certs/ca.crt;sslkey=certs/client.maxroach.key;sslcert=certs/client.maxroach.crt',
    'maxroach', null, array(
      PDO::ATTR_ERRMODE          => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_EMULATE_PREPARES => true,
      PDO::ATTR_PERSISTENT => true
    ));

  $dbh->exec('INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)');

  print "Account balances:\r\n";
  foreach ($dbh->query('SELECT id, balance FROM accounts') as $row) {
      print $row['id'] . ': ' . $row['balance'] . "\r\n";
  }
} catch (Exception $e) {
    print $e->getMessage() . "\r\n";
    exit(1);
}
?>
