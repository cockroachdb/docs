# Import the driver.
import psycopg2

# Connect to the cluster.
conn = psycopg2.connect(database='bank', user='root', host='localhost', port=26257)

# Ensure we are running with transactions.
conn.set_session(autocommit=False)

def onestmt(conn, sql):
    with conn.cursor() as cur:
        cur.execute(sql)

# Insert some values.
with conn:
    # The with-block is executed within its own transaction.
    onestmt(conn, "INSERT INTO accounts (id, balance) VALUES (1, 100), (2, 230)")

# Wrapper for a transaction.
# This automatically re-calls "op" with the open transaction as argument
# as long as the database server asks the transaction to be retried.
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
                if 'restart transaction' not in str(e):
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

# Close communication with the database.
conn.close()
