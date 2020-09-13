---
title: UPSERT
summary: The UPSERT statement inserts rows when values do not violate uniqueness constraints, and it updates rows when values do violate uniqueness constraints.
toc: true
---

The `UPSERT` [statement](sql-statements.html) is semantically equivalent to [`INSERT ON CONFLICT`](insert.html#on-conflict-clause), but the two may have slightly different [performance characteristics](#considerations). It inserts rows in cases where specified values do not violate uniqueness constraints, and it updates rows in cases where values do violate uniqueness constraints.

## Considerations

- `UPSERT` considers uniqueness only for [Primary Key](primary-key.html) columns. `INSERT ON CONFLICT` is more flexible and can be used to consider uniqueness for other columns. For more details, see [How `UPSERT` transforms into `INSERT ON CONFLICT`](#how-upsert-transforms-into-insert-on-conflict) below.

- When inserting/updating all columns of a table, and the table has no secondary indexes, `UPSERT` will be faster than the equivalent `INSERT ON CONFLICT` statement, as it will write without first reading. This may be particularly useful if you are using a simple SQL table of two columns to [simulate direct KV access](sql-faqs.html#can-i-use-cockroachdb-as-a-key-value-store).

- A single [multi-row `UPSERT`](#upsert-multiple-rows) statement is faster than multiple single-row `UPSERT` statements. Whenever possible, use multi-row `UPSERT` instead of multiple single-row `UPSERT` statements.

- If the input data contains duplicates, see [Import data containing duplicate rows using `DISTINCT ON`](#import-data-containing-duplicate-rows-using-distinct-on) below.

## Required privileges

The user must have the `INSERT`, `SELECT` and `UPDATE` [privileges](authorization.html#assign-privileges) on the table.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/upsert.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`common_table_expr` | See [Common Table Expressions](common-table-expressions.html).
`table_name` | The name of the table.
`AS table_alias_name` | An alias for the table name. When an alias is provided, it completely hides the actual table name.
`column_name` | The name of a column to populate during the insert.
`select_stmt` | A [selection query](selection-queries.html). Each value must match the [data type](data-types.html) of its column. Also, if column names are listed after `INTO`, values must be in corresponding order; otherwise, they must follow the declared order of the columns in the table.
`DEFAULT VALUES` | To fill all columns with their [default values](default-value.html), use `DEFAULT VALUES` in place of `select_stmt`. To fill a specific column with its default value, leave the value out of the `select_stmt` or use `DEFAULT` at the appropriate position.
`RETURNING target_list` | Return values based on rows inserted, where `target_list` can be specific column names from the table, `*` for all columns, or computations using [scalar expressions](scalar-expressions.html).<br><br>Within a [transaction](transactions.html), use `RETURNING NOTHING` to return nothing in the response, not even the number of rows affected.

## How `UPSERT` transforms into `INSERT ON CONFLICT`

`UPSERT` considers uniqueness only for [primary key](primary-key.html) columns. For example, assuming that columns `a` and `b` are the primary key, the following `UPSERT` and `INSERT ON CONFLICT` statements are equivalent:

{% include copy-clipboard.html %}
~~~ sql
> UPSERT INTO t (a, b, c) VALUES (1, 2, 3);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t (a, b, c)
    VALUES (1, 2, 3)
    ON CONFLICT (a, b)
    DO UPDATE SET c = excluded.c;
~~~

`INSERT ON CONFLICT` is more flexible and can be used to consider uniqueness for columns not in the primary key. For more details, see the [Upsert that Fails (Conflict on Non-Primary Key)](#upsert-that-fails-conflict-on-non-primary-key) example below.

## Examples

### Upsert a row (no conflict)

In this example, the `id` column is the primary key. Because the inserted `id` value does not conflict with the `id` value of any existing row, the `UPSERT` statement inserts a new row into the table.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
+----+----------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPSERT INTO accounts (id, balance) VALUES (3, 6325.20);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
+----+----------+
~~~

### Upsert multiple rows

In this example, the `UPSERT` statement inserts multiple rows into the table.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
+----+----------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPSERT INTO accounts (id, balance) VALUES (4, 1970.4), (5, 2532.9), (6, 4473.0);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
|  4 |   1970.4 |
|  5 |   2532.9 |
|  6 |   4473.0 |
+----+----------+
~~~

### Upsert that updates a row (conflict on primary key)

In this example, the `id` column is the primary key. Because the inserted `id` value is not unique, the `UPSERT` statement updates the row with the new `balance`.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
|  4 |   1970.4 |
|  5 |   2532.9 |
|  6 |   4473.0 |
+----+----------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPSERT INTO accounts (id, balance) VALUES (3, 7500.83);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |  7500.83 |
|  4 |   1970.4 |
|  5 |   2532.9 |
|  6 |   4473.0 |
+----+----------+
~~~

### Upsert that fails (conflict on non-primary key)

`UPSERT` will not update rows when the uniquness conflict is on columns not in the primary key. In this example, the `a` column is the primary key, but the `b` column also has the [`UNIQUE` constraint](unique.html). Because the inserted `b` value is not unique, the `UPSERT` fails.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM unique_test;
~~~

~~~
+---+---+
| a | b |
+---+---+
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
+---+---+
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPSERT INTO unique_test VALUES (4, 1);
~~~

~~~
pq: duplicate key value (b)=(1) violates unique constraint "unique_test_b_key"
~~~

In such a case, you would need to use the [`INSERT ON CONFLICT`](insert.html) statement to specify the `b` column as the column with the `UNIQUE` constraint.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO unique_test VALUES (4, 1) ON CONFLICT (b) DO UPDATE SET a = excluded.a;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM unique_test;
~~~

~~~
+---+---+
| a | b |
+---+---+
| 2 | 2 |
| 3 | 3 |
| 4 | 1 |
+---+---+
~~~

### Import data containing duplicate rows using `DISTINCT ON`

If the input data to insert/update contains duplicate rows, you must
use [`DISTINCT ON`](select-clause.html#eliminate-duplicate-rows) to
ensure there is only one row for each value of the primary key.

For example:

{% include copy-clipboard.html %}
~~~ sql
> WITH
    -- the following data contains duplicates on the conflict column "id":
    inputrows AS (VALUES (8, 130), (8, 140))

  UPSERT INTO accounts (id, balance)
    (SELECT DISTINCT ON(id) id, balance FROM inputrows); -- de-duplicate the input rows
~~~

The `DISTINCT ON` clause does not guarantee which of the duplicates is
considered. To force the selection of a particular duplicate, use an
`ORDER BY` clause:

{% include copy-clipboard.html %}
~~~ sql
> WITH
    -- the following data contains duplicates on the conflict column "id":
    inputrows AS (VALUES (8, 130), (8, 140))

  UPSERT INTO accounts (id, balance)
    (SELECT DISTINCT ON(id) id, balance
	 FROM inputrows
     ORDER BY balance); -- pick the lowest balance as value to update in each account
~~~

{{site.data.alerts.callout_info}}
Using `DISTINCT ON` incurs a performance cost to search and eliminate duplicates.
For best performance, avoid using it when the input is known to not contain duplicates.
{{site.data.alerts.end}}

## See also

- [Ordering of rows in DML statements](query-order.html#ordering-rows-in-dml-statements)
- [Selection Queries](selection-queries.html)
- [`DELETE`](delete.html)
- [`INSERT`](insert.html)
- [`UPDATE`](update.html)
- [`TRUNCATE`](truncate.html)
- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
