---
title: SQL Basics
toc: true
sidebar_data: sidebar-data-training.json
---

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before you begin

Make sure you have already completed [Data Import](data-import.html).

## Step 1. Start a SQL shell

Use the [`cockroach sql`](../cockroach-start.html) command to open the built-in SQL client:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26257
~~~

## Step 2. Create a database and table

In this training, you'll create a bank with customers and accounts. First, you'll need to [create a database](../create-database.html) on your Cockroach cluster to store this information.

1. In the built-in SQL client, create a database:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    Databases do not directly store any data; you need to describe the
    shape of the data you intend to store by [creating tables](../create-table.html) within your database.

2. Create a table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.customers (
       customer_id INTEGER PRIMARY KEY,
       name STRING,
       address STRING
    );
    ~~~

    You created a table called `customers` in the `bank` database with three columns: `customer_id`, `name`, and `address`. Each column has a [data type](../data-types.html). This means that the column will only accept the specified data type (i.e., `customer_id` can only be an [`INTEGER`](../int.html), `name` can only be a [`STRING`](../string.html), and `address` can only be a `STRING`).

    The `customer_id` column is also the table's [primary key](../primary-key.html). In CockroachDB, and most SQL databases, it is always more efficient to search a table by primary key than by any other field because there can only be one primary key column, and the primary key column must be unique for every row. Therefore, the `name` column would be an unsuitable primary key because it's likely that your bank will eventually have two customers with the same name.

## Step 3. Insert data into your table

Now that you have a table, [insert](../insert.html) some data into it.

1. Insert a row into the table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.customers
      VALUES (1, 'Petee', '101 5th Ave, New York, NY 10003');
    ~~~

    `INSERT` statements add new rows to a table. Values must be specified in the same order that the columns were declared in the `CREATE TABLE` statement. Note that a string needs to be surrounded with single quotes (`'`), but integers do not.

2. Verify that the data was inserted successfully by using a [`SELECT` statement](../select.html) to retrieve data from the table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT customer_id, name, address FROM bank.customers;
    ~~~

    ~~~~
      customer_id | name  |                    address
    +-------------+-------+------------------------------------------------+
                1 | Petee | 101 5th Ave, New York, NY 10003
    (1 row)
    ~~~~

3. Insert another row:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.customers VALUES (2, 'Carl', NULL);
    ~~~

    We do not know Carl's address, so we use the special `NULL` value to indicate "unknown."

4. Insert two rows in the same statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.customers VALUES
      (3, 'Lola', NULL),
      (4, 'Ernie', '1600 Pennsylvania Ave NW, Washington, DC 20500');
    ~~~

5. Verify that the data was inserted successfully:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.customers;
    ~~~

    ~~~
      customer_id | name  |                    address
    +-------------+-------+------------------------------------------------+
                1 | Petee | 101 5th Ave, New York, NY 10003
                2 | Carl  | NULL
                3 | Lola  | NULL
                4 | Ernie | 1600 Pennsylvania Ave NW, Washington, DC 20500
    (4 rows)
    ~~~

    The `SELECT *` shorthand is used to indicate that you want all the columns in the table without explicitly enumerating them.

    {{site.data.alerts.callout_info}}
    Tables are also called **relations**, in the mathematical sense of the word, which is why SQL databases are sometimes referred to as relational databases.
    {{site.data.alerts.end}}

## Step 4. Create an `accounts` table

Now that you have a place to store personal information about customers, create a table to store data about the customers' account(s) and balance.

1. Create an `accounts` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (
        type STRING,
        balance DECIMAL(8, 2),
        customer_id INTEGER REFERENCES bank.customers (customer_id)
    );
    ~~~

    This table demonstrates two new SQL features.

    The first new feature is the balance column's [`DECIMAL` type](../decimal.html), which is capable of storing fractional numbers (the previously used `INTEGER` columns can only store whole numbers). The numbers in parenthesis indicate the maximum size of the decimal number. `DECIMAL(8, 2)` means that a number with up to eight digits can be stored with up to two digits past the decimal point. This means we can store account balances as large as `999999.99`, but no larger.

    The second new feature is the [foreign key](../foreign-key.html) created by the `REFERENCES` clause. Foreign keys are how SQL maintains referential integrity across different tables. Here, the foreign key guarantees that every account belongs to a real customer. Let's verify this works as intended.

