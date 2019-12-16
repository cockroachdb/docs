---
title: Delete Data
summary: How to delete data from CockroachDB during application development
toc: true
---

This page has instructions for deleting data from CockroachDB (using the [`DELETE`](update.html) statement) using various programming languages.

The instructions assume that you have already:

- Set up a running cluster using the instructions for a [manual deployment][manual] or an [orchestrated deployment][orchestrated].
- [Connected to the database](connect-to-the-database.html).
- [Inserted data](insert-data.html) that you now want to delete.

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
DELETE from accounts WHERE id = 1;
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

## Go

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

## Java

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

## Python

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

1. Using a `WHERE` clause to limit the number of rows based on one or more predicates:
    {% include copy-clipboard.html %}
    ~~~ sql
    DELETE FROM student_loan_accounts WHERE loan_amount < 30000;
    ~~~

2. Using a `WHERE` clause to specify multiple records by a specific column's value (in this case, `id`):
    {% include copy-clipboard.html %}
    ~~~ sql
    DELETE FROM accounts WHERE id IN (1, 2, 3, 4, 5);
    ~~~

{{site.data.alerts.callout_info}}
Before deleting large amounts of data, see [Performance considerations](#performance-considerations).
{{site.data.alerts.end}}

## Performance considerations

Because of the way CockroachDB works under the hood, deleting data from the database does not immediately reduce disk usage.  Instead, records are marked as "deleted" and processed asynchronously by a background garbage collection process.  This process runs every 25 hours by default to allow sufficient time for running [backups](backup-and-restore.html) and running [time travel queries using `AS OF SYSTEM TIME`](as-of-system-time.html).  The garbage collection interval is controlled by the [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables) setting.

The practical implications of the above are:

- Deleting data will not immediately decrease disk usage.
- If you issue multiple [`DELETE`](delete.html) statements in sequence that each delete large amounts of data, each subsequent `DELETE` statement will run more slowly, for reasons [explained in this FAQ entry](sql-faqs.html#why-are-my-deletes-getting-slower-over-time).

For more information about how the storage layer of CockroachDB works, see the [storage layer reference documentation](architecture/storage-layer.html).

## See also

Reference information related to this task:

- [`DELETE`](delete.html)
- [Disk space usage after deletes](delete.html#disk-space-usage-after-deletes)
- [Why are my deletes getting slower over time?](sql-faqs.html#why-are-my-deletes-getting-slower-over-time)
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
