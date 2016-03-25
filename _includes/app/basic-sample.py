# Import the driver.
import psycopg2

# Connect to the cluster.
conn = psycopg2.connect(database='bank', user='root', host='localhost', port=26257)

# Make each statement commit immediately.
conn.set_session(autocommit=True)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Insert two rows into the table.
cur.execute("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)")

# Check account balances.
cur.execute("SELECT id, balance FROM accounts")
rows = cur.fetchall()
print('Account balances:')
for row in rows:
    print([str(cell) for cell in row])

# Close communication with the database.
cur.close()
conn.close()
