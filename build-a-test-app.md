---
title: Build a Test App
toc: false
---

## Go

## C/C++

## Python

~~~ python
# Import the driver.
import psycopg2

# Assuming a "bank" database already exists, connect to it.
conn = psycopg2.connect(database='bank', user='root', host='ROACHs-MacBook-Pro.local', port=26257)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Create an "accounts" table.
cur.execute("CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);")

# Insert two rows into the table.
cur.execute("INSERT INTO accounts (id, balance) VALUES (1, DECIMAL '1000'),(2, DECIMAL '230.50');")

# Update one row.
cur.execute("UPDATE accounts SET balance = balance - DECIMAL '5.50' WHERE id = 1;")

# Make the changes to the database persistent.
conn.commit()

# Close communication with the database.
cur.close()
conn.close()
~~~

## Ruby

## Java

## JavaScript (Node.js)

## Closure

## PHP
