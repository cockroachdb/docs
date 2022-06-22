---
title: EXPLAIN
summary: The EXPLAIN statement provides information you can use to optimize SQL queries.
toc: true
---

The `EXPLAIN` [statement](sql-statements.html) returns CockroachDB's query plan for an [explainable statement](sql-grammar.html#preparable_stmt). You can then use this information to optimize the query.

{{site.data.alerts.callout_success}}
To actually execute a statement and return a physical query plan with execution statistics, use [`EXPLAIN ANALYZE`](explain-analyze.html).
{{site.data.alerts.end}}

## Query optimization

Using `EXPLAIN`'s output, you can optimize your queries by taking the following points into consideration:

- Queries with fewer levels execute more quickly. Restructuring queries to require fewer levels of processing will generally improve performance.

- Avoid scanning an entire table, which is the slowest way to access data. You can avoid this by [creating indexes](indexes.html) that contain at least one of the columns that the query is filtering in its `WHERE` clause.

You can find out if your queries are performing entire table scans by using `EXPLAIN` to see which:

- Indexes the query uses; shown as the **Description** value of rows with the **Field** value of `table`

- Key values in the index are being scanned; shown as the **Description** value of rows with the **Field** value of `spans`

For more information, see [Find the Indexes and Key Ranges a Query Uses](#find-the-indexes-and-key-ranges-a-query-uses).

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/explain.html %}</section>

## Required privileges

