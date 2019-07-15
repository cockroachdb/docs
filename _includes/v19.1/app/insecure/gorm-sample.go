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
	// See implementation below in `transferFunds`.
	"github.com/lib/pq"
)

// Account is our model, which corresponds to the "accounts" database
// table.
type Account struct {
	ID      int `gorm:"primary_key"`
	Balance int
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
	db.Create(&Account{ID: 1, Balance: 1000})
	db.Create(&Account{ID: 2, Balance: 250})

	// The sequence of steps in this section is:
	// 1. Print account balances.
	// 2. Set up some Accounts and transfer funds between them.
	// 3. Print account balances again to verify the transfer occurred.

	// Print balances before transfer.
	printBalances(db)

	var amount = 100
	var fromAccount Account
	var toAccount Account

	db.First(&fromAccount, 1)
	db.First(&toAccount, 2)

	// Transfer funds between accounts.  To handle any possible
	// transaction retry errors, we add a retry loop with exponential
	// backoff to the transfer logic (see implementation below).
	if err := transferFunds(db, fromAccount, toAccount, amount); err != nil {
		// If the error is returned, it's either:
		//   1. Not a transaction retry error, i.e., some other kind of
		//   database error that you should handle here.
		//   2. A transaction retry error that has occurred more than N
		//   times (defined by the `maxRetries` variable inside
		//   `transferFunds`), in which case you will need to figure out
		//   why your database access is resulting in so much contention
		//   (see 'Understanding and avoiding transaction contention':
		//   https://www.cockroachlabs.com/docs/stable/performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
		fmt.Println(err)
	}

	// Print balances after transfer to ensure that it worked.
	printBalances(db)

	// Delete accounts so we can start fresh when we want to run this
	// program again.
	deleteAccounts(db)
}

func transferFunds(db *gorm.DB, fromAccount Account, toAccount Account, amount int) error {
	if fromAccount.Balance < amount {
		return fmt.Errorf("account %d balance %d is lower than transfer amount %d", fromAccount.ID, fromAccount.Balance, amount)
	}

	var maxRetries = 3
	for retries := 0; retries <= maxRetries; retries++ {
		if retries == maxRetries {
			return fmt.Errorf("hit max of %d retries, aborting", retries)
		}

		db.Exec("BEGIN")
		if err := db.Exec(
			`UPSERT INTO accounts (id, balance) VALUES
               (?, ((SELECT balance FROM accounts WHERE id = ?) - ?)),
		       (?, ((SELECT balance FROM accounts WHERE id = ?) + ?))`,
			fromAccount.ID, fromAccount.ID, amount,
			toAccount.ID, toAccount.ID, amount).Error; err != nil {

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
				db.Exec("ROLLBACK")
				var sleepMs = math.Pow(2, float64(retries)) * 100 * (rand.Float64() + 0.5)
				time.Sleep(time.Millisecond * time.Duration(sleepMs))
			} else {
				return err
			}
		} else {
			// Happy case.  All went well, so we commit and break out
			// of the retry loop.
			db.Exec("COMMIT")
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
