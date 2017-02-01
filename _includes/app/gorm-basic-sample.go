package main

import (
	"fmt"
	"log"

	// Import GORM-related packages.
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// Account is our model, which corresponds to a database table.
type Account struct {
	ID      int `gorm:"primary_key"`
	Balance int
}

func main() {
	// Connect to CockroachDB.
	const addr = "postgresql://maxroach@localhost:26257/bank?sslmode=disable"
	db, err := gorm.Open("postgres", addr)
	defer db.Close()
	if err != nil {
		log.Fatal(err)
	}

	// Automatically create the table "accounts" based on the Account model.
	db.AutoMigrate(&Account{})

	// Insert two rows into the "accounts" table.
	db.Create(&Account{ID: 1, Balance: 1000})
	db.Create(&Account{ID: 2, Balance: 250})

	// Print out the balances.
	var accounts []Account
	db.Find(&accounts)
	fmt.Println("Initial balances:")
	for _, account := range accounts {
		fmt.Printf("%d %d\n", account.ID, account.Balance)
	}
}
