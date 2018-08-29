---
title: SQL Basics
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
redirect_from: /training/cluster-basics.html
---

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Step 1. Create a training directory

To make it easier to keep track of all the files for this training, create a new directory and `cd` into it:

~~~ shell
$ mkdir cockroachdb-training
$ cd cockroachdb-training
~~~

From this point on, you'll start nodes and run all other commands from inside
the `cockroachdb-training` directory.

## Step 2. Install CockroachDB

1. Download the CockroachDB archive for your OS, and extract the binary:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz | tar -xJ
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz | tar  xvz
    ~~~
    </div>

2. Move the binary into the parent `cockroachdb-training` directory:

    <div class="filter-content" markdown="1" data-scope="mac">
    ~~~ shell
    $ mv cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach .
    $ rm -rf cockroach-{{ page.release_info.version }}.darwin-10.9-amd64
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    ~~~ shell
    $ mv cockroach-{{ page.release_info.version }}.linux-amd64/cockroach .
    $ rm -rf cockroach-{{ page.release_info.version }}
    ~~~
    </div>

## Step 3. Start a SQL shell

Use the [`cockroach start`](../start-a-node.html) command to start a node:

~~~ shell
$ ./cockroach start --insecure --background
~~~

We'll explain the flags more in a later module. Once the server has started,
you can open a SQL shell:

~~~ shell
$ ./cockroach sql --insecure
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

## Step 4. Create your first table

Today, you'll be launching your own bank with customers and accounts. You'll
need to create a _database_ within your Cockroach cluster to store this
information.

~~~ sql
> CREATE DATABASE bank;
CREATE DATABASE
~~~

Databases don't directly store any data. First, you'll need to describe the
shape of the data you intend to store by creating tables within your database.

Let's take a look at an example. Your bank will need to keep track of customers.
Every customer will have a name and, optionally, an address. If this data were
stored in an Excel spreadsheet, it would probably look like this:

~~~
+----+----------+------------------------------------------------+
| ID |   Name   |                     Address                    |
+----+----------+------------------------------------------------+
| 1  | Diana    | 101 5th Ave, New York, NY 10003                |
| 2  | Nate     |                                                |
| 3  | Andy     |                                                |
| 4  | Lakshmi  | 1600 Pennsylvania Ave NW, Washington, DC 20500 |
+----+----------+------------------------------------------------+
~~~

Notice that while every customer has an ID and a name, not every customer has
an address. (Perhaps these customers have signed up for paperless statements.)
We've decided to give each customer a numeric ID so that we have a stable
identifier if someone changes her name.

Here's how you create that same table in SQL:

~~~ sql
> CREATE TABLE bank.customers (
   customer_id INTEGER PRIMARY KEY,
   name STRING,
   address STRING
);
~~~

Let's break this down. The opening line, `CREATE TABLE bank.customers`, declares
that we're creating a table called `customers` in the `bank` database.

Then, we list out the name and type of every column in the table. Unlike Excel,
SQL requires that you commit to storing only one type of data in a given column.
For example, because the `customer_id` column has type `INTEGER`, you'll never
be able to insert data of type `STRING`, like `Diana`, into that column.

The `customer_id` column is also the table's _primary key_. In CockroachDB, and
most SQL databases, it is always more efficient to search a table by primary key
than by any other field. For example, finding the customer with ID 2 will be
much faster than finding the customer with the name "Nate".

A table can only have one primary key, and the primary key column must be unique
for every row. The name column would thus be an unsuitable primary key, because
it's quite likely that your bank will eventually have two customers with the
same name.

Go ahead and run the `CREATE TABLE` statement if you haven't already. Be sure
to include the semicolon (`;`) at the end. That's how you indicate the end of
a SQL _statement_.

Now that we have a table, we can insert some data into it. Let's start by
inserting the first row from our Excel spreadsheet into the table:

~~~ sql
> INSERT INTO bank.customers
  VALUES (1, 'Diana', '101 5th Ave, New York, NY 10003');
INSERT 1
~~~

