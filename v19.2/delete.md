---
title: DELETE
summary: The DELETE statement deletes rows from a table.
toc: true
---

The `DELETE` [statement](sql-statements.html) deletes rows from a table.

{{site.data.alerts.callout_danger}}If you delete a row that is referenced by a <a href="foreign-key.html">foreign key constraint</a> and has an <a href="foreign-key.html#foreign-key-actions"><code>ON DELETE</code> action</a>, all of the dependent rows will also be deleted or updated.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}To delete columns, see <a href="drop-column.html"><code>DROP COLUMN</code></a>.{{site.data.alerts.end}}

## Performance best practices

- To delete all rows in a table, use [`TRUNCATE`][truncate] instead of `DELETE`. Unless your table is small (less than 1000 rows), `TRUNCATE` will be more performant.

- To delete a large number of rows, we recommend iteratively deleting batches of rows until all of the unwanted rows are deleted. For more information, see [batch deletes](#batch-deletes).

## Required privileges

The user must have the `DELETE` and `SELECT` [privileges](authorization.html#assign-privileges) on the table.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/delete.html %}
</div>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|-------------
 `common_table_expr` | See [Common Table Expressions](common-table-expressions.html).
 `table_name` | The name of the table that contains the rows you want to update.
 `AS table_alias_name` | An alias for the table name. When an alias is provided, it completely hides the actual table name.
`WHERE a_expr`| `a_expr` must be an expression that returns Boolean values using columns (e.g., `<column> = <value>`). Delete rows that return   `TRUE`.<br><br/>__Without a `WHERE` clause in your statement, `DELETE` removes all rows from the table. To delete all rows in a table, we recommend using `TRUNCATE` instead of `DELETE`.__
 `sort_clause` | An `ORDER BY` clause. <br /><br /> See [Ordering of rows in DML statements](query-order.html#ordering-rows-in-dml-statements) for more details.
 `limit_clause` | A `LIMIT` clause. See [Limiting Query Results](limit-offset.html) for more details.
 `RETURNING target_list` | Return values based on rows deleted, where `target_list` can be specific column names from the table, `*` for all columns, or computations using [scalar expressions](scalar-expressions.html). <br><br>To return nothing in the response, not even the number of rows updated, use `RETURNING NOTHING`.

## Success responses

Successful `DELETE` statements return one of the following:

 Response | Description
-----------|-------------
`DELETE` _`int`_ | _int_ rows were deleted.<br><br>`DELETE` statements that do not delete any rows respond with `DELETE 0`. When `RETURNING NOTHING` is used, this information is not included in the response.
Retrieved table | Including the `RETURNING` clause retrieves the deleted rows, using the columns identified by the clause's parameters.<br><br>[See an example.](#return-deleted-rows)

## Batch deletes

To delete a large number of rows, we recommend iteratively deleting batches of rows with a [`LIMIT`](limit-offset.html) clause. You can script a simple loop to do this.

For example, in Python, this would look similar to the following:

{% include copy-clipboard.html %}
~~~ python
while True:
    with conn.cursor() as cur:
        cur.execute("DELETE from bank WHERE {0} LIMIT {1}".format(filter, batchsize))
        print(cur.statusmessage)
        if cur.statusmessage == 'DELETE 0':
            sys.exit()
    conn.commit()
~~~

To determine the optimal batch size for your application, try out different batch sizes (1000 rows, 10000 rows, 100000 rows, etc.) and monitor the change in performance.

{{site.data.alerts.callout_info}}
If you are batch-deleting a large amount of data, you might see a drop in performance for each subsequent batch. For an explanation of why this happens, and for instructions showing how to iteratively delete rows in constant time, see [Why are my deletes getting slower over time?](sql-faqs.html#why-are-my-deletes-getting-slower-over-time).
{{site.data.alerts.end}}

## Disk space usage after deletes

Deleting a row does not immediately free up the disk space. This is
due to the fact that CockroachDB retains [the ability to query tables
historically](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/).

If disk usage is a concern, the solution is to
[reduce the garbage collection time-to-live](configure-replication-zones.html) (TTL) for
the zone by setting `gc.ttlseconds` to a lower value, which will cause
garbage collection to clean up deleted objects (rows, tables) more
frequently.

## Select performance on deleted rows

Queries that scan across tables that have lots of deleted rows will
have to scan over deletions that have not yet been garbage
collected. Certain database usage patterns that frequently scan over
and delete lots of rows will want to reduce the
[garbage collection time-to-live](configure-replication-zones.html) values to clean up
deleted rows more frequently.

## Sorting the output of deletes

{% include {{page.version.version}}/misc/sorting-delete-output.md %}

For more information about ordering query results in general, see
[Ordering Query Results](query-order.html) and [Ordering of rows in
DML statements](query-order.html#ordering-rows-in-dml-statements).

## Force index selection for deletes

<span class="version-tag">New in v19.2:</span> By using the explicit index annotation (also known as "index hinting"), you can override [CockroachDB's index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/) and use a specific [index](indexes.html) for deleting rows of a named table.

{{site.data.alerts.callout_info}}
Index selection can impact [performance](performance-best-practices-overview.html), but does not change the result of a query.
{{site.data.alerts.end}}

The syntax to force a specific index for a delete is:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM table@my_idx;
~~~

This is equivalent to the longer expression:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM table@{FORCE_INDEX=my_idx};
~~~

To view how the index hint modifies the query plan that CockroachDB follows for deleting rows, use an [`EXPLAIN`](explain.html#opt-option) statement. To see all indexes available on a table, use [`SHOW INDEXES`](show-index.html).

For examples, see [Delete with index hints](#delete-with-index-hints).

## Delete "expired" data

CockroachDB does not support Time to Live (TTL) on table rows. To delete "expired" rows, we recommend automating a [batch delete process](#batch-deletes) using a job scheduler like `cron`.

For example, consider the following Python script:

{% include copy-clipboard.html %}
~~~ python
#!/usr/bin/env python3

import psycopg2
import sys
import os

conn = psycopg2.connect(os.environ.get('DB_URI'))
batchsize = 10000

while True:
    with conn.cursor() as cur:
        cur.execute("DELETE from bank WHERE timestamp < current_date() - INTERVAL '1 MONTH' LIMIT {0}".format(batchsize))
        if cur.statusmessage == 'DELETE 0':
            sys.exit()
    conn.commit()
~~~

This script deletes all rows older than a month, working iteratively in batches of 10,000 rows. To run this script with a daily `cron` job:

1. Make the file executable:

  {% include copy-clipboard.html %}
  ~~~ shell
  $ chmod +x cleanup.py
  ~~~

2. Create a new `cron` job:

  {% include copy-clipboard.html %}
  ~~~ shell
  $ crontab -e
  ~~~

  {% include copy-clipboard.html %}
  ~~~ txt
  30 10 * * * cleanup.py >> ~/cron.log 2>&1
  ~~~

Saving the `cron` file will install a new job that runs the `cleanup.py` file every morning at 10:00 A.M., writing the results to the `cron.log` file.

{{site.data.alerts.callout_info}}
CockroachDB versions < v20.2 do not automatically create timestamp data for table rows. As a result, your table must have a timestamp column to follow the pattern demonstrated above.
{{site.data.alerts.end}}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Delete rows using Primary Key/unique columns

Using columns with the [Primary Key](primary-key.html) or [Unique](unique.html) constraints to delete rows ensures your statement is unambiguous&mdash;no two rows contain the same column value, so it's less likely to delete data unintentionally.

In this example, `code` is our primary key and we want to delete the row where the code equals "about_stuff_city". Because we're positive no other rows have that value in the `code` column, there's no risk of accidentally removing another row.

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM promo_codes WHERE code = 'about_stuff_city';
~~~
~~~
DELETE 1
~~~

### Delete rows using non-unique columns

Deleting rows using non-unique columns removes _every_ row that returns `TRUE` for the `WHERE` clause's `a_expr`. This can easily result in deleting data you didn't intend to.

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM promo_codes WHERE creation_time > '2019-01-30 00:00:00+00:00';
~~~
~~~
DELETE 4
~~~

The example statement deleted four rows, which might be unexpected.

### Return deleted rows

To see which rows your statement deleted, include the `RETURNING` clause to retrieve them using the columns you specify.

#### Use all columns

By specifying `*`, you retrieve all columns of the delete rows.

#### Use specific columns

To retrieve specific columns, name them in the `RETURNING` clause.

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM promo_codes WHERE creation_time > '2019-01-29 00:00:00+00:00' RETURNING code, rules;
~~~
~~~
           code          |                    rules
+------------------------+----------------------------------------------+
  box_investment_stuff   | {"type": "percent_discount", "value": "10%"}
  energy_newspaper_field | {"type": "percent_discount", "value": "10%"}
  simple_guy_theory      | {"type": "percent_discount", "value": "10%"}
  study_piece_war        | {"type": "percent_discount", "value": "10%"}
  tv_this_list           | {"type": "percent_discount", "value": "10%"}
(5 rows)

~~~

#### Change column labels

When `RETURNING` specific columns, you can change their labels using `AS`.

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM promo_codes WHERE creation_time > '2019-01-28 00:00:00+00:00' RETURNING code, rules AS discount;
~~~
~~~
         code         |                   discount
+---------------------+----------------------------------------------+
  chair_company_state | {"type": "percent_discount", "value": "10%"}
  view_reveal_radio   | {"type": "percent_discount", "value": "10%"}
(2 rows)
~~~

#### Sort and return deleted rows

To sort and return deleted rows, use a statement like the following:

{% include copy-clipboard.html %}
~~~ sql
> WITH a AS (DELETE FROM promo_codes WHERE creation_time > '2019-01-27 00:00:00+00:00' RETURNING *)
  SELECT * FROM a ORDER BY expiration_time;
~~~

~~~
             code            |                                                                                                  description                                                                                                   |       creation_time       |      expiration_time      |                    rules
+----------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------+---------------------------+----------------------------------------------+
  often_thing_hair           | Society right wish face see if pull. Great generation social bar read budget wonder natural. Somebody dark field economic material. Nature nature paper law worry common. Serious activity hospital wide none. | 2019-01-27 03:04:05+00:00 | 2019-01-29 03:04:05+00:00 | {"type": "percent_discount", "value": "10%"}
  step_though_military       | Director middle summer most create any.                                                                                                                                                                        | 2019-01-27 03:04:05+00:00 | 2019-01-29 03:04:05+00:00 | {"type": "percent_discount", "value": "10%"}
  own_whose_economy          | Social participant order this. Guy toward nor indeed police player inside nor. Model education voice several college art on. Start listen their maybe.                                                         | 2019-01-27 03:04:05+00:00 | 2019-01-30 03:04:05+00:00 | {"type": "percent_discount", "value": "10%"}
  crime_experience_certainly | Prepare right teacher mouth student. Trouble condition weight during scene something stand.                                                                                                                    | 2019-01-27 03:04:05+00:00 | 2019-01-31 03:04:05+00:00 | {"type": "percent_discount", "value": "10%"}
  policy_its_wife            | Player either she something good minute or. Nearly policy player receive. Somebody mean book store fire realize.                                                                                               | 2019-01-27 03:04:05+00:00 | 2019-01-31 03:04:05+00:00 | {"type": "percent_discount", "value": "10%"}
(5 rows)
~~~

### Delete with index hints

Suppose you create a multi-column index on the `users` table with the `name` and `city` columns.

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name, city);
~~~

Now suppose you want to delete the two users named "Jon Snow". You can use the [`EXPLAIN (OPT)`](explain.html#opt-option) command to see how the [cost-based optimizer](cost-based-optimizer.html) decides to perform the delete:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) DELETE FROM users WHERE name='Jon Snow';
~~~

~~~
                                 text
+---------------------------------------------------------------------+
  delete users
   └── scan users@users_name_city_idx
        └── constraint: /8/7/6: [/'Jon Snow' - /'Jon Snow']
(3 rows)
~~~

The output of the `EXPLAIN` statement shows that the optimizer scans the newly-created `users_name_city_idx` index when performing the delete. This makes sense, as you are performing a delete based on the `name` column.

Now suppose that instead you want to perform a delete, but using the `id` column instead.

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) DELETE FROM users WHERE id IN ('70a3d70a-3d70-4400-8000-000000000016', '3d70a3d7-0a3d-4000-8000-00000000000c');
~~~

~~~
                                                  text
+-------------------------------------------------------------------------------------------------------+
  delete users
   └── select
        ├── scan users@users_name_city_idx
        └── filters
             └── id IN ('3d70a3d7-0a3d-4000-8000-00000000000c', '70a3d70a-3d70-4400-8000-000000000016')
(5 rows)
~~~

The optimizer still scans the newly-created `users_name_city_idx` index when performing the delete. Although scanning the table on this index could still be the most efficient, you may want to assess the performance difference between using `users_name_city_idx` and an index on the `id` column, as you are performing a delete with a filter on the `id` column.

If you provide an index hint (i.e. force the index selection) to use the primary index on the column instead, the CockroachDB will scan the users table using the primary index, on `city`, and `id`.

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) DELETE FROM users@primary WHERE id IN ('70a3d70a-3d70-4400-8000-000000000016', '3d70a3d7-0a3d-4000-8000-00000000000c');
~~~

~~~
                                                  text
+-------------------------------------------------------------------------------------------------------+
  delete users
   └── select
        ├── scan users
        │    └── flags: force-index=primary
        └── filters
             └── id IN ('3d70a3d7-0a3d-4000-8000-00000000000c', '70a3d70a-3d70-4400-8000-000000000016')
(6 rows)
~~~

## See also

- [`INSERT`](insert.html)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)
- [`TRUNCATE`][truncate]
- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
- [Limiting Query Results](limit-offset.html)

<!-- Reference Links -->

[truncate]: truncate.html

<!--

SQL for example table:

CREATE TABLE account_details (
       account_id INT PRIMARY KEY,
       balance FLOAT,
       account_type VARCHAR
);

INSERT INTO account_details (account_id, balance, account_type) VALUES (1, 32000, 'Savings');
INSERT INTO account_details (account_id, balance, account_type) VALUES (2, 30000, 'Checking');
INSERT INTO account_details (account_id, balance, account_type) VALUES (3, 30000, 'Savings');
INSERT INTO account_details (account_id, balance, account_type) VALUES (4, 22000, 'Savings');
INSERT INTO account_details (account_id, balance, account_type) VALUES (5, 43696.95, 'Checking');
INSERT INTO account_details (account_id, balance, account_type) VALUES (6, 23500, 'Savings');
INSERT INTO account_details (account_id, balance, account_type) VALUES (7, 79493.51, 'Checking');
INSERT INTO account_details (account_id, balance, account_type) VALUES (8, 40761.66, 'Savings');
INSERT INTO account_details (account_id, balance, account_type) VALUES (9, 2111.67, 'Checking');
INSERT INTO account_details (account_id, balance, account_type) VALUES (10, 59173.15, 'Savings');

-->
