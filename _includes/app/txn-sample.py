# Import the driver.
import psycopg2

# Connect to the cluster.
conn = psycopg2.connect(database='bank', user='maxroach', host='localhost', port=26257)

# Ensure we are running with transactions.
conn.set_session(autocommit=False)

def onestmt(conn, sql):
    with conn.cursor() as cur:
        cur.execute(sql)

# Wrapper for a transaction.
# This automatically re-calls "op" with the open transaction as an argument
# as long as the database server asks for the transaction to be retried.
def txnWrapper(conn, op):
    with conn:
        onestmt(conn, "SAVEPOINT cockroach_restart")
        while True:
            try:
                # Attempt the work.
                op(conn)

                # If we reach this point, commit.
                onestmt(conn, "RELEASE SAVEPOINT cockroach_restart")
                break

            except psycopg2.DatabaseError as e:
                if e.pgcode != 'CR000':
                    # A non-retryable error; report this up the call stack.
                    raise e
                # Signal the database we'll retry.
                onestmt(conn, "ROLLBACK TO SAVEPOINT cockroach_restart")


# The transaction we want to run.
def transferFunds(txn, frm, to, amount):
    with txn.cursor() as cur:

        # Check the current balance.
        cur.execute("SELECT balance FROM accounts WHERE id = " + str(frm))
        fromBalance = cur.fetchone()[0]
        if fromBalance < amount:
            raise "Insufficient funds"

        # Perform the transfer.
        cur.execute("UPDATE accounts SET balance = balance - " + str(amount) +
                    " WHERE id = " + str(frm))
        cur.execute("UPDATE accounts SET balance = balance + " + str(amount) +
                    " WHERE id = " + str(to))


# Execute the transaction.
txnWrapper(conn, lambda conn: transferFunds(conn, 1, 2, 100))


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