`INSERT` statements, like the one above, add new rows to a table. Values must be
specified in the same order that the columns were declared in the `CREATE TABLE`
statement. Note that string data needs to be surrounded with single quotes
(`'`), but integers do not.

We can verify that our data was inserted successfully by using a `SELECT`
statement to retrieve data from the table. 

~~~ sql
> SELECT customer_id, name, address FROM bank.customers;
+-------------+-------+---------------------------------+
| customer_id | name  |             address             |
+-------------+-------+---------------------------------+
|           1 | Diana | 101 5th Ave, New York, NY 10003 |
+-------------+-------+---------------------------------+
(1 row)
~~~


Looks very similar to our spreadsheet, doesn't it? Let's insert the next row:

~~~ sql
> INSERT INTO bank.customers VALUES (2, 'Nate', NULL);
INSERT 1
~~~

We don't know Nate's address, so we use the special `NULL` value to indicate
"unknown."

Now for the remaining two rows. You can insert both of them in the same
statement:

~~~ sql
> INSERT INTO bank.customers VALUES
  (3, 'Andy', NULL),
  (4, 'Lakshmi', '1600 Pennsylvania Ave NW, Washington, DC 20500');
INSERT 2
~~~

That's it! Take a look at the final product:

~~~ sql
> SELECT * FROM bank.customers;
+----+---------+------------------------------------------------+
| id |  name   |                    address                     |
+----+---------+------------------------------------------------+
|  1 | Diana   | 101 5th Ave, New York, NY 10003                |
|  2 | Nate    | NULL                                           |
|  3 | Andy    | NULL                                           |
|  4 | Lakshmi | 1600 Pennsylvania Ave NW, Washington, DC 20500 |
+----+---------+------------------------------------------------+
(4 rows)
~~~

This time we've used the `SELECT *` shorthand to indicate that we want all the
columns in the table without explicitly enumerating them.

{{site.data.alerts.callout_info}}
Tables are also called _relations_, in the mathematical sense of the word, which
is why SQL databases are sometimes referred to as relational databases.
{{site.data.alerts.end}}

## Step 5. Create an accounts table

A bank isn't very useful if customers can't store any money. Let's allow
customers to open accounts. We'll need another table that keeps track of which
customer the account belongs to and how much money is in the account.

Why not just add a balance column to the `bank.customers` table? We want to
allow one customer to have multiple accounts, like a checking account and a
savings account.

Create an `accounts` table like this:

~~~ sql
> CREATE TABLE bank.accounts (
    type STRING,
    balance DECIMAL(8, 2),
    customer_id INTEGER REFERENCES bank.customers (customer_id)
);
~~~

This table demonstrates two new SQL features.

The first new feature is the balance column's `DECIMAL` type, which is capable
of storing fractional numbers. (`INTEGER` columns can only store whole numbers.)
The numbers in parenthesis indicate the maximum size of the decimal number.
`DECIMAL(8, 2)` means that a number with up to eight digits can be stored with
up to two digits past the decimal point. So we can store account balances as
large as `999999.99`, but no larger.

The second new feature is the _foreign key_ created by the `REFERENCES` clause.
Foreign keys are how SQL maintains _referential integrity_ across different
tables. Here, the foreign key guarantees that every account belongs to a real
customer. Let's verify this works as intended.

Try to open an account for a customer ID, `5`, that doesn't exist:

~~~ sql
> INSERT INTO bank.accounts VALUES ('checking', 0.00, 5);
pq: foreign key violation: value [5] not found in customers@primary [id]
~~~

Just as we expected! The statement fails with a "foreign key violation" error
indicating that no customer with ID `5` exists. Now open an account for a valid
customer, Diana, with customer ID `1`:

~~~ sql
> INSERT INTO bank.accounts VALUES ('checking', 0.00, 1);
INSERT 1
~~~

As expected, this works! But what happens if Diana tries to take her business to
another bank? If we deleted her customer record, then we'd have an account
that wasn't associated with a valid customer.

~~~ sql
> DELETE FROM bank.customers WHERE customer_id = 1;
pq: foreign key violation: values [1] in columns [id] referenced in table "accounts"
~~~

