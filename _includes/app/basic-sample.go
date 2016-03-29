package main

import (
	"database/sql"
	"fmt"
	"log"
)

func main() {
	db, err := sql.Open("postgres", "postgresql://maxroach@localhost:26257/bank?sslmode=disable")
	if err != nil {
		log.Fatal("error connection to the database: ", err)
	}

	// Insert two rows into the "accounts" table.
	w.exec("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)")

	// Print out the balances.
	rows, err = db.Query("SELECT balance FROM accounts", from)
	if err != nil {
		log.Fatalf(err)
	}
	defer rows.Close()
	fmt.Println("Initial balances:")
	for rows.Next() {
		var id, balance int
		if err := rows.Scan(&id, &balance); err != nil {
			log.Fatalf(err)
		}
		fmt.Println("%d %d", id, balance)
	}
}
