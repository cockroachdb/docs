---
title: Build a Test App
toc: false
---

This page is CockroachDB's **Hello, world!** tutorial. It walks you through creating a database, granting privileges on the database to a user, and then connecting with that user from your preferred language to execute basic statements as well as more complex transactions.

<style>
div#toc ul {
    max-width: 50%;
}
</style>

<div id="toc"></div>

## Prerequisites

We assume that you have already:

- [Installed CockroachDB](install-cockroachdb.html) 
- [Started a local cluster](start-a-local-cluster.html) in insecure mode
- [Installed a client driver](install-client-drivers.html)
 
## Step 1. Create the database

As the `root` user, use the [built-in SQL client](use-the-builtin-sql-client.html) to create a `bank` database and an `accounts` table.

~~~ shell
$ ./cockroach sql --insecure -e='CREATE DATABASE bank;CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance INT)' 
~~~

## Step 2. Grant privileges to a user

Again as the `root` user, use the [built-in SQL client](use-the-builtin-sql-client.html) to grant privileges on the `accounts` table to the `maxroach` user. This will enable the user to execute statements from a client in the next steps.

~~~ shell
$ ./cockroach sql --insecure -e='GRANT ALL ON bank.accounts TO maxroach' 
~~~

## Step 3. Execute basic statements from a client

As the `maxroach` user, connect from your preferred language, insert a few rows into the `accounts` table, and read and print the rows.

**Go**

Coming soon

**Python**

~~~ py
{% include app/basic-sample.py %}
~~~

The balance printout will look like this:

~~~ shell
Initial balances:
['1', '1000']
['2', '250']

~~~

**Ruby**

~~~ ruby
{% include app/basic-sample.rb %}
~~~

**Java**

~~~ java
{% include app/BasicSample.java %}
~~~

**JavaScript (Node.js)**

~~~ js
{% include app/basic-sample.js %}
~~~

**C++**

Coming soon.

**Clojure**

~~~ clojure
{% include app/basic-sample.clj %}
~~~

**PHP**

Coming soon.

## Step 4. Execute transactions from a client

In addition to executing single statements, you'll want to batch statements together as atomic transactions, where all included statements are either commited or aborted together. 

More coming soon.

<!-- TODO: Explain necessity for retry and show our reusable function

TODO: Show retry function in context of a transaction (transfer funds from one account to the other)

The balance printout will look like this:

~~~ shell
Balances after transfer:
['1', '1000']
['2', '250']
~~~
-->