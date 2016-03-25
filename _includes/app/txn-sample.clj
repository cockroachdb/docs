  ;; Start a transaction. 
  (with-db-transaction [t conn]

    ;; Transfer 100 from account 1 to account 2.
    (let [balance (->> (query t ["SELECT balance FROM accounts WHERE id = 1"] :row-fn :balance)
                       (first))]
      (when (> balance 100)
        ;; Subtract 100 from account 1.
        (execute! t ["UPDATE accounts SET balance = balance - DECIMAL '100' WHERE id = 1"])
        ;; Add 100 to account 2.
        (execute! t ["UPDATE accounts SET balance = balance + DECIMAL '100' WHERE id = 2"])
        )))

  ;; Check account balances after the transaction.
  (->> (query conn ["SELECT id, balance FROM accounts"])
       (map println)
       doall)

