# Import the driver.
import psycopg2

# Connect to the "bank" database.
conn = psycopg2.connect(database='bank', user='maxroach', host='localhost', port=26257)

# Make each statement commit immediately.
conn.set_session(autocommit=True)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Create the "accounts" table.
cur.execute("CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)")

# Insert two rows into the "accounts" table.
cur.execute("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)")

# Print out the balances.
cur.execute("SELECT id, balance FROM accounts")
rows = cur.fetchall()
print('Initial balances:')
for row in rows:
    print([str(cell) for cell in row])

# Close the database connection.
cur.close()
conn.close()
