---
title: Cost-Based Optimizer
summary: Learn about the cost-based optimizer
toc: true
redirect_from: sql-optimizer.html
---

The cost-based optimizer seeks the lowest cost for a query, usually related to time.

## How is cost calculated?

A given SQL query can have thousands of equivalent query plans with vastly different execution times. The cost-based optimizer enumerates these plans and chooses the lowest cost plan.

Cost is roughly calculated by:

- Estimating how much time each node in the query plan will use to process all results
- Modeling how data flows through the query plan

The most important factor in determining the quality of a plan is cardinality (i.e., the number of rows); the fewer rows each SQL operator needs to process, the faster the query will run.

## Table statistics

The cost-based optimizer can often find more performant query plans if it has access to statistical data on the contents of your tables. This data needs to be generated from scratch for new tables, and regenerated periodically for existing tables.

By default, CockroachDB automatically generates table statistics when tables are [created](create-table.html), and as they are [updated](update.html). It does this [using a background job](create-statistics.html#view-statistics-jobs) that automatically determines which columns to get statistics on &mdash; specifically, it chooses:

- Columns that are part of the primary key or an index (in other words, all indexed columns).
- Up to 100 non-indexed columns.

 By default, CockroachDB also automatically collects [multi-column statistics](create-statistics.html#create-statistics-on-multiple-columns) on columns that prefix an index.

{{site.data.alerts.callout_info}}
[Schema changes](online-schema-changes.html) trigger automatic statistics collection for the affected table(s).
{{site.data.alerts.end}}

### Controlling automatic statistics

For best query performance, most users should leave automatic statistics enabled with the default settings. The information provided in this section is useful for troubleshooting or performance tuning by advanced users.

#### Controlling statistics refresh rate

Statistics are refreshed in the following cases:

1. When there are no statistics.
2. When it's been a long time since the last refresh, where "long time" is defined according to a moving average of the time across the last several refreshes.
3. After each mutation operation ([`INSERT`](insert.html), [`UPDATE`](update.html), or [`DELETE`](delete.html)), the probability of a refresh is calculated using a formula that takes the [cluster settings](cluster-settings.html) shown below as inputs. These settings define the target number of rows in a table that should be stale before statistics on that table are refreshed.  Increasing either setting will reduce the frequency of refreshes.  In particular, `min_stale_rows` impacts the frequency of refreshes for small tables, while `fraction_stale_rows` has more of an impact on larger tables.

| Setting                                              | Default Value | Details                                                                              |
|------------------------------------------------------+---------------+--------------------------------------------------------------------------------------|
| `sql.stats.automatic_collection.fraction_stale_rows` |           0.2 | Target fraction of stale rows per table that will trigger a statistics refresh       |
| `sql.stats.automatic_collection.min_stale_rows`      |           500 | Target minimum number of stale rows per table that will trigger a statistics refresh |

{{site.data.alerts.callout_info}}
Because the formula for statistics refreshes is probabilistic, you should not expect to see statistics update immediately after changing these settings, or immediately after exactly 500 rows have been updated.
{{site.data.alerts.end}}

#### Turning off statistics

If you need to turn off automatic statistics collection, follow the steps below:

1. Run the following statement to disable the automatic statistics [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
    ~~~

2. Use the [`SHOW STATISTICS`](show-statistics.html) statement to view automatically generated statistics.

3. Delete the automatically generated statistics using the following statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > DELETE FROM system.table_statistics WHERE true;
    ~~~

4. Restart the nodes in your cluster to clear the statistics caches.

For instructions showing how to manually generate statistics, see the examples in the [`CREATE STATISTICS` documentation](create-statistics.html).

#### Controlling histogram collection

By default, the optimizer collects histograms for all index columns (specifically the first column in each index) during automatic statistics collection. If a single column statistic is explicitly requested using manual invocation of [`CREATE STATISTICS`](create-statistics.html), a histogram will be collected, regardless of whether or not the column is part of an index.

{{site.data.alerts.callout_info}}
CockroachDB does not support histograms on [`ARRAY`-typed](array.html) columns. As a result, statistics created on `ARRAY`-typed columns do not include histograms.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
CockroachDB does not support multi-column histograms yet. See [tracking issue](https://github.com/cockroachdb/cockroach/issues/49698).
{{site.data.alerts.end}}

If you are an advanced user and need to disable histogram collection for troubleshooting or performance tuning reasons, change the [`sql.stats.histogram_collection.enabled` cluster setting](cluster-settings.html) by running [`SET CLUSTER SETTING`](set-cluster-setting.html) as follows:

{% include copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.stats.histogram_collection.enabled = false;
~~~

{{site.data.alerts.callout_info}}
When `sql.stats.histogram_collection.enabled` is set to `false`, histograms are never collected, either as part of automatic statistics collection or by manual invocation of [`CREATE STATISTICS`](create-statistics.html).
{{site.data.alerts.end}}

## Query plan cache

CockroachDB uses a cache for the query plans generated by the optimizer. This can lead to faster query execution since the database can reuse a query plan that was previously calculated, rather than computing a new plan each time a query is executed.

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

The cost-based optimizer will explore additional join orderings in an attempt to find the lowest-cost execution plan for a query involving multiple joins, which can lead to significantly better performance in some cases.

Because this process leads to an exponential increase in the number of possible execution plans for such queries, it's only used to reorder subtrees containing 4 or fewer joins by default.

To change this setting, which is controlled by the `reorder_joins_limit` [session variable](set-vars.html), run the statement shown below. To disable this feature, set the variable to `0`.

{% include copy-clipboard.html %}
~~~ sql
> SET reorder_joins_limit = 6;
~~~

{{site.data.alerts.callout_danger}}
We strongly recommend not setting this value higher than 8 to avoid performance degradation. If set too high, the cost of generating and costing execution plans can end up dominating the total execution time of the query.
{{site.data.alerts.end}}

For more information about the difficulty of selecting an optimal join ordering, see our blog post [An Introduction to Join Ordering](https://www.cockroachlabs.com/blog/join-ordering-pt1/).

## Join hints

The optimizer supports hint syntax to force the use of a specific join algorithm. The algorithm is specified between the join type (`INNER`, `LEFT`, etc.) and the `JOIN` keyword, for example:

- `INNER HASH JOIN`
- `OUTER MERGE JOIN`
- `LEFT LOOKUP JOIN`
- `CROSS MERGE JOIN`

Note that the hint cannot be specified with a bare hint keyword (e.g., `MERGE`) - in that case, the `INNER` keyword must be added. For example, `a INNER MERGE JOIN b` will work, but `a MERGE JOIN b` will not work.

{{site.data.alerts.callout_info}}
Join hints cannot be specified with a bare hint keyword (e.g., `MERGE`) due to SQL's implicit `AS` syntax. If you're not careful, you can make `MERGE` be an alias for a table; for example, `a MERGE JOIN b` will be interpreted as having an implicit `AS` and be executed as `a AS MERGE JOIN b`, which is just a long way of saying `a JOIN b`. Because the resulting query might execute without returning any hint-related error (because it is valid SQL), it will seem like the join hint "worked", but actually it didn't affect which join algorithm was used. In this case, the correct syntax is `a INNER MERGE JOIN b`.
{{site.data.alerts.end}}

### Supported join algorithms

- `HASH`: Forces a hash join; in other words, it disables merge and lookup joins. A hash join is always possible, even if there are no equality columns - CockroachDB considers the nested loop join with no index a degenerate case of the hash join (i.e., a hash table with one bucket).

- `MERGE`: Forces a merge join, even if it requires re-sorting both sides of the join.

- `LOOKUP`: Forces a lookup join into the right side; the right side must be a table with a suitable index. Note that `LOOKUP` can only be used with `INNER` and `LEFT` joins.

If it is not possible to use the algorithm specified in the hint, an error is signaled.


{{site.data.alerts.callout_info}}
With queries on [interleaved tables](interleave-in-parent.html), the optimizer might choose to use a merge join to perform a [foreign key](foreign-key.html) check when a lookup join would be more optimal.

 To make the optimizer prefer lookup joins to merge joins when performing foreign key checks, set the `prefer_lookup_joins_for_fks` [session variable](set-vars.html) to `on`.
{{site.data.alerts.end}}

### Additional considerations

- This syntax is consistent with the [SQL Server syntax for join hints](https://docs.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-join?view=sql-server-2017), except that:

   - SQL Server uses `LOOP` instead of `LOOKUP`.

   - CockroachDB does not support `LOOP` and instead supports `LOOKUP` for the specific case of nested loop joins with an index.

- When a join hint is specified, the two tables will not be reordered by the optimizer. The reordering behavior has the following characteristics, which can be affected by hints:

   - Given `a JOIN b`, CockroachDB will not try to commute to `b JOIN a`. This means that you will need to pay attention to this ordering, which is especially important for lookup joins. Without a hint, `a JOIN b` might be executed as `b INNER LOOKUP JOIN a` using an index into `a`, whereas `a INNER LOOKUP JOIN b` requires an index into `b`.

   - `(a JOIN b) JOIN c` might be changed to `a JOIN (b JOIN c)`, but this does not happen if `a JOIN b` uses a hint; the hint forces that particular join to happen as written in the query.

- Hint usage should be reconsidered with each new release of CockroachDB. Due to improvements in the optimizer, hints specified to work with an older version may cause decreased performance in a newer version.

## Preferring the nearest index

Given multiple identical [indexes](indexes.html) that have different locality constraints using [replication zones](configure-replication-zones.html), the optimizer will prefer the index that is closest to the gateway node that is planning the query. In a properly configured geo-distributed cluster, this can lead to performance improvements due to improved data locality and reduced network traffic.

{{site.data.alerts.callout_info}}
This feature is only available to users with an [enterprise license](enterprise-licensing.html). For insight into how to use this feature to get low latency, consistent reads in multi-region deployments, see the [Duplicate Indexes](topology-follower-reads.html) topology pattern.
{{site.data.alerts.end}}

This feature enables scenarios such as:

- Reference data such as a table of postal codes that can be replicated to different regions, and queries will use the copy in the same region. See [Example - zone constraints](#zone-constraints) for more details.
- Optimizing for local reads (potentially at the expense of writes) by adding leaseholder preferences to your zone configuration. See [Example - leaseholder preferences](#leaseholder-preferences) for more details.

To take advantage of this feature, you need to:

1. Have an [enterprise license](enterprise-licensing.html).
2. Determine which data consists of reference tables that are rarely updated (such as postal codes) and can therefore be easily replicated to different regions.
3. Create multiple [secondary indexes](indexes.html) on the reference tables. **Note that these indexes must include (in key or using [`STORED`](create-index.html#store-columns)) *every* column that you wish to query**. For example, if you run `SELECT * from db.table` and not every column of `db.table` is in the set of secondary indexes you created, the optimizer will have no choice but to fall back to the primary index.
4. Create [replication zones](configure-replication-zones.html) for each index.

With the above pieces in place, the optimizer will automatically choose the index nearest the gateway node that is planning the query.

{{site.data.alerts.callout_info}}
The optimizer does not actually understand geographic locations, i.e., the relative closeness of the gateway node to other nodes that are located to its "east" or "west". It is matching against the [node locality constraints](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) you provided when you configured your replication zones.
{{site.data.alerts.end}}

### Examples

#### Zone constraints

We can demonstrate the necessary configuration steps using a local cluster. The instructions below assume that you are already familiar with:

- How to [start a local cluster](start-a-local-cluster.html).
- The syntax for [assigning node locality when configuring replication zones](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes).
- Using [the built-in SQL client](cockroach-sql.html).

First, start 3 local nodes as shown below. Use the [`--locality`](cockroach-start.html#locality) flag to put them each in a different region as denoted by `region=usa`, `region=eu`, etc.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=usa  --insecure --store=/tmp/node0 --listen-addr=localhost:26257 \
  --http-port=8888  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=eu   --insecure --store=/tmp/node1 --listen-addr=localhost:26258 \
  --http-port=8889  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=apac --insecure --store=/tmp/node2 --listen-addr=localhost:26259 \
  --http-port=8890  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure --host=localhost --port=26257
~~~

Next, from the SQL client, add your organization name and enterprise license:

{% include copy-clipboard.html %}
~~~ sh
$ cockroach sql --insecure --host=localhost --port=26257
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING cluster.organization = 'FooCorp - Local Testing';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING enterprise.license = 'xxxxx';
~~~

Create a test database and table. The table will have 3 indexes into the same data. Later, we'll configure the cluster to associate each of these indexes with a different datacenter using replication zones.

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS test;
~~~

{% include copy-clipboard.html %}
~~~ sql
> USE test;
~~~

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE postal_codes (
    id INT PRIMARY KEY,
    code STRING,
    INDEX idx_eu (id) STORING (code),
    INDEX idx_apac (id) STORING (code)
);
~~~

Next, we modify the replication zone configuration via SQL so that:

- Nodes in the USA will use the primary key index.
- Nodes in the EU will use the `postal_codes@idx_eu` index (which is identical to the primary key index).
- Nodes in APAC will use the `postal_codes@idx_apac` index (which is also identical to the primary key index).

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE postal_codes CONFIGURE ZONE USING constraints='["+region=usa"]';
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER INDEX postal_codes@idx_eu CONFIGURE ZONE USING constraints='["+region=eu"]';
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER INDEX postal_codes@idx_apac CONFIGURE ZONE USING constraints='["+region=apac"]';
~~~

To verify this feature is working as expected, we'll query the database from each of our local nodes as shown below. Each node has been configured to be in a different region, and it should now be using the index pinned to that region.

{{site.data.alerts.callout_info}}
In a geo-distributed scenario with a cluster that spans multiple datacenters, it may take time for the optimizer to fetch schemas from other nodes the first time a query is planned; thereafter, the schema should be cached locally.

For example, if you have 11 nodes, you may see 11 queries with high latency due to schema cache misses.  Once all nodes have cached the schema locally, the latencies will drop.

This behavior may also cause the [Statements page of the Web UI](ui-statements-page.html) to show misleadingly high latencies until schemas are cached locally.
{{site.data.alerts.end}}

As expected, the node in the USA region uses the primary key index.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost --port=26257 --database=test -e 'EXPLAIN SELECT * FROM postal_codes WHERE id=1;'
~~~

~~~
  tree |        field        |     description
-------+---------------------+-----------------------
       | distribution        | local
       | vectorized          | false
  scan |                     |
       | estimated row count | 1
       | table               | postal_codes@primary
       | spans               | [/1 - /1]
(6 rows)
~~~

As expected, the node in the EU uses the `idx_eu` index.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost --port=26258 --database=test -e 'EXPLAIN SELECT * FROM postal_codes WHERE id=1;'
~~~

~~~
  tree |        field        |     description
-------+---------------------+----------------------
       | distribution        | local
       | vectorized          | false
  scan |                     |
       | estimated row count | 1
       | table               | postal_codes@idx_eu
       | spans               | [/1 - /1]
(6 rows)
~~~

As expected, the node in APAC uses the `idx_apac` index.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost --port=26259 --database=test -e 'EXPLAIN SELECT * FROM postal_codes WHERE id=1;'
~~~

~~~
  tree |        field        |      description
-------+---------------------+------------------------
       | distribution        | local
       | vectorized          | false
  scan |                     |
       | estimated row count | 1
       | table               | postal_codes@idx_apac
       | spans               | [/1 - /1]
(6 rows)
~~~

You'll need to make changes to the above configuration to reflect your [production environment](recommended-production-settings.html), but the concepts will be the same.

#### Leaseholder preferences

If you provide [leaseholder preferences](configure-replication-zones.html#lease_preferences) in addition to replication zone constraints, the optimizer will attempt to take your leaseholder preferences into account as well when selecting an index for your query. There are several factors to keep in mind:

- Zone constraints are always respected (hard constraint), whereas lease preferences are taken into account as "additional information" -- as long as they do not contradict the zone constraints.

- The optimizer does not consider the real-time location of leaseholders when selecting an index; it is pattern matching on the text values passed in the configuration (e.g., the [`ALTER INDEX`](alter-index.html) statements shown below). For the same reason, the optimizer only matches against the first locality in your `lease_preferences` array.

- The optimizer may use an index that satisfies your leaseholder preferences even though that index has moved to a different node/region due to [leaseholder rebalancing](architecture/replication-layer.html#leaseholder-rebalancing). This can cause slower performance than you expected. Therefore, you should only use this feature if you’re confident you know where the leaseholders will end up based on your cluster's usage patterns. We recommend thoroughly testing your configuration to ensure the optimizer is selecting the index(es) you expect.

In this example, we'll set up an authentication service using the access token / refresh token pattern from [OAuth 2](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2). To support fast local reads in our geo-distributed use case, we will have 3 indexes into the same authentication data: one for each region of our cluster. We configure each index using zone configurations and lease preferences so that the optimizer will use the local index for better performance.

The instructions below assume that you are already familiar with:

- How to [start a local cluster](start-a-local-cluster.html).
- The syntax for [assigning node locality when configuring replication zones](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes).
- Using [the built-in SQL client](cockroach-sql.html).

First, start 3 local nodes as shown below. Use the [`--locality`](cockroach-start.html#locality) flag to put them each in a different region.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=us-east  --insecure --store=/tmp/node0 --listen-addr=localhost:26257 \
  --http-port=8888  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=us-central   --insecure --store=/tmp/node1 --listen-addr=localhost:26258 \
  --http-port=8889  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=us-west --insecure --store=/tmp/node2 --listen-addr=localhost:26259 \
  --http-port=8890  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure --host=localhost --port=26257
~~~

From the SQL client, add your organization name and enterprise license:

{% include copy-clipboard.html %}
~~~ sh
$ cockroach sql --insecure --host=localhost --port=26257
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING cluster.organization = 'FooCorp - Local Testing';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING enterprise.license = 'xxxxx';
~~~

Create an authentication database and table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE if NOT EXISTS auth;
~~~

{% include copy-clipboard.html %}
~~~ sql
> USE auth;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE token (
	token_id VARCHAR(100) NULL,
	access_token VARCHAR(4000) NULL,
	refresh_token VARCHAR(4000) NULL
  );
~~~

Create the indexes for each region:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX token_id_west_idx ON token (token_id) STORING (access_token, refresh_token);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX token_id_central_idx ON token (token_id) STORING (access_token, refresh_token);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX token_id_east_idx ON token (token_id) STORING (access_token, refresh_token);
~~~

Enter zone configurations to distribute replicas across the cluster as follows:

- For the "East" index, store 2 replicas in the East, 2 in Central, and 1 in the West. Further, prefer that the leaseholders for that index live in the East or, failing that, in the Central region.
- Follow the same replica and leaseholder patterns for each of the Central and West regions.

The idea is that, for example, `token_id_east_idx` will have sufficient replicas (2/5) so that even if one replica goes down, the leaseholder will stay in the East region. That way, if a query comes in that accesses the columns covered by that index from the East gateway node, the optimizer will select `token_id_east_idx` for fast reads.

{{site.data.alerts.callout_info}}
The `ALTER TABLE` statement below is not required since it's later made redundant by the `token_id_west_idx` index. In production, you might go with the `ALTER TABLE` to put your table's lease preferences in the West, and then create only 2 indexes (for East and Central); however, the use of 3 indexes makes the example easier to understand.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE token CONFIGURE ZONE USING
        num_replicas = 5, constraints = '{+region=us-east: 1, +region=us-central: 2, +region=us-west: 2}', lease_preferences = '[[+region=us-west], [+region=us-central]]';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX token_id_east_idx CONFIGURE ZONE USING num_replicas = 5,
        constraints = '{+region=us-east: 2, +region=us-central: 2, +region=us-west: 1}', lease_preferences = '[[+region=us-east], [+region=us-central]]';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX token_id_central_idx CONFIGURE ZONE USING num_replicas = 5,
        constraints = '{+region=us-east: 2, +region=us-central: 2, +region=us-west: 1}', lease_preferences = '[[+region=us-central], [+region=us-east]]';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX token_id_west_idx CONFIGURE ZONE USING num_replicas = 5,
        constraints = '{+region=us-west: 2, +region=us-central: 2, +region=us-east: 1}', lease_preferences = '[[+region=us-west], [+region=us-central]]';
~~~

Next let's [check our zone configurations](show-zone-configurations.html) to make sure they match our expectation:

{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATIONS;
~~~

The output should include the following:

~~~
                       target                      |                                    raw_config_sql
---------------------------------------------------+---------------------------------------------------------------------------------------
  RANGE default                                    | ALTER RANGE default CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 90000,
                                                   |     num_replicas = 3,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  DATABASE system                                  | ALTER DATABASE system CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 90000,
                                                   |     num_replicas = 5,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  RANGE meta                                       | ALTER RANGE meta CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 3600,
                                                   |     num_replicas = 5,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  RANGE system                                     | ALTER RANGE system CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 90000,
                                                   |     num_replicas = 5,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  RANGE liveness                                   | ALTER RANGE liveness CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 600,
                                                   |     num_replicas = 5,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  TABLE system.public.replication_constraint_stats | ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE USING
                                                   |     gc.ttlseconds = 600,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  TABLE system.public.replication_stats            | ALTER TABLE system.public.replication_stats CONFIGURE ZONE USING
                                                   |     gc.ttlseconds = 600,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  TABLE auth.public.token                          | ALTER TABLE auth.public.token CONFIGURE ZONE USING
                                                   |     num_replicas = 5,
                                                   |     constraints = '{+region=us-central: 2, +region=us-east: 1, +region=us-west: 2}',
                                                   |     lease_preferences = '[[+region=us-west], [+region=us-central]]'
  INDEX auth.public.token@token_id_east_idx        | ALTER INDEX auth.public.token@token_id_east_idx CONFIGURE ZONE USING
                                                   |     num_replicas = 5,
                                                   |     constraints = '{+region=us-central: 2, +region=us-east: 2, +region=us-west: 1}',
                                                   |     lease_preferences = '[[+region=us-east], [+region=us-central]]'
  INDEX auth.public.token@token_id_central_idx     | ALTER INDEX auth.public.token@token_id_central_idx CONFIGURE ZONE USING
                                                   |     num_replicas = 5,
                                                   |     constraints = '{+region=us-central: 2, +region=us-east: 2, +region=us-west: 1}',
                                                   |     lease_preferences = '[[+region=us-central], [+region=us-east]]'
  INDEX auth.public.token@token_id_west_idx        | ALTER INDEX auth.public.token@token_id_west_idx CONFIGURE ZONE USING
                                                   |     num_replicas = 5,
                                                   |     constraints = '{+region=us-central: 2, +region=us-east: 1, +region=us-west: 2}',
                                                   |     lease_preferences = '[[+region=us-west], [+region=us-central]]'
(11 rows)
~~~

Now that we've set up our indexes the way we want them, we need to insert some data. The first statement below inserts 10,000 rows of placeholder data; the second inserts a row with a specific UUID string that we'll later query against to check which index is used.

{{site.data.alerts.callout_info}}
On a freshly created cluster like this one, you may need to wait a moment after adding the data to give [automatic statistics](#table-statistics) time to update. Then, the optimizer can generate a query plan that uses the expected index.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> INSERT
  INTO
      token (token_id, access_token, refresh_token)
  SELECT
      gen_random_uuid()::STRING,
      gen_random_uuid()::STRING,
      gen_random_uuid()::STRING
  FROM
      generate_series(1, 10000);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT
  INTO
      token (token_id, access_token, refresh_token)
  VALUES
      (
          '2E1B5BFE-6152-11E9-B9FD-A7E0F13211D9',
          '49E36152-6152-11E9-8CDC-3682F23211D9',
          '4E0E91B6-6152-11E9-BAC1-3782F23211D9'
      );
~~~

Finally, we [`EXPLAIN`](explain.html) a [selection query](selection-queries.html) from each node to verify which index is being queried against. For example, when running the query shown below against the `us-west` node, we expect it to use the `token_id_west_idx` index.

{% include copy-clipboard.html %}
~~~ sh
$ cockroach sql --insecure --host=localhost --port=26259 --database=auth # "West" node
~~~

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN
      SELECT
          access_token, refresh_token
      FROM
          token
      WHERE
          token_id = '2E1B5BFE-6152-11E9-B9FD-A7E0F13211D9';
~~~

~~~
  tree |        field        |                                     description
-------+---------------------+--------------------------------------------------------------------------------------
       | distribution        | local
       | vectorized          | false
  scan |                     |
       | estimated row count | 1
       | table               | token@token_id_east_idx
       | spans               | [/'2E1B5BFE-6152-11E9-B9FD-A7E0F13211D9' - /'2E1B5BFE-6152-11E9-B9FD-A7E0F13211D9']
(6 rows)
~~~

Similarly, queries from the `us-east` node should use the `token_id_east_idx` index (and the same should be true for `us-central`).

{% include copy-clipboard.html %}
~~~ sh
$ cockroach sql --insecure --host=localhost --port=26257 --database=auth # "East" node
~~~

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN
      SELECT
          access_token, refresh_token
      FROM
          token
      WHERE
          token_id = '2E1B5BFE-6152-11E9-B9FD-A7E0F13211D9';
~~~

~~~
  tree |        field        |                                     description
-------+---------------------+--------------------------------------------------------------------------------------
       | distribution        | local
       | vectorized          | false
  scan |                     |
       | estimated row count | 1
       | table               | token@token_id_east_idx
       | spans               | [/'2E1B5BFE-6152-11E9-B9FD-A7E0F13211D9' - /'2E1B5BFE-6152-11E9-B9FD-A7E0F13211D9']
(6 rows)
~~~

You'll need to make changes to the above configuration to reflect your [production environment](recommended-production-settings.html), but the concepts will be the same.

## See also

- [`SET (session variable)`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`RESET CLUSTER SETTING`](reset-cluster-setting.html)
- [`SHOW (session variable)`](show-vars.html)
- [`CREATE STATISTICS`](create-statistics.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`EXPLAIN`](explain.html)