The user requires the appropriate [privileges](authorization.html#assign-privileges) for the statement being explained.

## Parameters

 Parameter          | Description
--------------------+------------
 `VERBOSE`          | Show as much information as possible about the query plan.
 `TYPES`            | Include the intermediate [data types](data-types.html) CockroachDB chooses to evaluate intermediate SQL expressions.
 `OPT`              | Display a query plan tree if the query will be run with the [cost-based optimizer](cost-based-optimizer.html). If it returns an "unsupported statement" error, the query will not be run with the cost-based optimizer and will be run with the heuristic planner.<br><br><span class="version-tag">New in v19.1</span>: To include cost details used by the optimizer in planning the query, use `OPT, VERBOSE`. To include cost and type details, use `OPT, TYPES`. To include all details used by the optimizer, including statistics, use `OPT, ENV`.
 `DISTSQL`          | Generate a URL to a [distributed SQL physical query plan tree](explain-analyze.html#distsql-plan-viewer).<br><br>{% include {{ page.version.version }}/sql/physical-plan-url.md %}
 `preparable_stmt` | The [statement](sql-grammar.html#preparable_stmt) you want details about. All preparable statements are explainable.

{{site.data.alerts.callout_danger}}
`EXPLAIN` also includes other modes besides query plans that are useful only to CockroachDB developers, which are not documented here.
{{site.data.alerts.end}}

## Success responses

Successful `EXPLAIN` statements return tables with the following columns:

 Column | Description
-----------|-------------
**Tree** | A tree representation showing the hierarchy of the query plan.
**Field** | The name of a parameter relevant to the query plan node immediately above.
**Description** | Additional information for the parameter in  **Field**.
**Columns** | The columns provided to the processes at lower levels of the hierarchy. Included in `TYPES` and `VERBOSE` output.
**Ordering** | The order in which results are presented to the processes at each level of the hierarchy, as well as other properties of the result set at each level. Included in `TYPES` and `VERBOSE` output.

## Examples

### Default query plans


By default, `EXPLAIN` includes the least detail about the query plan but can be useful to find out which indexes and index key ranges are used by a query. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM episodes WHERE season > 3 ORDER BY season ASC;
~~~

~~~
    tree    | field  |   description
+-----------+--------+------------------+
  sort      |        |
   │        | order  | +season
   └── scan |        |
            | table  | episodes@primary
            | spans  | ALL
            | filter | season > 3
(6 rows)
~~~

The `tree` column of the output shows the tree structure of the query plan, in this case a `sort` and then a `scan`.

The `field` and `description` columns describe a set of properties specific to an operation listed in the `tree` column (in this case, `sort` or `scan`):

- `order`:`+season`
  <br>The sort will be ordered ascending on the `season` column.
- `table`:`episodes@primary`
  <br>The table is scanned on the `primary` index.
- `spans`:`ALL`
  <br>The table is scanned on all key ranges of the `primary` index (i.e., a full table scan). For more information on indexes and key ranges, see the [example](#find-the-indexes-and-key-ranges-a-query-uses) below.
- `filter`: `season > 3`
  <br>The scan filters on the `season` column.

### `VERBOSE` option

The `VERBOSE` option:

- Includes SQL expressions that are involved in each processing stage, providing more granular detail about which portion of your query is represented at each level.
- Includes detail about which columns are being used by each level, as well as properties of the result set on that level.

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN (VERBOSE) SELECT * FROM quotes AS q \
JOIN episodes AS e ON q.episode = e.id \
WHERE e.season = '1' \
ORDER BY e.stardate ASC;
~~~

~~~
       tree      |       field        |   description    |                                 columns                                  | ordering
+----------------+--------------------+------------------+--------------------------------------------------------------------------+-----------+
  sort           |                    |                  | (quote, characters, stardate, episode, id, season, num, title, stardate) | +stardate
   │             | order              | +stardate        |                                                                          |
   └── hash-join |                    |                  | (quote, characters, stardate, episode, id, season, num, title, stardate) |
        │        | type               | inner            |                                                                          |
        │        | equality           | (episode) = (id) |                                                                          |
        │        | right cols are key |                  |                                                                          |
        ├── scan |                    |                  | (quote, characters, stardate, episode)                                   |
        │        | table              | quotes@primary   |                                                                          |
        │        | spans              | ALL              |                                                                          |
        └── scan |                    |                  | (id, season, num, title, stardate)                                       |
                 | table              | episodes@primary |                                                                          |
                 | spans              | ALL              |                                                                          |
                 | filter             | season = 1       |                                                                          |
(13 rows)
~~~

### `TYPES` option

The `TYPES` mode includes the types of the values used in the query plan. It also includes the SQL expressions that were involved in each processing stage, and includes the columns used by each level.

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN (TYPES) SELECT * FROM episodes WHERE season > 3 ORDER BY season ASC;
~~~

~~~
    tree    | field  |           description            |                            columns                            | ordering
+-----------+--------+----------------------------------+---------------------------------------------------------------+----------+
  sort      |        |                                  | (id int, season int, num int, title string, stardate decimal) | +season
   │        | order  | +season                          |                                                               |
   └── scan |        |                                  | (id int, season int, num int, title string, stardate decimal) |
            | table  | episodes@primary                 |                                                               |
            | spans  | ALL                              |                                                               |
            | filter | ((season)[int] > (3)[int])[bool] |                                                               |
(6 rows)
~~~

### `OPT` option

The `OPT` option displays a query plan tree, if the query will be run with the [cost-based optimizer](cost-based-optimizer.html). If it returns an "unsupported statement" error, the query will not be run with the cost-based optimizer and will be run with the legacy heuristic planner.

For example, the following query returns the query plan tree, which means that it will be run with the cost-based optimizer:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) SELECT * FROM episodes WHERE season > 3 ORDER BY season ASC;
~~~

~~~
            text
+---------------------------+
  sort
   └── select
        ├── scan episodes
        └── filters
             └── season > 3
(5 rows)
~~~

<a name="opt-verbose-option"></a>

<span class="version-tag">New in v19.1</span>: To include cost details used by the optimizer in planning the query, use `OPT, VERBOSE`:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT, VERBOSE) SELECT * FROM episodes WHERE season > 3 ORDER BY season ASC;
~~~

~~~
                                                    text
+----------------------------------------------------------------------------------------------------------+
  sort
   ├── columns: id:1 season:2 num:3 title:4 stardate:5
   ├── stats: [rows=26.3333333, distinct(1)=26.3333333, null(1)=0, distinct(2)=2.99993081, null(2)=0]
   ├── cost: 90.7319109
   ├── key: (1)
   ├── fd: (1)-->(2-5)
   ├── ordering: +2
   ├── prune: (1,3-5)
   └── select
        ├── columns: id:1 season:2 num:3 title:4 stardate:5
        ├── stats: [rows=26.3333333, distinct(1)=26.3333333, null(1)=0, distinct(2)=2.99993081, null(2)=0]
        ├── cost: 87.71
        ├── key: (1)
        ├── fd: (1)-->(2-5)
        ├── prune: (1,3-5)
        ├── scan episodes
        │    ├── columns: id:1 season:2 num:3 title:4 stardate:5
        │    ├── stats: [rows=79, distinct(1)=79, null(1)=0, distinct(2)=3, null(2)=0]
        │    ├── cost: 86.91
        │    ├── key: (1)
        │    ├── fd: (1)-->(2-5)
        │    └── prune: (1-5)
        └── filters
             └── season > 3 [outer=(2), constraints=(/2: [/4 - ]; tight)]
(24 rows)
~~~

<a name="opt-types-option"></a>

<span class="version-tag">New in v19.1</span>: To include cost and type details, use `OPT, TYPES`:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT, TYPES) SELECT * FROM episodes WHERE season > 3 ORDER BY season ASC;
~~~

~~~
                                                    text
+----------------------------------------------------------------------------------------------------------+
  sort
   ├── columns: id:1(int!null) season:2(int!null) num:3(int) title:4(string) stardate:5(decimal)
   ├── stats: [rows=26.3333333, distinct(1)=26.3333333, null(1)=0, distinct(2)=2.99993081, null(2)=0]
   ├── cost: 90.7319109
   ├── key: (1)
   ├── fd: (1)-->(2-5)
   ├── ordering: +2
   ├── prune: (1,3-5)
   └── select
        ├── columns: id:1(int!null) season:2(int!null) num:3(int) title:4(string) stardate:5(decimal)
        ├── stats: [rows=26.3333333, distinct(1)=26.3333333, null(1)=0, distinct(2)=2.99993081, null(2)=0]
        ├── cost: 87.71
        ├── key: (1)
        ├── fd: (1)-->(2-5)
        ├── prune: (1,3-5)
        ├── scan episodes
        │    ├── columns: id:1(int!null) season:2(int) num:3(int) title:4(string) stardate:5(decimal)
        │    ├── stats: [rows=79, distinct(1)=79, null(1)=0, distinct(2)=3, null(2)=0]
        │    ├── cost: 86.91
        │    ├── key: (1)
        │    ├── fd: (1)-->(2-5)
        │    └── prune: (1-5)
        └── filters
             └── gt [type=bool, outer=(2), constraints=(/2: [/4 - ]; tight)]
                  ├── variable: season [type=int]
                  └── const: 3 [type=int]
(26 rows)
~~~

<a name="opt-env-option"></a>

<span class="version-tag">New in v19.1</span>: To include all details used by the optimizer, including statistics, use `OPT, ENV`:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT, ENV) SELECT * FROM episodes WHERE season > 3 ORDER BY season ASC;
~~~

