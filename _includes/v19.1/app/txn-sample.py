# Import the driver.
import psycopg2
import psycopg2.errorcodes

# Connect to the cluster.
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

def onestmt(conn, sql):
    with conn.cursor() as cur:
        cur.execute(sql)


# Wrapper for a transaction.
# This automatically re-calls "op" with the open transaction as an argument
# as long as the database server asks for the transaction to be retried.
def run_transaction(conn, op):
    with conn:
        onestmt(conn, "SAVEPOINT cockroach_restart")
        while True:
            try:
                # Attempt the work.
                op(conn)

                # If we reach this point, commit.
                onestmt(conn, "RELEASE SAVEPOINT cockroach_restart")
                break

            except psycopg2.OperationalError as e:
                if e.pgcode != psycopg2.errorcodes.SERIALIZATION_FAILURE:
                    # A non-retryable error; report this up the call stack.
                    raise e
                # Signal the database that we'll retry.
                onestmt(conn, "ROLLBACK TO SAVEPOINT cockroach_restart")


# The transaction we want to run.
def transfer_funds(txn, frm, to, amount):
    with txn.cursor() as cur:

        # Check the current balance.
        cur.execute("SELECT balance FROM accounts WHERE id = " + str(frm))
        from_balance = cur.fetchone()[0]
        if from_balance < amount:
            raise "Insufficient funds"

        # Perform the transfer.
        cur.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s",
                    (amount, frm))
        cur.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s",
                    (amount, to))


# Execute the transaction.
run_transaction(conn, lambda conn: transfer_funds(conn, 1, 2, 100))


with conn:
    with conn.cursor() as cur:
        # Check account balances.
        cur.execute("SELECT id, balance FROM accounts")
        rows = cur.fetchall()
        print('Balances after transfer:')
        for row in rows:
            print([str(cell) for cell in row])

# Close communication with the database.
conn.close()
