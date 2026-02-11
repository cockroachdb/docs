---
title: Delete Data
summary: How to delete data from CockroachDB during application development
toc: true
docs_area: develop
---

This page has instructions for deleting rows of data from CockroachDB, using the [`DELETE`]({% link {{ page.version.version }}/delete.md %}) [SQL statement]({% link {{ page.version.version }}/sql-statements.md %}).

## Before you begin

Before reading this page, do the following:

- [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/quickstart.md %}) or [start a local cluster]({% link cockroachcloud/quickstart.md %}?filters=local).
- [Install a Driver or ORM Framework]({% link {{ page.version.version }}/install-client-drivers.md %}).
- [Connect to the database]({% link {{ page.version.version }}/connect-to-the-database.md %}).
- [Create a database schema]({% link {{ page.version.version }}/schema-design-overview.md %}).
- [Insert data]({% link {{ page.version.version }}/insert-data.md %}) that you now want to delete.

    In the examples on this page, we use sample [`movr`]({% link {{ page.version.version }}/movr.md %}) data imported with the [`cockroach workload` command]({% link {{ page.version.version }}/cockroach-workload.md %}).

## Use `DELETE`

To delete rows in a table, use a [`DELETE` statement]({% link {{ page.version.version }}/update.md %}) with a `WHERE` clause that filters on the columns that identify the rows that you want to delete.

### SQL syntax

In SQL, `DELETE` statements generally take the following form:

~~~
DELETE FROM {table} WHERE {filter_column} {comparison_operator} {filter_value}
~~~

Where:

- `{table}` is a table with rows that you want to delete.
- `{filter_column}` is the column to filter on.
- `{comparison_operator}` is a [comparison operator]({% link {{ page.version.version }}/functions-and-operators.md %}#operators) that resolves to `TRUE` or `FALSE` (e.g., `=`).
- `{filter_value}` is the matching value for the filter.

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `DELETE` statement, including additional examples, see the [`DELETE` syntax page]({% link {{ page.version.version }}/delete.md %}).
{{site.data.alerts.end}}

### Best practices

Here are some best practices to follow when deleting rows:

- Limit the number of `DELETE` statements that you execute. It's more efficient to delete multiple rows with a single statement than to execute multiple `DELETE` statements that each delete a single row.
- Always specify a `WHERE` clause in `DELETE` queries. If no `WHERE` clause is specified, CockroachDB will delete all of the rows in the specified table.
- To delete all of the rows in a table, use a [`TRUNCATE` statement]({% link {{ page.version.version }}/truncate.md %}) instead of a `DELETE` statement.
- To delete a large number of rows (i.e., tens of thousands of rows or more), use a [batch-delete loop]({% link {{ page.version.version }}/bulk-delete-data.md %}#batch-delete-on-an-indexed-column).
- When executing `DELETE` statements from an application, make sure that you wrap the SQL-executing functions in [a retry loop that handles transaction errors]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#transaction-retry-errors) that can occur under [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).
- Review the [performance considerations below](#performance-considerations).

### Examples

#### Delete rows filtered on a non-unique column

Suppose that you want to delete the vehicle location history data recorded during a specific hour of a specific day. To delete all of the rows in the `vehicle_location_histories` table where the `timestamp` is between two [`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %}) values:

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL</button>
  <button class="filter-button" data-scope="go">Go (lib/pq)</button>
  <button class="filter-button" data-scope="java">Java (jdbc)</button>
  <button class="filter-button" data-scope="python">Python (psycopg2)</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM vehicle_location_histories WHERE timestamp BETWEEN '2021-03-17 14:00:00' AND '2021-03-17 15:00:00';
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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
If the `WHERE` clause evaluates to `TRUE` for a large number of rows (i.e., tens of thousands of rows), use a [batch-delete loop]({% link {{ page.version.version }}/bulk-delete-data.md %}#batch-delete-on-an-indexed-column) instead of executing a simple `DELETE` query.
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

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE from promo_codes WHERE code IN ('0_explain_theory_something', '100_address_garden_certain', '1000_do_write_words');
~~~

For more information about how to use the built-in SQL client, see the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

Because of the way CockroachDB works under the hood, deleting data from the database does not immediately reduce disk usage.  Instead, records are marked as "deleted" and processed asynchronously by a background garbage collection process. Once the marked records are older than [the specified TTL interval]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds), they are eligible to be removed.  The garbage collection interval is designed to allow sufficient time for running [backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}) and [time travel queries using `AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}). The garbage collection interval is controlled by the [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) setting.

The practical implications of the above are:

- Deleting data will not immediately decrease disk usage.
- If you issue multiple [`DELETE`]({% link {{ page.version.version }}/delete.md %}) statements in sequence that each delete large amounts of data, each subsequent `DELETE` statement will run more slowly. For details, see [Preserving `DELETE` performance over time]({% link {{ page.version.version }}/delete.md %}#preserving-delete-performance-over-time).

For more information about how the storage layer of CockroachDB works, see the [storage layer reference documentation]({% link {{ page.version.version }}/architecture/storage-layer.md %}).

## See also

Reference information related to this task:

- [`DELETE`]({% link {{ page.version.version }}/delete.md %})
- [Bulk-delete data]({% link {{ page.version.version }}/bulk-delete-data.md %})
- [Batch Delete Expired Data with Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %})
- [Disk space usage after deletes]({% link {{ page.version.version }}/delete.md %}#disk-space-usage-after-deletes)
- [`TRUNCATE`]({% link {{ page.version.version }}/truncate.md %})
- [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %})
- [Transaction Contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention)

Other common tasks:

- [Connect to the Database]({% link {{ page.version.version }}/connect-to-the-database.md %})
- [Insert Data]({% link {{ page.version.version }}/insert-data.md %})
- [Query Data]({% link {{ page.version.version }}/query-data.md %})
- [Update Data]({% link {{ page.version.version }}/update-data.md %})
- [Run Multi-Statement Transactions]({% link {{ page.version.version }}/run-multi-statement-transactions.md %})
- [Troubleshoot SQL Statements]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})
- [Optimize Statement Performance][fast]
- [Example Apps]({% link {{ page.version.version }}/example-apps.md %})

{% comment %} Reference Links {% endcomment %}

[selection]: selection-queries.html
[manual]: manual-deployment.html
[orchestrated]: orchestration.html
[fast]: make-queries-fast.html
[paginate]: pagination.html
[joins]: joins.html
