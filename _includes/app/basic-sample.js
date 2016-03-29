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

pg.connect(config, function (err, client, done) {
  if (err) {
    return console.error('could not connect to cockroachdb', err);
  }
  async.waterfall([
    function (next) {
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
      return console.error('error inserting into and selecting from accounts', err);
    }

    console.log('Initial account balances:');
    results.rows.forEach(function (row) {
      console.log(row);
    });

    // Close communication with the database and exit.
    done();
    process.exit();
  });
});
