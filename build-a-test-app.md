---
title: Build a Test App
toc: false
---

This page demonstrates how to connect a simple test app to CockroachDB from various languages. The app creates a "bank" database, creates two accounts, and executes a transaction to transfer funds from one account to the other. 

We assume that you have already [installed CockroachDB](install-cockroachdb.html), [started an insecure local cluster](start-a-local-cluster.html#insecure), and [installed the relevant client driver](install-client-drivers.html).

## Go

## C/C++

## Python

~~~ py
# Import the driver.
import psycopg2

# Connect to the cluster.
conn = psycopg2.connect(user='root', host='localhost', port=26257)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Make each statement commit immediately, except where autocommit=False.
conn.set_session(autocommit=True)

# Create a "bank" database and set it as default.
cur.execute("CREATE DATABASE bank;")
cur.execute("SET DATABASE = bank;")

# Create an "accounts" table in the "bank" database.
cur.execute("CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);")

# Insert two rows into the table.
cur.execute("INSERT INTO accounts (id, balance) VALUES (1, DECIMAL '1000'), (2, DECIMAL '230.50');")

# Check account balances.
cur.execute("SELECT id, balance FROM accounts;")
rows = cur.fetchall()
print('Account balances before transaction:')
for row in rows:
    print([str(cell) for cell in row])

# Start a transaction.
conn.set_session(autocommit=False)

# Transfer $100 from account 1 to account 2.
cur.execute("SELECT balance FROM accounts WHERE id = 1;")
rows = cur.fetchall()
for row in rows:
    if row[0] > 100:
        # Subtract $100 from account 1.
        cur.execute("UPDATE accounts SET balance = balance - DECIMAL '100' WHERE id = 1;")
        # Add $100 to account 2.
        cur.execute("Update accounts SET balance = balance + DECIMAL '100' WHERE id = 2;")

# Finish the transaction.
conn.commit()

# Check account balances after the transaction.
conn.set_session(autocommit=True)
cur.execute("SELECT id, balance FROM accounts")
rows = cur.fetchall()
print('Account balances after transaction:')
for row in rows:
    print([str(cell) for cell in row])

# Close communication with the database.
cur.close()
conn.close()
~~~

## Ruby

## Java

## JavaScript (Node.js)

## Clojure

~~~ clojure
;; Import the driver.
(use 'clojure.java.jdbc)

;; Connect to the cluster.
(def db-spec {:subprotocol "postgresql"
              :subname "//localhost:26257"
              :user "root"
              :password ""})

(with-db-connection [conn db-spec]

  ;; Create a "bank" database and set it as default.
  (execute! conn ["CREATE DATABASE bank"])
  (execute! conn ["SET DATABASE = bank"])

  ;; Create an "accounts" table in the "bank" database.
  (execute! conn ["CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL)"])

  ;; Insert two rows into the table.
  (insert! conn :accounts {:id 1 :balance 1000.0M} {:id 2 :balance 250.50M})

  ;; Check account balances.
  (->> (query conn ["SELECT id, balance FROM accounts"])
       (map println)
       doall)

  ;; Start a transaction. 
  (with-db-transaction [t conn]

    ;; Transfer $100 from account 1 to account 2.
    (let [balance (->> (query t ["SELECT balance FROM accounts WHERE id = 1"] :row-fn :balance)
                       (first))]
      (when (> balance 100)
        ;; Subtract $100 from account 1.
        (execute! t ["UPDATE accounts SET balance = balance - DECIMAL '100' WHERE id = 1"])
        ;; Add $100 to account 2.
        (execute! t ["UPDATE accounts SET balance = balance + DECIMAL '100' WHERE id = 2"])
        )))

  ;; Check account balances after the transaction.
  (->> (query conn ["SELECT id, balance FROM accounts"])
       (map println)
       doall)

;; The database connection is automatically closed by with-db-connection.
)
~~~

## PHP