2. Try to open an account for a customer that doesn't exist:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES ('checking', 0.00, 5);
    ~~~

    ~~~
    pq: foreign key violation: value [5] not found in customers@primary [customer_id] (txn="sql txn" id=fd9f171c key=/Min rw=false pri=0.00960426 iso=SERIALIZABLE stat=PENDING epo=0 ts=1534557981.019071738,0 orig=1534557981.019071738,0 max=1534557981.519071738,0 wto=false rop=false seq=1)
    ~~~

    As expected, the statement fails with a "foreign key violation" error, indicating that no customer with ID `5` exists.

3. Now open an account for a valid customer:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES ('checking', 0.00, 1);
    ~~~

4. Try to [delete](../delete.html) a customer record:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > DELETE FROM bank.customers WHERE customer_id = 1;
    ~~~

    The `WHERE` clause here is a constraint. It indicates that we do not want to delete all the data in the `customers` table, but just the row where `customer_id=1`.

    ~~~
    pq: foreign key violation: values [1] in columns [customer_id] referenced in table "accounts"
    ~~~

    You weren't able to delete Petee's information because the customer still has accounts open (i.e., there are records in the `accounts` table).

5. Delete a customer's account:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > DELETE FROM bank.accounts WHERE customer_id = 1;
    ~~~

6. Now that the customer's account is deleted, you can delete the customer record:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > DELETE FROM bank.customers WHERE customer_id = 1;
    ~~~

7. Create accounts for Carl (`customer_id=2`) and Ernie (`customer_id=4`):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES
      ('checking', 250.00, 2),
      ('savings', 314.15, 2),
      ('savings', 42000.00, 4);
    ~~~

## Step 5. List account balances

1. View account balances using a `SELECT` statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
        type   | balance  | customer_id
    +----------+----------+-------------+
      checking |   250.00 |           2
      savings  |   314.15 |           2
      savings  | 42000.00 |           4
    (3 rows)
    ~~~

2. Use a [join](../joins.html) to match customer IDs with the name and address in the `customers` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.customers NATURAL JOIN bank.accounts;
    ~~~

    ~~~
      customer_id | name  |                    address                     |   type   | balance
    +-------------+-------+------------------------------------------------+----------+----------+
                2 | Carl  | NULL                                           | checking |   250.00
                2 | Carl  | NULL                                           | savings  |   314.15
                4 | Ernie | 1600 Pennsylvania Ave NW, Washington, DC 20500 | savings  | 42000.00
    (3 rows)
    ~~~

    Now you have one view where you can see accounts alongside their customer information.

    While you could create one big table with all the above information, it's recommended that you create separate tables and join them. With this setup, you would only need to update data in one place.

3. [Update](../update.html) Carl's address:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE bank.customers
      SET address = '4 Privet Drive, Little Whinging, England'
      WHERE customer_id = 2;
    ~~~

4. With the join, the address is updated on both accounts:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.customers NATURAL JOIN bank.accounts;
    ~~~

    ~~~
      customer_id | name  |                    address                     |   type   | balance
    +-------------+-------+------------------------------------------------+----------+----------+
                2 | Carl  | 4 Privet Drive, Little Whinging, England       | checking |   250.00
                2 | Carl  | 4 Privet Drive, Little Whinging, England       | savings  |   314.15
                4 | Ernie | 1600 Pennsylvania Ave NW, Washington, DC 20500 | savings  | 42000.00
    (3 rows)
    ~~~

    If you only had one big table, you'd have to remember to update Carl's address on every account, and the multiple copies would likely get out of sync.

    {{site.data.alerts.callout_info}}
    Designing a schema so that there is exactly one copy of each piece of data is called **normalization**, and is a key concept in relational databases.
    {{site.data.alerts.end}}

## Step 6. Transactions

Suppose Carl wants to withdraw $250 from his checking account. First, check that he has $250 in his account with one query, then perform the withdrawal in another.

Here's how that would look (do not run this example yet):

