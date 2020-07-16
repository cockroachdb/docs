package main

import (
	"context"
	"fmt"
	"log"

	"github.com/cockroachdb/cockroach-go/crdb/crdbpgx"
	"github.com/jackc/pgx/v4"
)

func transferFunds(ctx context.Context, tx pgx.Tx, from int, to int, amount int) error {
	// Read the balance.
	var fromBalance int
	if err := tx.QueryRow(ctx,
		"SELECT balance FROM accounts WHERE id = $1", from).Scan(&fromBalance); err != nil {
		return err
	}

	if fromBalance < amount {
		return fmt.Errorf("insufficient funds")
	}

	// Perform the transfer.
	if _, err := tx.Exec(ctx,
		"UPDATE accounts SET balance = balance - $1 WHERE id = $2", amount, from); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx,
		"UPDATE accounts SET balance = balance + $1 WHERE id = $2", amount, to); err != nil {
		return err
	}
	return nil
}

func main() {
	config, err := pgx.ParseConfig("postgresql://maxroach@localhost:26257/bank?sslmode=disable")
	if err != nil {
		log.Fatal("error configuring the database: ", err)
	}

	// Connect to the "bank" database.
	conn, err := pgx.ConnectConfig(context.Background(), config)
	if err != nil {
		log.Fatal("error connecting to the database: ", err)
	}
	defer conn.Close(context.Background())

	// Run a transfer in a transaction.
	err = crdbpgx.ExecuteTx(context.Background(), conn, pgx.TxOptions{}, func(tx pgx.Tx) error {
		return transferFunds(context.Background(), tx, 1 /* from acct# */, 2 /* to acct# */, 100 /* amount */)
	})
	if err == nil {
		fmt.Println("Success")
	} else {
		log.Fatal("error: ", err)
	}
}
