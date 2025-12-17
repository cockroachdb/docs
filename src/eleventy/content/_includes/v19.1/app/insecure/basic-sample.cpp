#include <cassert>
#include <functional>
#include <iostream>
#include <stdexcept>
#include <string>
#include <pqxx/pqxx>

using namespace std;

int main() {
  try {
    // Connect to the "bank" database.
    pqxx::connection c("postgresql://maxroach@localhost:26257/bank");

    pqxx::nontransaction w(c);

    // Create the "accounts" table.
    w.exec("CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)");

    // Insert two rows into the "accounts" table.
    w.exec("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)");

    // Print out the balances.
    cout << "Initial balances:" << endl;
    pqxx::result r = w.exec("SELECT id, balance FROM accounts");
    for (auto row : r) {
      cout << row[0].as<int>() << ' ' << row[1].as<int>() << endl;
    }

    w.commit();  // Note this doesn't doesn't do anything
                 // for a nontransaction, but is still required.
  }
  catch (const exception &e) {
    cerr << e.what() << endl;
    return 1;
  }
  cout << "Success" << endl;
  return 0;
}
