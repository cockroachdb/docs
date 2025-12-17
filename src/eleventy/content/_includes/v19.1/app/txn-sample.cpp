#include <cassert>
#include <functional>
#include <iostream>
#include <stdexcept>
#include <string>
#include <pqxx/pqxx>

using namespace std;

void transferFunds(
    pqxx::dbtransaction *tx, int from, int to, int amount) {
  // Read the balance.
  pqxx::result r = tx->exec(
      "SELECT balance FROM accounts WHERE id = " + to_string(from));
  assert(r.size() == 1);
  int fromBalance = r[0][0].as<int>();

  if (fromBalance < amount) {
    throw domain_error("insufficient funds");
  }

  // Perform the transfer.
  tx->exec("UPDATE accounts SET balance = balance - "
      + to_string(amount) + " WHERE id = " + to_string(from));
  tx->exec("UPDATE accounts SET balance = balance + "
      + to_string(amount) + " WHERE id = " + to_string(to));
}


// ExecuteTx runs fn inside a transaction and retries it as needed.
// On non-retryable failures, the transaction is aborted and rolled
// back; on success, the transaction is committed.
//
// For more information about CockroachDB's transaction model see
// https://cockroachlabs.com/docs/transactions.html.
//
// NOTE: the supplied exec closure should not have external side
// effects beyond changes to the database.
void executeTx(
    pqxx::connection *c, function<void (pqxx::dbtransaction *tx)> fn) {
  pqxx::work tx(*c);
  while (true) {
    try {
      pqxx::subtransaction s(tx, "cockroach_restart");
      fn(&s);
      s.commit();
      break;
    } catch (const pqxx::pqxx_exception& e) {
      // Swallow "transaction restart" errors; the transaction will be retried.
      // Unfortunately libpqxx doesn't give us access to the error code, so we
      // do string matching to identify retryable errors.
      if (string(e.base().what()).find("restart transaction:") == string::npos) {
        throw;
      }
    }
  }
  tx.commit();
}

int main() {
  try {
    pqxx::connection c("dbname=bank user=maxroach sslmode=require sslkey=certs/client.maxroach.key sslcert=certs/client.maxroach.crt port=26257 host=localhost");

    executeTx(&c, [](pqxx::dbtransaction *tx) {
          transferFunds(tx, 1, 2, 100);
      });
  }
  catch (const exception &e) {
    cerr << e.what() << endl;
    return 1;
  }
  cout << "Success" << endl;
  return 0;
}
