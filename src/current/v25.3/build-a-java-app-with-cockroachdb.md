---
title: Build a Simple CRUD Java App with CockroachDB and JDBC
summary: Learn how to use CockroachDB from a simple Java application with the JDBC driver.
toc: true
twitter: false
referral_id: docs_java_jdbc
docs_area: get_started
---

{% include {{ page.version.version }}/filter-tabs/crud-java.md %}

This tutorial shows you how to build a simple CRUD Java application with CockroachDB and the Java JDBC driver.

{% include {{page.version.version}}/app/java-version-note.md %}

{{site.data.alerts.callout_success}}
For a sample app and tutorial that uses Spring Data JDBC and CockroachDB, see [Build a Spring App with CockroachDB and JDBC]({% link {{ page.version.version }}/build-a-spring-app-with-cockroachdb-jdbc.md %}).
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup-jdbc.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
git clone https://github.com/cockroachlabs/example-app-java-jdbc/
~~~

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
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
└── settings.gradle
~~~

The `BasicExample.java` file contains the code for `INSERT`, `SELECT`, and `UPDATE` SQL operations. The file also contains the `main` method of the program.

{% include_cached copy-clipboard.html %}
~~~ java
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-java-jdbc/master/app/src/main/java/com/cockroachlabs/BasicExample.java %}
~~~

The sample app uses JDBC and the [Data Access Object (DAO)](https://wikipedia.org/wiki/Data_access_object) pattern to map Java methods to SQL operations. It consists of two classes:

1. `BasicExample`, which is where the application logic lives.
1. `BasicExampleDAO`, which is used by the application to access the data store (in this case CockroachDB). This class also includes a helper function (`runSql`) that runs SQL statements inside a transaction, [retrying statements]({% link {{ page.version.version }}/transactions.md %}#transaction-retries) as needed.

The `main` method of the app performs the following steps which roughly correspond to method calls in the `BasicExample` class.

| Step                                                                                                       | Method                                                                                          |
|------------------------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------|
| 1. Insert account data using a `Map` that corresponds to the input to `INSERT` on the backend              | `BasicExampleDAO.updateAccounts(Map balance)`                                                   |
| 2. Transfer money from one account to another, printing out account balances before and after the transfer | `BasicExampleDAO.transferFunds(UUID from, UUID to, BigDecimal amount)`                                   |
| 3. Insert random account data using JDBC's bulk insertion support                                          | `BasicExampleDAO.bulkInsertRandomAccountData()`                                                 |
| 4. Print out some account data                                                                             | `BasicExampleDAO.readAccounts(int limit)`                                                       |

It does all of the above using the practices we recommend for using JDBC with CockroachDB, which are listed in the [Recommended Practices](#recommended-practices) section below.

## Step 3. Update the connection configuration

1. Navigate to the `example-app-java-jdbc` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd example-app-java-jdbc
    ~~~

1. Set the `JDBC_DATABASE_URL` environment variable to a JDBC-compatible connection string:

    <section class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export JDBC_DATABASE_URL=jdbc:postgresql://localhost:26257/defaultdb?sslmode=disable&user=root
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="console">

    1. Paste in the command you copied earlier:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        export JDBC_DATABASE_URL="{connection-string}"
        ~~~

        Where `{connection-string}` is the JDBC connection string from the command you copied earlier.

    </section>

    <section class="filter-content" markdown="1" data-scope="ccloud">

    1. Use the `cockroach convert-url` command to convert the connection string that you copied earlier to a [valid connection string for JDBC connections](connect-to-the-database.html?filters=java):

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        cockroach convert-url --url $DATABASE_URL
        ~~~

        ~~~
        ...

        # Connection URL for JDBC (Java and JVM-based languages):
        jdbc:postgresql://{host}:{port}/{database}?password={password}&sslmode=verify-full&user={username}
        ~~~

    1. Set the `JDBC_DATABASE_URL` environment variable to the JDBC-compatible connection string:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        export JDBC_DATABASE_URL="{jdbc-connection-string}"
        ~~~

    </section>

## Step 4. Run the code

Compile and run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
./gradlew run
~~~

The output will look like the following:

~~~
com.cockroachlabs.BasicExampleDAO.createAccountsTable:
    'CREATE TABLE IF NOT EXISTS accounts (id UUID PRIMARY KEY, balance int8)'

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

### Set session variables

[Session variables]({% link {{ page.version.version }}/session-variables.md %}) can be set in the JDBC connection string or as properties of the JDBC data source.

To set the session variable in the JDBC connection string, add them to the [`options` parameter]({% link {{ page.version.version }}/connection-parameters.md %}#supported-options-parameters):

{% include_cached copy-clipboard.html %}
~~~ shell
export JDBC_DATABASE_URL=jdbc:postgresql://{host}:{port}/{database}?options=-c%20{session variable name}%3D{session variable value}
~~~

Where:

- `{session variable name}` is the name of the session variable.
- `{session variable value}` is the value of the session variable.

URL encode the `options` parameter to make sure the JDBC connection URL is parsed correctly. For example, the following URL encoded `options` parameter:

~~~ shell
export JDBC_DATABASE_URL=jdbc:postgres://localhost:26257/movr?options=-c%20sql_safe_updates%3Dtrue
~~~

is equivalent to:

~~~
options=-c unbounded_parallel_scans=on
~~~

To set session variables as properties of the JDBC data source, set `options` using `setProperty`:

{% include_cached copy-clipboard.html %}
~~~ java
Properties props = new Properties();
props.setProperty("options", "-c {session variable name}={session variable value}");
Connection conn = DriverManager.getConnection(url, props);
~~~

Where:

- `{session variable name}` is the name of the session variable.
- `{session variable value}` is the value of the session variable.

To add more than one session variable, append additional `-c` settings:

{% include_cached copy-clipboard.html %}
~~~ shell
props.setProperty("options", "-c sql_safe_updates=true -c statement_timeout=30");
~~~

### Generate PKCS8 keys for user authentication

{% include {{page.version.version}}/app/pkcs8-gen.md %}

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include cockroachcloud/cc-no-user-certs.md %}

</section>

### Use `IMPORT INTO` to read in large data sets

If you are trying to get a large data set into CockroachDB all at once (a bulk import), avoid writing client-side code altogether and use the [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) statement instead. It is much faster and more efficient than making a series of [`INSERT`s]({% link {{ page.version.version }}/insert.md %}) and [`UPDATE`s]({% link {{ page.version.version }}/update.md %}). It bypasses the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}) altogether and writes directly to the [storage layer](architecture/storage-layer.html) of the database.

For more information about importing data from PostgreSQL, see [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %}).

