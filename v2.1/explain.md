---
title: EXPLAIN
summary: The EXPLAIN statement provides information you can use to optimize SQL queries.
toc: true
---

The `EXPLAIN` [statement](sql-statements.html) returns CockroachDB's query plan for an [explainable statement](sql-grammar.html#explainable_stmt). You can then use this information to optimize the query.

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

 Parameter          | Description
--------------------+------------
 `ANALYZE`          | <span class="version-tag">New in v2.1:</span> Execute the command and show execution statistics.
 `VERBOSE`          | Show as much information as possible about the query plan.
 `TYPES`            | Include the intermediate [data types](data-types.html) CockroachDB chooses to evaluate intermediate SQL expressions.
 `OPT`              | <span class="version-tag">New in v2.1:</span> Display a query plan tree if the query will be run with the [cost-based optimizer](sql-optimizer.html). If it returns `pq: unsupported statement: *tree.Insert`, the query will not be run with the cost-based optimizer and will be run with the heuristic planner.
 `DISTSQL`          | <span class="version-tag">New in v2.1:</span> Provide a link that displays a distributed SQL plan tree.
 `explainable_stmt` | The [explainable statement](sql-grammar.html#explainable_stmt) you want details about.

{{site.data.alerts.callout_danger}}<code>EXPLAIN</code> also includes other modes besides query plans that are useful only to CockroachDB developers, which are not documented here.{{site.data.alerts.end}}

## Success responses

Successful `EXPLAIN` statements return tables with the following columns:

 Column | Description
-----------|-------------
**Tree** | A tree representation showing the hierarchy of the query plan.
**Field** | The name of a parameter relevant to the query plan node immediately above.
**Description** | Additional information for the parameter in  **Field**.
**Columns** | The columns provided to the processes at lower levels of the hierarchy.
**Ordering** | The order in which results are presented to the processes at each level of the hierarchy, as well as other properties of the result set at each level.

## Examples

### Default query plans

By default, `EXPLAIN` includes the least detail about the query plan but can be
useful to find out which indexes and index key ranges are used by a query:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM kv WHERE v > 3 ORDER BY v;
~~~

~~~
   tree    | field | description
-----------+-------+-------------
 sort      |       |
  │        | order | +v
  └── scan |       |
           | table | kv@primary
           | spans | ALL
(5 rows)
~~~

The first column shows the tree structure of the query plan; a set of properties
is displayed for each node in the tree. Most importantly, for scans, you can see
the index that is scanned (`primary` in this case) and what key ranges of the
index you are scanning (in this case, a full table scan). For more
information on indexes and key ranges, see the
[example](#find-the-indexes-and-key-ranges-a-query-uses) below.

### `VERBOSE` option

The `VERBOSE` option:

+ Includes SQL expressions that are involved in each processing stage, providing more granular detail about which portion of your query is represented at each level.
+ Includes detail about which columns are being used by each level, as well as properties of the result set on that level.

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (VERBOSE) SELECT * FROM kv AS a JOIN kv USING (k) WHERE a.v > 3 ORDER BY a.v DESC;
~~~

~~~
         tree         |  field   | description |   columns    | ordering
+---------------------+----------+-------------+--------------+----------+
  sort                |          |             | (k, v, v)    | -v
   │                  | order    | -v          |              |
   └── render         |          |             | (k, v, v)    |
        │             | render 0 | k           |              |
        │             | render 1 | v           |              |
        │             | render 2 | v           |              |
        └── join      |          |             | (k, v, k, v) |
             │        | type     | inner       |              |
             │        | equality | (k) = (k)   |              |
             ├── scan |          |             | (k, v)       |
             │        | table    | kv@primary  |              |
             │        | spans    | ALL         |              |
             └── scan |          |             | (k, v)       |
                      | table    | kv@v        |              |
                      | spans    | /4-         |              |
(15 rows)
~~~

### `TYPES` option

The `TYPES` mode includes the types of the values used in the query plan.  It also includes the SQL expressions that were involved in each processing stage, and includes the columns used by each level.

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (TYPES) SELECT * FROM kv WHERE v > 3 ORDER BY v;
~~~

~~~
   tree    | field  |         description         |    columns     | ordering
-----------+--------+-----------------------------+----------------+----------
 sort      |        |                             | (k int, v int) | +v
  │        | order  | +v                          |                |
  └── scan |        |                             | (k int, v int) |
           | table  | kv@primary                  |                |
           | spans  | ALL                         |                |
           | filter | ((v)[int] > (3)[int])[bool] |                |
(6 rows)
~~~

### `OPT` option

<span class="version-tag">New in v2.1:</span> The `OPT` option displays a query plan tree if the query will be run with the [cost-based optimizer](sql-optimizer.html). If it returns an unsupported statement error, the query will not be run with the cost-based optimizer and will be run with the heuristic planner.

For example:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) SELECT * FROM kv WHERE k > 3;
~~~

~~~
                 text
--------------------------------------
 scan kv
  ├── columns: k:1(int!null) v:2(int)
  ├── constraint: /1: [/4 - ]
  ├── stats: [rows=333.333333]
  ├── cost: 346.666667
  ├── key: (1)
  ├── fd: (1)-->(2)
  └── prune: (2)
(8 rows)
~~~

The query above will be run with the cost-based optimizer and `EXPLAIN (OPT)` returns the query plan tree.


{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) INSERT INTO kv VALUES (1,1);
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
 automatic |                      url
-----------+----------------------------------------------
   true    | https://cockroachdb.github.io/distsqlplan...
~~~

Point your browser to the URL provided:

<img src="{{ 'images/v2.1/explain-distsql-plan.png' | relative_url }}" alt="EXPLAIN (DISTSQL)" style="border:1px solid #eee;max-width:100%" />

To view the distributed SQL query plan with execution statistics, use `EXPLAIN ANALYZE (DISTSQL)`:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN ANALYZE (DISTSQL) SELECT * FROM quotes WHERE episode = 13;
~~~

~~~
 automatic |                      url
-----------+----------------------------------------------
   true    | https://cockroachdb.github.io/distsqlplan...
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
 tree | field | description
------+-------+-------------
 scan |       |
      | table | kv@primary
      | spans | ALL
(3 rows)
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
 tree | field | description
------+-------+-------------
 scan |       |
      | table | kv@v
      | spans | /4-/6
(3 rows)
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
