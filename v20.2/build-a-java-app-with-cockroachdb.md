---
title: Build a Simple CRUD Java App with CockroachDB and JDBC
summary: Learn how to use CockroachDB from a simple Java application with the JDBC driver.
toc: true
twitter: false
referral_id: docs_hello_world_java_jdbc
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>JDBC</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button">Use <strong>Hibernate</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-jooq.html"><button class="filter-button">Use <strong>jOOQ</strong></button></a>
    <a href="build-a-spring-app-with-cockroachdb-mybatis.html"><button style="width: 25%" class="filter-button">Use <strong>MyBatis-Spring</strong></button></a>
</div>

This tutorial shows you how to build a simple CRUD Java application with CockroachDB and the Java JDBC driver.

{% include {{page.version.version}}/app/java-version-note.md %}

{{site.data.alerts.callout_success}}
For a sample app and tutorial that uses Spring Data JDBC and CockroachDB, see [Build a Spring App with CockroachDB and JDBC](build-a-spring-app-with-cockroachdb-jdbc.html).
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/app/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-java-jdbc/
~~~

<div class="filter-content" markdown="1" data-scope="cockroachcloud">

Check out the `cockroachcloud` branch:

{% include_cached copy-clipboard.html %}
~~~shell
git checkout cockroachcloud
~~~

</div>

The project has the following directory structure:

~~~
├── README.md
├── app
│   ├── build.gradle
│   └── src
│       └── main
│           ├── java
│           │   └── com
│           │       └── cockroachlabs
│           │           └── BasicExample.java
│           └── resources
│               └── dbinit.sql
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
└── settings.gradle
~~~

The `dbinit.sql` file initializes the database schema that the application uses:

{% include_cached copy-clipboard.html %}
~~~ java
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-java-jdbc/master/app/src/main/resources/dbinit.sql %}
~~~

The `BasicExample.java` file contains the code for `INSERT`, `SELECT`, and `UPDATE` SQL operations. The file also contains the `main` method of the program.

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include_cached copy-clipboard.html %}
~~~ java
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-java-jdbc/cockroachcloud/app/src/main/java/com/cockroachlabs/BasicExample.java %}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="local">

{% include_cached copy-clipboard.html %}
~~~ java
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-java-jdbc/master/app/src/main/java/com/cockroachlabs/BasicExample.java %}
~~~

</section>

