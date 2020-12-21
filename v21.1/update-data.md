---
title: Update Data
summary: How to update the data in CockroachDB from various programming languages
toc: true
---

This page has instructions for updating rows of data (using the [`UPDATE`](update.html) statement) in CockroachDB from various programming languages.

## Before you begin

Make sure you have already:

- Set up a [local cluster](secure-a-cluster.html).
- [Installed a Postgres client](install-client-drivers.html).
- [Connected to the database](connect-to-the-database.html).
- [Inserted data](insert-data.html) that you now want to update.

{% include {{page.version.version}}/app/retry-errors.md %}

## Update a row

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include copy-clipboard.html %}
~~~ sql
UPDATE accounts SET balance = 900 WHERE id = 1;
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
// tx is a *sql.Tx from "database/sql"

transferAmount := 100
fromID := 1

if _, err := tx.Exec("UPDATE accounts SET balance = balance - $1 WHERE id = $2", transferAmount, fromID); err != nil {
    return err
}
~~~

{% include {{page.version.version}}/app/for-a-complete-example-go.md %}

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

int transferAmount = 100;
int fromID = 1;

try (Connection connection = ds.getConnection()) {
    connection.createStatement().executeUpdate("UPDATE accounts SET balance = balance - "
                                               + transferAmount + " where id = " + fromID);

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

transferAmount = 100
fromID = 1

with conn.cursor() as cur:
    cur.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s",
                (transferAmount, fromID));
conn.commit()
~~~

{% include {{page.version.version}}/app/for-a-complete-example-python.md %}

</section>

## See also

Reference information related to this task:

- [`UPDATE`](update.html)
- [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
- [Selection queries][selection]

Other common tasks:

- [Connect to the Database](connect-to-the-database.html)
- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Delete Data](delete-data.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Error Handling and Troubleshooting][error_handling]
- [Make Queries Fast](make-queries-fast.html)
- [Hello World Example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[error_handling]: error-handling-and-troubleshooting.html
[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[selection]: selection-queries.html
