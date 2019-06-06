<?php

function transferMoney($dbh, $from, $to, $amount) {
  try {
    $dbh->beginTransaction();
    // This savepoint allows us to retry our transaction.
    $dbh->exec("SAVEPOINT cockroach_restart");
  } catch (Exception $e) {
    throw $e;
  }

  while (true) {
    try {
      $stmt = $dbh->prepare(
        'UPDATE accounts SET balance = balance + :deposit ' .
        'WHERE id = :account AND (:deposit > 0 OR balance + :deposit >= 0)');

      // First, withdraw the money from the old account (if possible).
      $stmt->bindValue(':account', $from, PDO::PARAM_INT);
      $stmt->bindValue(':deposit', -$amount, PDO::PARAM_INT);
      $stmt->execute();
      if ($stmt->rowCount() == 0) {
        print "source account does not exist or is underfunded\r\n";
        return;
      }

      // Next, deposit into the new account (if it exists).
      $stmt->bindValue(':account', $to, PDO::PARAM_INT);
      $stmt->bindValue(':deposit', $amount, PDO::PARAM_INT);
      $stmt->execute();
      if ($stmt->rowCount() == 0) {
        print "destination account does not exist\r\n";
        return;
      }

      // Attempt to release the savepoint (which is really the commit).
      $dbh->exec('RELEASE SAVEPOINT cockroach_restart');
      $dbh->commit();
      return;
    } catch (PDOException $e) {
      if ($e->getCode() != '40001') {
        // Non-recoverable error. Rollback and bubble error up the chain.
        $dbh->rollBack();
        throw $e;
      } else {
        // Cockroach transaction retry code. Rollback to the savepoint and
        // restart.
        $dbh->exec('ROLLBACK TO SAVEPOINT cockroach_restart');
      }
    }
  }
}

try {
    $dbh = new PDO('pgsql:host=localhost;port=26257;dbname=bank;sslmode=require;sslrootcert=certs/ca.crt;sslkey=certs/client.maxroach.key;sslcert=certs/client.maxroach.crt',
    'maxroach', null, array(
      PDO::ATTR_ERRMODE          => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_EMULATE_PREPARES => true,
    ));

  transferMoney($dbh, 1, 2, 10);

  print "Account balances after transfer:\r\n";
  foreach ($dbh->query('SELECT id, balance FROM accounts') as $row) {
      print $row['id'] . ': ' . $row['balance'] . "\r\n";
  }
} catch (Exception $e) {
    print $e->getMessage() . "\r\n";
    exit(1);
}
?>
