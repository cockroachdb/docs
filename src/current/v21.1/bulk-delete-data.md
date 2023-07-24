---
title: Bulk-delete Data
summary: How to delete a large amount of data from a cluster
toc: true
---

To delete a large number of rows (i.e., tens of thousands of rows or more), we recommend iteratively deleting subsets of the rows that you want to delete, until all of the unwanted rows have been deleted. You can write a script to do this, or you can write a loop into your application.

This page provides guidance on batch deleting with the `DELETE` query filter [on an indexed column](#batch-delete-on-an-indexed-column) and [on a non-indexed column](#batch-delete-on-a-non-indexed-column). Filtering on an indexed column is both simpler to implement and more efficient, but adding an index to a table can slow down insertions to the table and may cause bottlenecks. Queries that filter on a non-indexed column must perform at least one full-table scan, a process that takes time proportional to the size of the entire table.

{{site.data.alerts.callout_success}}
If you want to delete all of the rows in a table (and not just a large subset of the rows), use a [`TRUNCATE` statement](#delete-all-of-the-rows-in-a-table).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
Exercise caution when batch deleting rows from tables with foreign key constraints and explicit [`ON DELETE` foreign key actions](foreign-key.html#foreign-key-actions). To preserve `DELETE` performance on tables with foreign key actions, we recommend using smaller batch sizes, as additional rows updated or deleted due to `ON DELETE` actions can make batch loops significantly slower.
{{site.data.alerts.end}}

## Before you begin

Before reading this page, do the following:

- [Install CockroachDB](install-cockroachdb.html).
- [Start a local cluster](secure-a-cluster.html), or [create a {{ site.data.products.db }} cluster](../cockroachcloud/create-your-cluster.html).
- [Install a Postgres client](install-client-drivers.html).

    For the example on this page, we use the `psycopg2` Python driver.
- [Connect to the database](connect-to-the-database.html).
- [Insert data](insert-data.html) that you now want to delete.

    For the example on this page, we load a cluster with the [`tpcc` database](cockroach-workload.html#tpcc-workload) and data from [`cockroach workload`](cockroach-workload.html).

## Batch delete on an indexed column

For high-performance batch deletes, we recommending filtering the `DELETE` query on an [indexed column](indexes.html).

{{site.data.alerts.callout_info}}
Having an indexed filtering column can make delete operations faster, but it might lead to bottlenecks in execution, especially if the filtering column is a [timestamp](timestamp.html). To reduce bottlenecks, we recommend using a [hash-sharded index](hash-sharded-indexes.html).
{{site.data.alerts.end}}

Each iteration of a batch-delete loop should execute a transaction containing a single `DELETE` query. When writing this `DELETE` query:

- Use a `WHERE` clause to filter on a column that identifies the unwanted rows. If the filtering column is not the primary key, the column should have [a secondary index](indexes.html). Note that if the filtering column is not already indexed, it is not beneficial to add an index just to speed up batch deletes. Instead, consider [batch deleting on non-indexed columns](#batch-delete-on-a-non-indexed-column).
- To ensure that rows are efficiently scanned in the `DELETE` query, add an [`ORDER BY`](order-by.html) clause on the filtering column.
- Use a [`LIMIT`](limit-offset.html) clause to limit the number of rows to the desired batch size. To determine the optimal batch size, try out different batch sizes (1,000 rows, 10,000 rows, 100,000 rows, etc.) and monitor the change in performance.
- Add a `RETURNING` clause to the end of the query that returns the filtering column values of the deleted rows. Then, using the values of the deleted rows, update the filter to match only the subset of remaining rows to delete. This narrows each query's scan to the fewest rows possible, and [preserves the performance of the deletes over time](delete.html#preserving-delete-performance-over-time). This pattern assumes that no new rows are generated that match on the `DELETE` filter during the time that it takes to perform the delete.

For example, suppose that you want to delete all rows in the [`tpcc`](cockroach-workload.html#tpcc-workload) `new_order` table where `no_w_id` is less than `5`, in batches of 5,000 rows. To do this, you can write a script that loops over batches of 5,000 rows, following the `DELETE` query guidance provided above. Note that in this case, `no_w_id` is the first column in the primary index, and, as a result, you do not need to create a secondary index on the column.

In Python, the script would look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ python
#!/usr/bin/env python3

import psycopg2
import psycopg2.sql
import os

conn = psycopg2.connect(os.environ.get('DB_URI'))
filter = 4
lastrow = None

while True:
  with conn:
    with conn.cursor() as cur:
        if lastrow:
            filter = lastrow[0]
        query = psycopg2.sql.SQL("DELETE FROM new_order WHERE no_w_id <= %s ORDER BY no_w_id DESC LIMIT 5000 RETURNING no_w_id")
        cur.execute(query, (filter,))
        print(cur.statusmessage)
        if cur.rowcount == 0:
            break
        lastrow = cur.fetchone()

conn.close()
~~~

This script iteratively deletes rows in batches of 5,000, until all of the rows where `no_w_id <= 4` are deleted. Note that at each iteration, the filter is updated to match a narrower subset of rows.

## Batch delete on a non-indexed column

If you cannot index the column that identifies the unwanted rows, we recommend defining the batch loop to execute separate read and write operations at each iteration:

1. Execute a [`SELECT` query](selection-queries.html) that returns the primary key values for the rows that you want to delete. When writing the `SELECT` query:
    - Use a `WHERE` clause that filters on the column identifying the rows.
    - Add an [`AS OF SYSTEM TIME` clause](as-of-system-time.html) to the end of the selection subquery, or run the selection query in a separate, read-only transaction with [`SET TRANSACTION AS OF SYSTEM TIME`](as-of-system-time.html#using-as-of-system-time-in-transactions). This helps to reduce [transaction contention](transactions.html#transaction-contention).
    - Use a [`LIMIT`](limit-offset.html) clause to limit the number of rows queried to a subset of the rows that you want to delete. To determine the optimal `SELECT` batch size, try out different sizes (10,000 rows, 100,000 rows, 1,000,000 rows, etc.), and monitor the change in performance. Note that this `SELECT` batch size can be much larger than the batch size of rows that are deleted in the subsequent `DELETE` query.
    - To ensure that rows are efficiently scanned in the subsequent `DELETE` query, include an [`ORDER BY`](order-by.html) clause on the primary key.

2. Write a nested `DELETE` loop over the primary key values returned by the `SELECT` query, in batches smaller than the initial `SELECT` batch size. To determine the optimal `DELETE` batch size, try out different sizes (1,000 rows, 10,000 rows, 100,000 rows, etc.), and monitor the change in performance. Where possible, we recommend executing each `DELETE` in a separate transaction.

For example, suppose that you want to delete all rows in the [`tpcc`](cockroach-workload.html#tpcc-workload) `history` table that are older than a month. You can create a script that loops over the data and deletes unwanted rows in batches, following the query guidance provided above.

In Python, the script would look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ python
#!/usr/bin/env python3

import psycopg2
import os
import time

conn = psycopg2.connect(os.environ.get('DB_URI'))

while True:
    with conn:
        with conn.cursor() as cur:
            cur.execute("SET TRANSACTION AS OF SYSTEM TIME '-5s'")
            cur.execute("SELECT h_w_id, rowid FROM history WHERE h_date < current_date() - INTERVAL '1 MONTH' ORDER BY h_w_id, rowid LIMIT 20000")
            pkvals = list(cur)
    if not pkvals:
        return
    while pkvals:
        batch = pkvals[:5000]
        pkvals = pkvals[5000:]
        with conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM history WHERE (h_w_id, rowid) = ANY %s", (batch,))
                print(cur.statusmessage)
    del batch
    del pkvals
    time.sleep(5)

conn.close()
~~~

At each iteration, the selection query returns the primary key values of up to 20,000 rows of matching historical data from 5 seconds in the past, in a read-only transaction. Then, a nested loop iterates over the returned primary key values in smaller batches of 5,000 rows. At each iteration of the nested `DELETE` loop, a batch of rows is deleted. After the nested `DELETE` loop deletes all of the rows from the initial selection query, a time delay ensures that the next selection query reads historical data from the table after the last iteration's `DELETE` final delete.

{{site.data.alerts.callout_info}}
CockroachDB records the timestamp of each row created in a table in the `crdb_internal_mvcc_timestamp` metadata column. In the absence of an explicit timestamp column in your table, you can use `crdb_internal_mvcc_timestamp` to filter expired data.

`crdb_internal_mvcc_timestamp` cannot be indexed. As a result, we recommend following the [non-indexed column pattern](#batch-delete-on-a-non-indexed-column) if you plan to use `crdb_internal_mvcc_timestamp` as a filter for large deletes.

**Exercise caution when using `crdb_internal_mvcc_timestamp` in production, as the column is subject to change without prior notice in new releases of CockroachDB.**
{{site.data.alerts.end}}

## Batch-delete "expired" data

CockroachDB does not support Time to Live (TTL) on table rows. To delete "expired" rows, we recommend automating a batch delete process using a job scheduler like `cron`.

For example, suppose that every morning you want to delete all rows in the [`tpcc`](cockroach-workload.html#tpcc-workload) `history` table that are older than a month. To do this, you could use the example Python script that [batch deletes on the non-indexed `h_date` column](#batch-delete-on-a-non-indexed-column).

To run the script with a daily `cron` job:

1. Make the file executable:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ chmod +x cleanup.py
    ~~~

2. Create a new `cron` job:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ crontab -e
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ txt
    30 10 * * * DB_URI='cockroachdb://user@host:26257/bank' cleanup.py >> ~/cron.log 2>&1
    ~~~

Saving the `cron` file will install a new job that runs the `cleanup.py` file every morning at 10:30 A.M., writing the results to the `cron.log` file.

## Delete all of the rows in a table

To delete all of the rows in a table, use a [`TRUNCATE` statement](truncate.html).

For example, to delete all rows in the [`tpcc`](cockroach-workload.html#tpcc-workload) `new_order` table, execute the following SQL statement:

{% include_cached copy-clipboard.html %}
~~~ sql
TRUNCATE new_order;
~~~

You can execute the statement from a compatible SQL client (e.g., the [CockroachDB SQL client](cockroach-sql.html)), or in a script or application.

For example, in Python, using the `psycopg2` client driver:

{% include_cached copy-clipboard.html %}
~~~ python
#!/usr/bin/env python3

import psycopg2
import os

conn = psycopg2.connect(os.environ.get('DB_URI'))

with conn:
  with conn.cursor() as cur:
      cur.execute("TRUNCATE new_order")
~~~

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `TRUNCATE` statement, including additional examples, see the [`TRUNCATE` syntax page](truncate.html).
{{site.data.alerts.end}}

## See also

- [Delete data](delete-data.html)
- [`DELETE`](delete.html)
- [`TRUNCATE`](truncate.html)
