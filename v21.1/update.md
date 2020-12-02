---
title: UPDATE
summary: The UPDATE statement updates rows in a table.
toc: true
---

The `UPDATE` [statement](sql-statements.html) updates rows in a table.

{{site.data.alerts.callout_danger}}
If you update a row that contains a column referenced by a [foreign key constraint](foreign-key.html) and has an [`ON UPDATE` action](foreign-key.html#foreign-key-actions), all of the dependent rows will also be updated.
{{site.data.alerts.end}}


## Required privileges

The user must have the `SELECT` and `UPDATE` [privileges](authorization.html#assign-privileges) on the table.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/update.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`common_table_expr` | See [Common Table Expressions](common-table-expressions.html).
`table_name` | The name of the table that contains the rows you want to update.
`AS table_alias_name` | An alias for the table name. When an alias is provided, it completely hides the actual table name.
`column_name` | The name of the column whose values you want to update.
`a_expr` | The new value you want to use, the [aggregate function](functions-and-operators.html#aggregate-functions) you want to perform, or the [scalar expression](scalar-expressions.html) you want to use.<br><br>To fill columns with their [default values](default-value.html), use `DEFAULT VALUES` in place of `a_expr`. To fill a specific column with its default value, leave the value out of the `a_expr` or use `DEFAULT` at the appropriate position.
`FROM table_ref` | Specify a table to reference, but not update, in `UPDATE` expressions, or in `RETURNING` and `WHERE` clauses. For more details, see [Reference other tables in an update](#reference-other-tables-in-an-update).
`select_stmt` | A [selection query](selection-queries.html). Each value must match the [data type](data-types.html) of its column on the left side of `=`.
`WHERE a_expr`| `a_expr` must be a [scalar expression](scalar-expressions.html) that returns Boolean values using columns (e.g., `<column> = <value>`). Update rows that return `TRUE`.<br><br/>**Without a `WHERE` clause in your statement, `UPDATE` updates all rows in the table.**
`sort_clause` | An `ORDER BY` clause. See [Ordering Query Results](query-order.html) and [Ordering of rows in DML statements](query-order.html#ordering-rows-in-dml-statements) for more details.
`limit_clause` | A `LIMIT` clause. See [Limiting Query Results](limit-offset.html) for more details.
`RETURNING target_list` | Return values based on rows updated, where `target_list` can be specific column names from the table, `*` for all columns, or computations using [scalar expressions](scalar-expressions.html). <br><br>To return nothing in the response, not even the number of rows updated, use `RETURNING NOTHING`.
`ONLY ... *` |  Supported for compatibility with PostgreSQL table inheritance syntax. This clause is a no-op, as CockroachDB does not currently support table inheritance.

## Force index selection for updates

By using the explicit index annotation (also known as "index hinting"), you can override [CockroachDB's index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/) and use a specific [index](indexes.html) for updating rows of a named table.

{{site.data.alerts.callout_info}}
Index selection can impact [performance](performance-best-practices-overview.html), but does not change the result of a query.
{{site.data.alerts.end}}

The syntax to force an update for a specific index is:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE table@my_idx SET ...
~~~

This is equivalent to the longer expression:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE table@{FORCE_INDEX=my_idx} SET ...
~~~

To view how the index hint modifies the query plan that CockroachDB follows for updating rows, use an [`EXPLAIN (OPT)`](explain.html#opt-option) statement. To see all indexes available on a table, use [`SHOW INDEXES`](show-index.html).

For examples, see [Update with index hints](#update-with-index-hints).

## Reference other tables in an update

To reference values from a table other than the table being updated, add a `FROM` clause that specifies one or more tables in the cluster. Values from tables specified in a `FROM` clause can be used in `UPDATE` expressions, and in `RETURNING` and `WHERE` clauses.

When executing an `UPDATE` query with a `FROM` clause, CockroachDB [joins](joins.html) the target table (i.e., the table being updated) to the tables referenced in the `FROM` clause. The output of this join should have the same number of rows as the rows being updated in the target table, as CockroachDB uses a single row from the join output to update a given row in the target table. If the join produces more rows than the rows being updated in the target table, there is no way to predict which row from the join output will be used to update a row in the target table.

For an example, see [Update using values from a different table](#update-using-values-from-a-different-table).

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Update a single column in a single row

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users LIMIT 10;
~~~

~~~
                   id                  |   city    |        name        |            address             | credit_card
+--------------------------------------+-----------+--------------------+--------------------------------+-------------+
  c28f5c28-f5c2-4000-8000-000000000026 | amsterdam | Maria Weber        | 14729 Karen Radial             | 5844236997
  c7ae147a-e147-4000-8000-000000000027 | amsterdam | Tina Miller        | 97521 Mark Extensions          | 8880478663
  cccccccc-cccc-4000-8000-000000000028 | amsterdam | Taylor Cunningham  | 89214 Jennifer Well            | 5130593761
  d1eb851e-b851-4800-8000-000000000029 | amsterdam | Kimberly Alexander | 48474 Alfred Hollow            | 4059628542
  19999999-9999-4a00-8000-000000000005 | boston    | Nicole Mcmahon     | 11540 Patton Extensions        | 0303726947
  1eb851eb-851e-4800-8000-000000000006 | boston    | Brian Campbell     | 92025 Yang Village             | 9016427332
  23d70a3d-70a3-4800-8000-000000000007 | boston    | Carl Mcguire       | 60124 Palmer Mews Apt. 49      | 4566257702
  28f5c28f-5c28-4600-8000-000000000008 | boston    | Jennifer Sanders   | 19121 Padilla Brooks Apt. 12   | 1350968125
  80000000-0000-4000-8000-000000000019 | chicago   | Matthew Clay       | 49220 Lisa Junctions           | 9132291015
  851eb851-eb85-4000-8000-00000000001a | chicago   | Samantha Coffey    | 6423 Jessica Underpass Apt. 87 | 9437219051
(10 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPDATE users SET address = '201 E Randolph St' WHERE id = '851eb851-eb85-4000-8000-00000000001a';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users LIMIT 10;
~~~

~~~
                   id                  |   city    |        name        |           address            | credit_card
+--------------------------------------+-----------+--------------------+------------------------------+-------------+
  c28f5c28-f5c2-4000-8000-000000000026 | amsterdam | Maria Weber        | 14729 Karen Radial           | 5844236997
  c7ae147a-e147-4000-8000-000000000027 | amsterdam | Tina Miller        | 97521 Mark Extensions        | 8880478663
  cccccccc-cccc-4000-8000-000000000028 | amsterdam | Taylor Cunningham  | 89214 Jennifer Well          | 5130593761
  d1eb851e-b851-4800-8000-000000000029 | amsterdam | Kimberly Alexander | 48474 Alfred Hollow          | 4059628542
  19999999-9999-4a00-8000-000000000005 | boston    | Nicole Mcmahon     | 11540 Patton Extensions      | 0303726947
  1eb851eb-851e-4800-8000-000000000006 | boston    | Brian Campbell     | 92025 Yang Village           | 9016427332
  23d70a3d-70a3-4800-8000-000000000007 | boston    | Carl Mcguire       | 60124 Palmer Mews Apt. 49    | 4566257702
  28f5c28f-5c28-4600-8000-000000000008 | boston    | Jennifer Sanders   | 19121 Padilla Brooks Apt. 12 | 1350968125
  80000000-0000-4000-8000-000000000019 | chicago   | Matthew Clay       | 49220 Lisa Junctions         | 9132291015
  851eb851-eb85-4000-8000-00000000001a | chicago   | Samantha Coffey    | 201 E Randolph St            | 9437219051
(10 rows)
~~~

### Update multiple columns in a single row

{% include copy-clipboard.html %}
~~~ sql
> UPDATE rides SET (end_address, revenue) = ('201 E Randolph St', 25.00) WHERE id = '851eb851-eb85-4000-8000-000000000104';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM rides WHERE rider_id = '851eb851-eb85-4000-8000-00000000001a';
~~~

~~~
                   id                  |  city   | vehicle_city |               rider_id               |              vehicle_id              |         start_address         |         end_address         |        start_time         |         end_time          | revenue
+--------------------------------------+---------+--------------+--------------------------------------+--------------------------------------+-------------------------------+-----------------------------+---------------------------+---------------------------+---------+
  849ba5e3-53f7-4000-8000-000000000103 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 77630 Steven Road Suite 60    | 74140 Andrew Spur           | 2018-12-30 03:04:05+00:00 | 2018-12-31 08:04:05+00:00 |   20.00
  851eb851-eb85-4000-8000-000000000104 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 76707 Timothy Square          | 201 E Randolph St           | 2018-12-15 03:04:05+00:00 | 2018-12-17 07:04:05+00:00 |   25.00
  86a7ef9d-b22d-4000-8000-000000000107 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 28532 Kevin Villages Suite 90 | 27493 Ortega Radial Apt. 60 | 2018-12-08 03:04:05+00:00 | 2018-12-09 03:04:05+00:00 |   36.00
  92f1a9fb-e76c-4800-8000-00000000011f | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 56955 Edward Walks            | 53193 Jerry Village         | 2019-01-01 03:04:05+00:00 | 2019-01-01 15:04:05+00:00 |   35.00
  94fdf3b6-45a1-4800-8000-000000000123 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 63820 Robinson Fields         | 89245 Eric Orchard          | 2018-12-14 03:04:05+00:00 | 2018-12-16 10:04:05+00:00 |   80.00
(5 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPDATE rides SET end_address = '10000 W OHare Ave', revenue = 60.00 WHERE id = '94fdf3b6-45a1-4800-8000-000000000123';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM rides WHERE rider_id = '851eb851-eb85-4000-8000-00000000001a';
~~~

~~~
                   id                  |  city   | vehicle_city |               rider_id               |              vehicle_id              |         start_address         |         end_address         |        start_time         |         end_time          | revenue
+--------------------------------------+---------+--------------+--------------------------------------+--------------------------------------+-------------------------------+-----------------------------+---------------------------+---------------------------+---------+
  849ba5e3-53f7-4000-8000-000000000103 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 77630 Steven Road Suite 60    | 74140 Andrew Spur           | 2018-12-30 03:04:05+00:00 | 2018-12-31 08:04:05+00:00 |   20.00
  851eb851-eb85-4000-8000-000000000104 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 76707 Timothy Square          | 201 E Randolph St           | 2018-12-15 03:04:05+00:00 | 2018-12-17 07:04:05+00:00 |   25.00
  86a7ef9d-b22d-4000-8000-000000000107 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 28532 Kevin Villages Suite 90 | 27493 Ortega Radial Apt. 60 | 2018-12-08 03:04:05+00:00 | 2018-12-09 03:04:05+00:00 |   36.00
  92f1a9fb-e76c-4800-8000-00000000011f | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 56955 Edward Walks            | 53193 Jerry Village         | 2019-01-01 03:04:05+00:00 | 2019-01-01 15:04:05+00:00 |   35.00
  94fdf3b6-45a1-4800-8000-000000000123 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 63820 Robinson Fields         | 10000 W OHare Ave           | 2018-12-14 03:04:05+00:00 | 2018-12-16 10:04:05+00:00 |   60.00
(5 rows)
~~~

### Update using `SELECT` statement

{% include copy-clipboard.html %}
~~~ sql
> UPDATE rides SET (revenue, start_address) =
    (SELECT revenue, end_address FROM rides WHERE id = '94fdf3b6-45a1-4800-8000-000000000123')
     WHERE id = '851eb851-eb85-4000-8000-000000000104';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM rides WHERE rider_id = '851eb851-eb85-4000-8000-00000000001a';
~~~

~~~
                   id                  |  city   | vehicle_city |               rider_id               |              vehicle_id              |         start_address         |         end_address         |        start_time         |         end_time          | revenue
+--------------------------------------+---------+--------------+--------------------------------------+--------------------------------------+-------------------------------+-----------------------------+---------------------------+---------------------------+---------+
  849ba5e3-53f7-4000-8000-000000000103 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 77630 Steven Road Suite 60    | 74140 Andrew Spur           | 2018-12-30 03:04:05+00:00 | 2018-12-31 08:04:05+00:00 |   20.00
  851eb851-eb85-4000-8000-000000000104 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 10000 W OHare Ave             | 201 E Randolph St           | 2018-12-15 03:04:05+00:00 | 2018-12-17 07:04:05+00:00 |   60.00
  86a7ef9d-b22d-4000-8000-000000000107 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 28532 Kevin Villages Suite 90 | 27493 Ortega Radial Apt. 60 | 2018-12-08 03:04:05+00:00 | 2018-12-09 03:04:05+00:00 |   36.00
  92f1a9fb-e76c-4800-8000-00000000011f | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 56955 Edward Walks            | 53193 Jerry Village         | 2019-01-01 03:04:05+00:00 | 2019-01-01 15:04:05+00:00 |   35.00
  94fdf3b6-45a1-4800-8000-000000000123 | chicago | chicago      | 851eb851-eb85-4000-8000-00000000001a | 88888888-8888-4800-8000-000000000008 | 63820 Robinson Fields         | 10000 W OHare Ave           | 2018-12-14 03:04:05+00:00 | 2018-12-16 10:04:05+00:00 |   60.00
(5 rows)
~~~

### Update with default values

{% include copy-clipboard.html %}
~~~ sql
> UPDATE users SET address = DEFAULT WHERE id = '19999999-9999-4a00-8000-000000000005';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users LIMIT 5;
~~~

~~~
                   id                  |   city    |        name        |        address        | credit_card
+--------------------------------------+-----------+--------------------+-----------------------+-------------+
  c28f5c28-f5c2-4000-8000-000000000026 | amsterdam | Maria Weber        | 14729 Karen Radial    | 5844236997
  c7ae147a-e147-4000-8000-000000000027 | amsterdam | Tina Miller        | 97521 Mark Extensions | 8880478663
  cccccccc-cccc-4000-8000-000000000028 | amsterdam | Taylor Cunningham  | 89214 Jennifer Well   | 5130593761
  d1eb851e-b851-4800-8000-000000000029 | amsterdam | Kimberly Alexander | 48474 Alfred Hollow   | 4059628542
  19999999-9999-4a00-8000-000000000005 | boston    | Nicole Mcmahon     | NULL                  | 0303726947
(5 rows)
~~~

### Update using values from a different table

{% include copy-clipboard.html %}
~~~ sql
> UPDATE rides SET revenue = NULL FROM vehicles WHERE rides.rider_id=vehicles.owner_id AND rides.vehicle_id=vehicles.id;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM rides WHERE revenue IS NULL LIMIT 5;
~~~

~~~
                   id                  |   city    | vehicle_city |               rider_id               |              vehicle_id              |         start_address          |         end_address         |        start_time         |         end_time          | revenue
---------------------------------------+-----------+--------------+--------------------------------------+--------------------------------------+--------------------------------+-----------------------------+---------------------------+---------------------------+----------
  ab020c49-ba5e-4800-8000-00000000014e | amsterdam | amsterdam    | c28f5c28-f5c2-4000-8000-000000000026 | aaaaaaaa-aaaa-4800-8000-00000000000a | 1905 Christopher Locks Apt. 77 | 66037 Belinda Plaza Apt. 93 | 2018-12-13 03:04:05+00:00 | 2018-12-14 08:04:05+00:00 | NULL
  ac083126-e978-4800-8000-000000000150 | amsterdam | amsterdam    | c28f5c28-f5c2-4000-8000-000000000026 | aaaaaaaa-aaaa-4800-8000-00000000000a | 50217 Victoria Fields Apt. 44  | 56217 Wilson Spring         | 2018-12-07 03:04:05+00:00 | 2018-12-07 10:04:05+00:00 | NULL
  af9db22d-0e56-4800-8000-000000000157 | amsterdam | amsterdam    | c28f5c28-f5c2-4000-8000-000000000026 | aaaaaaaa-aaaa-4800-8000-00000000000a | 20937 Gibson River             | 50480 Steven Row            | 2018-12-23 03:04:05+00:00 | 2018-12-25 11:04:05+00:00 | NULL
  b22d0e56-0418-4000-8000-00000000015c | amsterdam | amsterdam    | bd70a3d7-0a3d-4000-8000-000000000025 | bbbbbbbb-bbbb-4800-8000-00000000000b | 36054 Ward Crescent Suite 35   | 7745 John Run               | 2018-12-09 03:04:05+00:00 | 2018-12-10 18:04:05+00:00 | NULL
  b53f7ced-9168-4000-8000-000000000162 | amsterdam | amsterdam    | bd70a3d7-0a3d-4000-8000-000000000025 | bbbbbbbb-bbbb-4800-8000-00000000000b | 86091 Mcdonald Motorway        | 1652 Robert Ford            | 2018-12-05 03:04:05+00:00 | 2018-12-05 06:04:05+00:00 | NULL
(5 rows)
~~~

### Update all rows

{{site.data.alerts.callout_danger}}
If you do not use the `WHERE` clause to specify the rows to be updated, the values for all rows will be updated.
{{site.data.alerts.end}}
{{site.data.alerts.callout_info}}
If the [`sql_safe_updates`](cockroach-sql.html#allow-potentially-unsafe-sql-statements) session variable is set to `true`, the client will prevent the update. `sql_safe_updates` is set to `true` by default.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> UPDATE rides SET revenue = 7.00;
~~~

~~~
pq: rejected: UPDATE without WHERE clause (sql_safe_updates = true)
~~~

You can use a [`SET`](set-vars.html) statement to set session variables.

{% include copy-clipboard.html %}
~~~ sql
> SET sql_safe_updates = false;
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPDATE rides SET revenue = 7.00;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM rides LIMIT 5;
~~~

~~~
                   id                  |   city    | vehicle_city |               rider_id               |              vehicle_id              |         start_address          |            end_address            |        start_time         |         end_time          | revenue
+--------------------------------------+-----------+--------------+--------------------------------------+--------------------------------------+--------------------------------+-----------------------------------+---------------------------+---------------------------+---------+
  c0000000-0000-4000-8000-000000000177 | amsterdam | amsterdam    | c28f5c28-f5c2-4000-8000-000000000026 | cccccccc-cccc-4000-8000-00000000000c | 65738 Williams Summit          | 72424 Thomas Field Suite 82       | 2018-12-31 03:04:05+00:00 | 2019-01-01 03:04:05+00:00 |    7.00
  c083126e-978d-4000-8000-000000000178 | amsterdam | amsterdam    | cccccccc-cccc-4000-8000-000000000028 | cccccccc-cccc-4000-8000-00000000000c | 53613 Johnson Terrace          | 12667 Monica Hollow               | 2018-12-16 03:04:05+00:00 | 2018-12-17 15:04:05+00:00 |    7.00
  c10624dd-2f1a-4000-8000-000000000179 | amsterdam | amsterdam    | c7ae147a-e147-4000-8000-000000000027 | cccccccc-cccc-4000-8000-00000000000c | 61921 Brittany Orchard Apt. 85 | 81157 Stephanie Court Suite 96    | 2018-12-30 03:04:05+00:00 | 2019-01-01 07:04:05+00:00 |    7.00
  c189374b-c6a7-4000-8000-00000000017a | amsterdam | amsterdam    | cccccccc-cccc-4000-8000-000000000028 | cccccccc-cccc-4000-8000-00000000000c | 75456 Gray View                | 69175 Christopher Shoals Suite 47 | 2018-12-23 03:04:05+00:00 | 2018-12-23 03:04:05+00:00 |    7.00
  c20c49ba-5e35-4000-8000-00000000017b | amsterdam | amsterdam    | cccccccc-cccc-4000-8000-000000000028 | cccccccc-cccc-4000-8000-00000000000c | 38892 Joseph Summit Suite 86   | 89582 Melissa Streets             | 2018-12-27 03:04:05+00:00 | 2018-12-28 18:04:05+00:00 |    7.00
(5 rows)
~~~

### Update and return values

In this example, the `RETURNING` clause returns the `id` value of the row updated. The language-specific versions assume that you have installed the relevant [client drivers](install-client-drivers.html).

{{site.data.alerts.callout_success}}This use of <code>RETURNING</code> mirrors the behavior of MySQL's <code>last_insert_id()</code> function.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}When a driver provides a <code>query()</code> method for statements that return results and an <code>exec()</code> method for statements that do not (e.g., Go), it's likely necessary to use the <code>query()</code> method for <code>UPDATE</code> statements with <code>RETURNING</code>.{{site.data.alerts.end}}

<section class="filters clearfix">
    <button class="filter-button" data-scope="shell">Shell</button>
    <button class="filter-button" data-scope="python">Python</button>
    <button class="filter-button" data-scope="ruby">Ruby</button>
    <button class="filter-button" data-scope="go">Go</button>
    <button class="filter-button" data-scope="js">Node.js</button>
</section>

<section class="filter-content" markdown="1" data-scope="shell">
<p></p>

{% include copy-clipboard.html %}
~~~ sql
> UPDATE vehicles SET status = 'available' WHERE city = 'new york' RETURNING id;
~~~

~~~
                   id
+--------------------------------------+
  00000000-0000-4000-8000-000000000000
  11111111-1111-4100-8000-000000000001
(2 rows)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">
<p></p>

{% include copy-clipboard.html %}
~~~ python
# Import the driver.
import psycopg2

# Connect to the "bank" database.
conn = psycopg2.connect(
    database='movr',
    user='root',
    host='localhost',
    port=26257
)

# Make each statement commit immediately.
conn.set_session(autocommit=True)

# Open a cursor to perform database operations.
cur = conn.cursor()

# Update a row in the "vehicles" table
# and return the "id" value.
cur.execute(
    "UPDATE vehicles SET status = 'available' WHERE city = 'new york' RETURNING id;"
)

# Print out the returned value.
rows = cur.fetchall()
print('IDs:')
for row in rows:
    print([str(cell) for cell in row])

# Close the database connection.
cur.close()
conn.close()
~~~

The printed value would look like:

~~~
IDs:
['00000000-0000-4000-8000-000000000000']
['11111111-1111-4100-8000-000000000001']
~~~

</section>

<section class="filter-content" markdown="1" data-scope="ruby">
<p></p>

{% include copy-clipboard.html %}
~~~ ruby
# Import the driver.
require 'pg'

# Connect to the "bank" database.
conn = PG.connect(
    user: 'root',
    dbname: 'movr',
    host: 'localhost',
    port: 26257
)

# Update a row in the "vehicles" table
# and return the "id" value.
conn.exec(
    "UPDATE vehicles SET status = 'available' WHERE city = 'new york' RETURNING id;"
) do |res|

# Print out the returned value.
puts "IDs:"
    res.each do |row|
        puts row
    end
end

# Close communication with the database.
conn.close()
~~~

The printed value would look like:

~~~
IDs:
{"id"=>"00000000-0000-4000-8000-000000000000"}
{"id"=>"11111111-1111-4100-8000-000000000001"}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="go">
<p></p>

{% include copy-clipboard.html %}
~~~ go
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	//Connect to the "bank" database.
	db, err := sql.Open(
		"postgres",
		"postgresql://root@localhost:26257/movr?sslmode=disable",
	)
	if err != nil {
		log.Fatal("error connecting to the database: ", err)
	}

	// Update a row in the "vehicles" table
	// and return the "id" value.
	rows, err := db.Query(
		"UPDATE vehicles SET status = 'available' WHERE city = 'new york' RETURNING id;",
	)
	if err != nil {
		log.Fatal(err)
	}

	// Print out the returned value.
	defer rows.Close()
	fmt.Println("IDs:")
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%s\n", id)
	}
}
~~~

The printed value would look like:

~~~
IDs:
00000000-0000-4000-8000-000000000000
11111111-1111-4100-8000-000000000001
~~~

</section>

<section class="filter-content" markdown="1" data-scope="js">
<p></p>

{% include copy-clipboard.html %}
~~~ js
var async = require('async')
var pg = require('pg')

// Config to connect to the "movr" database.
var config = {
    user: 'root',
    host: 'localhost',
    database: 'movr',
    port: 26257
  }

// Create pool
var pool = new pg.Pool(config)

pool.connect(function (err, client, done) {

    // Close communication with the database and exit.
    var finish = function () {
        done()
        process.exit()
    }

    if (err) {
        console.error('could not connect to cockroachdb', err);
        finish()
    }
    async.waterfall([function (next) {
        client.query(
            `UPDATE vehicles SET status = 'available' WHERE city = 'new york' RETURNING id;`,
          next
        )
      }
    ],
    function (err, results) {
      if (err) {
        console.error('error updating and selecting from users', err);
        finish()
      }
      // Print out the returned value.
      console.log('IDs:')
      results.rows.forEach(function (row) {
        console.log(row)
      })

      finish()
    })
  })
~~~

The printed value would like:

~~~
IDs:
{ id: '00000000-0000-4000-8000-000000000000' }
{ id: '11111111-1111-4100-8000-000000000001' }
~~~

</section>

### Update with index hints

Suppose that you create a multi-column index on the `users` table with the `name` and `city` columns.

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name, city);
~~~

Now suppose you want to update a couple rows in the table, based on their contents. You can use the [`EXPLAIN (OPT)`](explain.html#opt-option) command to see how the [cost-based optimizer](cost-based-optimizer.html) decides to perform the `UPDATE` statement:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (opt) UPDATE users SET name='Patricia Smith (there are two)' WHERE name='Patricia Smith';
~~~

~~~
                                        text
------------------------------------------------------------------------------------
  update users
   └── project
        ├── index-join users
        │    └── scan users@users_name_city_idx
        │         └── constraint: /10/9/8: [/'Patricia Smith' - /'Patricia Smith']
        └── projections
             └── 'Patricia Smith (there are two)'
(7 rows)
~~~

The output of the `EXPLAIN` statement shows that the optimizer scans the newly-created `users_name_city_idx` index when performing the update. This makes sense, as you are performing an update based on the `name` column.

Although `users_name_city_idx` is likely the most efficient index for the table scan, you may want to assess the performance difference between scanning on `users_name_city_idx` and scanning on the primary index. You can provide an index hint (i.e. force the index selection) to use the primary key of the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (opt) UPDATE users@primary SET name='Patricia Smith (there are two)' WHERE name='Patricia Smith';
~~~

~~~
                       text
---------------------------------------------------
  update users
   └── project
        ├── select
        │    ├── scan users
        │    │    └── flags: force-index=primary
        │    └── filters
        │         └── name = 'Patricia Smith'
        └── projections
             └── 'Patricia Smith (there are two)'
(9 rows)
~~~

## See also

- [`DELETE`](delete.html)
- [`INSERT`](insert.html)
- [`UPSERT`](upsert.html)
- [`TRUNCATE`](truncate.html)
- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
- [Limiting Query Results](limit-offset.html)
- [Ordering of rows in DML statements](query-order.html#ordering-rows-in-dml-statements)
