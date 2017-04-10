(ns test.util
  (:require   [clojure.java.jdbc :as j]
              [clojure.walk :as walk]))

(defn txn-restart-err-p
  "Takes an exception and return true if it is a CockroachDB retry error."
  [e]
  (when-let [m (.getMessage e)]
    (condp instance? e
      java.sql.BatchUpdateException
      (and (re-find #"getNextExc" m)
           (txn-restart-err-p (.getNextException e)))

      org.postgresql.util.PSQLException
      (or (re-find  #"restart transaction" m) (re-find #"force_retry" m))

      false
      )))

(defrecord Retry [bindings])

(defmacro with-retry
  "This macro wraps its body in a (loop [bindings] (try ...)).
  Provides a (retry & new bindings) form which is usable
  within (catch) blocks: when this form is returned by the body, the
  body will be retried with the new bindings. Borrowed from
  https://github.com/jepsen-io/jepsen/blob/master/jepsen/src/jepsen/util.clj."
  [initial-bindings & body]
  (assert (vector? initial-bindings))
  (assert (even? (count initial-bindings)))
  (let [bindings-count (/ (count initial-bindings) 2)
        body (walk/prewalk (fn [form]
                             (if (and (seq? form)
                                      (= 'retry (first form)))
                               (do (assert (= bindings-count
                                              (count (rest form))))
                                   `(Retry. [~@(rest form)]))
                               form))
                           body)
        retval (gensym 'retval)]
    `(loop [~@initial-bindings]
       (let [~retval (try ~@body)]
        (if (instance? Retry ~retval)
          (recur ~@(->> (range bindings-count)
                        (map (fn [i] `(nth (.bindings ~retval) ~i)))))
          ~retval))))
)

;; Wrapper for a transaction.
;; This automatically invokes the body again
;; as long as the database server asks the transaction to be retried.

;; Alternative 1: does not use CockroachDB savepoints
;; and priority ratcheting.

(defmacro with-txn-retry1
  "Wrap an evaluation within a naive retry block."
  [[txn c] & body]
  `  (with-retry [attempts# 30]
       (j/with-db-transaction [~txn ~c] ~@body)
       (catch java.sql.SQLException e#
         (if (and (pos? attempts#) (txn-restart-err-p e#))
           (do (~'retry (dec attempts#)))
           (throw e#)))
       ))

;; Alternative 2: does use CockroachDB savepoints
;; and priority ratcheting.

(defmacro with-txn-retry
  "Wrap an evaluation within a CockroachDB retry block."
  [[txn c] & body]
  `(j/with-db-transaction [~txn ~c]
     (loop []
       (j/execute! ~txn ["savepoint cockroach_restart"])
       (let [res# (try (let [r# (do ~@body)]
                         {:ok r#})
                       (catch java.sql.SQLException  e#
                         (if (txn-restart-err-p e#)
                           {:retry true}
                           (throw e#))))]
         (if (:retry res#)
           (do (j/execute! ~txn ["rollback to savepoint cockroach_restart"])
               (recur))
           (:ok res#))
         ))))

