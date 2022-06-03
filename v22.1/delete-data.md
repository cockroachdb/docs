---
title: Delete Data
summary: How to delete data from CockroachDB during application development
toc: true
docs_area: develop
---

This page has instructions for deleting rows of data from CockroachDB, using the [`DELETE`](update.html) [SQL statement](sql-statements.html).

## Before you begin

Before reading this page, do the following:

- [Create a {{ site.data.products.serverless }} cluster](../cockroachcloud/quickstart.html) or [start a local cluster](../cockroachcloud/quickstart.html?filters=local).
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

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `DELETE` statement, including additional examples, see the [`DELETE` syntax page](delete.html).
{{site.data.alerts.end}}

### Best practices

Here are some best practices to follow when deleting rows:

- Limit the number of `DELETE` statements that you execute. It's more efficient to delete multiple rows with a single statement than to execute multiple `DELETE` statements that each delete a single row.
- Always specify a `WHERE` clause in `DELETE` queries. If no `WHERE` clause is specified, CockroachDB will delete all of the rows in the specified table.
- To delete all of the rows in a table, use a [`TRUNCATE` statement](truncate.html) instead of a `DELETE` statement.
- To delete a large number of rows (i.e., tens of thousands of rows or more), use a [batch-delete loop](bulk-delete-data.html#batch-delete-on-an-indexed-column).
- When executing `DELETE` statements from an application, make sure that you wrap the SQL-executing functions in [a retry loop that handles transaction errors](error-handling-and-troubleshooting.html#transaction-retry-errors) that can occur under contention.
- Review the [performance considerations below](#performance-considerations).

### Examples

#### Delete rows filtered on a non-unique column

Suppose that you want to delete the vehicle location history data recorded during a specific hour of a specific day. To delete all of the rows in the `vehicle_location_histories` table where the `timestamp` is between two [`TIMESTAMP`](timestamp.html) values:

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go (lib/pq)</button>
  <button class="filter-button" data-scope="java">Java (jdbc)</button>
  <button class="filter-button" data-scope="python">Python (psycopg2)</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include copy-clipboard.html %}
~~~ sql
DELETE FROM vehicle_location_histories WHERE timestamp BETWEEN '2021-03-17 14:00:00' AND '2021-03-17 15:00:00';
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
// 'db' is an open database connection

tsOne := "2021-03-17 14:00:00"
tsTwo := "2021-03-17 15:00:00"

if _, err := db.Exec("DELETE FROM vehicle_location_histories WHERE timestamp BETWEEN $1 AND $2", tsOne, tsTwo); err != nil {
  return err
}
return nil
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

String tsOne = "2021-03-17 14:00:00";
String tsTwo = "2021-03-17 15:00:00";

try (Connection connection = ds.getConnection()) {
    PreparedStatement p = connection.prepareStatement("DELETE FROM vehicle_location_histories WHERE timestamp BETWEEN ? AND ?");
    p.setString(1, tsOne);
    p.setString(2, tsTwo);
    p.executeUpdate();

} catch (SQLException e) {
    System.out.printf("sql state = [%s]\ncause = [%s]\nmessage = [%s]\n", e.getSQLState(), e.getCause(),
            e.getMessage());
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

tsOne = '2021-03-17 14:00:00'
tsTwo = '2021-03-17 15:00:00'

with conn.cursor() as cur:
    cur.execute(
        "DELETE FROM vehicle_location_histories WHERE timestamp BETWEEN %s AND %s", (tsOne, tsTwo))
~~~

</section>

{{site.data.alerts.callout_success}}
If the `WHERE` clause evaluates to `TRUE` for a large number of rows (i.e., tens of thousands of rows), use a [batch-delete loop](bulk-delete-data.html#batch-delete-on-an-indexed-column) instead of executing a simple `DELETE` query.
{{site.data.alerts.end}}

#### Delete rows filtered on a unique column

Suppose that you want to delete the promo code data for a specific set of codes. To delete the rows in the `promo_codes` table where the `code` matches a string in a set of string values:

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go (lib/pq)</button>
  <button class="filter-button" data-scope="java">Java (jdbc)</button>
  <button class="filter-button" data-scope="python">Python (psycopg2)</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include copy-clipboard.html %}
~~~ sql
DELETE from promo_codes WHERE code IN ('0_explain_theory_something', '100_address_garden_certain', '1000_do_write_words');
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`](cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include copy-clipboard.html %}
~~~ go
// 'db' is an open database connection

codeOne := "0_explain_theory_something"
codeTwo := "100_address_garden_certain"
codeThree := "1000_do_write_words"

if _, err := db.Exec("DELETE from promo_codes WHERE code IN ($1, $2, $3)", codeOne, codeTwo, codeThree); err != nil {
  return err
}
return nil
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include copy-clipboard.html %}
~~~ java
// ds is an org.postgresql.ds.PGSimpleDataSource

String codeOne = "0_explain_theory_something";
String codeTwo = "100_address_garden_certain";
String codeThree = "1000_do_write_words";

try (Connection connection = ds.getConnection()) {
    PreparedStatement p = connection.prepareStatement("DELETE from promo_codes WHERE code IN(?, ?, ?)");
    p.setString(1, codeOne);
    p.setString(2, codeTwo);
    p.setString(3, codeThree);
    p.executeUpdate();

} catch (SQLException e) {
    System.out.printf("sql state = [%s]\ncause = [%s]\nmessage = [%s]\n", e.getSQLState(), e.getCause(),
            e.getMessage());
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

{% include copy-clipboard.html %}
~~~ python
# conn is a psycopg2 connection

codeOne = '0_explain_theory_something'
codeTwo = '100_address_garden_certain'
codeThree = '1000_do_write_words'

with conn.cursor() as cur:
    cur.execute("DELETE from promo_codes WHERE code IN (%s, %s, %s)", (codeOne, codeTwo, codeThree)),
~~~

</section>

## Performance considerations

Because of the way CockroachDB works under the hood, deleting data from the database does not immediately reduce disk usage.  Instead, records are marked as "deleted" and processed asynchronously by a background garbage collection process.  This process runs every 25 hours by default to allow sufficient time for running [backups](take-full-and-incremental-backups.html) and running [time travel queries using `AS OF SYSTEM TIME`](as-of-system-time.html).  The garbage collection interval is controlled by the [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables) setting.

The practical implications of the above are:

- Deleting data will not immediately decrease disk usage.
- If you issue multiple [`DELETE`](delete.html) statements in sequence that each delete large amounts of data, each subsequent `DELETE` statement will run more slowly. For details, see [Preserving `DELETE` performance over time](delete.html#preserving-delete-performance-over-time).

For more information about how the storage layer of CockroachDB works, see the [storage layer reference documentation](architecture/storage-layer.html).

## See also

Reference information related to this task:

- [`DELETE`](delete.html)
- [Bulk-delete data](bulk-delete-data.html)
- [Batch Delete Expired Data with Row-Level TTL](row-level-ttl.html)
- [Disk space usage after deletes](delete.html#disk-space-usage-after-deletes)
- [`TRUNCATE`](truncate.html)
- [`DROP TABLE`](drop-table.html)
- [Transaction Contention](performance-best-practices-overview.html#transaction-contention)

Other common tasks:

- [Connect to the Database](connect-to-the-database.html)
- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Optimize Statement Performance][fast]
- [Example Apps](example-apps.html)

<!-- Reference Links -->

[selection]: selection-queries.html
[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[fast]: make-queries-fast.html
[paginate]: pagination.html
[joins]: joins.html