For more information about importing data from MySQL, see [Migrate from MySQL]({% link molt/migrate-to-cockroachdb.md %}?filters=mysql).

### Use `reWriteBatchedInserts` for increased speed

We strongly recommend setting `reWriteBatchedInserts=true`; we have seen 2-3x performance improvements with it enabled. From [the JDBC connection parameters documentation](https://jdbc.postgresql.org/documentation/use/#connection-parameters):

> This will change batch inserts from `insert into foo (col1, col2, col3) values (1,2,3)` into `insert into foo (col1, col2, col3) values (1,2,3), (4,5,6)` this provides 2-3x performance improvement

### Use a batch size of 128

PGJDBC's batching support only works with [powers of two](https://github.com/pgjdbc/pgjdbc/blob/7b52b0c9e5b9aa9a9c655bb68f23bf4ec57fd51c/pgjdbc/src/main/java/org/postgresql/jdbc/PgPreparedStatement.java#L1597), and will split batches of other sizes up into multiple sub-batches. This means that a batch of size 128 can be 6x faster than a batch of size 250.

The code snippet below shows a pattern for using a batch size of 128, and is taken from the longer example above (specifically, the `BasicExampleDAO.bulkInsertRandomAccountData()` method).

Specifically, it does the following:

1. Turn off auto-commit so you can manage the transaction lifecycle and thus the size of the batch inserts.
1. Given an overall update size of 500 rows (for example), split it into batches of size 128 and execute each batch in turn.
1. Finally, commit the batches of statements you've just executed.

{% include_cached copy-clipboard.html %}
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

CockroachDB now supports the PostgreSQL wire-protocol cursors for implicit transactions and explicit transactions executed to completion. This means the [PGJDBC driver](https://jdbc.postgresql.org) can use this protocol to stream queries with large result sets. This is much faster than [paginating through results in SQL using `LIMIT .. OFFSET`]({% link {{ page.version.version }}/pagination.md %}).

For instructions showing how to use cursors in your Java code, see [Getting results based on a cursor](https://jdbc.postgresql.org/documentation/query/#getting-results-based-on-a-cursor) from the PGJDBC documentation.

Note that interleaved execution (partial execution of multiple statements within the same connection and transaction) is not supported when [`Statement.setFetchSize()`](https://docs.oracle.com/javase/8/docs/api/java/sql/Statement.html#setFetchSize-int-) is used.

### Connection pooling

For guidance on connection pooling, with an example using JDBC and [HikariCP](https://github.com/brettwooldridge/HikariCP), see [Connection Pooling]({% link {{ page.version.version }}/connection-pooling.md %}).

## What's next?

Read more about using the [Java JDBC driver](https://jdbc.postgresql.org/).

{% include_cached {{page.version.version}}/app/see-also-links.md %}
