---
title: Insert Data
summary: How to insert data into CockroachDB during application development
toc: true
docs_area: develop
---

This page has instructions for getting data into CockroachDB with various programming languages, using the [`INSERT`]({{ page.version.version }}/insert.md) SQL statement.

## Before you begin

Before reading this page, do the following:

- [Create a CockroachDB {{ site.data.products.standard }} cluster](quickstart.md) or [start a local cluster](quickstart.md?filters=local).
- [Install a Driver or ORM Framework]({{ page.version.version }}/install-client-drivers.md).
- [Connect to the database]({{ page.version.version }}/connect-to-the-database.md).


## Insert rows

When inserting multiple rows, a single [multi-row insert statement]({{ page.version.version }}/insert.md#insert-multiple-rows-into-an-existing-table) is faster than multiple single-row statements.

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

~~~ sql
CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT);
INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250);
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`]({{ page.version.version }}/cockroach-sql.md) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

~~~ go
// 'db' is an open database connection

// Insert two rows into the "accounts" table.
if _, err := db.Exec(
    "INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)"); err != nil {
    log.Fatal(err)
}
~~~


</section>

<section class="filter-content" markdown="1" data-scope="java">

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


</section>

<section class="filter-content" markdown="1" data-scope="python">

~~~ python
# conn is a psycopg2 connection

with conn.cursor() as cur:
    cur.execute('INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)')

conn.commit()
~~~


</section>


## See also

Reference information related to this task:

- [Migration Overview]({{ page.version.version }}/migration-overview.md)
- [`INSERT`]({{ page.version.version }}/insert.md)
- [`UPSERT`]({{ page.version.version }}/upsert.md)
- [Transaction Contention]({{ page.version.version }}/performance-best-practices-overview.md#transaction-contention)
- [Multi-row DML best practices]({{ page.version.version }}/performance-best-practices-overview.md#dml-best-practices)
- [Insert Multiple Rows]({{ page.version.version }}/insert.md#insert-multiple-rows-into-an-existing-table)

Other common tasks:

- [Connect to the Database]({{ page.version.version }}/connect-to-the-database.md)
- [Query Data]({{ page.version.version }}/query-data.md)
- [Update Data]({{ page.version.version }}/update-data.md)
- [Delete Data]({{ page.version.version }}/delete-data.md)
- [Run Multi-Statement Transactions]({{ page.version.version }}/run-multi-statement-transactions.md)
- [Troubleshoot SQL Statements]({{ page.version.version }}/query-behavior-troubleshooting.md)
- [Optimize Statement Performance]({{ page.version.version }}/make-queries-fast.md)
- [Example Apps]({{ page.version.version }}/example-apps.md)

{% comment %} Reference Links {% endcomment %}

[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[local_secure]: secure-a-cluster.html
[connection_params]: connection-parameters.html