// Build with g++ -std=c++11 txn_sample.cpp -lpq -lpqxx

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
  auto r = tx->exec(
      "SELECT balance FROM accounts WHERE id = " + to_string(from));
  assert(r.size() == 1);
  auto fromBalance = r[0][0].as<int>();

  if (fromBalance < amount) {
    throw domain_error("insufficient funds");
  }

  // Perform the transfer.
  tx->exec("UPDATE accounts SET balance = balance - " 
      + to_string(amount) + " WHERE id = " + to_string(from));
  tx->exec("UPDATE accounts SET balance = balance + " 
      + to_string(amount) + " WHERE id = " + to_string(to));
}

// txnWrapper runs fn inside a transaction and retries it as needed.
void txnWrapper(
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
      // do string matching to identify retriable errors.
      if (string(e.base().what()).find("restart transaction:") == string::npos) {
        throw;
      }
    }
  }
  tx.commit();
}

int main() {
  try {
    pqxx::connection c("postgresql://root@localhost:26257/bank");

    pqxx::nontransaction w(c);
    (void) w.exec(
	"INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 230)");
    w.commit();  // Note this doesn't doesn't do anything
                 // for a nontransaction, but is still required.

    txnWrapper(&c, [](pqxx::dbtransaction *tx) {
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
