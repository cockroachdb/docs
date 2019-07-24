#!/usr/bin/env python3

import psycopg2
import psycopg2.errorcodes
import time
import logging
import random


def create_accounts(conn):
    with conn.cursor() as cur:
        cur.execute('CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)')
        cur.execute('UPSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)')
        logging.debug("create_accounts(): status message: {}".format(cur.statusmessage))
        conn.commit()
        cur.close()


def print_balances(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT id, balance FROM accounts")
        logging.debug("print_balances(): status message: {}".format(cur.statusmessage))
        conn.commit()
        rows = cur.fetchall()
        cur.close()
        print("Balances at {}".format(time.asctime()))
        for row in rows:
            print([str(cell) for cell in row])


def delete_accounts(conn):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM bank.accounts")
        logging.debug("delete_accounts(): status message: {}".format(cur.statusmessage))
        conn.commit()


def transfer_funds(conn, frm, to, amount):

    retries = 0
    max_retries = 3

    with conn.cursor() as cur:

        # The code below handles the actual funds transfer.  To handle any
        # possible transaction retry errors, we wrap the transaction logic in a
        # retry loop with exponential backoff (see implementation below).
        while True:
            retries += 1
            if retries == max_retries:
                raise ValueError("Transaction did not succeed after 3 retries")

            try:
                # The below SQL statements are used to test the transaction
                # retry logic.  This comment block can be deleted from
                # production code.
                # cur.execute('SELECT now()')
                # cur.execute("SELECT crdb_internal.force_retry('1s'::INTERVAL);")

                cur.execute("SELECT balance FROM accounts WHERE id = " + str(frm))
                logging.debug("transfer_funds(): status message 'SELECT balance ...': {}".format(cur.statusmessage))
                from_balance = cur.fetchone()[0]
                if from_balance < amount:
                    raise RuntimeError("Insufficient funds in account {}: have {}, need {}".format(frm, from_balance, amount))

                cur.execute('''
                            UPSERT INTO accounts (id, balance)
                            VALUES
                            (%s, ((SELECT balance FROM accounts WHERE id = %s) - %s)),
                            (%s, ((SELECT balance FROM accounts WHERE id = %s) + %s))''',
                            (frm, frm, amount, to, to, amount))

                conn.commit()
                # Important: As soon as our funds transfer succeeds and is
                # committed, we break out of the retry loop.
                break
            except psycopg2.Error as e:
                logging.debug("e.pgcode: {}".format(e.pgcode))
                if e.pgcode == '40001':
                    cur.rollback()
                    logging.debug("EXECUTE SERIALIZATION_FAILURE BRANCH")

                    # This is a retry error, so we roll back the current
                    # transaction and sleep for a bit before retrying. The
                    # sleep time increases for each failed transaction.
                    sleep_ms = (2**retries) * 0.1 * (random.random() + 0.5)
                    logging.debug("Sleeping {} seconds".format(sleep_ms))
                    time.sleep(sleep_ms)
                    continue
                else:
                    logging.debug("EXECUTE NON-SERIALIZATION_FAILURE BRANCH")
                    raise e


def main():

    dsn = 'postgresql://maxroach@localhost:26257/bank?sslmode=disable'
    conn = psycopg2.connect(dsn)

    # Uncomment the below to turn on logging to the console.  This was useful
    # when testing transaction retry handling.  It is not necessary for
    # production code.
    # log_level = getattr(logging, 'DEBUG', None)
    # logging.basicConfig(level=log_level)

    create_accounts(conn)

    print_balances(conn)

    amount = 100
    fromId = 1
    toId = 2

    try:
        transfer_funds(conn, fromId, toId, amount)
    except ValueError as ve:
        # Below, we print the error and continue on so this example is easy to
        # run (and run, and run...).  In real code you should handle this error
        # and any others thrown by the database interaction.
        logging.debug("transfer_funds() failed: {}".format(ve))
        pass

    print_balances(conn)

    delete_accounts(conn)

    # Close communication with the database.
    conn.close()


if __name__ == '__main__':
    main()
