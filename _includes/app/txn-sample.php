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
      // TODO(tschottdorf): https://github.com/cockroachdb/cockroach/issues/5758
      /*
      $stmt = $dbh->prepare('UPDATE accounts SET balance = balance + :deposit WHERE id = :account');
      $stmt->execute(array('account' => $to, 'deposit' => $amount));
      $stmt->execute(array('account' => $from, 'deposit' => -$amount));
       */
      $dbh->exec('UPDATE accounts SET balance=balance+'.$amount.' WHERE id='.$to);
      $dbh->exec('UPDATE accounts SET balance=balance+'.(-$amount).' WHERE id='.$from);

      // Attempt to release the savepoint (which is really the commit).
      $dbh->exec('RELEASE SAVEPOINT cockroach_restart');
      $dbh->commit();
      return;
    } catch (PDOException $e) {
      if ($e->getCode() != 'CR000') {
        // Non-recoverable error. Rollback and bubble it up the chain.
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
  $dbh = new PDO('pgsql:host=localhost;port=26257;dbname=bank;sslmode=disable',
    'maxroach', null, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));

  transferMoney($dbh, 1, 2, 10);

  print "Account balances after transfer:\n";
  foreach ($dbh->query('SELECT id, balance FROM accounts') as $row) {
      print $row['id'] . ': ' . $row['balance'] . "\n";
  }
} catch (Exception $e) {
	print $e->getMessage();
	exit(1);
}
?>
