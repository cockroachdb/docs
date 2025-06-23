---
title: Insert Data
summary: How to insert data into CockroachDB during application development
toc: true
docs_area: develop
---

This page has instructions for getting data into CockroachDB with various programming languages, using the [`INSERT`]({% link {{ page.version.version }}/insert.md %}) SQL statement.

## Before you begin

Before reading this page, do the following:

- [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/quickstart.md %}) or [start a local cluster]({% link cockroachcloud/quickstart.md %}?filters=local).
- [Install a Driver or ORM Framework]({% link {{ page.version.version }}/install-client-drivers.md %}).
- [Connect to the database]({% link {{ page.version.version }}/connect-to-the-database.md %}).

{% include {{page.version.version}}/app/retry-errors.md %}

## Insert rows

When inserting multiple rows, a single [multi-row insert statement]({% link {{ page.version.version }}/insert.md %}#insert-multiple-rows-into-an-existing-table) is faster than multiple single-row statements.

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT);
INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250);
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

with conn.cursor() as cur:
    cur.execute('INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)')

conn.commit()
~~~

{% include {{page.version.version}}/app/for-a-complete-example-python.md %}

</section>

{% include {{page.version.version}}/sql/limit-row-size.md %}

## See also

Reference information related to this task:

- [Migration Overview]({% link molt/migration-overview.md %})
- [`INSERT`]({% link {{ page.version.version }}/insert.md %})
- [`UPSERT`]({% link {{ page.version.version }}/upsert.md %})
- [Transaction Contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention)
- [Multi-row DML best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#dml-best-practices)
- [Insert Multiple Rows]({% link {{ page.version.version }}/insert.md %}#insert-multiple-rows-into-an-existing-table)

Other common tasks:

- [Connect to the Database]({% link {{ page.version.version }}/connect-to-the-database.md %})
- [Query Data]({% link {{ page.version.version }}/query-data.md %})
- [Update Data]({% link {{ page.version.version }}/update-data.md %})
- [Delete Data]({% link {{ page.version.version }}/delete-data.md %})
- [Run Multi-Statement Transactions]({% link {{ page.version.version }}/run-multi-statement-transactions.md %})
- [Troubleshoot SQL Statements]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})
- [Optimize Statement Performance]({% link {{ page.version.version }}/make-queries-fast.md %})
- [Example Apps]({% link {{ page.version.version }}/example-apps.md %})

{% comment %} Reference Links {% endcomment %}

[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[local_secure]: secure-a-cluster.html
[connection_params]: connection-parameters.html
