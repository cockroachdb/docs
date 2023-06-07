package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v4"
)

func main() {
	config, err := pgx.ParseConfig("postgresql://maxroach@localhost:26257/bank?sslmode=require&sslrootcert=certs/ca.crt&sslkey=certs/client.maxroach.key&sslcert=certs/client.maxroach.crt")
	if err != nil {
		log.Fatal("error configuring the database: ", err)
	}

	config.TLSConfig.ServerName = "localhost"

	// Connect to the "bank" database.
	conn, err := pgx.ConnectConfig(context.Background(), config)
	if err != nil {
		log.Fatal("error connecting to the database: ", err)
	}
	defer conn.Close(context.Background())

	// Create the "accounts" table.
	if _, err := conn.Exec(context.Background(),
		"CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)"); err != nil {
		log.Fatal(err)
	}

	// Insert two rows into the "accounts" table.
	if _, err := conn.Exec(context.Background(),
		"INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)"); err != nil {
		log.Fatal(err)
	}

	// Print out the balances.
	rows, err := conn.Query(context.Background(), "SELECT id, balance FROM accounts")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	fmt.Println("Initial balances:")
	for rows.Next() {
		var id, balance int
		if err := rows.Scan(&id, &balance); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%d %d\n", id, balance)
	}
}