~~~
                                                              text
+-------------------------------------------------------------------------------------------------------------------------------+
  Version: CockroachDB CCL v19.1.0-beta.20190318-377-gc45b9a400f (x86_64-apple-darwin17.7.0, built 2019/03/26 19:46:42, go1.11)

  CREATE TABLE episodes (
      id INT8 NOT NULL,
      season INT8 NULL,
      num INT8 NULL,
      title STRING NULL,
      stardate DECIMAL NULL,
      CONSTRAINT "primary" PRIMARY KEY (id ASC),
      FAMILY "primary" (id, season, num, title, stardate)
  );

  ALTER TABLE startrek.public.episodes INJECT STATISTICS '[
      {
          "columns": [
              "id"
          ],
          "created_at": "2019-03-26 19:49:53.18699+00:00",
          "distinct_count": 79,
          "histo_col_type": "",
          "name": "__auto__",
          "null_count": 0,
          "row_count": 79
      },
      {
          "columns": [
              "season"
          ],
          "created_at": "2019-03-26 19:49:53.18699+00:00",
          "distinct_count": 3,
          "histo_col_type": "",
          "name": "__auto__",
          "null_count": 0,
          "row_count": 79
      },
      {
          "columns": [
              "num"
          ],
          "created_at": "2019-03-26 19:49:53.18699+00:00",
          "distinct_count": 29,
          "histo_col_type": "",
          "name": "__auto__",
          "null_count": 0,
          "row_count": 79
      },
      {
          "columns": [
              "title"
          ],
          "created_at": "2019-03-26 19:49:53.18699+00:00",
          "distinct_count": 79,
          "histo_col_type": "",
          "name": "__auto__",
          "null_count": 0,
          "row_count": 79
      },
      {
          "columns": [
              "stardate"
          ],
          "created_at": "2019-03-26 19:49:53.18699+00:00",
          "distinct_count": 75,
          "histo_col_type": "",
          "name": "__auto__",
          "null_count": 4,
          "row_count": 79
      }
  ]';

  EXPLAIN (OPT, ENV) SELECT * FROM episodes WHERE season > 3 ORDER BY season ASC;
  ----
  sort
   └── select
        ├── scan episodes
        └── filters
             └── season > 3
