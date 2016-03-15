---
title: Build a Test App
toc: false
---

This page demonstrates connecting to CockroachDB and executing a basic SQL scenario from various languages. It assumes that you have already [installed CockroachDB](install-cockroachdb.html), [started an insecure local cluster](start-a-local-cluster.html#insecure), and [installed the appropriate client driver](install-client-drivers.html).

## Go

## C/C++

## Python

~~~ py
# Import the driver.
import psycopg2

# Assuming a "bank" database already exists, connect to it.
conn = psycopg2.connect(database='bank', user='root', host='localhost', port=26257)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Make every statement have immediate effect.
conn.set_session(autocommit=True)

# Create an "accounts" table.
cur.execute("CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);")

# Insert two rows into the table.
cur.execute("INSERT INTO accounts (id, balance) VALUES (1, DECIMAL '1000'),(2, DECIMAL '230.50');")

# Update one row.
cur.execute("UPDATE accounts SET balance = balance - DECIMAL '5.50' WHERE id = 1;")

# Close communication with the database.
cur.close()
conn.close()
~~~

## Ruby

## Java

## JavaScript (Node.js)

## Closure

## PHP
