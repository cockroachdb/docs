---
title: Build a Java App with CockroachDB and JDBC
summary: Learn how to use CockroachDB from a simple Java application with the JDBC driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>JDBC</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button">Use <strong>Hibernate</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-jooq.html"><button class="filter-button">Use <strong>jOOQ</strong></button></a>
    <a href="build-a-spring-app-with-cockroachdb-mybatis.html"><button style="width: 25%" class="filter-button">Use <strong>MyBatis-Spring</strong></button></a>
</div>

This tutorial shows you how to build a simple Java application with CockroachDB and the Java JDBC driver.

{% include {{page.version.version}}/app/java-version-note.md %}

{{site.data.alerts.callout_success}}
For a sample app and tutorial that uses Spring Data JDBC and CockroachDB, see [Build a Spring App with CockroachDB and JDBC](build-a-spring-app-with-cockroachdb-jdbc.html).
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Run the Java code

The code below uses JDBC and the [Data Access Object (DAO)](https://en.wikipedia.org/wiki/Data_access_object) pattern to map Java methods to SQL operations. It consists of two classes:

1. `BasicExample`, which is where the application logic lives.
2. `BasicExampleDAO`, which is used by the application to access the data store (in this case CockroachDB). This class has logic to handle [transaction retries](transactions.html#transaction-retries) (see the `BasicExampleDAO.runSQL()` method).

It performs the following steps which roughly correspond to method calls in the `BasicExample` class.

| Step                                                                                                       | Method                                                                                          |
|------------------------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------|
| 1. Create an `accounts` table in the `bank` database                                                       | `BasicExampleDAO.createAccounts()`                                                              |
| 2. Insert account data using a `Map` that corresponds to the input to `INSERT` on the backend              | `BasicExampleDAO.updateAccounts(Map balance)`                                                   |
| 3. Transfer money from one account to another, printing out account balances before and after the transfer | `BasicExampleDAO.transferFunds(int from, int to, BigDecimal amount)`                                   |
| 4. Insert random account data using JDBC's bulk insertion support                                          | `BasicExampleDAO.bulkInsertRandomAccountData()`                                                 |
| 5. Print out some account data                                                                             | `BasicExampleDAO.readAccounts(int limit)`                                                       |
| 6. Drop the `accounts` table and perform any other necessary cleanup                                       | `BasicExampleDAO.tearDown()` (This cleanup step means you can run this program more than once.) |

It does all of the above using the practices we recommend for using JDBC with CockroachDB, which are listed in the [Recommended Practices](#recommended-practices) section below.

To run it:

1. Clone the `hello-world-java-hibernate` repo to your machine:

    {% include copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachlabs/hello-world-java-jdbc
    ~~~

1. In a text editor modify `app/src/main/java/com/cockroachlabs/BasicExample.java` with the settings to connect to the demo cluster:

    1. Set the port number in the `PGSimpleDataSource` instance:

        {% include copy-clipboard.html %}
        ~~~ java
        ds.setPortNumber({port});
        ~~~

        Where `{port}` is the port number from the connection string you noted earlier.

    1. Set the username and password in the `PGSimpleDataSource` instance:

        {% include copy-clipboard.html %}
        ~~~ java
        ds.setUser("{username}");
        ds.setPassword("{password}");
        ~~~

        Where `{username}` is the database username you created, and `{password}` is the database user's password.

1. Compile and run the code:

    {% include copy-clipboard.html %}
    ~~~ shell
    ./gradlew run
    ~~~

The contents of `BasicExample.java`:

{% include copy-clipboard.html %}
~~~ java
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-java-jdbc/master/app/src/main/java/com/cockroachlabs/BasicExample.java %}
~~~

The output will look like the following:

~~~
BasicExampleDAO.createAccounts:
    'CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance DECIMAL(12,2), CONSTRAINT balance_gt_0 CHECK (balance >= 0))'

BasicExampleDAO.updateAccounts:
    'INSERT INTO accounts (id, balance) VALUES (1, 1000)'

BasicExampleDAO.updateAccounts:
    'INSERT INTO accounts (id, balance) VALUES (2, 250)'
BasicExampleDAO.updateAccounts:
    => 2 total updated accounts
main:
    => Account balances at time '11:54:06.904':
    ID 1 => $1000
    ID 2 => $250

BasicExampleDAO.transferFunds:
    'UPSERT INTO accounts (id, balance) VALUES(1, ((SELECT balance FROM accounts WHERE id = 1) - 100)),(2, ((SELECT balance FROM accounts WHERE id = 2) + 100))'
BasicExampleDAO.transferFunds:
    => $100 transferred between accounts 1 and 2, 2 rows updated
main:
    => Account balances at time '11:54:06.985':
    ID 1 => $900
    ID 2 => $350

BasicExampleDAO.bulkInsertRandomAccountData:
    'INSERT INTO accounts (id, balance) VALUES (354685257, '158423397'::numeric)'
    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:
    'INSERT INTO accounts (id, balance) VALUES (206179866, '950590234'::numeric)'
    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:
    'INSERT INTO accounts (id, balance) VALUES (708995411, '892928833'::numeric)'
    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:
    'INSERT INTO accounts (id, balance) VALUES (500817884, '189050420'::numeric)'
    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:
    => finished, 512 total rows inserted

BasicExampleDAO.readAccounts:
    'SELECT id, balance FROM accounts LIMIT 10'
    id       =>          1
    balance  =>        900
    id       =>          2
    balance  =>        350
    id       =>     190756
    balance  =>  966414958
    id       =>    1002343
    balance  =>  243354081
    id       =>    1159751
    balance  =>   59745201
    id       =>    2193125
    balance  =>  346719279
    id       =>    2659707
    balance  =>  770266587
    id       =>    6819325
    balance  =>  511618834
    id       =>    9985390
    balance  =>  905049643
    id       =>   12256472
    balance  =>  913034434

BasicExampleDAO.tearDown:
    'DROP TABLE accounts'
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
            BigDecimal balance = BigDecimal.valueOf(random.nextInt(1000000000));
            pstmt.setInt(1, id);
            pstmt.setBigDecimal(2, balance);
            pstmt.addBatch();
        }
        int[] count = pstmt.executeBatch();
        System.out.printf("    => %s row(s) updated in this batch\n", count.length); // Verifying 128 rows in the batch
    }
    connection.commit();
}
~~~

### Retrieve large data sets in chunks using cursors

CockroachDB now supports the Postgres wire-protocol cursors for implicit transactions and explicit transactions executed to completion. This means the [PGJDBC driver](https://jdbc.postgresql.org) can use this protocol to stream queries with large result sets. This is much faster than [paginating through results in SQL using `LIMIT .. OFFSET`](selection-queries.html#paginate-through-limited-results).

For instructions showing how to use cursors in your Java code, see [Getting results based on a cursor](https://jdbc.postgresql.org/documentation/head/query.html#query-with-cursor) from the PGJDBC documentation.

Note that interleaved execution (partial execution of multiple statements within the same connection and transaction) is not supported when [`Statement.setFetchSize()`](https://docs.oracle.com/javase/8/docs/api/java/sql/Statement.html#setFetchSize-int-) is used.

## What's next?

Read more about using the [Java JDBC driver](https://jdbc.postgresql.org/).

{% include {{page.version.version}}/app/see-also-links.md %}
