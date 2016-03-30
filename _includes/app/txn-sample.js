var async = require('async');

// Require the driver.
var pg = require('pg');

// Connect to the cluster.
var config = {
  user: 'maxroach',
  host: 'localhost',
  database: 'bank',
  port: 26257
};

// Wrapper for a transaction.
// This automatically re-calls "op" with the client as an argument as
// long as the database server asks for the transaction to be retried.
function txnWrapper(client, op, next) {
  client.query('BEGIN; SAVEPOINT cockroach_restart', function (err) {
    if (err) {
      return next(err);
    }

    var commit = function (err) {
      if (err) {
        client.query('ROLLBACK', function () {
          next(err);
        });
      } else {
        client.query('COMMIT', next);
      }
    };

    var released = false;
    async.doWhilst(function (done) {
      // Attempt the work.
      op(client, function (err) {
        if (err) {
          if (err.code === 'CR000') {
            console.log('RETRYING');
            // Signal the database we'll retry.
            return client.query('ROLLBACK TO SAVEPOINT cockroach_restart', done);
          }
          // A non-retryable error; report this up the call stack.
          return done(err);
        }

        // If we reach this point, release and commit.
        client.query('RELEASE SAVEPOINT cockroach_restart', function (err) {
          released = !err;
          return done(err);
        });
      });
    },
    function () {
      return !released;
    }, commit);
  });
}

// The transaction we want to run.
function transferFunds(client, from, to, amount, next) {
  // Check the current balance.
  client.query('SELECT balance FROM accounts WHERE id = $1', [from], function (err, results) {
    if (err) {
      return next(err);
    } else if (results.rows.length === 0) {
      return next(new Error('account not found in table'));
    }

    var acctBal = results.rows[0].balance;
    if (acctBal >= amount) {
      // Perform the transfer.
      async.series([
        function (next) {
          // Subtract amount from account 1.
          client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, from], next);
        },
        function (next) {
          // Add amount to account 2.
          client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, to], next);
        },
      ], next);
    } else {
      next(new Error('insufficient funds'));
    }
  });
}

pg.connect(config, function (err, client, done) {
  // Closes communication with the database and exit.
  var finish = function () {
    done();
    process.exit();
  };

  if (err) {
    console.error('could not connect to cockroachdb', err);
    finish();
  }

  // Execute the transaction.
  txnWrapper(client,
  function (client, next) {
    transferFunds(client, 1, 2, 100, next);
  },
  function (err, results) {
    if (err) {
      console.error('error performing transaction', err);
      finish();
    }

    // Check account balances after the transaction.
    client.query('SELECT id, balance FROM accounts', function (err, results) {
      if (err) {
        console.error('error querying accounts', err);
        finish();
      }

      console.log('Balances after transfer:');
      results.rows.forEach(function (row) {
        console.log(row);
      });

      finish();
    });
  });
});
