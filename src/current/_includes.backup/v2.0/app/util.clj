(ns test.util
  (:require [clojure.java.jdbc :as j]
            [clojure.walk :as walk]))

(defn txn-restart-err?
  "Takes an exception and returns true if it is a CockroachDB retry error."
  [e]
  (when-let [m (.getMessage e)]
    (condp instance? e
      java.sql.BatchUpdateException
      (and (re-find #"getNextExc" m)
           (txn-restart-err? (.getNextException e)))

      org.postgresql.util.PSQLException
      (= (.getSQLState e) "40001") ; 40001 is the code returned by CockroachDB retry errors.

      false)))

;; Wrapper for a transaction.
;; This automatically invokes the body again as long as the database server
;; asks the transaction to be retried.

(defmacro with-txn-retry
  "Wrap an evaluation within a CockroachDB retry block."
  [[txn c] & body]
  `(j/with-db-transaction [~txn ~c]
     (loop []
       (j/execute! ~txn ["savepoint cockroach_restart"])
       (let [res# (try (let [r# (do ~@body)]
                         {:ok r#})
                       (catch java.sql.SQLException  e#
                         (if (txn-restart-err? e#)
                           {:retry true}
                           (throw e#))))]
         (if (:retry res#)
           (do (j/execute! ~txn ["rollback to savepoint cockroach_restart"])
               (recur))
           (:ok res#))))))