(77 rows)
~~~

### `DISTSQL` option

The `DISTSQL` option generates a URL for a physical query plan that provides high level information about how a query will be executed. For details about reading the physical query plan, see [DistSQL Plan Viewer](explain-analyze.html#distsql-plan-viewer). For more information about distributed SQL queries, see the [DistSQL section of our SQL Layer Architecture docs](architecture/sql-layer.html#distsql).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/sql/physical-plan-url.md %}
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN (DISTSQL) SELECT l_shipmode, AVG(l_extendedprice) FROM lineitem GROUP BY l_shipmode;
~~~

~~~
 automatic |                      url
-----------+----------------------------------------------
   true    | https://cockroachdb.github.io/distsqlplan...
~~~

To view the [DistSQL Plan Viewer](explain-analyze.html#distsql-plan-viewer), point your browser to the URL provided:

<img src="{{ 'images/v19.1/explain-distsql-plan.png' | relative_url }}" alt="EXPLAIN (DISTSQL)" style="border:1px solid #eee;max-width:100%" />

### Find the indexes and key ranges a query uses

You can use `EXPLAIN` to understand which indexes and key ranges queries use, which can help you ensure a query isn't performing a full table scan.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE kv (k INT PRIMARY KEY, v INT);
~~~

Because column `v` is not indexed, queries filtering on it alone scan the entire table:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM kv WHERE v BETWEEN 4 AND 5;
~~~

~~~
  tree | field  |      description
+------+--------+-----------------------+
  scan |        |
       | table  | kv@primary
       | spans  | ALL
       | filter | (v >= 4) AND (v <= 5)
(4 rows)
~~~

If there were an index on `v`, CockroachDB would be able to avoid scanning the entire table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX v ON kv (v);
~~~

{% include_cached copy-clipboard.html %}
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

Now, only part of the index `v` is getting scanned, specifically the key range starting at (and including) 4 and stopping before 6.

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`BACKUP`](backup.html)
- [`CANCEL JOB`](cancel-job.html)
- [`CREATE DATABASE`](create-database.html)
- [`DROP DATABASE`](drop-database.html)
- [`EXECUTE`](sql-grammar.html#execute_stmt)
- [`EXPLAIN ANALYZE`](explain-analyze.html)
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