The `WHERE` clause here is a _constraint_. It indicates that we don't want to
delete _all_ the data in the `customers` table, but just the row with ID `1`,
i.e., Diana's record.

As we hoped, CockroachDB will prevent us from deleting Diana's information until
she's closed her accounts. Specifically, we can delete her customer record as
long as we delete her account first:

~~~ sql
> DELETE FROM bank.accounts WHERE customer_id = 1;
DELETE 1
> DELETE FROM bank.customers WHERE customer_id = 1;
DELETE 1
~~~

Finally, let's open some accounts for Nate (ID 2) and Lakshmi (ID 4), and make
them rich:

~~~ sql
> INSERT INTO bank.accounts VALUES
  ('checking', 250.00, 2),
  ('savings', 314.15, 2),
  ('savings', 42000.00, 4);
INSERT 2;
~~~

## Step 6. List account balances

Just like in step 4, we can list account balances using a `SELECT` statement:

~~~ sql
> SELECT * FROM bank.accounts;
+----------+----------+-------------+
|   type   | balance  | customer_id |
+----------+----------+-------------+
| checking |   250.00 |           2 |
| savings  |   314.15 |           2 |
| savings  | 42000.00 |           4 |
+----------+----------+-------------+
(3 rows)
~~~

It's tough to tell who each account belongs to because only customer IDs are
shown. We can use a _join_ to automatically match customer IDs with the name and
address in the `customers` table:

~~~ sql
> SELECT * FROM bank.customers NATURAL JOIN bank.accounts;
+-------------+---------+------------------------------------------------+----------+----------+
| customer_id |  name   |                    address                     |   type   | balance  |
+-------------+---------+------------------------------------------------+----------+----------+
|           2 | Nate    | NULL                                           | checking |   250.00 |
|           2 | Nate    | NULL                                           | savings  |   314.15 |
|           4 | Lakshmi | 1600 Pennsylvania Ave NW, Washington, DC 20500 | savings  | 42000.00 |
+-------------+---------+------------------------------------------------+----------+----------+
(3 rows)
~~~

Much better! Now we have one view where we can see accounts alongside their
customer information.

You might wonder: why not store one big table `customer_accounts` table with all
the above information? Well, suppose Nate decides to tell us his address. At the
moment, we only need to update it in one place using an `UPDATE` statement:

~~~ sql
> UPDATE bank.customers
  SET address = '4 Privet Drive, Little Whinging, England'
  WHERE customer_id = 2;
UPDATE 1
~~~

If we perform the join again, we'll see his address updated on both his accounts.

~~~ sql
> SELECT * FROM bank.customers NATURAL JOIN bank.accounts;
+-------------+---------+------------------------------------------------+----------+----------+
| customer_id |  name   |                    address                     |   type   | balance  |
+-------------+---------+------------------------------------------------+----------+----------+
|           2 | Nate    | 4 Privet Drive, Little Whinging, England       | checking |   250.00 |
|           2 | Nate    | 4 Privet Drive, Little Whinging, England       | savings  |   314.15 |
|           4 | Lakshmi | 1600 Pennsylvania Ave NW, Washington, DC 20500 | savings  | 42000.00 |
+-------------+---------+------------------------------------------------+----------+----------+
(3 rows)
~~~

If, instead, we had only one big `customer_accounts` table, we'd have to
remember to update Nate's address on every single account, and the multiple
copies would likely get out of sync. It might not seem like a big deal in this
small example, but in a database with not two but dozens of tables, keeping
multiple copies of the same piece of data in sync becomes quite challenging.

{{site.data.alerts.callout_info}}
Designing a schema so that exactly one copy of each piece of data is called
_normalization_, and is a key concept in relational databases.
{{site.data.alerts.end}}

## Step 7. Transactions

Suppose Nate wants to withdraw $250 from his checking account. Naively, we might
check that he has $250 in his account with one query, then perform the
withdrawal in another.

Here's how that would look. Don't run this example yet.

