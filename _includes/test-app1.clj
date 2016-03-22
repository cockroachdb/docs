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