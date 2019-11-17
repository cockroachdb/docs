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

(defn test-basic []
  ;; Connect to the cluster and run the code below with
  ;; the connection object bound to 'conn'.
  (j/with-db-connection [conn db-spec]

    ;; Insert two rows into the "accounts" table.
    (j/insert! conn :accounts {:id 1 :balance 1000})
    (j/insert! conn :accounts {:id 2 :balance 250})

    ;; Print out the balances.
    (println "Initial balances:")
    (->> (j/query conn ["SELECT id, balance FROM accounts"])
         (map println)
         doall)

    ))


(defn -main [& args]
  (test-basic))
