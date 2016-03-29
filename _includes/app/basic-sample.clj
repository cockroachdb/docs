;; Import the driver.
(use 'clojure.java.jdbc)

;; Connect to the "bank" database..
(def db-spec {:subprotocol "postgresql"
              :subname "//localhost:26257/bank"
              :user "maxroach"
              :password ""})

(with-db-connection [conn db-spec]

  ;; Insert two rows into the "accounts" table.
  (insert! conn :accounts {:id 1 :balance 1000} {:id 2 :balance 250})

  ;; Print out the balances.
  (println "Initial balances:")
  (->> (query conn ["SELECT id, balance FROM accounts"])
       (map println)
       doall)

;; The database connection is automatically closed by with-db-connection.
)
