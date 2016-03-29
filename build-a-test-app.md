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
 
## Step 1. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-builtin-sql-client.html) to create a `bank` database and grant privileges to the `maxroach` user. The privileges will enable the user to execute statements in the next steps. 

~~~ shell
$ ./cockroach sql -e 'CREATE DATABASE bank'
$ ./cockroach sql -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~

## Step 2. Create a table in the new database

As the `maxroach` user, use the [built-in SQL client](use-the-builtin-sql-client.html) to create an `accounts` table in the new database.

~~~ shell
$ ./cockroach sql --database=bank --user=maxroach -e 'CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)' 
~~~

## Step 3. Execute basic statements from a client

As the `maxroach` user, connect from your preferred language, insert a few rows into the `accounts` table, and read and print the rows.

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

**Go**

Coming soon

**Java**

~~~ java
{% include app/BasicSample.java %}
~~~

**JavaScript (Node.js)**

~~~ js
{% include app/basic-sample.js %}
~~~

**C++**

~~~ cpp
{% include app/basic-sample.cpp %}
~~~

**Clojure**

~~~ clojure
{% include app/basic-sample.clj %}
~~~

**PHP**

Coming soon.

## Step 4. Execute transactions from a client

As the `maxroach` user, connect again from your preferred language, but this time execute a batch of statements as an atomic transaction, where all included statements are either commited or aborted. 

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code as needed. For more details about retries and other transaction topics, see <a href="https://www.cockroachlabs.com/docs/transactions.html">Transactions</a>.{{site.data.alerts.end}}    

**Python**

~~~ py
{% include app/txn-sample.py %}
~~~

**Ruby**

Coming soon.

**Go**

For Go, the CockroachDB retry function is available as a client package that you can clone into your `$GOPATH` as follows:

~~~ shell
$ mkdir -p $GOPATH/github.com/cockroachdb 
$ cd $GOPATH/github.com/cockroachdb 
$ git clone git@github.com:cockroachdb/cockroach-go.git
~~~

~~~ go
{% include app/txn-sample.go %}
~~~

**Java**

Coming soon.

**JavaScript (Node.js)**

~~~ js
{% include app/txn-sample.js %}
~~~

**C++**

~~~ cpp
{% include app/txn-sample.cpp %}
~~~

**Clojure**

~~~ clojure
{% include app/txn-sample.clj %}
~~~

**PHP**

Coming soon.