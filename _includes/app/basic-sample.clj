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

  ;; Create an "accounts" table.
  (execute! conn ["CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)"])

  ;; Insert two rows into the table.
  (insert! conn :accounts {:id 1 :balance 1000} {:id 2 :balance 250})

  ;; Check account balances.
  (->> (query conn ["SELECT id, balance FROM accounts"])
       (map println)
       doall)

;; The database connection is automatically closed by with-db-connection.
)