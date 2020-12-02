---
title: Selection Queries
summary: Selection Queries can read and process data.
toc: true
redirect_from: selection-clauses.html
key: selection-clauses.html
---

Selection queries read and process data in CockroachDB.  They are more
general than [simple `SELECT` clauses](select-clause.html): they can
group one or more [selection clauses](#selection-clauses) with [set
operations](#set-operations) and can request a [specific
ordering](query-order.html) or [row limit](limit-offset.html).

Selection queries can occur:

- At the top level of a query like other [SQL statements](sql-statements.html).
- Between parentheses as a [subquery](table-expressions.html#subqueries-as-table-expressions).
- As [operand to other statements](#using-selection-queries-with-other-statements) that take tabular data as input, for example [`INSERT`](insert.html), [`UPSERT`](upsert.html),  [`CREATE TABLE AS`](create-table-as.html) or [`ALTER ... SPLIT AT`](split-at.html).


## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/select.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`common_table_expr` | See [Common Table Expressions](common-table-expressions.html).
`select_clause` | A valid [selection clause](#selection-clauses), either simple or using [set operations](#set-operations).
`sort_clause` | An optional `ORDER BY` clause. See [Ordering Query Results](query-order.html) for details.
`limit_clause` | An optional `LIMIT` clause. See [Limiting Query Results](limit-offset.html) for details.
`offset_clause` | An optional `OFFSET` clause. See [Limiting Query Results](limit-offset.html) for details.
`for_locking_clause` |  The `FOR UPDATE` locking clause is used to order transactions by controlling concurrent access to one or more rows of a table.  For more information, see [`SELECT FOR UPDATE`](select-for-update.html).

The optional `LIMIT` and `OFFSET` clauses can appear in any order, but must appear after `ORDER BY`, if also present.

{{site.data.alerts.callout_info}}Because the <code>WITH</code>, <code>ORDER BY</code>, <code>LIMIT</code> and <code>OFFSET</code> sub-clauses are all optional, any simple <a href="#selection-clauses">selection clause</a> is also a valid selection query.{{site.data.alerts.end}}

## Selection clauses

Selection clauses are the main component of a selection query. They
define tabular data. There are four specific syntax forms collectively named selection clauses:

Form | Usage
-----|--------
[`SELECT`](#select-clause) | Load or compute tabular data from various sources. This is the most common selection clause.
[`VALUES`](#values-clause) | List tabular data by the client.
[`TABLE`](#table-clause) | Load tabular data from the database.
[Set Operations](#set-operations) | Combine tabular data from two or more selection clauses.

{{site.data.alerts.callout_info}}To perform joins or other relational operations over selection clauses, use a <a href="table-expressions.html">table expression</a> and <a href="#composability">convert it back</a> into a selection clause with <a href="#table-clause"><code>TABLE</code></a> or <a href="#select-clause"><code>SELECT</code></a>.{{site.data.alerts.end}}

### Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/select_clause.html %}
</div>

### `VALUES` clause

#### Syntax

<div>
  {% include {{ page.version.version }}/sql/diagrams/values_clause.html %}
</div>

A `VALUES` clause defines tabular data defined by the expressions
listed within parentheses. Each parenthesis group defines a single row
in the resulting table.

The columns of the resulting table data have automatically generated
names. [These names can be modified with
`AS`](table-expressions.html#aliased-table-expressions) when the
`VALUES` clause is used as a sub-query.

#### Example

{% include copy-clipboard.html %}
~~~ sql
> VALUES (1, 2, 3), (4, 5, 6);
~~~

~~~
+---------+---------+---------+
| column1 | column2 | column3 |
+---------+---------+---------+
|       1 |       2 |       3 |
|       4 |       5 |       6 |
+---------+---------+---------+
~~~

### `TABLE` clause

#### Syntax

<div>
  {% include {{ page.version.version }}/sql/diagrams/table_clause.html %}
</div>

A `TABLE` clause reads tabular data from a specified table. The
columns of the resulting table data are named after the schema of the
table.

In general, `TABLE x` is equivalent to `SELECT * FROM x`, but it is
shorter to type.

{{site.data.alerts.callout_info}}Any <a href="table-expressions.html">table expression</a> between parentheses is a valid operand for <code>TABLE</code>, not just <a href="table-expressions.html#table-or-view-names">simple table or view names</a>.{{site.data.alerts.end}}

#### Example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE employee_copy AS TABLE employee;
~~~

This statement copies the content from table `employee` into a new
table. However, note that the `TABLE` clause does not preserve the indexing,
foreign key, or constraint and default information from the schema of the
table it reads from, so in this example, the new table `employee_copy`
will likely have a simpler schema than `employee`.

Other examples:

{% include copy-clipboard.html %}
~~~ sql
> TABLE employee;
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO employee_copy TABLE employee;
~~~

### `SELECT` clause

See [Simple `SELECT` Clause](select-clause.html) for more
details.

## Set operations

Set operations combine data from two [selection
clauses](#selection-clauses). They are valid as operand to other
set operations or as main component in a selection query.

### Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/set_operation.html %}
</div>

### Set operators

SQL lets you compare the results of multiple [selection clauses](#selection-clauses). You can think of each of the set operators as representing a Boolean operator:

- `UNION` = OR
- `INTERSECT` = AND
- `EXCEPT` = NOT

By default, each of these comparisons displays only one copy of each value (similar to `SELECT DISTINCT`). However, each function also lets you add an `ALL` to the clause to display duplicate values.

### Union: Combine two queries

`UNION` combines the results of two queries into one result.

{% include copy-clipboard.html %}
~~~ sql
> SELECT name
FROM accounts
WHERE state_opened IN ('AZ', 'NY')
UNION
SELECT name
FROM mortgages
WHERE state_opened IN ('AZ', 'NY');
~~~
~~~
+-----------------+
|      name       |
+-----------------+
| Naseem Joossens |
| Ricarda Caron   |
| Carola Dahl     |
| Aygün Sanna     |
+-----------------+
~~~

To show duplicate rows, you can use `ALL`.

{% include copy-clipboard.html %}
~~~ sql
> SELECT name
FROM accounts
WHERE state_opened IN ('AZ', 'NY')
UNION ALL
SELECT name
FROM mortgages
WHERE state_opened IN ('AZ', 'NY');
~~~
~~~
+-----------------+
|      name       |
+-----------------+
| Naseem Joossens |
| Ricarda Caron   |
| Carola Dahl     |
| Naseem Joossens |
| Aygün Sanna     |
| Carola Dahl     |
+-----------------+
~~~

### Intersect: Retrieve intersection of two queries

`INTERSECT` finds only values that are present in both query operands.

{% include copy-clipboard.html %}
~~~ sql
> SELECT name
FROM accounts
WHERE state_opened IN ('NJ', 'VA')
INTERSECT
SELECT name
FROM mortgages;
~~~
~~~
+-----------------+
|      name       |
+-----------------+
| Danijel Whinery |
| Agar Archer     |
+-----------------+
~~~

### Except: Exclude one query's results from another

`EXCEPT` finds values that are present in the first query operand but not the second.

{% include copy-clipboard.html %}
~~~ sql
> SELECT name
FROM mortgages
EXCEPT
SELECT name
FROM accounts;
~~~
~~~
+------------------+
|       name       |
+------------------+
| Günay García     |
| Karla Goddard    |
| Cybele Seaver    |
+------------------+
~~~

## Ordering results

The following sections provide examples. For more details, see [Ordering Query Results](query-order.html).

### Order retrieved rows by one column

{% include copy-clipboard.html %}
~~~ sql
> SELECT *
FROM accounts
WHERE balance BETWEEN 350 AND 500
ORDER BY balance DESC;
~~~
~~~
+----+--------------------+---------+----------+--------------+
| id |        name        | balance |   type   | state_opened |
+----+--------------------+---------+----------+--------------+
| 12 | Raniya Žitnik      |     500 | savings  | CT           |
| 59 | Annibale Karga     |     500 | savings  | ND           |
| 27 | Adelbert Ventura   |     500 | checking | IA           |
| 86 | Theresa Slaski     |     500 | checking | WY           |
| 73 | Ruadh Draganov     |     500 | checking | TN           |
| 16 | Virginia Ruan      |     400 | checking | HI           |
| 43 | Tahirih Malinowski |     400 | checking | MS           |
| 50 | Dusan Mallory      |     350 | savings  | NV           |
+----+--------------------+---------+----------+--------------+
~~~

### Order retrieved rows by multiple columns

Columns are sorted in the order you list them in `sortby_list`. For example, `ORDER BY a, b` sorts the rows by column `a` and then sorts rows with the same `a` value by their column `b` values.

{% include copy-clipboard.html %}
~~~ sql
> SELECT *
FROM accounts
WHERE balance BETWEEN 350 AND 500
ORDER BY balance DESC, name ASC;
~~~
~~~
+----+--------------------+---------+----------+--------------+
| id |        name        | balance |   type   | state_opened |
+----+--------------------+---------+----------+--------------+
| 27 | Adelbert Ventura   |     500 | checking | IA           |
| 59 | Annibale Karga     |     500 | savings  | ND           |
| 12 | Raniya Žitnik      |     500 | savings  | CT           |
| 73 | Ruadh Draganov     |     500 | checking | TN           |
| 86 | Theresa Slaski     |     500 | checking | WY           |
| 43 | Tahirih Malinowski |     400 | checking | MS           |
| 16 | Virginia Ruan      |     400 | checking | HI           |
| 50 | Dusan Mallory      |     350 | savings  | NV           |
+----+--------------------+---------+----------+--------------+
~~~

## Limiting row count and pagination

The following sections provide examples. For more details, see [Limiting Query Results](limit-offset.html).

### Limit number of retrieved results

You can reduce the number of results with `LIMIT`.

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, name
FROM accounts
LIMIT 5;
~~~
~~~
+----+------------------+
| id |       name       |
+----+------------------+
|  1 | Bjorn Fairclough |
|  2 | Bjorn Fairclough |
|  3 | Arturo Nevin     |
|  4 | Arturo Nevin     |
|  5 | Naseem Joossens  |
+----+------------------+
~~~

### Paginate through limited results

To iterate through a table one "page" of results at a time (also known as pagination) there are two options, only one of which is recommended:

- Keyset pagination (**fast, recommended**)
- `LIMIT` / `OFFSET` pagination (slow, not recommended)

Keyset pagination (also known as the "seek method") is used to fetch a subset of records from a table quickly. It does this by restricting the set of records returned with a combination of `WHERE` and [`LIMIT`](limit-offset.html) clauses. To get the next page, you check the value of the column in the `WHERE` clause against the last row returned in the previous page of results.

The general pattern for keyset pagination queries is:

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM t AS OF SYSTEM TIME ${time}
  WHERE key > ${value}
  ORDER BY key
  LIMIT ${amount}
~~~

This is faster than using `LIMIT`/`OFFSET` because, instead of doing a full table scan up to the value of the `OFFSET`, a keyset pagination query looks at a fixed-size set of records for each iteration. This can be done quickly provided that the key used in the `WHERE` clause to implement the pagination is [indexed](indexes.html#best-practices) and [unique](unique.html). A [primary key](primary-key.html) meets both of these criteria.

{{site.data.alerts.callout_info}}
CockroachDB does not have cursors. To support a cursor-like use case, namely "operate on a snapshot of the database at the moment the cursor is opened", use the [`AS OF SYSTEM TIME`](as-of-system-time.html) clause as shown in the examples below.
{{site.data.alerts.end}}

#### Pagination example

The examples in this section use the [employees data set](https://github.com/datacharmer/test_db), which you can load into CockroachDB as follows:

{% include copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS employees;
USE employees;
IMPORT PGDUMP 'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/employees-full.sql.gz';
~~~

To get the first page of results using keyset pagination, run the statement below.

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM employees AS OF SYSTEM TIME '-1m' WHERE emp_no > 10000 ORDER BY emp_no LIMIT 25;
~~~

~~~
emp_no |        birth_date         | first_name |  last_name  | gender |         hire_date
---------+---------------------------+------------+-------------+--------+----------------------------
 10001 | 1953-09-02 00:00:00+00:00 | Georgi     | Facello     | M      | 1986-06-26 00:00:00+00:00
 10002 | 1964-06-02 00:00:00+00:00 | Bezalel    | Simmel      | F      | 1985-11-21 00:00:00+00:00
 10003 | 1959-12-03 00:00:00+00:00 | Parto      | Bamford     | M      | 1986-08-28 00:00:00+00:00
 10004 | 1954-05-01 00:00:00+00:00 | Chirstian  | Koblick     | M      | 1986-12-01 00:00:00+00:00
...
(25 rows)

Server Execution Time: 540µs
Network Latency: 797µs
~~~

{{site.data.alerts.callout_success}}
When writing your own queries of this type, use a known minimum value for the key's data type. If you don't know what the minimum value of the key is, you can use `SELECT min(key) FROM table`.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
We use [`AS OF SYSTEM TIME`](as-of-system-time.html) in these examples to ensure that we are operating on a consistent snapshot of the database as of the specified timestamp. This reduces the chance that there will be any concurrent updates to the data the query is accessing, and thus no missing or duplicated rows during the pagination. It also reduces the risk of [transaction retries](transactions.html#client-side-intervention) due to concurrent data access. The value of `-1m` passed to `AS OF SYSTEM TIME` may need to be updated depending on your application's data access patterns.
{{site.data.alerts.end}}

To get the second page of results, run:

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM employees AS OF SYSTEM TIME '-1m' WHERE emp_no > 10025 ORDER BY emp_no LIMIT 25;
~~~

~~~
  emp_no |        birth_date         | first_name | last_name  | gender |         hire_date
---------+---------------------------+------------+------------+--------+----------------------------
   10026 | 1953-04-03 00:00:00+00:00 | Yongqiao   | Berztiss   | M      | 1995-03-20 00:00:00+00:00
   10027 | 1962-07-10 00:00:00+00:00 | Divier     | Reistad    | F      | 1989-07-07 00:00:00+00:00
   10028 | 1963-11-26 00:00:00+00:00 | Domenick   | Tempesti   | M      | 1991-10-22 00:00:00+00:00
   10029 | 1956-12-13 00:00:00+00:00 | Otmar      | Herbst     | M      | 1985-11-20 00:00:00+00:00
...
(25 rows)

Server Execution Time: 545µs
Network Latency: 529µs
~~~

To get an arbitrary page of results showing employees whose IDs (`emp_no`) are in a much higher range, run the following query. Note that it takes about the same amount of time to run as the previous queries.

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM employees AS OF SYSTEM TIME '-1m' WHERE emp_no > 300025 ORDER BY emp_no LIMIT 25;
~~~

~~~
  emp_no |        birth_date         | first_name |  last_name   | gender |         hire_date
---------+---------------------------+------------+--------------+--------+----------------------------
  400000 | 1963-11-29 00:00:00+00:00 | Mitsuyuki  | Reinhart     | M      | 1985-08-27 00:00:00+00:00
  400001 | 1962-06-02 00:00:00+00:00 | Rosalie    | Chinin       | M      | 1986-11-28 00:00:00+00:00
  400002 | 1964-08-16 00:00:00+00:00 | Quingbo    | Birnbaum     | F      | 1986-04-23 00:00:00+00:00
  400003 | 1958-04-30 00:00:00+00:00 | Jianwen    | Sidhu        | M      | 1986-02-01 00:00:00+00:00
  400004 | 1958-04-30 00:00:00+00:00 | Sedat      | Suppi        | M      | 1995-12-18 00:00:00+00:00
....
(25 rows)

Server Execution Time: 545µs
Network Latency: 529µs
~~~

Compare the execution speed of the previous keyset pagination queries with the query below that uses `LIMIT` / `OFFSET` to get the same page of results:

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM employees AS OF SYSTEM TIME '-1m' LIMIT 25 OFFSET 200024;
~~~

~~~
  emp_no |        birth_date         | first_name |  last_name   | gender |         hire_date
---------+---------------------------+------------+--------------+--------+----------------------------
  400000 | 1963-11-29 00:00:00+00:00 | Mitsuyuki  | Reinhart     | M      | 1985-08-27 00:00:00+00:00
  400001 | 1962-06-02 00:00:00+00:00 | Rosalie    | Chinin       | M      | 1986-11-28 00:00:00+00:00
  400002 | 1964-08-16 00:00:00+00:00 | Quingbo    | Birnbaum     | F      | 1986-04-23 00:00:00+00:00
  400003 | 1958-04-30 00:00:00+00:00 | Jianwen    | Sidhu        | M      | 1986-02-01 00:00:00+00:00
...
(25 rows)

Server Execution Time: 141.314ms
Network Latency: 498µs
~~~

The query using `LIMIT`/`OFFSET` for pagination is almost 100 times slower. To see why, let's use [`EXPLAIN`](explain.html).

{% include copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT * FROM employees LIMIT 25 OFFSET 200024;
~~~

~~~
    tree    |        field        |         description
------------+---------------------+------------------------------
            | distribution        | full
            | vectorized          | true
  limit     |                     |
   │        | offset              | 200024
   └── scan |                     |
            | estimated row count | 200049
            | table               | employees@idx_17110_primary
            | spans               | LIMITED SCAN
            | limit               | 200049
(9 rows)
~~~

The culprit is this: because we used `LIMIT`/`OFFSET`, we are performing a limited scan of the entire table (see `spans` = `LIMITED SCAN` above) from the first record all the way up to the value of the offset. In other words, we are iterating over a big array of rows from 1 to *n*, where *n* is 200049. The `estimated row count` row shows this.

Meanwhile, the keyset pagination queries are looking at a much smaller range of table spans, which is much faster (see `spans` = `300026-` + 25 below). Because [there is an index on every column in the `WHERE` clause](indexes.html#best-practices), these queries are doing an index lookup to jump to the start of the page of results, and then getting an additional 25 rows from there. This is much faster.

{% include copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT * FROM employees WHERE emp_no > 300025 ORDER BY emp_no LIMIT 25;
~~~

~~~
  tree |        field        |         description
-------+---------------------+------------------------------
       | distribution        | local
       | vectorized          | false
  scan |                     |
       | estimated row count | 25
       | table               | employees@idx_17110_primary
       | spans               | [/300026 - ]
       | limit               | 25
(7 rows)
~~~

As shown by the `estimated row count` row, this query scans only 25 rows, far fewer than the 200049 scanned by the `LIMIT`/`OFFSET` query.

{{site.data.alerts.callout_danger}}
Using a sequential (i.e., non-[UUID](uuid.html)) primary key creates hot spots in the database for write-heavy workloads, since concurrent [`INSERT`](insert.html)s to the table will attempt to write to the same (or nearby) underlying [ranges](architecture/overview.html#architecture-range). This can be mitigated by designing your schema with [multi-column primary keys which include a monotonically increasing column](performance-best-practices-overview.html#use-multi-column-primary-keys).
{{site.data.alerts.end}}

## Row-level locking for concurrency control with `SELECT FOR UPDATE`

{% include {{page.version.version}}/sql/select-for-update-overview.md %}

For an example showing how to use it, see  [`SELECT FOR UPDATE`](select-for-update.html).

## Composability

[Selection clauses](#selection-clauses) are defined in the context of selection queries. [Table expressions](table-expressions.html) are defined in the context of the `FROM` sub-clause of [`SELECT`](select-clause.html). Nevertheless, they can be integrated with one another to form more complex queries or statements.

### Using any selection clause as a selection query

Any [selection clause](#selection-clauses) can be used as a
selection query with no change.

For example, the construct [`SELECT * FROM accounts`](select-clause.html) is a selection clause. It is also a valid selection query, and thus can be used as a stand-alone statement by appending a semicolon:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~
~~~
+----+-----------------------+---------+----------+--------------+
| id |         name          | balance |   type   | state_opened |
+----+-----------------------+---------+----------+--------------+
|  1 | Bjorn Fairclough      |    1200 | checking | AL           |
|  2 | Bjorn Fairclough      |    2500 | savings  | AL           |
|  3 | Arturo Nevin          |     250 | checking | AK           |
[ truncated ]
+----+-----------------------+---------+----------+--------------+
~~~

Likewise, the construct [`VALUES (1), (2), (3)`](#values-clause) is also a selection
clause and thus can also be used as a selection query on its own:

{% include copy-clipboard.html %}
~~~ sql
> VALUES (1), (2), (3);
~~~
~~~
+---------+
| column1 |
+---------+
|       1 |
|       2 |
|       3 |
+---------+
(3 rows)
~~~

### Using any table expression as selection clause

Any [table expression](table-expressions.html) can be used as a selection clause (and thus also a selection query) by prefixing it with `TABLE` or by using it as an operand to `SELECT * FROM`.

For example, the [simple table name](table-expressions.html#table-or-view-names) `customers` is a table expression, which designates all rows in that table. The expressions [`TABLE accounts`](selection-queries.html#table-clause) and [`SELECT * FROM accounts`](select-clause.html) are valid selection clauses.

Likewise, the [SQL join expression](joins.html) `customers c JOIN orders o ON c.id = o.customer_id` is a table expression. You can turn it into a valid selection clause, and thus a valid selection query as follows:

{% include copy-clipboard.html %}
~~~ sql
> TABLE (customers c JOIN orders o ON c.id = o.customer_id);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers c JOIN orders o ON c.id = o.customer_id;
~~~

### Using any selection query as table expression

Any selection query (or [selection clause](#selection-clauses)) can be used as a [table
expression](table-expressions.html) by enclosing it between parentheses, which forms a
[subquery](table-expressions.html#subqueries-as-table-expressions).

For example, the following construct is a selection query, but is not a valid table expression:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers ORDER BY name LIMIT 5
~~~

To make it valid as operand to `FROM` or another table expression, you can enclose it between parentheses as follows:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id FROM (SELECT * FROM customers ORDER BY name LIMIT 5);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT o.id
    FROM orders o
    JOIN (SELECT * FROM customers ORDER BY name LIMIT 5) AS c
	  ON o.customer_id = c.id;
~~~

### Using selection queries with other statements

Selection queries are also valid as operand in contexts that require tabular data.

For example:

 Statement | Example using `SELECT` | Example using `VALUES` | Example using `TABLE` |
|----------------|-----------------------------------|------------------------------------|-------------------------------
 [`INSERT`](insert.html) | `INSERT INTO foo SELECT * FROM bar` | `INSERT INTO foo VALUES (1), (2), (3)` | `INSERT INTO foo TABLE bar`
 [`UPSERT`](upsert.html) | `UPSERT INTO foo SELECT * FROM bar` | `UPSERT INTO foo VALUES (1), (2), (3)` | `UPSERT INTO foo TABLE bar`
 [`CREATE TABLE AS`](create-table-as.html) | `CREATE TABLE foo AS SELECT * FROM bar`  `CREATE TABLE foo AS VALUES (1),(2),(3)` | `CREATE TABLE foo AS TABLE bar`
 [`ALTER ... SPLIT AT`](split-at.html) | `ALTER TABLE foo SPLIT AT SELECT * FROM bar`  `ALTER TABLE foo SPLIT AT VALUES (1),(2),(3)` | `ALTER TABLE foo SPLIT AT TABLE bar`
 Subquery in a [table expression](table-expressions.html) | `SELECT * FROM (SELECT * FROM bar)` | `SELECT * FROM (VALUES (1),(2),(3))` | `SELECT * FROM (TABLE bar)`
 Subquery in a [scalar expression](scalar-expressions.html) | `SELECT * FROM foo WHERE x IN (SELECT * FROM bar)` | `SELECT * FROM foo WHERE x IN (VALUES (1),(2),(3))` | `SELECT * FROM foo WHERE x IN (TABLE bar)`

## See also

- [Simple `SELECT` Clause](select-clause.html)
- [`SELECT FOR UPDATE`](select-for-update.html)
- [Table Expressions](table-expressions.html)
- [Ordering Query Results](query-order.html)
- [Limiting Query Results](limit-offset.html)
