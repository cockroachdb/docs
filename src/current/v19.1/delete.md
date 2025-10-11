---
title: DELETE
summary: The DELETE statement deletes one or more rows from a table.
toc: true
---

The `DELETE` [statement](sql-statements.html) deletes rows from a table.

{{site.data.alerts.callout_danger}}If you delete a row that is referenced by a <a href="foreign-key.html">foreign key constraint</a> and has an <a href="foreign-key.html#foreign-key-actions"><code>ON DELETE</code> action</a>, all of the dependent rows will also be deleted or updated.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}To delete columns, see <a href="drop-column.html"><code>DROP COLUMN</code></a>.{{site.data.alerts.end}}

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
`WHERE a_expr`| `a_expr` must be an expression that returns Boolean values using columns (e.g., `<column> = <value>`). Delete rows that return `TRUE`.<br><br/>__Without a `WHERE` clause in your statement, `DELETE` removes all rows from the table.__
 `sort_clause` | An `ORDER BY` clause. <br /><br /> <span class="version-tag">New in v19.1</span>: The `ORDER BY` clause can no longer be used with a `DELETE` statement when there is no `LIMIT` clause present.
 `limit_clause` | A `LIMIT` clause. See [Limiting Query Results](limit-offset.html) for more details.
 `RETURNING target_list` | Return values based on rows deleted, where `target_list` can be specific column names from the table, `*` for all columns, or computations using [scalar expressions](scalar-expressions.html). <br><br>To return nothing in the response, not even the number of rows updated, use `RETURNING NOTHING`.

## Success responses

Successful `DELETE` statements return one of the following:

 Response | Description
-----------|-------------
`DELETE` _`int`_ | _int_ rows were deleted.<br><br>`DELETE` statements that do not delete any rows respond with `DELETE 0`. When `RETURNING NOTHING` is used, this information is not included in the response.
Retrieved table | Including the `RETURNING` clause retrieves the deleted rows, using the columns identified by the clause's parameters.<br><br>[See an example.](#return-deleted-rows)

## Disk space usage after deletes

Deleting a row does not immediately free up the disk space. This is
due to the fact that CockroachDB retains [the ability to query tables
historically](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/).

If disk usage is a concern, the solution is to
[reduce the time-to-live](configure-replication-zones.html) (TTL) for
the zone by setting `gc.ttlseconds` to a lower value, which will cause
garbage collection to clean up deleted objects (rows, tables) more
frequently.

## Select performance on deleted rows

Queries that scan across tables that have lots of deleted rows will
have to scan over deletions that have not yet been garbage
collected. Certain database usage patterns that frequently scan over
and delete lots of rows will want to reduce the
[time-to-live](configure-replication-zones.html) values to clean up
deleted rows more frequently.

## Sorting the output of deletes

{% include {{page.version.version}}/misc/sorting-delete-output.md %}

For more information about ordering query results in general, see
[Ordering Query Results](query-order.html).

## Delete performance on large data sets

If you are deleting a large amount of data using iterative `DELETE ... LIMIT` statements, you are likely to see a drop in performance for each subsequent `DELETE` statement.

For an explanation of why this happens, and for instructions showing how to iteratively delete rows in constant time, see [Why are my deletes getting slower over time?](sql-faqs.html#why-are-my-deletes-getting-slower-over-time).

## Force index selection for deletes

By using the explicit index annotation (also known as "index hinting"), you can override [CockroachDB's index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/) and use a specific [index](indexes.html) for deleting rows of a named table.

{{site.data.alerts.callout_info}}
Index selection can impact [performance](performance-best-practices-overview.html), but does not change the result of a query.
{{site.data.alerts.end}}

The syntax to force a specific index for a delete is:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM table@my_idx;
~~~

This is equivalent to the longer expression:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM table@{FORCE_INDEX=my_idx};
~~~

To view how the index hint modifies the query plan that CockroachDB follows for deleting rows, use an [`EXPLAIN`](explain.html#opt-option) statement. To see all indexes available on a table, use [`SHOW INDEXES`](show-index.html).

## Examples

### Delete all rows

You can delete all rows from a table by not including a `WHERE` clause in your `DELETE` statement.

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM account_details;
~~~
~~~
DELETE 7
~~~

{{site.data.alerts.callout_success}}
Unless your table is small (less than 1000 rows), using [`TRUNCATE`][truncate] to delete the contents of a table will be more performant than using `DELETE`.
{{site.data.alerts.end}}

### Delete specific rows

When deleting specific rows from a table, the most important decision you make is which columns to use in your `WHERE` clause. When making that choice, consider the potential impact of using columns with the [Primary Key](primary-key.html)/[Unique](unique.html) constraints (both of which enforce uniqueness) versus those that are not unique.

#### Delete rows using Primary Key/unique columns

Using columns with the [Primary Key](primary-key.html) or [Unique](unique.html) constraints to delete rows ensures your statement is unambiguous&mdash;no two rows contain the same column value, so it's less likely to delete data unintentionally.

In this example, `account_id` is our primary key and we want to delete the row where it equals 1. Because we're positive no other rows have that value in the `account_id` column, there's no risk of accidentally removing another row.

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM account_details WHERE account_id = 1 RETURNING *;
~~~
~~~
 account_id | balance | account_type
------------+---------+--------------
          1 |   32000 | Savings
(1 row)

DELETE 1
~~~

#### Delete rows using non-unique columns

Deleting rows using non-unique columns removes _every_ row that returns `TRUE` for the `WHERE` clause's `a_expr`. This can easily result in deleting data you didn't intend to.

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM account_details WHERE balance = 30000 RETURNING *;
~~~
~~~
 account_id | balance | account_type
------------+---------+--------------
          2 |   30000 | Checking
          3 |   30000 | Savings
(2 rows)

DELETE 2
~~~

The example statement deleted two rows, which might be unexpected.

### Return deleted rows

To see which rows your statement deleted, include the `RETURNING` clause to retrieve them using the columns you specify.

#### Use all columns

By specifying `*`, you retrieve all columns of the delete rows.

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM account_details WHERE balance < 23000 RETURNING *;
~~~
~~~
 account_id | balance | account_type
------------+---------+--------------
          4 |   22000 | Savings
(1 row)

DELETE 1
~~~

#### Use specific columns

To retrieve specific columns, name them in the `RETURNING` clause.

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM account_details WHERE account_id = 5 RETURNING account_id, account_type;
~~~
~~~
 account_id | account_type
------------+--------------
          5 | Checking
(1 row)

DELETE 1
~~~

#### Change column labels

When `RETURNING` specific columns, you can change their labels using `AS`.

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM account_details WHERE balance < 24500 RETURNING account_id, balance AS final_balance;
~~~
~~~
 account_id | final_balance 
------------+---------------
          6 |         23500
(1 row)

DELETE 1
~~~

#### Sort and return deleted rows

To sort and return deleted rows, use a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [DELETE FROM account_details RETURNING *] ORDER BY account_id;
~~~

~~~
 account_id | balance  | account_type
------------+----------+--------------
          7 | 79493.51 | Checking
          8 | 40761.66 | Savings
          9 |  2111.67 | Checking
         10 | 59173.15 | Savings
(4 rows)
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
