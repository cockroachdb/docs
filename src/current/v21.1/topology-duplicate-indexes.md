---
title: Duplicate Indexes Topology
summary: Guidance on using the duplicate indexes topology in a multi-region deployment.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
This pattern and the use of replication zones are fully supported. However, for most users, they are harder to use and in some cases can result in worse performance than the [multi-region SQL abstractions](multiregion-overview.html). Cockroach Labs recommends that you migrate to [global tables](global-tables.html) whenever possible.
{{site.data.alerts.end}}

In a multi-region deployment, the duplicate indexes pattern is a good choice for tables with the following requirements:

- Read latency must be low, but write latency can be much higher.
- Reads must be up-to-date for business reasons or because the table is referenced by [foreign keys](foreign-key.html).
- Rows in the table, and all latency-sensitive queries, **cannot** be tied to specific geographies.
- Table data must remain available during a region failure.

In general, this pattern is suited well for immutable/reference tables that are rarely or never updated.

{% include_cached youtube.html video_id="xde_Oz-dJxM" %}

{{site.data.alerts.callout_success}}
**See It In Action** - Read about how a [financial software company](https://www.cockroachlabs.com/guides/banking-guide-to-the-cloud/) is using the Duplicate Indexes topology for low latency reads in their identity access management layer.
{{site.data.alerts.end}}

## Prerequisites

### Fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

### Cluster setup

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-setup.md %}

## Configuration

