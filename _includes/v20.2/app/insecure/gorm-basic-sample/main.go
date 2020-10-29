package main

import (
	"context"
	"fmt"
	"log"
	"time"

	// Import GORM-related packages.
	"github.com/cockroachdb/cockroach-go/crdb/crdbgorm"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// Account is our model, which corresponds to the "accounts" database
// table.
type Account struct {
	ID      int `gorm:"primary_key"`
	Balance int
}

// Functions of type `txnFunc` are passed as arguments to the
// `ExecuteTx` wrapper that handles transaction retries
type txnFunc func(*gorm.DB) error

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
	// in `crdbgorm.ExecuteTx`, a helper function for GORM which
	// implements a retry loop
	if err := crdbgorm.ExecuteTx(context.Background(), db, nil,
		func(*gorm.DB) error {
			return transferFunds(db, fromID, toID, amount)
		},
	); err != nil {
		// For information and reference documentation, see:
		//   https://www.cockroachlabs.com/docs/stable/error-handling-and-troubleshooting.html
		fmt.Println(err)
	}

	// Print balances after transfer to ensure that it worked.
	printBalances(db)

	// Delete accounts so we can start fresh when we want to run this
	// program again.
	deleteAccounts(db)
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
