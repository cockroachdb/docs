---
title: Build a Java App with CockroachDB
summary: Learn how to use CockroachDB from a simple Java application with the JDBC driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>JDBC</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button">Use <strong>Hibernate</strong></button></a>
</div>

This tutorial shows you how build a simple Java application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Java JDBC driver](https://jdbc.postgresql.org/) and the [Hibernate ORM](http://hibernate.org/) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

{{site.data.alerts.callout_danger}}
The examples on this page assume you are using a Java version <= 9. They do not work with Java 10.
{{site.data.alerts.end}}

## Step 1. Install the Java JDBC driver

Download and set up the Java JDBC driver as described in the [official documentation](https://jdbc.postgresql.org/documentation/head/setup.html).

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command. The code samples will run as this user.

<span class="version-tag">New in v19.1</span>: You can pass the [`--also-generate-pkcs8-key` flag](create-security-certificates.html#flag-pkcs8) to generate a key in [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java. In this case, the generated PKCS8 key will be named `client.maxroach.key.pk8`.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key --also-generate-pkcs8-key
~~~

## Step 4. Run the Java code


The code below uses JDBC and the [Data Access Object (DAO)](https://en.wikipedia.org/wiki/Data_access_object) pattern to map Java methods to SQL operations. It consists of two classes:

1. `BasicExample`, which is where the application logic lives.
2. `BasicExampleDAO`, which is used by the application to access the data store (in this case CockroachDB). This class has logic to handle [transaction retries](transactions.html#transaction-retries) (see the `BasicExampleDAO.runSQL()` method).

It performs the following steps which roughly correspond to method calls in the `BasicExample` class.

| Step                                                                                                       | Method                                                                                          |
|------------------------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------|
| 1. Create an `accounts` table in the `bank` database                                                       | `BasicExampleDAO.createAccounts()`                                                              |
| 2. Insert account data using a `Map` that corresponds to the input to `INSERT` on the backend              | `BasicExampleDAO.updateAccounts(Map balance)`                                                   |
| 3. Transfer money from one account to another, printing out account balances before and after the transfer | `BasicExampleDAO.transferFunds(int from, int to, int amount)`                                   |
| 4. Insert random account data using JDBC's bulk insertion support                                          | `BasicExampleDAO.bulkInsertRandomAccountData()`                                                 |
| 5. Print out some account data                                                                             | `BasicExampleDAO.readAccounts(int limit)`                                                       |
| 6. Drop the `accounts` table and performs any other necessary cleanup                                      | `BasicExampleDAO.tearDown()` (This cleanup step means you can run this program more than once.) |

It does all of the above using the practices we recommend for using JDBC with CockroachDB, which are listed in the [Recommended Practices](#recommended-practices) section below.

To run it:

1. Download [`BasicExample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v19.1/app/BasicExample.java), or create the file yourself and copy the code below.
2. Download [the PostgreSQL JDBC driver](https://jdbc.postgresql.org/download.html).
3. Compile and run the code (adding the PostgreSQL JDBC driver to your classpath):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ javac -classpath .:/path/to/postgresql.jar BasicExample.java
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ java -classpath .:/path/to/postgresql.jar BasicExample
    ~~~

The contents of [`BasicExample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v19.1/app/BasicExample.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/BasicExample.java %}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Java code

The code below uses JDBC and the [Data Access Object (DAO)](https://en.wikipedia.org/wiki/Data_access_object) pattern to map Java methods to SQL operations. It consists of two classes:

1. `BasicExample`, which is where the application logic lives.
2. `BasicExampleDAO`, which is used by the application to access the data store (in this case CockroachDB). This class has logic to handle [transaction retries](transactions.html#transaction-retries) (see the `BasicExampleDAO.runSQL()` method).

It performs the following steps which roughly correspond to method calls in the `BasicExample` class.

1. Create an `accounts` table in the `bank` database (`BasicExampleDAO.createAccounts()`).
2. Insert account data using a `Map` that corresponds to the input to `INSERT` on the backend (`BasicExampleDAO.updateAccounts(Map balance)`).
3. Transfer money from one account to another, printing out account balances before and after the transfer (`BasicExampleDAO.transferFunds(int from, int to, int amount)`).
4. Insert random account data using JDBC's bulk insertion support (`BasicExampleDAO.bulkInsertRandomAccountData()`).
5. Print out (some) account data (`BasicExampleDAO.readAccounts(int limit)`).
6. Drop the `accounts` table and performs any other necessary cleanup (`BasicExampleDAO.tearDown()`). (Note that you can run this program as many times as you want due to this cleanup step.)

It does all of the above using the practices we recommend for using JDBC with CockroachDB, which are listed in the [Recommended Practices](#recommended-practices) section below.

To run it:

1. Download [`BasicExample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v19.1/app/insecure/BasicExample.java), or create the file yourself and copy the code below.
2. Download [the PostgreSQL JDBC driver](https://jdbc.postgresql.org/download.html).
3. Compile and run the code (adding the PostgreSQL JDBC driver to your classpath):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ javac -classpath .:/path/to/postgresql.jar BasicExample.java
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ java -classpath .:/path/to/postgresql.jar BasicExample
    ~~~

The contents of [`BasicExample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v19.1/app/insecure/BasicExample.java):

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/insecure/BasicExample.java %}
~~~

</section>

The output will look like the following:

~~~
BasicExampleDAO.createAccounts:

    'CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)'
    => 0 row(s) updated


BasicExampleDAO.updateAccounts:

    'INSERT INTO accounts (id, balance) VALUES (1, 1000)'
    => 1 row(s) updated


BasicExampleDAO.updateAccounts:

    'INSERT INTO accounts (id, balance) VALUES (2, 250)'
    => 1 row(s) updated

main:
    => Account balances at time '14:04:31.525':
    ID 1 => $1000
    ID 2 => $250

BasicExampleDAO.transferFunds:

    'UPSERT INTO accounts (id, balance) values (1, 900), (2, 350)'
    => 2 row(s) updated

main:
    => Account balances at time '14:04:31.648':
    ID 1 => $900
    ID 2 => $350

BasicExampleDAO.bulkInsertRandomAccountData:

    'INSERT INTO accounts (id, balance) VALUES (847399719, 180326192)'

    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:

    'INSERT INTO accounts (id, balance) VALUES (829377880, 84945190)'

    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:

    'INSERT INTO accounts (id, balance) VALUES (92102737, 291571579)'

    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:

    'INSERT INTO accounts (id, balance) VALUES (652174166, 312870715)'

    => 128 row(s) updated in this batch

BasicExampleDAO.readAccounts:

    'SELECT id, balance FROM accounts LIMIT 10'

    id       =>          1
    balance  =>        900
    id       =>          2
    balance  =>        350
    id       =>    1269441
    balance  =>  806876724
    id       =>    1668525
    balance  =>  443112804
    id       =>    4156302
    balance  =>  797785738
    id       =>   10555230
    balance  =>  147833339
    id       =>   12108251
    balance  =>  682245205
    id       =>   12527906
    balance  =>  491751851
    id       =>   13414989
    balance  =>  970890645
    id       =>   15287258
    balance  =>  773104528

BasicExampleDAO.tearDown:

    'DROP TABLE accounts'
    => 0 row(s) updated
~~~

## Recommended Practices

### Use `IMPORT` to read in large data sets

If you are trying to get a large data set into CockroachDB all at once (a bulk import), avoid writing client-side code altogether and use the [`IMPORT`](import.html) statement instead. It is much faster and more efficient than making a series of [`INSERT`s](insert.html) and [`UPDATE`s](update.html). It bypasses the [SQL layer](architecture/sql-layer.html) altogether and writes directly to the [storage layer](architecture/storage-layer.html) of the database.

For more information about importing data from Postgres, see [Migrate from Postgres](migrate-from-postgres.html).

For more information about importing data from MySQL, see [Migrate from MySQL](migrate-from-mysql.html).

### Use `rewriteBatchedInserts` for increased speed

We strongly recommend setting `rewriteBatchedInserts=true`; we have seen 2-3x performance improvements with it enabled. From [the JDBC connection parameters documentation](https://jdbc.postgresql.org/documentation/head/connect.html#connection-parameters):

> This will change batch inserts from `insert into foo (col1, col2, col3) values (1,2,3)` into `insert into foo (col1, col2, col3) values (1,2,3), (4,5,6)` this provides 2-3x performance improvement

### Use a batch size of 128

PGJDBC's batching support only works with [powers of two](https://github.com/pgjdbc/pgjdbc/blob/7b52b0c9e5b9aa9a9c655bb68f23bf4ec57fd51c/pgjdbc/src/main/java/org/postgresql/jdbc/PgPreparedStatement.java#L1597), and will split batches of other sizes up into multiple sub-batches. This means that a batch of size 128 can be 6x faster than a batch of size 250.

The code snippet below shows a pattern for using a batch size of 128, and is taken from the longer example above (specifically, the `BasicExampleDAO.bulkInsertRandomAccountData()` method).

Specifically, it does the following:

1. Turn off auto-commit so you can manage the transaction lifecycle and thus the size of the batch inserts.
2. Given an overall update size of 500 rows (for example), split it into batches of size 128 and execute each batch in turn.
3. Finally, commit the batches of statements you've just executed.

~~~ java
int BATCH_SIZE = 128;
connection.setAutoCommit(false);

try (PreparedStatement pstmt = connection.prepareStatement("INSERT INTO accounts (id, balance) VALUES (?, ?)")) {
    for (int i=0; i<=(500/BATCH_SIZE);i++) {
        for (int j=0; j<BATCH_SIZE; j++) {
            int id = random.nextInt(1000000000);
            int balance = random.nextInt(1000000000);
            pstmt.setInt(1, id);
            pstmt.setInt(2, balance);
            pstmt.addBatch();
        }
        int[] count = pstmt.executeBatch();
        System.out.printf("    => %s row(s) updated in this batch\n", count.length); // Verifying 128 rows in the batch
    }
    connection.commit();
}
~~~

## What's next?

Read more about using the [Java JDBC driver](https://jdbc.postgresql.org/).

{% include {{page.version.version}}/app/see-also-links.md %}
