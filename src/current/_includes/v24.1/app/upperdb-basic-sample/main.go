package main

import (
	"fmt"
	"log"
	"time"

	"github.com/upper/db/v4"
	"github.com/upper/db/v4/adapter/cockroachdb"
)

// The settings variable stores connection details.
var settings = cockroachdb.ConnectionURL{
	Host:     "localhost",
	Database: "bank",
	User:     "maxroach",
	Options: map[string]string{
		// Secure node.
		 "sslrootcert": "certs/ca.crt",
		 "sslkey":      "certs/client.maxroach.key",
		 "sslcert":     "certs/client.maxroach.crt",
	},
}

// Accounts is a handy way to represent a collection.
func Accounts(sess db.Session) db.Store {
	return sess.Collection("accounts")
}

// Account is used to represent a single record in the "accounts" table.
type Account struct {
	ID      uint64 `db:"id,omitempty"`
	Balance int64  `db:"balance"`
}

// Collection is required in order to create a relation between the Account
// struct and the "accounts" table.
func (a *Account) Store(sess db.Session) db.Store {
	return Accounts(sess)
}

// createTables creates all the tables that are neccessary to run this example.
func createTables(sess db.Session) error {
	_, err := sess.SQL().Exec(`
		CREATE TABLE IF NOT EXISTS accounts (
			ID SERIAL PRIMARY KEY,
			balance INT
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

// crdbForceRetry can be used to simulate a transaction error and
// demonstrate upper/db's ability to retry the transaction automatically.
//
// By default, upper/db will retry the transaction five times, if you want
// to modify this number use: sess.SetMaxTransactionRetries(n).
//
// This is only used for demonstration purposes and not intended
// for production code.
func crdbForceRetry(sess db.Session) error {
	var err error

	// The first statement in a transaction can be retried transparently on the
	// server, so we need to add a placeholder statement so that our
	// force_retry() statement isn't the first one.
	_, err = sess.SQL().Exec(`SELECT 1`)
	if err != nil {
		return err
	}

	// If force_retry is called during the specified interval from the beginning
	// of the transaction it returns a retryable error. If not, 0 is returned
	// instead of an error.
	_, err = sess.SQL().Exec(`SELECT crdb_internal.force_retry('1s'::INTERVAL)`)
	if err != nil {
		return err
	}

	return nil
}

func main() {
	// Connect to the local CockroachDB node.
	sess, err := cockroachdb.Open(settings)
	if err != nil {
		log.Fatal("cockroachdb.Open: ", err)
	}
	defer sess.Close()

	// Adjust this number to fit your specific needs (set to 5, by default)
	// sess.SetMaxTransactionRetries(10)

	// Create the "accounts" table
	createTables(sess)

	// Delete all the previous items in the "accounts" table.
	err = Accounts(sess).Truncate()
	if err != nil {
		log.Fatal("Truncate: ", err)
	}

	// Create a new account with a balance of 1000.
	account1 := Account{Balance: 1000}
	err = Accounts(sess).InsertReturning(&account1)
	if err != nil {
		log.Fatal("sess.Save: ", err)
	}

	// Create a new account with a balance of 250.
	account2 := Account{Balance: 250}
	err = Accounts(sess).InsertReturning(&account2)
	if err != nil {
		log.Fatal("sess.Save: ", err)
	}

	// Printing records
	printRecords(sess)

	// Change the balance of the first account.
	account1.Balance = 500
	err = sess.Save(&account1)
	if err != nil {
		log.Fatal("sess.Save: ", err)
	}

	// Change the balance of the second account.
	account2.Balance = 999
	err = sess.Save(&account2)
	if err != nil {
		log.Fatal("sess.Save: ", err)
	}

	// Printing records
	printRecords(sess)

	// Delete the first record.
	err = sess.Delete(&account1)
	if err != nil {
		log.Fatal("Delete: ", err)
	}

	startTime := time.Now()

	// Add a couple of new records within a transaction.
	err = sess.Tx(func(tx db.Session) error {
		var err error

		if err = tx.Save(&Account{Balance: 887}); err != nil {
			return err
		}

		if time.Now().Sub(startTime) < time.Second*1 {
			// Will fail continuously for 2 seconds.
			if err = crdbForceRetry(tx); err != nil {
				return err
			}
		}

		if err = tx.Save(&Account{Balance: 342}); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		log.Fatal("Could not commit transaction: ", err)
	}

	// Printing records
	printRecords(sess)
}

func printRecords(sess db.Session) {
	accounts := []Account{}
	err := Accounts(sess).Find().All(&accounts)
	if err != nil {
		log.Fatal("Find: ", err)
	}
	log.Printf("Balances:")
	for i := range accounts {
		fmt.Printf("\taccounts[%d]: %d\n", accounts[i].ID, accounts[i].Balance)
	}
}
