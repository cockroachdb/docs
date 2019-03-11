---
title: Cost-Based Optimizer
summary: Learn about the cost-based optimizer
toc: true
redirect_from: sql-optimizer.html
---

The cost-based optimizer seeks the lowest cost for a query, usually related to time.

In versions prior to 2.1, a heuristic planner was used to generate query execution plans. The heuristic planner is only used in the following cases:

- If your query uses functionality that is not yet supported by the cost-based optimizer. For more information about the types of queries that are supported, see [Types of statements supported by the cost-based optimizer](#types-of-statements-supported-by-the-cost-based-optimizer).
- If you explicitly turn off the optimizer. For more information, see [How to turn the optimizer off](#how-to-turn-the-optimizer-off).

{% include {{ page.version.version }}/misc/beta-warning.md %}

## How is cost calculated?

A given SQL query can have thousands of equivalent query plans with vastly different execution times. The cost-based optimizer enumerates these plans and chooses the lowest cost plan.

Cost is roughly calculated by:

- Estimating how much time each node in the query plan will use to process all results
- Modeling how data flows through the query plan

The most important factor in determining the quality of a plan is cardinality (i.e., the number of rows); the fewer rows each SQL operator needs to process, the faster the query will run.

## View query plan

To see whether a query will be run with the cost-based optimizer, run the query with [`EXPLAIN (OPT)`](explain.html). The `OPT` option displays a query plan tree, along with some information that was used to plan the query. If the query is unsupported (i.e., it returns an error message that starts with e.g., `pq: unsupported statement` or `pq: aggregates with FILTER are not supported yet`), the query will not be run with the cost-based optimizer and will be run with the legacy heuristic planner.

For example, the following query (which uses [CockroachDB's TPC-H data set](https://github.com/cockroachdb/cockroach/tree/b1a57102d8e99b301b74c97527c1b8ffd4a4f3f1/pkg/workload/tpch)) returns the query plan tree, which means that it will be run with the cost-based optimizer:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) SELECT l_shipmode, avg(l_extendedprice) from lineitem GROUP BY l_shipmode;
~~~

~~~
                                     text
+-----------------------------------------------------------------------------+
group-by
├── columns: l_shipmode:15(string!null) avg:17(float)
├── grouping columns: l_shipmode:15(string!null)
├── stats: [rows=700, distinct(15)=700]
├── cost: 1207
├── key: (15)
├── fd: (15)-->(17)
├── prune: (17)
├── scan lineitem
│    ├── columns: l_extendedprice:6(float!null) l_shipmode:15(string!null)
│    ├── stats: [rows=1000, distinct(15)=700]
│    ├── cost: 1180
│    └── prune: (6,15)
└── aggregations [outer=(6)]
└── avg [type=float, outer=(6)]
└── variable: l_extendedprice [type=float, outer=(6)]
(16 rows)
~~~

In contrast, queries that are not supported by the cost-based optimizer return errors that begin with the string `pq: unsupported statement: ...` or specific messages like `pq: aggregates with FILTER are not supported yet`. Such queries will use the legacy heuristic planner instead of the cost-based optimizer.

## Types of statements supported by the cost-based optimizer

The cost-based optimizer supports most SQL statements. Specifically, the following types of statements are supported:

- [`CREATE TABLE`](create-table.html)
- [`UPDATE`](update.html)
- [`INSERT`](insert.html), including:
  - `INSERT .. ON CONFLICT DO NOTHING`
  - `INSERT .. ON CONFLICT .. DO UPDATE`
- [`UPSERT`](upsert.html)
- [`DELETE`](delete.html)
- `FILTER` clauses on [aggregate functions](functions-and-operators.html#aggregate-functions)
- [Sequences](create-sequence.html)
- [Views](views.html)
- All [`SELECT`](select.html) statements that do not include window functions
- All `UNION` statements that do not include window functions
- All `VALUES` statements that do not include window functions

This is not meant to be an exhaustive list. To check whether a particular query will be run with the cost-based optimizer, follow the instructions in the [View query plan](#view-query-plan) section.

## Table statistics

The cost-based optimizer can often find more performant query execution plans if it has access to statistical data on the contents of your database's tables. This statistical data needs to be generated from scratch for new tables, and regenerated periodically for existing tables.

{% include {{ page.version.version }}/misc/automatic-statistics.md %}

To manually generate statistics for a table, run a [`CREATE STATISTICS`](create-statistics.html) statement like the one shown below. It automatically figures out which columns to get statistics on &mdash; specifically, it chooses:

- Columns that are part of the primary key or an index (in other words, all indexed columns).
- Up to 100 non-indexed columns.

Note that the above also describes the statistics gathered by the automatic statistics feature, since it runs a query similar to the one shown below.

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS employees_stats FROM employees;
~~~

{{site.data.alerts.callout_info}}
Every time the [`CREATE STATISTICS`](create-statistics.html) statement is executed, it kicks off a background job. For more information, see [View statistics jobs](create-statistics.html#view-statistics-jobs).
{{site.data.alerts.end}}

## Query plan cache

<span class="version-tag">New in v19.1</span>: CockroachDB uses a cache for the query plans generated by the optimizer. This can lead to faster query execution since the database can reuse a query plan that was previously calculated, rather than computing a new plan each time a query is executed.

The query plan cache is enabled by default. To disable it, execute the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.query_cache.enabled = false;
~~~

Finally, note that only the following statements use the plan cache:

- [`SELECT`](select.html)
- [`INSERT`](insert.html)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)
- [`DELETE`](delete.html)

## Join reordering

<span class="version-tag">New in v19.1</span>: The cost-based optimizer will explore additional join orderings in an attempt to find the lowest-cost execution plan for a query involving multiple joins, which can lead to significantly better performance in some cases.

Because this process leads to an exponential increase in the number of possible execution plans for such queries, it's only used to reorder subtrees containing 4 or fewer joins by default.

To change this setting, which is controlled by the `experimental_reorder_joins_limit` [session variable](set-vars.html), run the statement shown below. To disable this feature, set the variable to `0`.

{% include copy-clipboard.html %}
~~~ sql
> SET experimental_reorder_joins_limit = 6;
~~~

{{site.data.alerts.callout_danger}}
We strongly recommend not setting this value higher than 8 to avoid performance degradation. If set too high, the cost of generating and costing execution plans can end up dominating the total execution time of the query.
{{site.data.alerts.end}}

For more information about the difficulty of selecting an optimal join ordering, see our blog post [An Introduction to Join Ordering](https://www.cockroachlabs.com/blog/join-ordering-pt1/).

## Preferring the nearest index

<span class="version-tag">New in v19.1</span>: Given multiple identical [indexes](indexes.html) that have different locality constraints using [replication zones](configure-replication-zones.html), the optimizer will prefer the index that is closest to the gateway node that is planning the query. In a properly configured geo-distributed cluster, this can lead to performance improvements due to improved data locality and reduced network traffic.

This feature enables scenarios where reference data such as a table of postal codes can be replicated to different regions, and queries will use the copy in the same region.

{{site.data.alerts.callout_info}}
The optimizer preferring the nearest index is not an enterprise feature, but in order to take advantage of it you need to be able to [create a replication zone for a secondary index](configure-replication-zones.html#create-a-replication-zone-for-a-secondary-index), which is an [enterprise feature](enterprise-licensing.html).
{{site.data.alerts.end}}

To take advantage of this feature, you will need to:

1. Have an [enterprise license](enterprise-licensing.html).
2. Determine which of your data consists of reference tables that are rarely updated (such as postal codes) and can therefore be easily replicated to different regions.
3. Create multiple indexes on the reference tables.
4. Create replication zones for each index.

With the above pieces in place, the optimizer will automatically choose the index nearest the gateway node that is planning the query.

We can demonstrate the necessary configuration steps using a local cluster. The instructions below assume that you are already familiar with:

- How to [Start a local cluster](start-a-local-cluster.html).
- The syntax for [assigning node locality when configuring replication zones](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes).
- Using [the built-in SQL client](use-the-built-in-sql-client.html).

First, start 3 local nodes as shown below. Use the [`--locality`](start-a-node.html#locality) flag to put them all in the same region, while putting each in a different datacenter as denoted by `dc=dc1`, `dc=dc2`, etc.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=east,dc=dc1 --insecure --store=/tmp/node0 --host=localhost --port=26257 --http-port=8888  --join=localhost:26257,localhost:26258,localhost:26259 --background
$ cockroach start --locality=region=east,dc=dc2 --insecure --store=/tmp/node1 --host=localhost --port=26258 --http-port=8889  --join=localhost:26257,localhost:26258,localhost:26259 --background
$ cockroach start --locality=region=east,dc=dc3 --insecure --store=/tmp/node2 --host=localhost --port=26259 --http-port=8890  --join=localhost:26257,localhost:26258,localhost:26259 --background
$ cockroach init --insecure --host=localhost --port=26257
~~~

Next, from the SQL client, add your organization name and enterprise license:

{% include copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING cluster.organization = 'FooCorp - Local Testing';
SET CLUSTER SETTING enterprise.license = 'xxxxx';
~~~

Create a test database and table. The table will have 3 indexes into the same data. Later, we'll configure the cluster to associate each of these indexes with a different datacenter using replication zones.

{% include copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS test;
USE test;
CREATE TABLE t (
    k INT PRIMARY KEY,
    v STRING,
    INDEX secondary (k) STORING (v),
    INDEX ternary (k) STORING (v)
);
~~~

Next, we modify the replication zone configuration via SQL so that:

- Nodes in DC1 will use the primary key index.
- Nodes in DC2 will use the `t@secondary` index (which is identical to the primary key index).
- Nodes in DC3 will use the `t@ternary` index (which is also identical to the primary key index).

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE t CONFIGURE ZONE USING constraints='["+region=east","+dc=dc1"]';
ALTER INDEX t@secondary CONFIGURE ZONE USING constraints='["+region=east","+dc=dc2"]';
ALTER INDEX t@ternary CONFIGURE ZONE USING constraints='["+region=east","+dc=dc3"]';
~~~

To verify this is working as expected, we'll query the database from each of our 3 local nodes as shown below. Each node should be in a different "datacenter" according to the replication zone configuration, and should therefore be using the index pinned to that datacenter's location.

As expected, the node in "dc1" uses the primary key index.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost --port=26257 --database=test -e 'EXPLAIN SELECT * FROM t WHERE k=1;'
~~~

~~~
 tree | field | description
------+-------+-------------
 scan |       |
      | table | t@primary
      | spans | /10-/10/#
(3 rows)
~~~

As expected, the node in "dc2" uses the `t@secondary` index.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost --port=26258 --database=test -e 'EXPLAIN SELECT * FROM t WHERE k=1;'
~~~

~~~
  tree | field | description
+------+-------+-------------+
  scan |       |
       | table | t@secondary
       | spans | /10-/11
(3 rows)
~~~

As expected, the node in "dc3" uses the `t@ternary` index.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost --port=26259 --database=test -e 'EXPLAIN SELECT * FROM t WHERE k=1;'
~~~

~~~
  tree | field | description
+------+-------+-------------+
  scan |       |
       | table | t@ternary
       | spans | /10-/11
(3 rows)
~~~

You'll need to make changes to the above configuration to reflect your [production environment](recommended-production-settings.html), but the concepts will be the same.

## How to turn the optimizer off

With the optimizer turned on, the performance of some workloads may change. If your workload performs worse than expected (e.g., lower throughput or higher latency), you can turn off the cost-based optimizer and use the heuristic planner.

To turn the cost-based optimizer off for the current session:

{% include copy-clipboard.html %}
~~~ sql
> SET optimizer = 'off';
~~~

To turn the cost-based optimizer off for all sessions:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.defaults.optimizer = 'off';
~~~

{{site.data.alerts.callout_info}}
Changing the cluster setting does not immediately turn the optimizer off; instead, it changes the default session setting to `off`. To see the change, restart your session.
{{site.data.alerts.end}}

## Known limitations

- Some features are not supported by the cost-based optimizer; however, the optimizer will fall back to the heuristic planner for this functionality. If performance is worse than in previous versions of CockroachDB, you can [turn the optimizer off](#how-to-turn-the-optimizer-off) to manually force it to fallback to the heuristic planner.
- Some [correlated subqueries](subqueries.html#correlated-subqueries) are not supported by the cost-based optimizer yet. If you come across an unsupported correlated subquery, please [file a Github issue](file-an-issue.html).

## See also

- [`SET (session variable)`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW (session variable)`](show-vars.html)
- [`CREATE STATISTICS`](create-statistics.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`EXPLAIN`](explain.html)
