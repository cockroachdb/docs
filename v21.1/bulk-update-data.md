---
title: Bulk-update Data
summary: How to update a large amount of data in a cluster
toc: true
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
- [Start a local cluster](secure-a-cluster.html), or [create a CockroachCloud cluster](../cockroachcloud/create-your-cluster.html).
- [Install a Postgres client](install-client-drivers.html).

    For the example on this page, we use the `psycopg2` Python driver.
- [Connect to the database](connect-to-the-database.html).
- [Insert data](insert-data.html) that you now want to update.

    For the example on this page, we load a cluster with the `movr` database and data from [`cockroach workload`](cockroach-workload.html).

## Write a batch-update loop

1. At the top level of a loop in your application, or in a script, execute a `SELECT` query that returns a large batch of primary key values for the rows that you want to update. When defining the `SELECT` query:
    - Use a `WHERE` clause that filters on the column identifying the rows that you want to update. This clause should also filter out the rows that have been updated by previous iterations of the `UPDATE` loop.
    - Add an [`AS OF SYSTEM TIME` clause](as-of-system-time.html) to the end of the selection subquery, or run the selection query in a separate, read-only transaction with [`SET TRANSACTION AS OF SYSTEM TIME`](as-of-system-time.html#using-as-of-system-time-in-transactions). This helps to reduce [transaction contention](transactions.html#transaction-contention).
    - Use a [`LIMIT`](limit-offset.html) clause to limit the number of rows queried to a subset of the rows that you want to update. To determine the optimal `SELECT` batch size, try out different sizes (10,000 rows, 20,000 rows, etc.), and monitor the change in performance. Note that this `SELECT` batch size can be much larger than the batch size of rows that are updated in the subsequent `UPDATE` query.
    - To ensure that rows are efficiently scanned in the subsequent `UPDATE` query, include an [`ORDER BY`](order-by.html) clause on the primary key.

1. Under the `SELECT` query, write a nested loop that executes `UPDATE` queries over the primary key values returned by the `SELECT` query, in batches smaller than the initial `SELECT` batch size. To determine the optimal `UPDATE` batch size, try out different sizes (1,000 rows, 2,000 rows, etc.), and monitor the change in performance. Where possible, we recommend executing each `UPDATE` in a separate transaction.

## Example

Suppose that over the past year, you've recorded hundreds of thousands of [MovR](movr.html) rides in a cluster loaded with the [`movr`](cockroach-workload.html) database. And suppose that, for the last week of December, you applied a 10% discount to all ride charges billed to users, but you didn't update the `rides` table to reflect the discounts.

To get the `rides` table up-to-date, you can create a loop that updates the relevant rows of the `rides` table in batches, following the query guidance provided [above](#write-a-batch-update-loop).

In this case, you will also need to add a new column to the `rides` table that signals whether or not a row has been updated. Using this column, the top-level `SELECT` query can filter out rows that have already been updated, which will prevent rows from being updated more than once.

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

    while True:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SET TRANSACTION AS OF SYSTEM TIME '-5s'")
                cur.execute("SELECT id FROM rides WHERE discounted != true AND extract('month', start_time) = 12 AND extract('day', start_time) > 23 ORDER BY id LIMIT 10000")
                pkvals = list(cur)
        if not pkvals:
            return
        while pkvals:
            batch = pkvals[:2000]
            pkvals = pkvals[2000:]
            with conn:
                with conn.cursor() as cur:
                    cur.execute("UPDATE rides SET discounted = true, revenue = revenue*.9 WHERE id = ANY %s", (batch,))
                    print(cur.statusmessage)
        del batch
        del pkvals
        time.sleep(5)

    conn.close()
if __name__ == '__main__':
    main()
~~~

At each iteration, the `SELECT` query returns the primary key values of up to 10,000 rows of matching historical data from 5 seconds in the past, in a read-only transaction. Then, a nested loop iterates over the returned primary key values in smaller batches of 2,000 rows. At each iteration of the nested `UPDATE` loop, a batch of rows is updated. After the nested `UPDATE` loop updates all of the rows from the initial selection query, a time delay ensures that the next selection query reads historical data from the table after the last iteration's `UPDATE` final update.

## See also

- [Update data](update-data.html)
- [`UPDATE`](update.html)
