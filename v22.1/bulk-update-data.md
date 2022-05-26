---
title: Bulk-update Data
summary: How to to update a large amount of data using batch-update loops.
toc: true
docs_area: develop
---

To update multiple rows in a table, you can use a single [`UPDATE` statement](update.html), with a `WHERE` clause that filters the rows you want to update.

To update a large number of rows (i.e., tens of thousands of rows or more), we recommend iteratively updating subsets of the rows that you want to update, until all of the rows have been updated. You can write a script to do this, or you can write a loop into your application.

This page provides guidance on writing batch-update loops with a pattern that executes `SELECT` and `UPDATE` statements at different levels of a nested loop.

{{site.data.alerts.callout_danger}}
Exercise caution when batch-updating rows from tables with foreign key constraints and explicit [`ON UPDATE` foreign key actions](foreign-key.html#foreign-key-actions). To preserve `UPDATE` performance on tables with foreign key actions, we recommend using smaller batch sizes, as additional rows updated due to `ON UPDATE` actions can make batch loops significantly slower.
{{site.data.alerts.end}}

## Before you begin

Before reading this page, do the following:

- [Install CockroachDB](install-cockroachdb.html).
- [Start a local cluster](secure-a-cluster.html), or [create a {{ site.data.products.dedicated }} cluster](../cockroachcloud/create-your-cluster.html).
- [Install a PostgreSQL client](install-client-drivers.html).

    For the example on this page, we use the `psycopg2` Python driver.
- [Connect to the database](connect-to-the-database.html).
- [Insert data](insert-data.html) that you now want to update.

    For the example on this page, we load a cluster with the `movr` database and data from [`cockroach workload`](cockroach-workload.html).

## Write a batch-update loop

1. At the top level of a loop in your application, or in a script, execute a [`SELECT`](selection-queries.html) query that returns a large batch of primary key values for the rows that you want to update. When defining the `SELECT` query:
    - Use a `WHERE` clause to filter on columns that identify the rows that you want to update. This clause should also filter out the rows that have been updated by previous iterations of the nested `UPDATE` loop:
        - For optimal performance, the first condition of the filter should evaluate the last primary key value returned by the last `UPDATE` query that was executed. This narrows each `SELECT` query's scan to the fewest rows possible, and preserves the performance of the row updates over time.
        - Another condition of the filter should evaluate column values persisted to the database that signal whether or not a row has been updated. This prevents rows from being updated more than once, in the event that the application or script crashes and needs to be restarted. If there is no way to distinguish between an updated row and a row that has not yet been updated, you might need to [add a new column to the table](add-column.html) (e.g., `ALTER TABLE ... ADD COLUMN updated BOOL;`).
    - Add an [`AS OF SYSTEM TIME` clause](as-of-system-time.html) to the end of the selection subquery, or run the selection query in a separate, read-only transaction with [`SET TRANSACTION AS OF SYSTEM TIME`](as-of-system-time.html#use-as-of-system-time-in-transactions). This helps to reduce [transaction contention](transactions.html#transaction-contention).
    - Use a [`LIMIT`](limit-offset.html) clause to limit the number of rows queried to a subset of the rows that you want to update. To determine the optimal `SELECT` batch size, try out different sizes (10,000 rows, 20,000 rows, etc.), and monitor the change in performance. Note that this `SELECT` batch size can be much larger than the batch size of rows that are updated in the subsequent `UPDATE` query.
    - To ensure that rows are efficiently scanned in the subsequent `UPDATE` query, include an [`ORDER BY`](order-by.html) clause on the primary key.

1. Under the `SELECT` query, write a nested loop that executes `UPDATE` queries over the primary key values returned by the `SELECT` query, in batches smaller than the initial `SELECT` batch size. When defining the `UPDATE` query:
    - Use a `WHERE` clause that filters on a subset of the primary key values returned by the top-level `SELECT` query. To determine the optimal `UPDATE` batch size, try out different sizes (1,000 rows, 2,000 rows, etc.), and monitor the change in performance.
    - Make sure that the `UPDATE` query updates a column that signals whether or not the row has been updated. This column might be different from the column whose values you want to update.
    - Add a `RETURNING` clause to the end of the query that returns the primary key values of the rows being updated. The `WHERE` clause in the top-level `SELECT` query should filter out the primary key value of the last row that was updated, using the values returned by the last `UPDATE` query executed.
    - Where possible, we recommend executing each `UPDATE` in a separate transaction.

## Example

Suppose that over the past year, you've recorded hundreds of thousands of [MovR](movr.html) rides in a cluster loaded with the [`movr`](cockroach-workload.html) database. And suppose that, for the last week of December, you applied a 10% discount to all ride charges billed to users, but you didn't update the `rides` table to reflect the discounts.

To get the `rides` table up-to-date, you can create a loop that updates the relevant rows of the `rides` table in batches, following the query guidance provided [above](#write-a-batch-update-loop).

In this case, you will also need to add a new column to the `rides` table that signals whether or not a row has been updated. Using this column, the top-level `SELECT` query can filter out rows that have already been updated, which will prevent rows from being updated more than once if the script crashes.

For example, you could create a column named `discounted`, of data type [`BOOL`](bool.html):

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE rides ADD COLUMN discounted BOOL DEFAULT false;
~~~

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

In Python, a batch-update script might look similar to the following:

{% include copy-clipboard.html %}
~~~ python
#!/usr/bin/env python3

import psycopg2
import os
import time

def main():
    conn = psycopg2.connect(os.environ.get('DB_URI'))
    lastid = None

    while True:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SET TRANSACTION AS OF SYSTEM TIME '-5s'")
                if lastid:
                    cur.execute("SELECT id FROM rides WHERE id > %s AND discounted != true AND extract('month', start_time) = 12 AND extract('day', start_time) > 23 ORDER BY id LIMIT 10000", (lastid,))
                else:
                    cur.execute("SELECT id FROM rides WHERE discounted != true AND extract('month', start_time) = 12 AND extract('day', start_time) > 23 ORDER BY id LIMIT 10000")
                pkvals = list(cur)
        if not pkvals:
            return
        while pkvals:
            batch = pkvals[:2000]
            pkvals = pkvals[2000:]
            with conn:
                with conn.cursor() as cur:
                    cur.execute("UPDATE rides SET discounted = true, revenue = revenue*.9 WHERE id = ANY %s RETURNING id", (batch,))
                    print(cur.statusmessage)
                    if not pkvals:
                        lastid = cur.fetchone()[0]
        del batch
        del pkvals
        time.sleep(5)

    conn.close()
if __name__ == '__main__':
    main()
~~~

At each iteration, the `SELECT` query returns the primary key values of up to 10,000 rows of matching historical data from 5 seconds in the past, in a read-only transaction. Then, a nested loop iterates over the returned primary key values in smaller batches of 2,000 rows. At each iteration of the nested `UPDATE` loop, a batch of rows is updated. After the nested `UPDATE` loop updates all of the rows from the initial selection query, a time delay ensures that the next selection query reads historical data from the table after the last iteration's `UPDATE` final update.

Note that the last iteration of the nested loop assigns the primary key value of the last row updated to the `lastid` variable. The next `SELECT` query uses this variable to decrease the number of rows scanned by the number of rows updated in the last iteration of the loop.

## See also

- [Update data](update-data.html)
- [`UPDATE`](update.html)
