var async = require('async');

// Require the driver.
var pg = require('pg');

// Connect to the cluster.
var config = {
  user: 'root',
  host: 'localhost',
  port: 26257
};

pg.connect(config, function (err, client, done) {
  if (err) {
    return console.error('could not connect to cockroachdb', err);
  }
  // Create a "bank" database and set it as default.
  client.query('CREATE DATABASE bank; SET DATABASE = bank;', function (err, result) {
    if (err) {
      return console.error('error creating database', err);
    }

    async.waterfall([
      function (next) {
        // Create an "accounts" table in the "bank" database.
        client.query('CREATE TABLE accounts (id INT PRIMARY KEY, balance INT);', next);
      },
      function (results, next) {
        // Insert two rows into the table.
        client.query("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250);", next);
      },
      function (results, next) {
        // Check account balances.
        client.query('SELECT id, balance FROM accounts;', next);
      },
    ],
    function (err, results) {
      if (err) {
        return console.error('error creating and inserting into table', err);
      }

      console.log('Account balances before transaction:');
      results.rows.forEach(function (row) {
        console.log(row);
      });

      async.waterfall([
        function (next) {
          // Start a transaction.
          client.query('BEGIN;', next);
        },
        function (results, next) {
          // Transfer 100 from account 1 to account 2.
          client.query('SELECT balance FROM accounts WHERE id = 1;', function (err, results) {
            if (err) {
              return next(err);
            }

            var acctOneBal = results.rows[0].balance;
            if (acctOneBal > 100) {
              async.series([
                function (next) {
                  // Subtract $100 from account 1.
                  client.query("UPDATE accounts SET balance = balance - DECIMAL '100' WHERE id = 1;", next);
                },
                function (next) {
                  // Add $100 to account 2.
                  client.query("Update accounts SET balance = balance + DECIMAL '100' WHERE id = 2;", next);
                },
              ], next);
            } else {
              next();
            }
          });
        },
        function (results, next) {
          // Finish the transaction.
          client.query('COMMIT;', next);
        },
      ],
      function (err, results) {
        if (err) {
          return console.error('error performing transaction', err);
        }

        // Check account balances after the transaction.
        client.query('SELECT id, balance FROM accounts', function (err, results) {
          if (err) {
            return console.error('error querying accounts', err);
          }

          console.log('Account balances after transaction:');
          results.rows.forEach(function (row) {
            console.log(row);
          });

          // Close communication with the database and exit.
          done();
          process.exit();
        });
      });
    });
  });
});
