package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/lib/pq"
)

func transferFunds(tx *sql.Tx, from int, to int, amount float64) error {
	// Read the balance.
	var fromBalance float64
	if err := tx.QueryRow(
		"SELECT balance FROM accounts WHERE id = $1", from).Scan(&fromBalance); err != nil {
		return err
	}

	if fromBalance < amount {
		return fmt.Errorf("insufficient funds")
	}

	// Transfer $100 to the other account.
	if _, err := tx.Exec(
		"UPDATE accounts SET balance = balance - $1 WHERE id = $2", amount, from); err != nil {
		return err
	}
	if _, err := tx.Exec(
		"UPDATE accounts SET balance = balance + $1 WHERE id = $2", amount, to); err != nil {
		return err
	}
	return nil
}

// txnWrapper runs fn inside a transaction and retries it as needed.
func txnWrapper(db *sql.DB, database string, fn func(*sql.Tx) error) error {
	// Start a transaction.
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	// Specify that we intend to retry this txn in case of CockroachDB retriable
	// errors.
	if _, err := tx.Exec("SAVEPOINT cockroach_restart"); err != nil {
		return err
	}
	if _, err := tx.Exec("SET DATABASE = " + database); err != nil {
		return err
	}

	for {
		err = fn(tx)
		if err == nil {
			// RELEASE acts like COMMIT in CockroachDB. We use it since it gives us an
			// opportunity to react to retryable errors, whereas txn.Commit() doesn't.
			if _, err = tx.Exec("RELEASE SAVEPOINT cockroach_restart"); err == nil {
				err = tx.Commit()
				return err
			}
		}
		// We got an error; let's see if it's a retriable one and, if so, restart.
		pqErr, ok := err.(*pq.Error)
		retriable := ok && string(pqErr.Code) == "CR000"
		if !retriable {
			return err
		}
		if _, err := tx.Exec("ROLLBACK TO SAVEPOINT cockroach_restart"); err != nil {
			return err
		}
	}
}

func main() {
	db, err := sql.Open("postgres", "postgresql://root@localhost:26257?sslmode=disable")
	if err != nil {
		log.Fatal("error connection to the database: ", err)
	}

	// Create the database and the initial state of the accounts.
	if _, err := db.Exec(`
		CREATE DATABASE bank;
		CREATE TABLE IF NOT EXISTS bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
		INSERT INTO bank.accounts (id, balance) VALUES (1, DECIMAL '1000'), (2, DECIMAL '230.50');
	`); err != nil {
		log.Fatalf("error initializing database: %s", err)
	}

	// Run a transfer in a transaction.
	err = txnWrapper(db, "bank", func(tx *sql.Tx) error {
		return transferFunds(tx, 1 /* from acct# */, 2 /* to acct# */, 100 /* amount */)
	})
	if err == nil {
		fmt.Println("Success")
	} else {
		log.Fatalf("error: %s", err)
	}
}
