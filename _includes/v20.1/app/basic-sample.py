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


def print_balances(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT id, balance FROM accounts")
        logging.debug("print_balances(): status message: {}".format(cur.statusmessage))
        rows = cur.fetchall()
        conn.commit()
        print("Balances at {}".format(time.asctime()))
        for row in rows:
            print([str(cell) for cell in row])


def delete_accounts(conn):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM bank.accounts")
        logging.debug("delete_accounts(): status message: {}".format(cur.statusmessage))
    conn.commit()


# Wrapper for a transaction.
# This automatically re-calls "op" with the open transaction as an argument
# as long as the database server asks for the transaction to be retried.
def run_transaction(conn, op):
    retries = 0
    max_retries = 3
    with conn:
        while True:
            retries +=1
            if retries == max_retries:
                err_msg = "Transaction did not succeed after {} retries".format(max_retries)
                raise ValueError(err_msg)

            try:
                op(conn)

                # If we reach this point, we were able to commit, so we break
                # from the retry loop.
                break
            except psycopg2.Error as e:
                logging.debug("e.pgcode: {}".format(e.pgcode))
                if e.pgcode == '40001':
                    # This is a retry error, so we roll back the current
                    # transaction and sleep for a bit before retrying. The
                    # sleep time increases for each failed transaction.
                    conn.rollback()
                    logging.debug("EXECUTE SERIALIZATION_FAILURE BRANCH")
                    sleep_ms = (2**retries) * 0.1 * (random.random() + 0.5)
                    logging.debug("Sleeping {} seconds".format(sleep_ms))
                    time.sleep(sleep_ms)
                    continue
                else:
                    logging.debug("EXECUTE NON-SERIALIZATION_FAILURE BRANCH")
                    raise e


# This function is used to test the transaction retry logic.  It can be deleted
# from production code.
def test_retry_loop(conn):
    with conn.cursor() as cur:
        # The first statement in a transaction can be retried transparently on
        # the server, so we need to add a placeholder statement so that our
        # force_retry() statement isn't the first one.
        cur.execute('SELECT now()')
        cur.execute("SELECT crdb_internal.force_retry('1s'::INTERVAL)")
    logging.debug("test_retry_loop(): status message: {}".format(cur.statusmessage))


def transfer_funds(conn, frm, to, amount):
    with conn.cursor() as cur:

        # Check the current balance.
        cur.execute("SELECT balance FROM accounts WHERE id = " + str(frm))
        from_balance = cur.fetchone()[0]
        if from_balance < amount:
            err_msg = "Insufficient funds in account {}: have {}, need {}".format(frm, from_balance, amount)
            raise RuntimeError(err_msg)

        # Perform the transfer.
        cur.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s",
                    (amount, frm))
        cur.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s",
                    (amount, to))
    conn.commit()
    logging.debug("transfer_funds(): status message: {}".format(cur.statusmessage))


def main():

    conn = psycopg2.connect(
        database='bank',
        user='maxroach',
        sslmode='require',
        sslrootcert='certs/ca.crt',
        sslkey='certs/client.maxroach.key',
        sslcert='certs/client.maxroach.crt',
        port=26257,
        host='localhost'
    )

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
        run_transaction(conn, lambda conn: transfer_funds(conn, fromId, toId, amount))

        # The function below is used to test the transaction retry logic.  It
        # can be deleted from production code.
        # run_transaction(conn, lambda conn: test_retry_loop(conn))
    except ValueError as ve:
        # Below, we print the error and continue on so this example is easy to
        # run (and run, and run...).  In real code you should handle this error
        # and any others thrown by the database interaction.
        logging.debug("run_transaction(conn, op) failed: {}".format(ve))
        pass

    print_balances(conn)

    delete_accounts(conn)

    # Close communication with the database.
    conn.close()


if __name__ == '__main__':
    main()
