# Import the driver.
import psycopg2

# Connect to the cluster.
conn = psycopg2.connect(user='root', host='localhost', port=26257)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Make each statement commit immediately, except where autocommit=False.
conn.set_session(autocommit=True)

# Create a "bank" database and set it as default.
cur.execute("CREATE DATABASE bank")
cur.execute("SET DATABASE = bank")

# Create an "accounts" table in the "bank" database.
cur.execute("CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL)")

# Insert two rows into the table.
cur.execute("INSERT INTO accounts (id, balance) VALUES (1, DECIMAL '1000'), (2, DECIMAL '230.50')")

# Check account balances.
cur.execute("SELECT id, balance FROM accounts")
rows = cur.fetchall()
print('Account balances before transaction:')
for row in rows:
    print([str(cell) for cell in row])

# Start a transaction.
conn.set_session(autocommit=False)

# Transfer $100 from account 1 to account 2.
cur.execute("SELECT balance FROM accounts WHERE id = 1")
rows = cur.fetchall()
for row in rows:
    if row[0] > 100:
        # Subtract $100 from account 1.
        cur.execute("UPDATE accounts SET balance = balance - DECIMAL '100' WHERE id = 1")
        # Add $100 to account 2.
        cur.execute("Update accounts SET balance = balance + DECIMAL '100' WHERE id = 2")

# Finish the transaction.
conn.commit()

# Check account balances after the transaction.
conn.set_session(autocommit=True)
cur.execute("SELECT id, balance FROM accounts")
rows = cur.fetchall()
print('Account balances after transaction:')
for row in rows:
    print([str(cell) for cell in row])

# Close communication with the database.
cur.close()
conn.close()