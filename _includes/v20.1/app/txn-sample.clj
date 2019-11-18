(ns test.test
  (:require [clojure.java.jdbc :as j]
            [test.util :as util]))

;; Define the connection parameters to the cluster.
(def db-spec {:dbtype "postgresql"
              :dbname "bank"
              :host "localhost"
              :port "26257"
              :ssl true
              :sslmode "require"
              :sslcert "certs/client.maxroach.crt"
              :sslkey "certs/client.maxroach.key.pk8"
              :user "maxroach"})

;; The transaction we want to run.
(defn transferFunds
  [txn from to amount]

  ;; Check the current balance.
  (let [fromBalance (->> (j/query txn ["SELECT balance FROM accounts WHERE id = ?" from])
                         (mapv :balance)
                         (first))]
    (when (< fromBalance amount)
      (throw (Exception. "Insufficient funds"))))

  ;; Perform the transfer.
  (j/execute! txn [(str "UPDATE accounts SET balance = balance - " amount " WHERE id = " from)])
  (j/execute! txn [(str "UPDATE accounts SET balance = balance + " amount " WHERE id = " to)]))

(defn test-txn []
  ;; Connect to the cluster and run the code below with
  ;; the connection object bound to 'conn'.
  (j/with-db-connection [conn db-spec]

    ;; Execute the transaction within an automatic retry block;
    ;; the transaction object is bound to 'txn'.
    (util/with-txn-retry [txn conn]
      (transferFunds txn 1 2 100))

    ;; Execute a query outside of an automatic retry block.
    (println "Balances after transfer:")
    (->> (j/query conn ["SELECT id, balance FROM accounts"])
         (map println)
         (doall))))

(defn -main [& args]
  (test-txn))
