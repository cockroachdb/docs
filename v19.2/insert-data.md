---
title: Insert Data
summary: How to insert data into CockroachDB during application development
toc: true
---

This page has instructions for getting data into CockroachDB with various programming languages, using the [`INSERT`](insert.html) SQL statement.

## Before you begin

Make sure you have already:

- Set up a [local cluster](secure-a-cluster.html).
- [Installed a Postgres client](install-client-drivers.html).
- [Connected to the database](connect-to-the-database.html).

{% include {{page.version.version}}/app/retry-errors.md %}

## Insert rows

When inserting multiple rows, a single [multi-row insert statement](insert.html#insert-multiple-rows-into-an-existing-table) is faster than multiple single-row statements.

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT);
INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250);
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
// 'db' is an open database connection

// Insert two rows into the "accounts" table.
if _, err := db.Exec(
    "INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)"); err != nil {
    log.Fatal(err)
}
~~~

{% include {{page.version.version}}/app/for-a-complete-example-go.md %}

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

try (Connection connection = ds.getConnection()) {
    connection.setAutoCommit(false);
    PreparedStatement pstmt = connection.prepareStatement("INSERT INTO accounts (id, balance) VALUES (?, ?)");

    pstmt.setInt(1, 1);
    pstmt.setInt(2, 1000);
    pstmt.addBatch();

    pstmt.executeBatch();
    connection.commit();
} catch (SQLException e) {
    System.out.printf("sql state = [%s]\ncause = [%s]\nmessage = [%s]\n",
                      e.getSQLState(), e.getCause(), e.getMessage());
}
~~~

{% include {{page.version.version}}/app/for-a-complete-example-java.md %}

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

with conn.cursor() as cur:
    cur.execute('INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)')

conn.commit()
~~~

{% include {{page.version.version}}/app/for-a-complete-example-python.md %}

</section>

## Bulk insert

If you need to get a lot of data into a CockroachDB cluster quickly, use the [`IMPORT`](import.html) statement instead of sending SQL [`INSERT`s](insert.html) from application code. It will be much faster because it bypasses the SQL layer altogether and writes directly to the data store using low-level commands. For instructions, see the [Migration Overview](migration-overview.html).

## See also

Reference information related to this task:

- [Migration Overview](migration-overview.html)
- [`IMPORT`](import.html)
- [Import performance](import.html#performance)
- [`INSERT`](insert.html)
- [`UPSERT`](upsert.html)
- [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
- [Multi-row DML best practices](performance-best-practices-overview.html#multi-row-dml-best-practices)
- [Insert Multiple Rows](insert.html#insert-multiple-rows-into-an-existing-table)

Other common tasks:

- [Connect to the Database](connect-to-the-database.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Make Queries Fast](make-queries-fast.html)
- [Hello World Example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[local_secure]: secure-a-cluster.html
[connection_params]: connection-parameters.html
