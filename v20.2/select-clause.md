---
title: Simple SELECT Clause
summary: The Simple SELECT clause loads or computes data from various sources.
toc: true
redirect_from: select.html
key: select.html
---

The simple `SELECT` clause is the main SQL syntax to read and process
existing data.

When used as a stand-alone statement, the simple `SELECT` clause is
also called "the `SELECT` statement". However, it is also a
[selection clause](selection-queries.html#selection-clauses) that can be combined
with other constructs to form more complex [selection queries](selection-queries.html).


## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/simple_select_clause.html %}
</div>


{{site.data.alerts.callout_success}}
The simple `SELECT` clause also has other applications not covered here, such as executing [functions](functions-and-operators.html) like `SELECT current_timestamp();`.
{{site.data.alerts.end}}

## Required privileges

The user must have the `SELECT` [privilege](authorization.html#assign-privileges) on the tables used as operands.

## Parameters

Parameter | Description
----------|-------------
`DISTINCT` or `ALL` | See [Eliminate Duplicate Rows](#eliminate-duplicate-rows).
`DISTINCT ON ( a_expr [, ...] )` | `DISTINCT ON` followed by a list of [scalar expressions](scalar-expressions.html) within parentheses. See [Eliminate Duplicate Rows](#eliminate-duplicate-rows).
`target_elem` | A [scalar expression](scalar-expressions.html) to compute a column in each result row, or `*` to automatically retrieve all columns from the `FROM` clause.<br><br>If `target_elem` contains an [aggregate function](functions-and-operators.html#aggregate-functions), a `GROUP BY` clause can be used to further control the aggregation.
`table_ref` | The [table expression](table-expressions.html) you want to retrieve data from.<br><br>Using two or more table expressions in the `FROM` sub-clause, separated with a comma, is equivalent to a [`CROSS JOIN`](joins.html) expression.
`AS OF SYSTEM TIME timestamp` | Retrieve data as it existed [as of `timestamp`](as-of-system-time.html). <br><br>**Note**: Because `AS OF SYSTEM TIME` returns historical data, your reads might be stale.
`WHERE a_expr` | Only retrieve rows that return `TRUE` for `a_expr`, which must be a [scalar expression](scalar-expressions.html) that returns Boolean values using columns (e.g., `<column> = <value>`).
`GROUP BY a_expr` | Group results on one or more columns.<br><br>When an [aggregate function](functions-and-operators.html#aggregate-functions) follows `SELECT` as a `target_elem`, or `HAVING` as an `a_expr`, you can [create aggregate groups](#create-aggregate-groups) on column groupings listed after `GROUP BY`.<br> You can group columns by an alias (i.e., a label assigned to the column with an `AS` clause) rather than the column name.<br> If aggregate groups are created on a full primary key, any column in the table can be selected as a `target_elem`, or specified in a `HAVING` clause.<br> If a selected column is in a [subquery](subqueries.html), and the column references a higher scope, the column does not need to be included in the `GROUP BY` clause (if one exists).<br><br>Using a `GROUP BY` clause in a statement without an aggregate function is equivalent to using a [`DISTINCT ON`](#eliminate-duplicate-rows) clause on the grouping columns.
`HAVING a_expr` | Only retrieve aggregate function groups that return `TRUE` for `a_expr`, which must be a [scalar expression](scalar-expressions.html) that returns Boolean values using an aggregate function (e.g., `<aggregate function> = <value>`). <br/><br/>`HAVING` works like the `WHERE` clause, but for aggregate functions.
`WINDOW window_definition_list` | A list of [window definitions](window-functions.html#window-definitions).

## Eliminate duplicate rows

The `DISTINCT` subclause specifies to remove duplicate rows.

By default, or when `ALL` is specified, `SELECT` returns all the rows
selected, without removing duplicates. When `DISTINCT` is specified,
duplicate rows are eliminated.

Without `ON`, two rows are considered duplicates if they are equal on
all the results computed by `SELECT`.

With `ON`, two rows are considered duplicates if they are equal only
using the [scalar expressions](scalar-expressions.html) listed with `ON`. When two rows are considered duplicates according to `DISTINCT ON`, the values from the first `FROM` row in the order specified by [`ORDER BY`](query-order.html) are used to compute the remaining target expressions. If `ORDER BY` is not specified, CockroachDB will pick any one of the duplicate rows as first row, non-deterministically.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Choose columns

#### Retrieve specific columns

Retrieve specific columns by naming them in a comma-separated list:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, city, name FROM users LIMIT 10;
~~~

~~~
                   id                  |     city      |       name
+--------------------------------------+---------------+------------------+
  7ae147ae-147a-4000-8000-000000000018 | los angeles   | Alfred Garcia
  570a3d70-a3d7-4c00-8000-000000000011 | san francisco | Amy Cobb
  428f5c28-f5c2-4000-8000-00000000000d | seattle       | Anita Atkinson
  1eb851eb-851e-4800-8000-000000000006 | boston        | Brian Campbell
  23d70a3d-70a3-4800-8000-000000000007 | boston        | Carl Mcguire
  a8f5c28f-5c28-4800-8000-000000000021 | detroit       | Carl Russell
  147ae147-ae14-4b00-8000-000000000004 | new york      | Catherine Nelson
  99999999-9999-4800-8000-00000000001e | detroit       | Charles Montoya
  e147ae14-7ae1-4800-8000-00000000002c | paris         | Cheyenne Smith
  2e147ae1-47ae-4400-8000-000000000009 | washington dc | Cindy Medina
(10 rows)
~~~

#### Retrieve all columns

Retrieve all columns by using `*`:

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

### Filter rows

#### Filter on a single condition

Filter rows with expressions that use columns and return Boolean values in the `WHERE` clause:

{% include copy-clipboard.html %}
~~~ sql
> SELECT name, id FROM users WHERE city='seattle';
~~~

~~~
        name       |                  id
+------------------+--------------------------------------+
  Anita Atkinson   | 428f5c28-f5c2-4000-8000-00000000000d
  Patricia Herrera | 47ae147a-e147-4000-8000-00000000000e
  Holly Williams   | 4ccccccc-cccc-4c00-8000-00000000000f
  Ryan Hickman     | 51eb851e-b851-4c00-8000-000000000010
(4 rows)
~~~

#### Filter on multiple conditions

To use multiple `WHERE` filters join them with `AND` or `OR`. You can also create negative filters with `NOT`:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM vehicles WHERE city = 'seattle' AND status = 'available';
~~~

~~~
                   id                  |  city   | type |               owner_id               |       creation_time       |  status   |    current_location    |                  ext
+--------------------------------------+---------+------+--------------------------------------+---------------------------+-----------+------------------------+----------------------------------------+
  44444444-4444-4400-8000-000000000004 | seattle | bike | 428f5c28-f5c2-4000-8000-00000000000d | 2019-01-02 03:04:05+00:00 | available | 37754 Farmer Extension | {"brand": "Merida", "color": "yellow"}
(1 row)
~~~

#### Filter values with a list

Using `WHERE <column> IN (<comma separated list of values>)` performs an `OR` search for listed values in the specified column:

{% include copy-clipboard.html %}
~~~ sql
> SELECT name, id FROM users WHERE city IN ('new york', 'chicago', 'seattle');
~~~

~~~
        name       |                  id
+------------------+--------------------------------------+
  Matthew Clay     | 80000000-0000-4000-8000-000000000019
  Samantha Coffey  | 851eb851-eb85-4000-8000-00000000001a
  Jessica Martinez | 8a3d70a3-d70a-4000-8000-00000000001b
  John Hines       | 8f5c28f5-c28f-4000-8000-00000000001c
  Kenneth Barnes   | 947ae147-ae14-4800-8000-00000000001d
  Robert Murphy    | 00000000-0000-4000-8000-000000000000
  James Hamilton   | 051eb851-eb85-4ec0-8000-000000000001
  Judy White       | 0a3d70a3-d70a-4d80-8000-000000000002
  Devin Jordan     | 0f5c28f5-c28f-4c00-8000-000000000003
  Catherine Nelson | 147ae147-ae14-4b00-8000-000000000004
  Anita Atkinson   | 428f5c28-f5c2-4000-8000-00000000000d
  Patricia Herrera | 47ae147a-e147-4000-8000-00000000000e
  Holly Williams   | 4ccccccc-cccc-4c00-8000-00000000000f
  Ryan Hickman     | 51eb851e-b851-4c00-8000-000000000010
(14 rows)
~~~

#### Select distinct rows

Columns without the [Primary Key](primary-key.html) or [Unique](unique.html) constraints can have multiple instances of the same value:

{% include copy-clipboard.html %}
~~~ sql
> SELECT name FROM users WHERE city in ('los angeles', 'washington dc');
~~~

~~~
         name
+---------------------+
  Ricky Beck
  Michael Brown
  William Wood
  Alfred Garcia
  Cindy Medina
  Daniel Hernandez MD
  Sarah Wang DDS
  Michael Brown
(8 rows)
~~~

Using `DISTINCT`, you can remove all but one instance of duplicate values from your retrieved data:

{% include copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT name FROM users WHERE city in ('los angeles', 'washington dc');
~~~

~~~
         name
+---------------------+
  Ricky Beck
  Michael Brown
  William Wood
  Alfred Garcia
  Cindy Medina
  Daniel Hernandez MD
  Sarah Wang DDS
(7 rows)
~~~

### Rename columns in output

Instead of outputting a column's name in the retrieved table, you can change its label using `AS`:

{% include copy-clipboard.html %}
~~~ sql
> SELECT current_location AS ny_address, id, type, status FROM vehicles WHERE city = 'new york';
~~~

~~~
        ny_address       |                  id                  |    type    | status
+------------------------+--------------------------------------+------------+--------+
  64110 Richard Crescent | 00000000-0000-4000-8000-000000000000 | skateboard | in_use
  86667 Edwards Valley   | 11111111-1111-4100-8000-000000000001 | scooter    | in_use
(2 rows)
~~~

This *does not* change the name of the column in the table. To do that, use [`RENAME COLUMN`](rename-column.html).

### Search for string values

Search for partial [string](string.html) matches in columns using `LIKE`, which supports the following wildcard operators:

- `%` matches 0 or more characters.
- `_` matches exactly 1 character.

For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT city, status, id FROM vehicles WHERE type LIKE 'scoot%';
~~~

~~~
      city      |  status   |                  id
+---------------+-----------+--------------------------------------+
  boston        | in_use    | 22222222-2222-4200-8000-000000000002
  detroit       | in_use    | 99999999-9999-4800-8000-000000000009
  minneapolis   | in_use    | aaaaaaaa-aaaa-4800-8000-00000000000a
  minneapolis   | available | bbbbbbbb-bbbb-4800-8000-00000000000b
  new york      | in_use    | 11111111-1111-4100-8000-000000000001
  san francisco | available | 55555555-5555-4400-8000-000000000005
  washington dc | in_use    | 33333333-3333-4400-8000-000000000003
(7 rows)
~~~

### Aggregate functions

[Aggregate functions](functions-and-operators.html#aggregate-functions) perform calculations on retrieved rows.

#### Perform aggregate function on entire column

By using an aggregate function as a `target_elem`, you can perform the calculation on the entire column.

{% include copy-clipboard.html %}
~~~ sql
> SELECT MIN(revenue) FROM rides;
~~~

~~~
  min
+------+
  0.00
(1 row)
~~~

You can also use the retrieved value as part of an expression. For example, you can use the result in the `WHERE` clause to select additional rows that were not part of the aggregate function itself:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, city, vehicle_id, rider_id
FROM rides
WHERE revenue = (
      SELECT
      MIN(revenue)
      FROM rides
);
~~~

~~~
                   id                  |    city     |              vehicle_id              |               rider_id
+--------------------------------------+-------------+--------------------------------------+--------------------------------------+
  1f3b645a-1cac-4800-8000-00000000003d | boston      | 22222222-2222-4200-8000-000000000002 | 19999999-9999-4a00-8000-000000000005
  23d70a3d-70a3-4800-8000-000000000046 | boston      | 22222222-2222-4200-8000-000000000002 | 19999999-9999-4a00-8000-000000000005
  851eb851-eb85-4000-8000-000000000104 | chicago     | 88888888-8888-4800-8000-000000000008 | 851eb851-eb85-4000-8000-00000000001a
  85a1cac0-8312-4000-8000-000000000105 | chicago     | 88888888-8888-4800-8000-000000000008 | 947ae147-ae14-4800-8000-00000000001d
  722d0e56-0418-4400-8000-0000000000df | los angeles | 77777777-7777-4800-8000-000000000007 | 7ae147ae-147a-4000-8000-000000000018
  ae147ae1-47ae-4800-8000-000000000154 | minneapolis | aaaaaaaa-aaaa-4800-8000-00000000000a | b851eb85-1eb8-4000-8000-000000000024
  0dd2f1a9-fbe7-4c80-8000-00000000001b | new york    | 11111111-1111-4100-8000-000000000001 | 00000000-0000-4000-8000-000000000000
  f4bc6a7e-f9db-4000-8000-0000000001de | rome        | eeeeeeee-eeee-4000-8000-00000000000e | f0a3d70a-3d70-4000-8000-00000000002f
(8 rows)
~~~

#### Perform aggregate function on retrieved rows

By filtering the statement, you can perform the calculation only on retrieved rows:

{% include copy-clipboard.html %}
~~~ sql
> SELECT SUM(revenue) FROM rides WHERE city IN ('new york', 'chicago');
~~~

~~~
    sum
+---------+
  4079.00
(1 row)
~~~

#### Filter columns fed into aggregate functions

You can use `FILTER (WHERE <Boolean expression>)` in the `target_elem` to filter which rows are processed by an aggregate function; those that return `FALSE` or `NULL` for the `FILTER` clause's Boolean expression are not fed into the aggregate function:

{% include copy-clipboard.html %}
~~~ sql
> SELECT count(*) AS unfiltered, count(*) FILTER (WHERE revenue > 50) AS filtered FROM rides;
~~~

~~~
  unfiltered | filtered
+------------+----------+
         500 |      252
(1 row)
~~~

#### Create aggregate groups

Instead of performing aggregate functions on an the entire set of retrieved rows, you can split the rows into groups and then perform the aggregate function on each of them.

When creating aggregate groups, each column selected as a `target_elem` must be included in a `GROUP BY` clause.

For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT city, SUM(revenue) AS city_revenue FROM rides
WHERE city IN ('new york', 'chicago', 'seattle') GROUP BY city;
~~~

~~~
    city   | city_revenue
+----------+--------------+
  chicago  |      1990.00
  new york |      2089.00
  seattle  |      2029.00
(3 rows)
~~~

{{site.data.alerts.callout_info}}
 If the group is created on a primary key column, any column in the table can be selected as a `target_elem`. If a selected column is in a [subquery](subqueries.html) that references a higher scope, a `GROUP BY` clause is not needed.
{{site.data.alerts.end}}

#### Filter aggregate groups

To filter aggregate groups, use `HAVING`, which is the equivalent of the `WHERE` clause for aggregate groups, which must evaluate to a Boolean value.

For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT city, AVG(revenue) as avg FROM rides GROUP BY city
HAVING AVG(revenue) BETWEEN 50 AND 60;
~~~

~~~
      city      |          avg
+---------------+-----------------------+
  amsterdam     |                 52.50
  boston        | 52.666666666666666667
  los angeles   | 55.951219512195121951
  minneapolis   | 55.146341463414634146
  washington dc | 58.756097560975609756
(5 rows)
~~~

#### Use aggregate functions in having clause

Aggregate functions can also be used in the `HAVING` clause without needing to be included as a `target_elem`.

For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT vehicle_id, city FROM rides WHERE city IN ('new york', 'chicago', 'seattle')
GROUP BY vehicle_id, city HAVING COUNT(vehicle_id) > 20;
~~~

~~~
               vehicle_id              |   city
+--------------------------------------+----------+
  88888888-8888-4800-8000-000000000008 | chicago
  11111111-1111-4100-8000-000000000001 | new york
  44444444-4444-4400-8000-000000000004 | seattle
(3 rows)
~~~

#### Order aggregate function input rows by column

Non-commutative aggregate functions are sensitive to the order in which the rows are processed in the surrounding `SELECT` clause. To specify the order in which input rows are processed, you can add an [`ORDER BY`](query-order.html) clause within the function argument list.

For example, suppose you want to create an array of `name` values, ordered alphabetically, and grouped by `city`. You can use the following statement to do so:

{% include copy-clipboard.html %}
~~~ sql
> SELECT city, array_agg(name ORDER BY name) AS users FROM users WHERE city IN ('new york', 'chicago', 'seattle') GROUP BY city;
~~~

~~~
    city   |                                        users
+----------+-------------------------------------------------------------------------------------+
  new york | {"Catherine Nelson","Devin Jordan","James Hamilton","Judy White","Robert Murphy"}
  seattle  | {"Anita Atkinson","Holly Williams","Patricia Herrera","Ryan Hickman"}
  chicago  | {"Jessica Martinez","John Hines","Kenneth Barnes","Matthew Clay","Samantha Coffey"}
(3 rows)
~~~

You can also order input rows using a column different than the input row column. The following statement returns an array of `revenue` values from high-revenue rides, ordered by ride `end_time`:

{% include copy-clipboard.html %}
~~~ sql
> SELECT city, array_agg(revenue ORDER BY end_time) as revenues FROM rides WHERE revenue > 80 GROUP BY city;
~~~

~~~
      city      |                                    revenues
+---------------+---------------------------------------------------------------------------------+
  amsterdam     | {87.00,95.00,87.00,85.00,87.00,85.00,88.00,95.00,86.00,97.00,98.00,87.00,82.00}
  boston        | {92.00,92.00,86.00,87.00,94.00}
  detroit       | {89.00,96.00,94.00,92.00,84.00}
  minneapolis   | {84.00,98.00,86.00,92.00,81.00,99.00,87.00,86.00,88.00,81.00}
  new york      | {83.00,94.00,86.00,95.00,81.00,91.00,94.00,81.00,81.00,90.00}
  san francisco | {96.00,85.00,96.00,84.00,94.00,87.00,93.00}
  chicago       | {82.00,98.00,84.00,99.00,91.00,90.00,83.00,82.00,91.00}
  los angeles   | {92.00,98.00,92.00,99.00,93.00,87.00,98.00,91.00,89.00,81.00,87.00}
  paris         | {87.00,94.00,98.00,98.00,95.00,81.00,99.00,94.00,95.00,82.00}
  rome          | {83.00,96.00,90.00,98.00,95.00,87.00,86.00,97.00}
  seattle       | {88.00,88.00,82.00,86.00,91.00,81.00,99.00}
  washington dc | {96.00,94.00,97.00,96.00,88.00,97.00,93.00}
(12 rows)
~~~

If you include multiple aggregate functions in a single `SELECT` clause, you can order the input rows of the multiple functions on different columns. For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT city, array_agg(revenue ORDER BY revenue) as revenues_by_revenue, array_agg(revenue ORDER BY end_time) as revenues_by_end_time FROM rides WHERE revenue > 90 GROUP BY city;
~~~
~~~
      city      |             revenues_by_revenue             |            revenues_by_end_time
+---------------+---------------------------------------------+---------------------------------------------+
  amsterdam     | {95.00,95.00,97.00,98.00}                   | {95.00,95.00,97.00,98.00}
  boston        | {92.00,92.00,94.00}                         | {92.00,92.00,94.00}
  minneapolis   | {92.00,98.00,99.00}                         | {98.00,92.00,99.00}
  new york      | {91.00,94.00,94.00,95.00}                   | {94.00,95.00,91.00,94.00}
  paris         | {94.00,94.00,95.00,95.00,98.00,98.00,99.00} | {94.00,98.00,98.00,95.00,99.00,94.00,95.00}
  san francisco | {93.00,94.00,96.00,96.00}                   | {96.00,96.00,94.00,93.00}
  chicago       | {91.00,91.00,98.00,99.00}                   | {98.00,99.00,91.00,91.00}
  detroit       | {92.00,94.00,96.00}                         | {96.00,94.00,92.00}
  los angeles   | {91.00,92.00,92.00,93.00,98.00,98.00,99.00} | {92.00,98.00,92.00,99.00,93.00,98.00,91.00}
  rome          | {95.00,96.00,97.00,98.00}                   | {96.00,98.00,95.00,97.00}
  seattle       | {91.00,99.00}                               | {91.00,99.00}
  washington dc | {93.00,94.00,96.00,96.00,97.00,97.00}       | {96.00,94.00,97.00,96.00,97.00,93.00}
(12 rows)
~~~

### Group by an alias

 If a query includes an alias (i.e., a [label assigned to the column with an `AS` clause](#rename-columns-in-output)), you can group the aggregations in the query by the alias rather than by the column name. For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT city AS c, SUM(revenue) AS c_rev FROM rides GROUP BY c;
~~~
~~~
        c       |  c_rev
----------------+----------
  amsterdam     | 2966.00
  boston        | 3019.00
  los angeles   | 2772.00
  new york      | 2923.00
  paris         | 2849.00
  rome          | 2653.00
  san francisco | 2857.00
  seattle       | 2792.00
  washington dc | 2797.00
(9 rows)
~~~

### Select from a specific index

{% include {{page.version.version}}/misc/force-index-selection.md %}

### Select historical data (time-travel)

CockroachDB lets you find data as it was stored at a given point in
time using `AS OF SYSTEM TIME` with various [supported
formats](as-of-system-time.html). This can be also advantageous for
performance. For more details, see [`AS OF SYSTEM
TIME`](as-of-system-time.html).

## Advanced uses of `SELECT` clauses

CockroachDB supports numerous ways to combine results from `SELECT`
clauses together.

See [Selection Queries](selection-queries.html) for
details. A few examples follow.

### Sorting and limiting query results

To order the results of a `SELECT` clause or limit the number of rows
in the result, you can combine it with `ORDER BY` or `LIMIT` /
`OFFSET` to form a [selection query](selection-queries.html) or
[subquery](table-expressions.html#subqueries-as-table-expressions).

See [Ordering Query Results](query-order.html) and [Limiting Query
Results](limit-offset.html) for more details.

{{site.data.alerts.callout_info}}When <code>ORDER BY</code> is not included in a query, rows are not sorted by any consistent criteria. Instead, CockroachDB returns them as the coordinating node receives them.<br><br>Also, CockroachDB sorts <a href="null-handling.html#nulls-and-sorting"><code>NULL</code> values</a> first with <code>ASC</code> and last with <code>DESC</code>. This differs from PostgreSQL, which sorts <code>NULL</code> values last with <code>ASC</code> and first with <code>DESC</code>.{{site.data.alerts.end}}

### Combining results from multiple queries

Results from two or more queries can be combined together as follows:

- Using [join expressions](joins.html) to combine rows
  according to conditions on specific columns.
- Using [set operations](selection-queries.html#set-operations) to combine rows
  using inclusion/exclusion rules.

### Row-level locking for concurrency control with `SELECT FOR UPDATE`

{% include {{page.version.version}}/sql/select-for-update-overview.md %}

For an example showing how to use it, see  [`SELECT FOR UPDATE`](select-for-update.html).

## See also

- [Scalar Expressions](scalar-expressions.html)
- [Selection Clauses](selection-queries.html#selection-clauses)
- [`SELECT FOR UPDATE`](select-for-update.html)
- [Set Operations](selection-queries.html#set-operations)
- [Table Expressions](table-expressions.html)
- [Ordering Query Results](query-order.html)
- [Limiting Query Results](limit-offset.html)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
