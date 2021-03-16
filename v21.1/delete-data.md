---
title: Delete Data
summary: How to delete data from CockroachDB during application development
toc: true
---

This page has instructions for deleting rows of data from CockroachDB, using the [`DELETE`](update.html) [SQL statement](sql-statements.html).

## Before you begin

Before reading this page, do the following:

- [Install CockroachDB](install-cockroachdb.html).
- [Start a local cluster](secure-a-cluster.html), or [create a CockroachCloud cluster](../cockroachcloud/create-your-cluster.html).
- [Install a Postgres client](install-client-drivers.html).
- [Connect to the database](connect-to-the-database.html).
- [Create a database schema](schema-design-overview.html).
- [Insert data](insert-data.html) that you now want to delete.

    In the examples on this page, we use sample [`movr`](movr.html) data imported with the [`cockroach workload` command](cockroach-workload.html).

## Use `DELETE`

To delete rows in a table, use a [`DELETE` statement](update.html) with a `WHERE` clause that filters on the columns that identify the rows that you want to delete.

### SQL syntax

In SQL, `DELETE` statements generally take the following form:

~~~
DELETE FROM {table} WHERE {filter_column} {comparison_operator} {filter_value}
~~~

Where:

- `{table}` is a table with rows that you want to delete.
- `{filter_column}` is the column to filter on.
- `{comparison_operator}` is a [comparison operator](functions-and-operators.html#operators) that resolves to `TRUE` or `FALSE` (e.g., `=`).
- `{filter_value}` is the matching value for the filter.

{{site.data.alerts.callout_info}}
Filtering on a unique or primary key column will delete a single row. Filtering on non-unique columns removes every row that returns `TRUE` for the `WHERE` clause's expression.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `DELETE` statement, including additional examples, see the [`DELETE` syntax page](delete.html).
{{site.data.alerts.end}}

### Best practices

Here are some best practices to follow when deleting rows:

- Limit the number of `DELETE` statements that you execute. It's more efficient to delete multiple rows with a single statement than to execute multiple `DELETE` statements that each delete a single row.
- Always specify a `WHERE` clause in `DELETE` queries. If no `WHERE` clause is specified, CockroachDB will delete all of the rows in the specified table.
- To delete all of the rows in a table, use a [`TRUNCATE` statement](truncate.html).
- To delete a large number of rows (i.e., tens of thousands of rows or more), use a [batch-delete loop](bulk-delete-data.html#batch-delete-on-an-indexed-column).
- When executing `DELETE` statements from an application, make sure that you wrap the SQL-executing functions in [a retry loop that handles transaction errors](error-handling-and-troubleshooting.html#transaction-retry-errors) that can occur under contention.
- Review the [performance considerations below](#performance-considerations) before writing and executing `DELETE` statements.

### Examples

#### Delete rows filtered on a non-unique column

Suppose that you want to delete all of the MovR ride data that generated no revenue. To delete all rows from the `rides` table where `revenue` is equal to 0:

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go (lib/pq)</button>
  <button class="filter-button" data-scope="java">Java (jdbc)</button>
  <button class="filter-button" data-scope="python">Python (psycopg2)</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include copy-clipboard.html %}
~~~ sql
DELETE from rides WHERE revenue = 0;
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
// 'db' is an open database connection

if _, err := db.Exec("DELETE from rides WHERE revenue = 0"); err != nil {
    return err
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

try (Connection connection = ds.getConnection()) {
    connection.createStatement().executeUpdate("DELETE from rides WHERE revenue = 0");

} catch (SQLException e) {
    System.out.printf("sql state = [%s]\ncause = [%s]\nmessage = [%s]\n",
                      e.getSQLState(), e.getCause(), e.getMessage());
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

with conn.cursor() as cur:
    cur.execute("DELETE from rides WHERE revenue = 0",
conn.commit()
~~~

</section>


#### Delete rows filtered on a unique column

Suppose that you want to delete all of the MovR ride data for a specific set of users. To delete the rows in the `rides` table where the `user_id` matches a UUID in a set of UUID values:

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go (lib/pq)</button>
  <button class="filter-button" data-scope="java">Java (jdbc)</button>
  <button class="filter-button" data-scope="python">Python (psycopg2)</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include copy-clipboard.html %}
~~~ sql
DELETE from rides WHERE user_id IN ('00000000-0000-4000-8000-000000000000', '80000000-0000-4000-8000-000000000019', '33333333-3333-4400-8000-00000000000a');
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
// tx is a *sql.Tx from "database/sql"

idOne := "00000000-0000-4000-8000-000000000000"
idTwo := "80000000-0000-4000-8000-000000000019"
idThree := "33333333-3333-4400-8000-00000000000a"

if _, err := tx.Exec("DELETE from rides WHERE user_id IN ('$1', '$2', '$3')", idOne, idTwo, idThree); err != nil {
    return err
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

String idOne = "00000000-0000-4000-8000-000000000000"
String idTwo = "80000000-0000-4000-8000-000000000019"
String idThree = "33333333-3333-4400-8000-00000000000a"

try (Connection connection = ds.getConnection()) {
    connection.createStatement().executeUpdate("DELETE from rides WHERE user_id IN('"
                                               + idOne + "','" + idTwo + "','" + idThree + "')");

} catch (SQLException e) {
    System.out.printf("sql state = [%s]\ncause = [%s]\nmessage = [%s]\n",
                      e.getSQLState(), e.getCause(), e.getMessage());
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

idOne = '00000000-0000-4000-8000-000000000000'
idTwo = '80000000-0000-4000-8000-000000000019'
idThree = '33333333-3333-4400-8000-00000000000a'

with conn.cursor() as cur:
    cur.execute("DELETE from rides WHERE user_id IN ('%s', '%s', '%s')", (idOne, idTwo, idThree)),
conn.commit()
~~~

</section>

## Performance considerations

Because of the way CockroachDB works under the hood, deleting data from the database does not immediately reduce disk usage.  Instead, records are marked as "deleted" and processed asynchronously by a background garbage collection process.  This process runs every 25 hours by default to allow sufficient time for running [backups](backup-and-restore.html) and running [time travel queries using `AS OF SYSTEM TIME`](as-of-system-time.html).  The garbage collection interval is controlled by the [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables) setting.

The practical implications of the above are:

- Deleting data will not immediately decrease disk usage.
- If you issue multiple [`DELETE`](delete.html) statements in sequence that each delete large amounts of data, each subsequent `DELETE` statement will run more slowly. For details, see [Preserving `DELETE` performance over time](delete.html#preserving-delete-performance-over-time).

For more information about how the storage layer of CockroachDB works, see the [storage layer reference documentation](architecture/storage-layer.html).

## See also

Reference information related to this task:

- [`DELETE`](delete.html)
- [Bulk-delete data](bulk-delete-data.html)
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
[paginate]: pagination.html
[joins]: joins.html
