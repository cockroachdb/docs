---
title: Insert Data
summary: How to insert data into CockroachDB during application development
toc: true
---

This page has instructions for getting data into CockroachDB with various programming languages, using the [`INSERT`](insert.html) SQL statement.

The instructions assume that you already have a cluster up and running using the instructions for a [manual deployment][manual] or an [orchestrated deployment][orchestrated].

The instructions assume you are already [connected to the database](connect-to-the-database.html).

{{site.data.alerts.callout_success}}
If you need to get a lot of data into a CockroachDB cluster quickly, use the IMPORT statement instead of sending SQL INSERTs from application code. It will be much faster because it bypasses the SQL layer altogether and writes directly to the data store using low-level commands. For instructions, see the Migration Overview.

If you need to get a lot of data into a CockroachDB cluster quickly, use the [`IMPORT`](import.html) statement instead of sending SQL [`INSERT`s](insert.html) from application code. It will be much faster because it bypasses the SQL layer altogether and writes directly to the data store using low-level commands. For instructions, see the [Migration Overview](migration-overview.html).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

{% include {{page.version.version}}/app/retry-errors.md %}

<section class="filter-content" markdown="1" data-scope="sql">

## SQL

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT);
INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250);
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

## Go

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

## Java

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

## Python

{% include copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

with conn.cursor() as cur:
    cur.execute('INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)')

conn.commit()
~~~

{% include {{page.version.version}}/app/for-a-complete-example-python.md %}

</section>

## See also

Reference information related to this task:

- [Migration Overview](migration-overview.html)
- [`IMPORT`](import.html)
- [Import performance](import.html#performance)
- [`INSERT`](insert.html)
- [`UPSERT`](upsert.html)
- [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)

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
