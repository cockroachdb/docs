---
title: Delete Data
summary: How to delete data from CockroachDB during application development
toc: true
---

This page has instructions for deleting data from CockroachDB (using the [`DELETE`](update.html) statement) using various programming languages.

## Before you begin

Make sure you have already:

- Set up a [local cluster](secure-a-cluster.html).
- [Installed a Postgres client](install-client-drivers.html).
- [Connected to the database](connect-to-the-database.html).
- [Inserted data](insert-data.html) that you now want to delete.

{% include {{page.version.version}}/app/retry-errors.md %}

## Delete a single row

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include copy-clipboard.html %}
~~~ sql
DELETE from accounts WHERE id = 1;
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
// 'db' is an open database connection

if _, err := db.Exec("DELETE FROM accounts WHERE id = 1"); err != nil {
    return err
}
~~~

{% include {{page.version.version}}/app/for-a-complete-example-go.md %}

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

try (Connection connection = ds.getConnection()) {
    connection.createStatement().executeUpdate("DELETE FROM accounts WHERE id = 1");

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
    cur.execute("DELETE FROM accounts WHERE id = 1",
conn.commit()
~~~

{% include {{page.version.version}}/app/for-a-complete-example-python.md %}

</section>

## Delete multiple rows

You can delete multiple rows from a table in several ways:

- Using a `WHERE` clause to limit the number of rows based on one or more predicates:

    {% include copy-clipboard.html %}
    ~~~ sql
    DELETE FROM student_loan_accounts WHERE loan_amount < 30000;
    ~~~

- Using a `WHERE` clause to specify multiple records by a specific column's value (in this case, `id`):

    {% include copy-clipboard.html %}
    ~~~ sql
    DELETE FROM accounts WHERE id IN (1, 2, 3, 4, 5);
    ~~~

- Using [`TRUNCATE`](truncate.html) instead of [`DELETE`](delete.html) to delete all of the rows from a table, as recommended in our [performance best practices](performance-best-practices-overview.html#use-truncate-instead-of-delete-to-delete-all-rows-in-a-table).

{{site.data.alerts.callout_info}}
Before deleting large amounts of data, see [Performance considerations](#performance-considerations).
{{site.data.alerts.end}}

## Performance considerations

Because of the way CockroachDB works under the hood, deleting data from the database does not immediately reduce disk usage.  Instead, records are marked as "deleted" and processed asynchronously by a background garbage collection process.  This process runs every 25 hours by default to allow sufficient time for running [backups](backup-and-restore.html) and running [time travel queries using `AS OF SYSTEM TIME`](as-of-system-time.html).  The garbage collection interval is controlled by the [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables) setting.

The practical implications of the above are:

- Deleting data will not immediately decrease disk usage.
- If you issue multiple [`DELETE`](delete.html) statements in sequence that each delete large amounts of data, each subsequent `DELETE` statement will run more slowly. For details, see [Preserving `DELETE` performance over time](delete.html#preserving-delete-performance-over-time).
- To delete all of the rows in a table, [it's faster to use `TRUNCATE` instead of `DELETE`](performance-best-practices-overview.html#use-truncate-instead-of-delete-to-delete-all-rows-in-a-table).

For more information about how the storage layer of CockroachDB works, see the [storage layer reference documentation](architecture/storage-layer.html).

## See also

Reference information related to this task:

- [`DELETE`](delete.html)
- [Disk space usage after deletes](delete.html#disk-space-usage-after-deletes)
- [`TRUNCATE`](truncate.html)
- [`DROP TABLE`](drop-table.html)
- [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)

Other common tasks:

- [Connect to the Database](connect-to-the-database.html)
- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Make Queries Fast][fast]
- [Hello World Example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[selection]: selection-queries.html
[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[fast]: make-queries-fast.html
[paginate]: selection-queries.html#paginate-through-limited-results
[joins]: joins.html