{{site.data.alerts.callout_info}}
Pinning secondary indexes requires an [Enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

### Summary

Using this pattern, you tell CockroachDB to put the leaseholder for the table itself (also called the primary index) in one region, create 2 secondary indexes on the table, and tell CockroachDB to put the leaseholder for each secondary index in one of the other regions. This means that reads will access the local leaseholder (either for the table itself or for one of the secondary indexes). Writes, however, will still leave the region to get consensus for the table and its secondary indexes.

<img src="{{ 'images/v21.1/topology-patterns/topology_duplicate_indexes1.png' | relative_url }}" alt="Duplicate Indexes topology" style="max-width:100%" />

### Steps

Assuming you have a [cluster deployed across three regions](#cluster-setup) and a table like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE postal_codes (
    id INT PRIMARY KEY,
    code STRING
);
~~~

1. If you do not already have one, [request a trial Enterprise license](licensing-faqs.html#obtain-a-license).

2. [Create a replication zone](configure-zone.html) for the table and set a leaseholder preference telling CockroachDB to put the leaseholder for the table in one of the regions, for example `us-west`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE postal_codes
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-west":1}',
          lease_preferences = '[[+region=us-west]]';
    ~~~

3. [Create secondary indexes](create-index.html) on the table for each of your other regions, including all of the columns you wish to read either in the key or in the key and a [`STORING`](create-index.html#store-columns) clause:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE INDEX idx_central ON postal_codes (id)
        STORING (code);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE INDEX idx_east ON postal_codes (id)
        STORING (code);
    ~~~

4. [Create a replication zone](configure-zone.html) for each secondary index, in each case setting a leaseholder preference telling CockroachDB to put the leaseholder for the index in a distinct region:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX postal_codes@idx_central
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-central":1}',
          lease_preferences = '[[+region=us-central]]';
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX postal_codes@idx_east
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-east":1}',
          lease_preferences = '[[+region=us-east]]';
    ~~~

5. To confirm that replication zones are in effect, you can use the [`SHOW CREATE TABLE`](show-create.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW CREATE TABLE postal_codes;
    ~~~

    ~~~
       table_name  |                              create_statement
    +--------------+----------------------------------------------------------------------------+
      postal_codes | CREATE TABLE postal_codes (
                   |     id INT8 NOT NULL,
                   |     code STRING NULL,
                   |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
                   |     INDEX idx_central (id ASC) STORING (code),
                   |     INDEX idx_east (id ASC) STORING (code),
                   |     FAMILY "primary" (id, code)
                   | );
                   | ALTER TABLE defaultdb.public.postal_codes CONFIGURE ZONE USING
                   |     num_replicas = 3,
                   |     constraints = '{+region=us-west: 1}',
                   |     lease_preferences = '[[+region=us-west]]';
                   | ALTER INDEX defaultdb.public.postal_codes@idx_central CONFIGURE ZONE USING
                   |     num_replicas = 3,
                   |     constraints = '{+region=us-central: 1}',
                   |     lease_preferences = '[[+region=us-central]]';
                   | ALTER INDEX defaultdb.public.postal_codes@idx_east CONFIGURE ZONE USING
                   |     num_replicas = 3,
                   |     constraints = '{+region=us-east: 1}',
                   |     lease_preferences = '[[+region=us-east]]'
    (1 row)
    ~~~

## Characteristics

### Latency

#### Reads

Reads access the local leaseholder and, therefore, never leave the region. This makes read latency very low.

For example, in the animation below:

1. The read request in `us-central` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the relevant leaseholder. In `us-west`, the leaseholder is for the table itself. In the other regions, the leaseholder is for the relevant index, which the [cost-based optimizer](cost-based-optimizer.html) uses due to the leaseholder preferences.
4. The leaseholder retrieves the results and returns to the gateway node.
5. The gateway node returns the results to the client.

<img src="{{ 'images/v21.1/topology-patterns/topology_duplicate_indexes_reads.png' | relative_url }}" alt="Pinned secondary indexes topology" style="max-width:100%" />

#### Writes

The replicas for the table and its secondary indexes are spread across all 3 regions, so writes involve multiple network hops across regions to achieve consensus. This increases write latency significantly. It's also important to understand that the replication of extra indexes can reduce throughput and increase storage cost.

For example, in the animation below:

1. The write request in `us-central` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the leaseholder replicas for the table and its secondary indexes.
4. While each leaseholder appends the write to its Raft log, it notifies its follower replicas.
5. In each case, as soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leaseholder and the write is committed on the agreeing replicas.
6. The leaseholders then return acknowledgement of the commit to the gateway node.
7. The gateway node returns the acknowledgement to the client.

<img src="{{ 'images/v21.1/topology-patterns/topology_duplicate_indexes_writes.gif' | relative_url }}" alt="Duplicate Indexes topology" style="max-width:100%" />

### Resiliency

Because this pattern balances the replicas for the table and its secondary indexes across regions, one entire region can fail without interrupting access to the table:

<img src="{{ 'images/v21.1/topology-patterns/topology_duplicate_indexes_resiliency.png' | relative_url }}" alt="Pinned Secondary Indexes topology" style="max-width:100%" />

<!-- However, if an additional machine holding a replica for the table or any of its secondary indexes fails at the same time as the region failure, the range to which the replica belongs becomes unavailable for reads and writes:

<img src="{{ 'images/v21.1/topology-patterns/topology_pinned_index_leaseholders3.png' | relative_url }}" alt="Pinned Secondary Indexes topology" style="max-width:100%" /> -->

## Preferring the nearest index

Given multiple identical [indexes](indexes.html) that have different locality constraints using [replication zones](configure-replication-zones.html), the optimizer will prefer the index that is closest to the gateway node that is planning the query. In a properly configured geo-distributed cluster, this can lead to performance improvements due to improved data locality and reduced network traffic.

This feature enables scenarios such as:

- Reference data such as a table of postal codes that can be replicated to different regions, and queries will use the copy in the same region. See [Example - zone constraints](#zone-constraints) for more details.
- Optimizing for local reads (potentially at the expense of writes) by adding leaseholder preferences to your zone configuration. See [Example - leaseholder preferences](#leaseholder-preferences) for more details.

## Prerequisites

1. Acquire an [Enterprise license](enterprise-licensing.html).
2. Determine which data consists of reference tables that are rarely updated (such as postal codes) and can therefore be easily replicated to different regions.
3. Create multiple [secondary indexes](indexes.html) on the reference tables. **These indexes must include (in key or using [`STORED`](create-index.html#store-columns)) every column that you wish to query**. For example, if you run `SELECT * from db.table` and not every column of `db.table` is in the set of secondary indexes you created, the optimizer will have no choice but to fall back to the primary index.
4. Create [replication zones](configure-replication-zones.html) for each index.

With the above pieces in place, the optimizer will automatically choose the index nearest the gateway node that is planning the query.

{{site.data.alerts.callout_info}}
The optimizer does not actually understand geographic locations, i.e., the relative closeness of the gateway node to other nodes that are located to its "east" or "west". It is matching against the [node locality constraints](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) you provided when you configured your replication zones.
{{site.data.alerts.end}}

## Examples

#### Zone constraints

We can demonstrate the necessary configuration steps using a local cluster. The instructions below assume that you are already familiar with:

- How to [start a local cluster](start-a-local-cluster.html).
- The syntax for [assigning node locality when configuring replication zones](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes).
- Using [the built-in SQL client](cockroach-sql.html).

First, start 3 local nodes as shown below. Use the [`--locality`](cockroach-start.html#locality) flag to put them each in a different region as denoted by `region=usa`, `region=eu`, etc.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=usa  --insecure --store=/tmp/node0 --listen-addr=localhost:26257 \
  --http-port=8888  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=eu   --insecure --store=/tmp/node1 --listen-addr=localhost:26258 \
  --http-port=8889  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=apac --insecure --store=/tmp/node2 --listen-addr=localhost:26259 \
  --http-port=8890  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure --host=localhost --port=26257
~~~

Next, from the SQL client, add your organization name and Enterprise license:

{% include_cached copy-clipboard.html %}
~~~ sh
$ cockroach sql --insecure --host=localhost --port=26257
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING cluster.organization = 'FooCorp - Local Testing';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING enterprise.license = 'xxxxx';
~~~

Create a test database and table. The table will have 3 indexes into the same data. Later, we'll configure the cluster to associate each of these indexes with a different datacenter using replication zones.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS test;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> USE test;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE postal_codes CONFIGURE ZONE USING constraints='["+region=usa"]';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX postal_codes@idx_eu CONFIGURE ZONE USING constraints='["+region=eu"]';
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=us-east  --insecure --store=/tmp/node0 --listen-addr=localhost:26257 \
  --http-port=8888  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=us-central   --insecure --store=/tmp/node1 --listen-addr=localhost:26258 \
  --http-port=8889  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --locality=region=us-west --insecure --store=/tmp/node2 --listen-addr=localhost:26259 \
  --http-port=8890  --join=localhost:26257,localhost:26258,localhost:26259 --background
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure --host=localhost --port=26257
~~~

From the SQL client, add your organization name and Enterprise license:

{% include_cached copy-clipboard.html %}
~~~ sh
$ cockroach sql --insecure --host=localhost --port=26257
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING cluster.organization = 'FooCorp - Local Testing';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING enterprise.license = 'xxxxx';
~~~

Create an authentication database and table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE if NOT EXISTS auth;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> USE auth;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE token (
	token_id VARCHAR(100) NULL,
	access_token VARCHAR(4000) NULL,
	refresh_token VARCHAR(4000) NULL
  );
~~~

Create the indexes for each region:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX token_id_west_idx ON token (token_id) STORING (access_token, refresh_token);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX token_id_central_idx ON token (token_id) STORING (access_token, refresh_token);
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE token CONFIGURE ZONE USING
        num_replicas = 5, constraints = '{+region=us-east: 1, +region=us-central: 2, +region=us-west: 2}', lease_preferences = '[[+region=us-west], [+region=us-central]]';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER INDEX token_id_east_idx CONFIGURE ZONE USING num_replicas = 5,
        constraints = '{+region=us-east: 2, +region=us-central: 2, +region=us-west: 1}', lease_preferences = '[[+region=us-east], [+region=us-central]]';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER INDEX token_id_central_idx CONFIGURE ZONE USING num_replicas = 5,
        constraints = '{+region=us-east: 2, +region=us-central: 2, +region=us-west: 1}', lease_preferences = '[[+region=us-central], [+region=us-east]]';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER INDEX token_id_west_idx CONFIGURE ZONE USING num_replicas = 5,
        constraints = '{+region=us-west: 2, +region=us-central: 2, +region=us-east: 1}', lease_preferences = '[[+region=us-west], [+region=us-central]]';
~~~

Next let's [check our zone configurations](show-zone-configurations.html) to make sure they match our expectation:

{% include_cached copy-clipboard.html %}
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
On a freshly created cluster like this one, you may need to wait a moment after adding the data to give [automatic statistics](cost-based-optimizer.html#table-statistics) time to update. Then, the optimizer can generate a query plan that uses the expected index.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sh
$ cockroach sql --insecure --host=localhost --port=26259 --database=auth # "West" node
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sh
$ cockroach sql --insecure --host=localhost --port=26257 --database=auth # "East" node
~~~

{% include_cached copy-clipboard.html %}
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

## Alternatives

- If reads from a table can be historical (4.8 seconds or more in the past), consider the [Follower Reads](topology-follower-reads.html) pattern.
- If rows in the table, and all latency-sensitive queries, can be tied to specific geographies, consider the [Geo-Partitioned Leaseholders](topology-geo-partitioned-leaseholders.html) pattern. Both patterns avoid extra secondary indexes, which increase data replication and, therefore, higher throughput and less storage.

## Tutorial

For a step-by-step demonstration of how this pattern gets you low-latency reads in a broadly distributed cluster, see the [Low Latency Multi-Region Deployment](demo-low-latency-multi-region-deployment.html) tutorial.

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
