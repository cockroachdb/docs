package main

import (
	"fmt"
	"log"
	"math"
	"math/rand"
	"time"

	// Import GORM-related packages.
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"

	// Necessary in order to check for transaction retry error codes.
	"github.com/lib/pq"
)

// Account is our model, which corresponds to the "accounts" database
// table.
type Account struct {
	ID      int `gorm:"primary_key"`
	Balance int
}

// Functions of type `txnFunc` are passed as arguments to our
// `runTransaction` wrapper that handles transaction retries for us
// (see implementation below).
type txnFunc func(*gorm.DB) error

// This function is used for testing the transaction retry loop.  It
// can be deleted from production code.
var forceRetryLoop txnFunc = func(db *gorm.DB) error {

	// The first statement in a transaction can be retried transparently
	// on the server, so we need to add a placeholder statement so that our
	// force_retry statement isn't the first one.
	if err := db.Exec("SELECT now()").Error; err != nil {
		return err
	}
	// Used to force a transaction retry.  Can only be run as the
	// 'root' user.
	if err := db.Exec("SELECT crdb_internal.force_retry('1s'::INTERVAL)").Error; err != nil {
		return err
	}
	return nil
}

func transferFunds(db *gorm.DB, fromID int, toID int, amount int) error {
	var fromAccount Account
	var toAccount Account

	db.First(&fromAccount, fromID)
	db.First(&toAccount, toID)

	if fromAccount.Balance < amount {
		return fmt.Errorf("account %d balance %d is lower than transfer amount %d", fromAccount.ID, fromAccount.Balance, amount)
	}

	fromAccount.Balance -= amount
	toAccount.Balance += amount

	if err := db.Save(&fromAccount).Error; err != nil {
		return err
	}
	if err := db.Save(&toAccount).Error; err != nil {
		return err
	}
	return nil
}

func main() {
	// Connect to the "bank" database as the "maxroach" user.
	const addr = "postgresql://maxroach@localhost:26257/bank?sslmode=disable"
	db, err := gorm.Open("postgres", addr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Set to `true` and GORM will print out all DB queries.
	db.LogMode(false)

	// Automatically create the "accounts" table based on the Account
	// model.
	db.AutoMigrate(&Account{})

	// Insert two rows into the "accounts" table.
	var fromID = 1
	var toID = 2
	db.Create(&Account{ID: fromID, Balance: 1000})
	db.Create(&Account{ID: toID, Balance: 250})

	// The sequence of steps in this section is:
	// 1. Print account balances.
	// 2. Set up some Accounts and transfer funds between them inside
	// a transaction.
	// 3. Print account balances again to verify the transfer occurred.

	// Print balances before transfer.
	printBalances(db)

	// The amount to be transferred between the accounts.
	var amount = 100

	// Transfer funds between accounts.  To handle potential
	// transaction retry errors, we wrap the call to `transferFunds`
	// in `runTransaction`, a wrapper which implements a retry loop
	// with exponential backoff around our access to the database (see
	// the implementation for details).
	if err := runTransaction(db,
		func(*gorm.DB) error {
			return transferFunds(db, fromID, toID, amount)
		},
	); err != nil {
		// If the error is returned, it's either:
		//   1. Not a transaction retry error, i.e., some other kind
		//   of database error that you should handle here.
		//   2. A transaction retry error that has occurred more than
		//   N times (defined by the `maxRetries` variable inside
		//   `runTransaction`), in which case you will need to figure
		//   out why your database access is resulting in so much
		//   contention (see 'Understanding and avoiding transaction
		//   contention':
		//   https://www.cockroachlabs.com/docs/stable/performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
		fmt.Println(err)
	}

	// Print balances after transfer to ensure that it worked.
	printBalances(db)

	// Delete accounts so we can start fresh when we want to run this
	// program again.
	deleteAccounts(db)
}

// Wrapper for a transaction.  This automatically re-calls `fn` with
// the open transaction as an argument as long as the database server
// asks for the transaction to be retried.
func runTransaction(db *gorm.DB, fn txnFunc) error {
	var maxRetries = 3
	for retries := 0; retries <= maxRetries; retries++ {
		if retries == maxRetries {
			return fmt.Errorf("hit max of %d retries, aborting", retries)
		}
		txn := db.Begin()
		if err := fn(txn); err != nil {
			// We need to cast GORM's db.Error to *pq.Error so we can
			// detect the Postgres transaction retry error code and
			// handle retries appropriately.
			pqErr := err.(*pq.Error)
			if pqErr.Code == "40001" {
				// Since this is a transaction retry error, we
				// ROLLBACK the transaction and sleep a little before
				// trying again.  Each time through the loop we sleep
				// for a little longer than the last time
				// (A.K.A. exponential backoff).
				txn.Rollback()
				var sleepMs = math.Pow(2, float64(retries)) * 100 * (rand.Float64() + 0.5)
				fmt.Printf("Hit 40001 transaction retry error, sleeping %s milliseconds\n", sleepMs)
				time.Sleep(time.Millisecond * time.Duration(sleepMs))
			} else {
				// If it's not a retry error, it's some other sort of
				// DB interaction error that needs to be handled by
				// the caller.
				return err
			}
		} else {
			// All went well, so we try to commit and break out of the
			// retry loop if possible.
			if err := txn.Commit().Error; err != nil {
				pqErr := err.(*pq.Error)
				if pqErr.Code == "40001" {
					// However, our attempt to COMMIT could also
					// result in a retry error, in which case we
					// continue back through the loop and try again.
					continue
				} else {
					// If it's not a retry error, it's some other sort
					// of DB interaction error that needs to be
					// handled by the caller.
					return err
				}
			}
			break
		}
	}
	return nil
}

func printBalances(db *gorm.DB) {
	var accounts []Account
	db.Find(&accounts)
	fmt.Printf("Balance at '%s':\n", time.Now())
	for _, account := range accounts {
		fmt.Printf("%d %d\n", account.ID, account.Balance)
	}
}

func deleteAccounts(db *gorm.DB) error {
	// Used to tear down the accounts table so we can re-run this
	// program.
	err := db.Exec("DELETE from accounts where ID > 0").Error
	if err != nil {
		return err
	}
	return nil
}
