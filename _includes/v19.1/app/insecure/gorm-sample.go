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
)

// Account is our model, which corresponds to the "accounts" database table.
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

	db.LogMode(false)

	// Automatically create the "accounts" table based on the Account
	// model.
	db.AutoMigrate(&Account{})

	// Insert two rows into the "accounts" table.
	db.Create(&Account{ID: 1, Balance: 1000})
	db.Create(&Account{ID: 2, Balance: 250})

	printBalances(db)

	// Transfer funds between accounts. To handle any possible
	// transaction retry errors, we add a retry loop with exponential
	// backoff to the transfer logic (see below).

	var maxRetries = 3
	var amount = 100

	var fromAccount Account
	var toAccount Account

	db.First(&fromAccount, 1)
	db.First(&toAccount, 2)

retryLoop:
	for retries := 0; retries <= maxRetries; retries++ {

		if retries == maxRetries {
			fmt.Errorf("hit max of %d retries, aborting", retries)
			break retryLoop
		}

		err := transferFunds(db, fromAccount, toAccount, amount)

		if err != nil {
			// If there's an error, we try again after sleeping an
			// increased amount of time, a.k.a. exponential backoff.
			fmt.Println("error: ", err)
			r := rand.New(rand.NewSource(time.Now().UnixNano()))
			var sleepMs = ((int(math.Pow(2, float64(retries))) * 1000) + r.Intn(100-1) + 1)
			fmt.Printf("sleepMs = %s\n", sleepMs)
			time.Sleep(time.Millisecond * time.Duration(sleepMs))
		} else {
			break retryLoop
		}
	}

	// Print balances after transfer to ensure that it worked.
	printBalances(db)

	// Delete accounts so we can start fresh when we want to run this
	// program again.
	deleteAccounts(db)
}

func transferFunds(db *gorm.DB, fromAccount Account, toAccount Account, amount int) error {
	if fromAccount.Balance < amount {
		err := fmt.Errorf("account %d balance %d is lower than transfer amount %d", fromAccount.ID, fromAccount.Balance, amount)
		return err
	}

	// We would like to check for the 40001 error code below, but it
	// isn't clear how to get at it from GORM. According to
	// https://github.com/jinzhu/gorm/issues/17, GORM does not expose
	// the PG error codes. Therefore, we retry on any error.

	db.Exec("BEGIN")
	if err := db.Exec(
		"UPSERT INTO accounts (id, balance) VALUES (?, ?), (?, ?)", fromAccount.ID, fromAccount.Balance-amount, toAccount.ID, toAccount.Balance+amount).Error; err != nil {
		db.Exec("ROLLBACK")
		return db.Error
	} else {
		db.Exec("COMMIT")
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
	} else {
		return nil
	}
}