~~~ sql
> SELECT balance >= 250 FROM bank.accounts WHERE type = 'checking' AND customer_id = 2;
+----------------+
| balance >= 250 |
+----------------+
|      true      |
+----------------+
(1 row)

-- If false, quit. Otherwise, continue.

> UPDATE bank.accounts SET balance = balance - 250 WHERE type = 'checking' AND customer_id = 2;
~~~

This would work most of the time, but there's a security flaw! Suppose Nate
issues two transfer requests for $250 at exactly the same moment in time. We'll
call them transfer A and transfer B.

First, transfer A checks to see if there's at least $250 in Nate's checking
account. There is, so it proceeds with the transfer. But before transfer A can
deduct the $250 from his account, transfer B checks to see if there's $250 in
his account. Transfer A hasn't deducted the money yet, so transfer B sees enough
money and decides to proceed too! When the two transfers complete, Nate will
have withdrawn $250 that wasn't in his account, and your bank will have to cover
the loss.

We can solve this by using a _transaction_. If two transactions attempt to
modify the same data at the same time, one of the transactions will get
canceled. In our ex

Using transactions is as simple as issuing a `BEGIN` statement to start a
transaction and a `COMMIT` statement to finish it. You can also `ROLLBACK` a
transaction midway if, for example, you discover that the transfer has
insufficient funds.

Here's the above example in a transaction. Again, don't run this example yet.

~~~ sql
> BEGIN;
-- Now adding input for a multi-line SQL transaction client-side.
-- Press Enter two times to send the SQL text collected so far to the server, or Ctrl+C to cancel.
-- You can also use \show to display the statements entered so far.
                        -> SELECT balance >= 250 FROM bank.accounts WHERE type = 'checking' AND customer_id = 2;
                        -> -- press Enter again
+----------------+
| balance >= 250 |
+----------------+
|      true      |
+----------------+
(1 row)

-- If false, issue a ROLLBACK statement. Otherwise, continue.

OPEN> UPDATE bank.accounts SET balance = balance - 250 WHERE type = 'savings' AND customer_id = 2;
UPDATE 1;
OPEN> COMMIT;
COMMIT
~~~

Try running two copies of the above transaction in parallel. You'll need to open
another SQL shell. Then, for each query in the example above, execute it in the
first shell, then the new shell. That is, execute `BEGIN` in the first shell,
then again in the new shell, then execute `SELECT balance >= 300...` in the
first shell, then again in the new shell, and so on.

When you reach the `COMMIT` statement, you'll see one transaction fail with an
error like this:

~~~
pq: restart transaction: HandledRetryableTxnError: TransactionRetryError: retry txn (RETRY_WRITE_TOO_OLD)
~~~

CockroachDB has automatically detected that the two transactions are attempting
conflicting withdrawals and canceled one of them! Just like that, we've plugged
the leak in our bank.

{{site.data.alerts.callout_info}}
Any number of `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries can be placed
in a transaction. This is what makes traditional SQL databases so powerful.
{{site.data.alerts.end}}

## Step 8. Aggregations

`SELECT` statements aren't limited to combining data from different tables. They
can also combine data in the same table using _aggregations_. For example, we
can sum the balances in the accounts table to determine the total assets we
manage:

~~~ sql
> SELECT SUM(balance) FROM bank.accounts;
+----------+
|   sum    |
+----------+
| 42564.15 |
+----------+
(1 row)
~~~

Or perhaps we want the balance grouped by account type:

~~~ sql
> SELECT type, SUM(balance) FROM bank.accounts GROUP BY type;
+----------+----------+
|   type   |   sum    |
+----------+----------+
| checking |   250.00 |
| savings  | 42314.15 |
+----------+----------+
(2 rows)
~~~

SQL is even more powerful than we've demonstrated here. Joins and aggregations
can be combined and nested to express nearly any query you can conceive of. If
you'd like, [continue learning about CockroachDB
SQL](../learn-cockroachdb-sql.html) in our docs.

## What's Next?

- [Cluster Startup and Scaling](cluster-startup-and-scaling.html)
