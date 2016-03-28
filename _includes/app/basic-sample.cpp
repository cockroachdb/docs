// Build with g++ -std=c++11 basic-sample.cpp -lpq -lpqxx

#include <cassert>
#include <functional>
#include <iostream>
#include <stdexcept>
#include <string>
#include <pqxx/pqxx>

using namespace std;

int main() {
  try {
    pqxx::connection c("postgresql://maxroach@localhost:26257/bank");

    pqxx::nontransaction w(c);

    w.exec("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 230)");

    cout << "Account balances:" << endl;
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
