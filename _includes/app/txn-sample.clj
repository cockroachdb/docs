;; Import the driver.
(use 'clojure.java.jdbc)

;; Connect to the cluster.
(def db-spec {:subprotocol "postgresql"
              :subname "//localhost:26257/bank"
              :user "maxroach"
              :password ""})


;; Wrapper for a transaction.
;; This automatically invokes the body again
;; as long as the database server asks the transaction to be retried.
(defmacro with-txn-retry
  [c conn & body]
  `(with-db-transaction [c conn]
     (loop []
       (let [res# (try (let [r# ~@body]
                         {:ok r#})
                       (catch org.postgresql.util.PSQLException e#
                         (if (re-find #"restart transaction" (.getMessage e#))
                           {:retry true}
                           (throw e#))))]
         (if (:retry res#) (recur) (:ok res#))
         ))))

;; The transaction we want to run.
(defn transferFunds
  [txn from to amount]

  ;; Check the current balance.
  (let [fromBalance (->> (query txn ["SELECT balance FROM accounts WHERE id = ?" from])
                         (mapv :balance)
                         (first))]
    (when (< fromBalance amount)
      (throw (Exception. "Insufficient funds"))))

  ;; Perform the transfer.
  (execute! txn [(str "UPDATE accounts SET balance = balance - " amount " WHERE id = " from)])
  (execute! txn [(str "UPDATE accounts SET balance = balance + " amount " WHERE id = " to)])
  )
      

(with-db-connection [conn db-spec]
  ;; Execute the transaction.
  (with-txn-retry [c conn]
     (transferFunds c 1 2 100))

  (println "Balances after transfer:")
  (->> (query conn ["SELECT id, balance FROM accounts"])
       (map println)
       (doall))
  )
  
  

