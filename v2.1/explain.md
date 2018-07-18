---
title: EXPLAIN
summary: The EXPLAIN statement provides information you can use to optimize SQL queries.
toc: true
---

The `EXPLAIN` [statement](sql-statements.html) returns CockroachDB's query plan for an [explainable statement](#explainable-statements). You can then use this information to optimize the query.


## Explainable statements

You can `EXPLAIN` on the following statements:

- [`ALTER USER`](sql-grammar.html#alter_user_stmt), [`ALTER TABLE`](alter-table.html), [`ALTER INDEX`](alter-index.html), [`ALTER VIEW`](alter-view.html), [`ALTER DATABASE`](alter-database.html), [`ALTER SEQUENCE`](alter-sequence.html)
- [`BACKUP`](backup.html)
- [`CANCEL JOB`](cancel-job.html), [`CANCEL QUERY`](cancel-query.html)
- [`CREATE DATABASE`](create-database.html), [`CREATE INDEX`](create-index.html), [`CREATE TABLE`](create-table.html), [`CREATE TABLE AS`](create-table-as.html), [`CREATE USER`](create-user.html), [`CREATE VIEW`](create-view.html), [`CREATE SEQUENCE`](create-sequence.html)
- [`DELETE`](delete.html)
- [`DROP DATABASE`](drop-database.html), [`DROP INDEX`](drop-index.html), [`DROP SEQUENCE`](drop-sequence.html), [`DROP TABLE`](drop-table.html), [`DROP USER`](drop-user.html), [`DROP VIEW`](drop-view.html)
- [`EXECUTE`](sql-grammar.html#execute_stmt)
- `EXPLAIN`
- [`IMPORT`](import.html)
- [`INSERT`](insert.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESET`](reset-vars.html)
- [`RESTORE`](restore.html)
- [`RESUME JOB`](resume-job.html)
- [`SELECT`](select-clause.html) and any [selection query](selection-queries.html)
- [`SET`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW BACKUP`](show-backup.html), [`SHOW COLUMNS`](show-columns.html), [`SHOW CONSTRAINTS`](show-constraints.html), [`SHOW CREATE `](show-create.html), [`SHOW CLUSTER SETTING`](show-cluster-setting.html), [`SHOW DATABASES`](show-databases.html), [`SHOW GRANTS`](show-grants.html), [`SHOW INDEX`](show-index.html), [`SHOW JOBS`](show-jobs.html), [`SHOW QUERIES`](show-queries.html), [`SHOW SESSIONS`](show-sessions.html), [`SHOW TABLES`](show-tables.html), [`SHOW TRACE FOR SESSION`](show-trace-for-session.html), [`SHOW USERS`](show-users.html), [`SHOW HISTOGRAM`](sql-grammar.html#show_histogram_stmt)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)

## Query optimization

Using `EXPLAIN`'s output, you can optimize your queries by taking the following points into consideration:

- Queries with fewer levels execute more quickly. Restructuring queries to require fewer levels of processing will generally improve performance.

- To view the distributed SQL query plan with execution statistics, use `EXPLAIN ANALYZE (DISTSQL)`.

- Avoid scanning an entire table, which is the slowest way to access data. You can avoid this by [creating indexes](indexes.html) that contain at least one of the columns that the query is filtering in its `WHERE` clause.

You can find out if your queries are performing entire table scans by using `EXPLAIN` to see which:

- Indexes the query uses; shown as the **Description** value of rows with the **Field** value of `table`

- Key values in the index are being scanned; shown as the **Description** value of rows with the **Field** value of `spans`

For more information, see [Find the Indexes and Key Ranges a Query Uses](#find-the-indexes-and-key-ranges-a-query-uses).

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/explain.html %}</section>

## Required privileges

The user requires the appropriate [privileges](privileges.html) for the statement being explained.

## Parameters

Parameter | Description
-----------|-----------
`ANALYZE` | <span class="version-tag">New in v2.1:</span> Execute the command and show execution statistics.
`EXPRS` | Include the SQL expressions that are involved in each processing stage.
`QUALIFY` | Include table names when referencing columns, which might be important to verify the behavior of joins across tables with the same column names.<br/><br/>To list qualified names, `QUALIFY` requires you to include the `EXPRS` option.
`METADATA` | Include the columns each level uses in the **Columns** column, as well as **Ordering** detail.
`VERBOSE`  | Imply the `EXPRS`, `METADATA`, and `QUALIFY` options.
`TYPES` | Include the intermediate [data types](data-types.html) CockroachDB chooses to evaluate intermediate SQL expressions. <br/><br/>`TYPES` also implies `METADATA` and `EXPRS` options.
`OPT` | <span class="version-tag">New in v2.1:</span> Display a query plan tree if the query will be run with the [cost-based optimizer](sql-optimizer.html). If it returns `pq: unsupported statement: *tree.Insert`, the query will not be run with the cost-based optimizer and will be run with the heuristic planner.
`DISTSQL` | <span class="version-tag">New in v2.1:</span> Provide a link that displays a distributed SQL plan tree.
`explainable_stmt` | The [statement](#explainable-statements) you want details about.

{{site.data.alerts.callout_danger}}<code>EXPLAIN</code> also includes other modes besides query plans that are useful only to CockroachDB developers, which are not documented here.{{site.data.alerts.end}}

## Success responses

Successful `EXPLAIN` statements return tables with the following columns:

 Column | Description
-----------|-------------
**Tree** | A tree representation showing the hierarchy of the query plan.
**Field** | The name of a parameter relevant to the query plan node immediately above.
**Description** | Additional information for the parameter in  **Field**.
**Columns** | The columns provided to the processes at lower levels of the hierarchy. <br/><br>This column displays only if the `METADATA` option is specified or implied.
**Ordering** | The order in which results are presented to the processes at each level of the hierarchy, as well as other properties of the result set at each level. <br/><br>This column displays only if the `METADATA` option is specified or implied.

## Examples

### Default query plans

By default, `EXPLAIN` includes the least detail about the query plan but can be
useful to find out which indexes and index key ranges are used by a query:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM kv WHERE v > 3 ORDER BY v;
~~~

~~~
+-----------+-------+-------------+
|   Tree    | Field | Description |
+-----------+-------+-------------+
| sort      |       |             |
|  │        | order | +v          |
|  └── scan |       |             |
|           | table | kv@primary  |
|           | spans | ALL         |
+-----------+-------+-------------+
~~~

The first column shows the tree structure of the query plan; a set of properties
is displayed for each node in the tree. Most importantly, for scans, you can see
the index that is scanned (`primary` in this case) and what key ranges of the
index you are scanning (in this case, a full table scan). For more
information on indexes and key ranges, see the
[example](#find-the-indexes-and-key-ranges-a-query-uses) below.

### `EXPRS` option

The `EXPRS` option includes SQL expressions that are involved in each processing stage, providing more granular detail about which portion of your query is represented at each level:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (EXPRS) SELECT * FROM kv WHERE v > 3 ORDER BY v;
~~~

~~~
+-----------+--------+-------------+
|   Tree    | Field  | Description |
+-----------+--------+-------------+
| sort      |        |             |
|  │        | order  | +v          |
|  └── scan |        |             |
|           | table  | kv@primary  |
|           | spans  | ALL         |
|           | filter | v > 3       |
+-----------+--------+-------------+
~~~

### `METADATA` option

The `METADATA` option includes detail about which columns are being used by each
level, as well as properties of the result set on that level:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (METADATA) SELECT * FROM kv WHERE v > 3 ORDER BY v;
~~~

~~~
+-----------+-------+------+-------+-------------+---------+------------------------------+
|   Tree    | Level | Type | Field | Description | Columns |           Ordering           |
+-----------+-------+------+-------+-------------+---------+------------------------------+
| sort      |     0 | sort |       |             | (k, v)  | k!=NULL; v!=NULL; key(k); +v |
|  │        |     0 |      | order | +v          |         |                              |
|  └── scan |     1 | scan |       |             | (k, v)  | k!=NULL; v!=NULL; key(k)     |
|           |     1 |      | table | kv@primary  |         |                              |
|           |     1 |      | spans | ALL         |         |                              |
+-----------+-------+------+-------+-------------+---------+------------------------------+
~~~

The **Ordering** column most importantly includes the ordering of the rows at
that level (`+v` in this case), but it also includes other information about the
result set at that level. In this case, CockroachDB was able to deduce that `k`
and `v` cannot be `NULL`, and `k` is a "key", meaning that you cannot have more
than one row with any given value of `k`.

Note that descending (`DESC`) orderings are indicated by the `-` sign:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (METADATA) SELECT * FROM kv WHERE v > 3 ORDER BY v DESC;
~~~

~~~
+-----------+-------+------+-------+-------------+---------+------------------------------+
|   Tree    | Level | Type | Field | Description | Columns |           Ordering           |
+-----------+-------+------+-------+-------------+---------+------------------------------+
| sort      |     0 | sort |       |             | (k, v)  | k!=NULL; v!=NULL; key(k); -v |
|  │        |     0 |      | order | -v          |         |                              |
|  └── scan |     1 | scan |       |             | (k, v)  | k!=NULL; v!=NULL; key(k)     |
|           |     1 |      | table | kv@primary  |         |                              |
|           |     1 |      | spans | ALL         |         |                              |
+-----------+-------+------+-------+-------------+---------+------------------------------+
~~~

Another property that is reported in the **Ordering** column is information
about columns that are known to be equal on any row, and "constant" columns
that are known to have the same value on all rows. For example:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (METADATA) SELECT * FROM abcd JOIN efg ON a = e AND c = 1;
~~~

~~~
+-----------+-------+------+----------------+--------------+-----------------------+-------------------------------+
|   Tree    | Level | Type |     Field      | Description  |        Columns        |           Ordering            |
+-----------+-------+------+----------------+--------------+-----------------------+-------------------------------+
| join      |     0 | join |                |              | (a, b, c, d, e, f, g) | a=e; c=CONST; a!=NULL; key(a) |
|  │        |     0 |      | type           | inner        |                       |                               |
|  │        |     0 |      | equality       | (a) = (e)    |                       |                               |
|  │        |     0 |      | mergeJoinOrder | +"(a=e)"     |                       |                               |
|  ├── scan |     1 | scan |                |              | (a, b, c, d)          | c=CONST; a!=NULL; key(a); +a  |
|  │        |     1 |      | table          | abcd@primary |                       |                               |
|  │        |     1 |      | spans          | ALL          |                       |                               |
|  └── scan |     1 | scan |                |              | (e, f, g)             | e!=NULL; key(e); +e           |
|           |     1 |      | table          | efg@primary  |                       |                               |
|           |     1 |      | spans          | ALL          |                       |                               |
+-----------+-------+------+----------------+--------------+-----------------------+-------------------------------+
~~~

This indicates that on any row, column `a` has the same value with column `e`,
and that all rows have the same value on column `c`.

### `QUALIFY` option

`QUALIFY` uses `<table name>.<column name>` notation for columns in the query plan. However, `QUALIFY` must be used with `EXPRS` to show the SQL values used:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (EXPRS, QUALIFY) SELECT a.v, b.v FROM t.kv AS a, t.kv AS b;
~~~

~~~
+----------------+----------+-------------+
|      Tree      |  Field   | Description |
+----------------+----------+-------------+
| render         |          |             |
|  │             | render 0 | a.v         |
|  │             | render 1 | b.v         |
|  └── join      |          |             |
|       │        | type     | cross       |
|       ├── scan |          |             |
|       │        | table    | kv@primary  |
|       │        | spans    | ALL         |
|       └── scan |          |             |
|                | table    | kv@primary  |
|                | spans    | ALL         |
+----------------+----------+-------------+
~~~

You can contrast this with the same statement not including the `QUALIFY` option to see that the column references are not qualified, which can lead to ambiguity if multiple tables have columns with the same names:

{% include copy-clipboard.html %}
~~~ sql
>  EXPLAIN (EXPRS) SELECT a.v, b.v FROM kv AS a, kv AS b;
~~~

~~~
+-------+--------+----------+-------------+
| Level |  Type  |  Field   | Description |
+-------+--------+----------+-------------+
|     0 | render |          |             |
|     0 |        | render 0 | v           |
|     0 |        | render 1 | v           |
|     1 | join   |          |             |
|     1 |        | type     | cross       |
|     2 | scan   |          |             |
|     2 |        | table    | kv@primary  |
|     2 | scan   |          |             |
|     2 |        | table    | kv@primary  |
+-------+--------+----------+-------------+
~~~

### `VERBOSE` option

The `VERBOSE` option is an alias for the combination of `EXPRS`, `METADATA`, and `QUALIFY` options:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (VERBOSE)
  SELECT * FROM kv AS a JOIN kv USING (k) WHERE a.v > 3 ORDER BY a.v DESC;
~~~

~~~
+---------------------+----------------+------------------+-----------------------+------------------------------+
|        Tree         |     Field      |   Description    |        Columns        |           Ordering           |
+---------------------+----------------+------------------+-----------------------+------------------------------+
| sort                |                |                  | (k, v, v)             | k!=NULL; key(k); -v          |
|  │                  | order          | -v               |                       |                              |
|  └── render         |                |                  | (k, v, v)             | k!=NULL; key(k)              |
|       │             | render 0       | a.k              |                       |                              |
|       │             | render 1       | a.v              |                       |                              |
|       │             | render 2       | radu.public.kv.v |                       |                              |
|       └── join      |                |                  | (k, v, k[omitted], v) | k=k; k!=NULL; key(k)         |
|            │        | type           | inner            |                       |                              |
|            │        | equality       | (k) = (k)        |                       |                              |
|            │        | mergeJoinOrder | +"(k=k)"         |                       |                              |
|            ├── scan |                |                  | (k, v)                | k!=NULL; v!=NULL; key(k); +k |
|            │        | table          | kv@primary       |                       |                              |
|            │        | spans          | ALL              |                       |                              |
|            │        | filter         | v > 3            |                       |                              |
|            └── scan |                |                  | (k, v)                | k!=NULL; key(k); +k          |
|                     | table          | kv@primary       |                       |                              |
|                     | spans          | ALL              |                       |                              |
+---------------------+----------------+------------------+-----------------------+------------------------------+
~~~

By default, the `Level` and `Type` columns are hidden. To view, use `SELECT`:

{% include copy-clipboard.html %}
~~~ sql
> SELECT
  "Level", "Type"
FROM
  [
    EXPLAIN (VERBOSE)
      SELECT * FROM kv AS a JOIN kv USING (k) WHERE a.v > 3 ORDER BY a.v DESC
  ];
~~~
~~~
+-------+--------+
| Level |  Type  |
+-------+--------+
|     0 | sort   |
|     0 |        |
|     1 | render |
|     1 |        |
|     1 |        |
|     1 |        |
|     2 | join   |
|     2 |        |
|     2 |        |
|     2 |        |
|     3 | scan   |
|     3 |        |
|     3 |        |
|     3 |        |
|     3 | scan   |
|     3 |        |
|     3 |        |
+-------+--------+
~~~

### `TYPES` option

The `TYPES` mode includes the types of the values used in the query plan, and implies the `METADATA` and `EXPRS` options as well:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (TYPES) SELECT * FROM kv WHERE v > 3 ORDER BY v;
~~~

~~~
+-----------+-------+------+--------+-----------------------------+----------------+------------------------------+
|   Tree    | Level | Type | Field  |         Description         |    Columns     |           Ordering           |
+-----------+-------+------+--------+-----------------------------+----------------+------------------------------+
| sort      |     0 | sort |        |                             | (k int, v int) | k!=NULL; v!=NULL; key(k); +v |
|  │        |     0 |      | order  | +v                          |                |                              |
|  └── scan |     1 | scan |        |                             | (k int, v int) | k!=NULL; v!=NULL; key(k)     |
|           |     1 |      | table  | kv@primary                  |                |                              |
|           |     1 |      | spans  | ALL                         |                |                              |
|           |     1 |      | filter | ((v)[int] > (3)[int])[bool] |                |                              |
+-----------+-------+------+--------+-----------------------------+----------------+------------------------------+
~~~

### `OPT` option

<span class="version-tag">New in v2.1:</span> The `OPT` option displays a query plan tree if the query will be run with the [cost-based optimizer](sql-optimizer.html). If it returns `pq: unsupported statement: *tree.Insert`, the query will not be run with the cost-based optimizer and will be run with the heuristic planner.

For example:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) SELECT * FROM x WHERE a = 3;
~~~

~~~
+--------------------------------------------------------------------------+
|                                   text                                   |
+--------------------------------------------------------------------------+
| select                                                                   |
|  ├── columns: a:1(int!null) b:2(jsonb)                                   |
|  ├── stats: [rows=1.42857143, distinct(1)=1]                             |
|  ├── cost: 1060                                                          |
|  ├── fd: ()-->(1)                                                        |
|  ├── prune: (2)                                                          |
|  ├── scan x                                                              |
|  │    ├── columns: x.a:1(int) x.b:2(jsonb)                               |
|  │    ├── stats: [rows=1000, distinct(1)=700]                            |
|  │    ├── cost: 1050                                                     |
|  │    └── prune: (1,2)                                                   |
|  └── filters [type=bool, outer=(1), constraints=(/1: [/3 - /3]; tight),  |
| fd=()-->(1)]                                                             |
|       └── eq [type=bool, outer=(1), constraints=(/1: [/3 - /3]; tight)]  |
|            ├── variable: x.a [type=int, outer=(1)]                       |
|            └── const: 3 [type=int]                                       |
+--------------------------------------------------------------------------+
(15 rows)
~~~

The query above will be run with the cost-based optimizer and `EXPLAIN (OPT)` returns the query plan tree.


{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) INSERT INTO x VALUES (1);
~~~

~~~
pq: unsupported statement: *tree.Insert
~~~

The query above will not be run with the cost-based optimizer.

### `DISTSQL` option

<span class="version-tag">New in v2.1:</span> The `DISTSQL` option provides a link to a distributed query plan tree:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (DISTSQL) SELECT * FROM quotes WHERE episode = 13;
~~~

~~~
+-----------+----------------------------------------------+
| Automatic |                      URL                     |
+-----------+----------------------------------------------+
|   true    | https://cockroachdb.github.io/distsqlplan... |
+-----------+----------------------------------------------+
~~~

Point your browser to the URL provided:

<img src="{{ 'images/v2.1/explain-distsql-plan.png' | relative_url }}" alt="EXPLAIN (DISTSQL)" style="border:1px solid #eee;max-width:100%" />

To view the distributed SQL query plan with execution statistics, use `EXPLAIN ANALYZE (DISTSQL)`:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN ANALYZE (DISTSQL) SELECT * FROM quotes WHERE episode = 13;
~~~

~~~
+-----------+----------------------------------------------+
| Automatic |                      URL                     |
+-----------+----------------------------------------------+
|   true    | https://cockroachdb.github.io/distsqlplan... |
+-----------+----------------------------------------------+
~~~

Point your browser to the URL provided:

<img src="{{ 'images/v2.1/explain-analyze-distsql-plan.png' | relative_url }}" alt="EXPLAIN ANALYZE (DISTSQL)" style="border:1px solid #eee;max-width:100%" />

### Find the indexes and key ranges a query uses

You can use `EXPLAIN` to understand which indexes and key ranges queries use,
which can help you ensure a query isn't performing a full table scan.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE kv (k INT PRIMARY KEY, v INT);
~~~

Because column `v` is not indexed, queries filtering on it alone scan the entire table:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM kv WHERE v BETWEEN 4 AND 5;
~~~

~~~
+-------+------+-------+-------------+
| Level | Type | Field | Description |
+-------+------+-------+-------------+
|     0 | scan |       |             |
|     0 |      | table | kv@primary  |
|     0 |      | spans | ALL         |
+-------+------+-------+-------------+
~~~

If there were an index on `v`, CockroachDB would be able to avoid scanning the
entire table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX v ON kv (v);
~~~

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM kv WHERE v BETWEEN 4 AND 5;
~~~

~~~
+------+-------+-------------+
| Tree | Field | Description |
+------+-------+-------------+
| scan |       |             |
|      | table | kv@v        |
|      | spans | /4-/6       |
+------+-------+-------------+
~~~

Now, only part of the index `v` is getting scanned, specifically the key range starting
at (and including) 4 and stopping before 6.

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`BACKUP`](backup.html)
- [`CANCEL JOB`](cancel-job.html)
- [`CREATE DATABASE`](create-database.html)
- [`DROP DATABASE`](drop-database.html)
- [`EXECUTE`](sql-grammar.html#execute_stmt)
- [`IMPORT`](import.html)
- [Indexes](indexes.html)
- [`INSERT`](insert.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESET`](reset-vars.html)
- [`RESTORE`](restore.html)
- [`RESUME JOB`](resume-job.html)
- [`SELECT`](select-clause.html)
- [Selection Queries](selection-queries.html)
- [`SET`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)