The sample app uses JDBC and the [Data Access Object (DAO)](https://en.wikipedia.org/wiki/Data_access_object) pattern to map Java methods to SQL operations. It consists of two classes:

1. `BasicExample`, which is where the application logic lives.
2. `BasicExampleDAO`, which is used by the application to access the data store (in this case CockroachDB). This class also includes a helper function (`runSql`) that runs SQL statements inside a transaction, [retrying statements](transactions.html#transaction-retries) as needed.

The `main` method of the app performs the following steps which roughly correspond to method calls in the `BasicExample` class.

| Step                                                                                                       | Method                                                                                          |
|------------------------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------|
| 1. Insert account data using a `Map` that corresponds to the input to `INSERT` on the backend              | `BasicExampleDAO.updateAccounts(Map balance)`                                                   |
| 2. Transfer money from one account to another, printing out account balances before and after the transfer | `BasicExampleDAO.transferFunds(UUID from, UUID to, BigDecimal amount)`                                   |
| 3. Insert random account data using JDBC's bulk insertion support                                          | `BasicExampleDAO.bulkInsertRandomAccountData()`                                                 |
| 4. Print out some account data                                                                             | `BasicExampleDAO.readAccounts(int limit)`                                                       |

It does all of the above using the practices we recommend for using JDBC with CockroachDB, which are listed in the [Recommended Practices](#recommended-practices) section below.

## Step 3. Initialize the database

To initialize the example database, use the [`cockroach sql`](cockroach-sql.html) command to execute the SQL statements in the `dbinit.sql` file:

<div class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include_cached copy-clipboard.html %}
~~~ shell
cat app/src/main/resources/dbinit.sql | cockroach sql --url "<connection-string>"
~~~

Where `<connection-string>` is the connection string you obtained earlier from the {{ site.data.products.db }} Console.

</div>

<div class="filter-content" markdown="1" data-scope="local">

{% include_cached copy-clipboard.html %}
~~~ shell
cat app/src/main/resources/dbinit.sql | cockroach sql --url "postgresql://root@localhost:26257?sslmode=disable"
~~~

{{site.data.alerts.callout_info}}
`postgresql://root@localhost:26257?sslmode=disable` is the `sql` connection string you obtained earlier from the `cockroach` welcome text.
{{site.data.alerts.end}}

</div>

The SQL statements in the initialization file should execute:

~~~
SET

Time: 1ms

SET

Time: 2ms

DROP DATABASE

Time: 1ms

CREATE DATABASE

Time: 2ms

SET

Time: 10ms

CREATE TABLE

Time: 4ms
~~~

## Step 4. Run the code

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Update the connection parameters

In a text editor modify `app/src/main/java/com/cockroachlabs/BasicExample.java` with the settings to connect to the cluster:

{% include_cached copy-clipboard.html %}
~~~ java
ds.setServerNames(new String[]{"{globalhost}"});
ds.setDatabaseName("{cluster_name}.bank");
ds.setUser("{username}");
ds.setPassword("{password}");
ds.setSslRootCert(System.getenv("{path to the CA certificate}"));
~~~

{% include {{page.version.version}}/app/cc-free-tier-params.md %}

{{site.data.alerts.callout_success}}
For guidance on connection pooling, with an example using JDBC and [HikariCP](https://github.com/brettwooldridge/HikariCP), see [Connection Pooling](connection-pooling.html).
{{site.data.alerts.end}}

</section>

Compile and run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
./gradlew run
~~~

The output will look like the following:

~~~
com.cockroachlabs.BasicExampleDAO.updateAccounts:
    'INSERT INTO accounts (id, balance) VALUES ('b5679853-b968-4206-91ec-68945fa3e716', 250)'

com.cockroachlabs.BasicExampleDAO.updateAccounts:
    'INSERT INTO accounts (id, balance) VALUES ('d1c41041-6589-4b06-8d7c-b9d6d901727e', 1000)'
BasicExampleDAO.updateAccounts:
    => 2 total updated accounts
main:
    => Account balances at time '15:09:08.902':
    ID 1 => $1000
    ID 2 => $250

com.cockroachlabs.BasicExampleDAO.transferFunds:
    'UPSERT INTO accounts (id, balance) VALUES('d99e6bb5-ecd1-48e5-b6b6-47fc9a4bc752', ((SELECT balance FROM accounts WHERE id = 'd99e6bb5-ecd1-48e5-b6b6-47fc9a4bc752') - 100)),('6f0c1f94-509a-47e3-a9ab-6a9e3965945c', ((SELECT balance FROM accounts WHERE id = '6f0c1f94-509a-47e3-a9ab-6a9e3965945c') + 100))'
BasicExampleDAO.transferFunds:
    => $100 transferred between accounts d99e6bb5-ecd1-48e5-b6b6-47fc9a4bc752 and 6f0c1f94-509a-47e3-a9ab-6a9e3965945c, 2 rows updated
main:
    => Account balances at time '15:09:09.142':
    ID 1 => $1000
    ID 2 => $250

BasicExampleDAO.bulkInsertRandomAccountData:
    'INSERT INTO accounts (id, balance) VALUES ('b70a0c48-fdf4-42ea-b07a-2fea83d77c7d', '287108674'::numeric)'
    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:
    'INSERT INTO accounts (id, balance) VALUES ('75a5f894-532a-464d-b37e-a4b9ec1c1db6', '189904311'::numeric)'
    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:
    'INSERT INTO accounts (id, balance) VALUES ('0803968f-ba07-4ece-82d5-24d4da9fdee9', '832474731'::numeric)'
    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:
    'INSERT INTO accounts (id, balance) VALUES ('082e634d-4930-41eb-9839-298632a5530a', '665918272'::numeric)'
    => 128 row(s) updated in this batch

BasicExampleDAO.bulkInsertRandomAccountData:
    => finished, 512 total rows inserted

com.cockroachlabs.BasicExampleDAO.readAccounts:
    'SELECT id, balance FROM accounts LIMIT 10'
    balance  =>  424934060
    balance  =>   62220740
    balance  =>  454671673
    balance  =>  556061618
    balance  =>  450164589
    balance  =>  996867752
    balance  =>   55869978
    balance  =>  747446662
    balance  =>  175832969
    balance  =>  181799597

BUILD SUCCESSFUL in 8s
3 actionable tasks: 3 executed
~~~

## Recommended Practices

### Generate PKCS8 keys for user authentication

{% include {{page.version.version}}/app/pkcs8-gen.md %}

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include cockroachcloud/cc-no-user-certs.md %}

</section>

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

CockroachDB now supports the Postgres wire-protocol cursors for implicit transactions and explicit transactions executed to completion. This means the [PGJDBC driver](https://jdbc.postgresql.org) can use this protocol to stream queries with large result sets. This is much faster than [paginating through results in SQL using `LIMIT .. OFFSET`](pagination.html).

For instructions showing how to use cursors in your Java code, see [Getting results based on a cursor](https://jdbc.postgresql.org/documentation/head/query.html#query-with-cursor) from the PGJDBC documentation.

Note that interleaved execution (partial execution of multiple statements within the same connection and transaction) is not supported when [`Statement.setFetchSize()`](https://docs.oracle.com/javase/8/docs/api/java/sql/Statement.html#setFetchSize-int-) is used.

## What's next?

Read more about using the [Java JDBC driver](https://jdbc.postgresql.org/).

{% include {{page.version.version}}/app/see-also-links.md %}