~~~ sql
> SELECT balance >= 250 FROM bank.accounts WHERE type = 'checking' AND customer_id = 2;

  balance >= 250
+----------------+
       true      
(1 row)

-- If false, quit. Otherwise, continue.

> UPDATE bank.accounts SET balance = balance - 250 WHERE type = 'checking' AND customer_id = 2;
~~~

This would work most of the time, but there's a security flaw. Suppose Carl issues two transfer requests for $250 at the exact same time; let's call them transfer A and transfer B.

First, transfer A checks to see if there's at least $250 in Carl's checking account. There is, so it proceeds with the transfer. But before transfer A can deduct the $250 from his account, transfer B checks to see if there's $250 in the account. Transfer A hasn't deducted the money yet, so transfer B sees enough money and decides to proceed, too. When the two transfers complete, Carl will have withdrawn $250 that wasn't in his account, and the bank will have to cover the loss.

This issue can be solved by using a [transaction](../transactions.html). If two transactions attempt to modify the same data at the same time, one of the transactions will get canceled.

Using transactions is as simple as issuing a [`BEGIN` statement](../begin-transaction.html) to start a transaction and a [`COMMIT` statement](../commit-transaction.html) to finish it. You can also [`ROLLBACK` a transaction](../rollback-transaction.html) midway if, for example, you discover that the transfer has insufficient funds.

Here's the above example in a transaction. Again, do not run this example yet.

~~~ sql
> BEGIN;
-- Now adding input for a multi-line SQL transaction client-side.
-- Press Enter two times to send the SQL text collected so far to the server, or Ctrl+C to cancel.
-- You can also use \show to display the statements entered so far.
                        -> SELECT balance >= 250 FROM bank.accounts WHERE type = 'checking' AND customer_id = 2;
                        -> -- press Enter again

  balance >= 250
+----------------+
       true      
(1 row)

-- If false, issue a ROLLBACK statement. Otherwise, continue.

OPEN> UPDATE bank.accounts SET balance = balance - 250 WHERE type = 'checking' AND customer_id = 2;
UPDATE 1;
OPEN> COMMIT;
COMMIT
~~~

Now try running two copies of the above transaction in parallel:

1. In the SQL shell, run:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT balance >= 250 FROM bank.accounts WHERE type = 'checking' AND customer_id = 2;
    ~~~

2. Press enter.

3. Open a new terminal, start a second SQL shell, and run the same:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT balance >= 250 FROM bank.accounts WHERE type = 'checking' AND customer_id = 2;
    ~~~

4. Press enter a second time to send the SQL statement to the server.

5. Run:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE bank.accounts SET balance = balance - 250 WHERE type = 'checking' AND customer_id = 2;
    ~~~
6. Press enter a second time to send the SQL statement to the server.

7. Commit the transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

8. Back in the first SQL shell, run:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE bank.accounts SET balance = balance - 250 WHERE type = 'checking' AND customer_id = 2;
    ~~~

9. Press enter a second time to send the SQL statement to the server.

10. Commit the transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

When you reach the `COMMIT` statement, you'll see one transaction fail with an error like this:

~~~
pq: restart transaction: HandledRetryableTxnError: TransactionRetryError: retry txn (RETRY_WRITE_TOO_OLD)
~~~

CockroachDB detected that the two transactions are attempting conflicting withdrawals and canceled one of them.

{{site.data.alerts.callout_info}}
Any number of `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries can be placed in a transaction. This is what makes traditional SQL databases so powerful.
{{site.data.alerts.end}}

## Step 7. Aggregations

`SELECT` statements aren't limited to combining data from different tables. They can also combine data in the same table using **aggregations**.

1. Add all of the balances in the `accounts` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT SUM(balance) FROM bank.accounts;
    ~~~

    ~~~
        sum
    +----------+
      42314.15
    (1 row)
    ~~~

2. View the balance grouped by account type:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT type, SUM(balance) FROM bank.accounts GROUP BY type;
    ~~~

    ~~~
        type   |   sum
    +----------+----------+
      checking |   250.00
      savings  | 42064.15
    (2 rows)
    ~~~

Joins and aggregations can be combined and nested to express nearly any query.

## What's Next?

- [Users and Privileges](users-and-privileges.html)
