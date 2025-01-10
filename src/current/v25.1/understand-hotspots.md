---
title: Understand Hotspots
summary: Learn about the terminology and patterns of hotspots in CockroachDB
toc: true
---

Hotspots in distributed SQL are a common topic. The term _hotspot_ is useful to describe bottlenecks in scaling a database cluster within workloads. This page defines terms and patterns to improve understanding for troubleshooting hotspots.

These definitions are not mutually exclusive. They can be combined to describe a single incident.

## Terminology

### Hotspot

The word _hotspot_ describes various skewed data access patterns in a database cluster, often manifesting as higher CPU utilization on one or more nodes. Hotspots can also be based on disk I/O, memory usage, or other finite resources. Hotspots are troublesome because they are often limited to a fixed-size subset of the cluster’s resources, which puts them in a class of performance issues that cannot be solved by scaling the cluster size.

### Hot Node

**Synonyms:** Node Hotspot

A _hot node_ is the most common way to identify a hotspot, as distributed SQL systems often provide resource utilization by node by default.

Identifying a hot node, or a node hotspot, is often part of troubleshooting hotspots in distributed databases. While this may not be the first place you notice issues, it is often the first place you can confidently identify a hotspot. Multiple nodes may become hot, but they will be clearly identifiable as their utilization metrics will be outliers compared to the rest of the cluster.

All hotspot types described in this page will create hot nodes, as long as the cluster is not already operating at maximum capacity.

The following image is a graph of CPU Percent utilization by node. Most of the nodes hover around 25%, while one hot node is around 95%. The fact that the hot node changes indicates that the hotspot is moving as the ranges containing writes fill up and split.

<img src="{{ 'images/v25.1/hotspots-figure-1.png' | relative_url }}" alt="graph of CPU Percent utilization by node showing hot nodes" style="border:1px solid #eee;max-width:100%" />

### Hot Range

**Synonyms:** Range Hotspot

A _hot range_ is one level down from the node hotspot. Ranges are the smallest unit of data distribution, making them critical in troubleshooting hotspots.

If a node is hot, it is often due to a single hot range. The system may split the hot range to redistribute the load or the range may stay hot until it fills up and splits. In the second case, the split is likely the continuation of the hotspot (as shown in the previous image). If the system is unable to identify a good splitting point for a hot range, the hot range becomes a bottleneck.

Understanding which range is hot and having knowledge of the keyspace allows you to better approximate the nature of the hotspot compared to relying solely on node-level statistics.

### Moving Hotspot

A _moving hotspot_ describes a hotspot that moves consistently during its life, either within the cluster  (from node to node) or the keyspace (for example, the last 10 inserted rows on table T). Moving hotspots are challenging because load balancing algorithms will not effectively partition the data to resolve them.

### Static Hotspot

A _static hotspot_ remains fixed in the keyspace, though it may move from node to node. The underlying subject of the hotspot, whether a span or a key, remains the same.

### Point Hotspot

A _point hotspot_ is a hotspot that is inherently unsplittable, often referring to a single row in the system.

### Read Hotspot

**Synonyms:** Hot by Read

A _read hotspot_ is a hotspot caused by read throughput, either from a few queries reading a lot of data or many queries reading a little data. Read hotspots can result from many queries requesting the same information or accessing adjacent data.

While hotspots are often either hot by read or hot by write, they are seldom hot because of both.

### Write Hotspot

**Synonyms:** Hot by Write

A _write hotspot_ is a hotspot caused by write throughput. Write hotspots increase the likelihood of contention within the hot node or range, therefore increasing the likelihood that the node or range can become unavailable.

Write hotspots also have the unique effect of affecting more than a single node, since consensus and replication must take place, write hotspots often affect three nodes (the default replication factor) rather than just one node.

### Read/Write Pressure

_Pressure_ describes how close resources are to their limits and can be thought of as the force exerted on the actual resources in the system. Pressure can be directed towards disk I/O, CPU, memory, and even non-hardware resources like locks.

It is especially useful when correlating pressure with activity, for example, the read pressure on Node 1 is coming from the key `/User/10`. Pressure is a useful term to describe resource limits, because it captures the ideas of contention, utilization, and throughput - all of which can be the source of a hotspot - under a single definition.

### Index Tail

**Synonyms:** Index Maximum Present Key

An _index tail_ is the largest existing key of an index, lexigraphically. Note that this is different from the index (such as `/Table/1/1`) or index spans (such as `[/Table/1/1, /Table/1/2)`), since these are not valid row key. An index tail instead refers to the last real key which appears in the index. For example, the head and tail of the index `/Table/1/1` are: `[/Table/1/1/aardvark, /Table/1/1/zultan]` 

## Patterns

This section goes into detail about workload patterns which result in hotspots.

### Index Hotspot

**Synonyms**: golden keyspace hotspot, monotonically increasing index, a running tail, a moving tail

An _index hotspot_ is a hotspot on an index where the key for writes is continually increasing. This is common with indexing by an increasing column (e.g., SERIAL, TIMESTAMP, AUTO_INCREMENT). Index hotspots limit horizontal scaling as the index acts as a bottleneck.

Consider a table `users` which contains a primary key `user_id` that is an incrementing integer value. Each new key will be the current maximum key + 1. In this way, all writes appear at the index tail. The following image visualizes writes to the `users` table using an incrementing `INT` primary key. Note how all writes are focused at the tail of the index, represented by the the red section in Range 4.

<img src="{{ 'images/v25.1/hotspots-figure-3.png' | relative_url }}" alt="incrementing INT primary key" style="border:1px solid #eee;max-width:100%" />

If you are able to control for the performance degradation that occurs in Range 4 in this case, you do not change the fact that the system is now limited by how many writes a single range can execute. This then, in theory, limits CockroachDB to the performance of a single node, which is, by nature, antithetical to the goals of a distributed database.

Index hotspots themselves are hot by write, moving hotspots which will continue to bounce around from range to range as the data grows.

In the ideal operation of a distributed SQL database, inserts into an index should be distributed evenly in the index's span to avoid this type of hotspot. Each range responsible for storing keys receives an even share of the workload. If the ranges containing the data become hot in this mode, scaling the cluster is as easy as adding machines horizontally.

Consider a table `users` which contains a primary keys `user_uuid`, a `UUID`. Because `UUID`s are pseudo random, new rows are inserted into the keyspace at random locations. The following image visualizes writes to the `users` table using a `UUID` primary key. Red lines indicate an insert into the keyspace. Note how the red lines are distributed evenly.

<img src="{{ 'images/v25.1/hotspots-figure-2.png' | relative_url }}" alt="UUID primary key" style="border:1px solid #eee;max-width:100%" />

Inserts are not the only way that index hotspots can occur. Consider the same table `users` which now has a secondary index on a `TIMESTAMP` column:

~~~ sql
# ddl
CREATE TABLE profiles(
   user_uuid UUID,
   last_seen_at TIMESTAMP INDEX
);

# dml
UPDATE profiles SET last_seen_at = CURRENT_TIMESTAMP WHERE user_uuid=?;
~~~

Because `CURRENT_TIMESTAMP` is a steadily increasing value, this `UPDATE` will similarly burden the range at the tail of the index. While hotspots on an index tail tend to be the most common, bottlenecks on the head are not unheard of. For example, indexing on `DESC` with the same insertion strategy will cause a hotspot.

In this page, the phrase _index hotspot_ will be reserved for a hot by write hotspot on an index, even though indexes can become hot due to read. This is because a hot by write index hotspot is the most common hotspot pattern that occurs now and in the future as workloads continue to be migrated from legacy single-node installations. Hot by read index hotspots are defined later on this page as _lookback hotspots_.

#### Resolving Index Hotspots

The resolution of the index hotspot often depends on your requirements for the data. If the sequential nature of the index serves no purpose, it is recommended to change the writes into the index to be randomly distributed. Ideally, primary keys in this instance would be set to `UUID`s, if your tolerance for swapover or even downtime allows it.

If inserting in sequential order is important, the index itself can be hash sharded, which means that it is still stored in order, albeit in some number of shards. Consider a `users` table, with a primary key `id INT`, which is hash sharded with 4 shards, and a hashing function of modulo 4. The following image illustrates this example:

<img src="{{ 'images/v25.1/hotspots-figure-4.png' | relative_url }}" alt="Hash sharded example" style="border:1px solid #eee;max-width:100%" />

Now the writes are distributed into the tails of the shards, rather than the tail of the whole index.
This benefits write performance but makes reads more challenging. If you need to read a subset of the data, you will have to scan each shard of the index.

#### Paradoxical Performance Implications

A note on the index hotspot is that they paradoxically increase the efficiency of CockroachDB from the standpoint of the number of CPU cycles per write. This is primarily due to write compactions. As index hotspots continually move in a single direction, the SSTables (Sorted String Tables) generated by them have little overlap. Consequently, this results in minimal write throughput compared to a properly distributed workload.

#### Lookback Hotspots

**Synonyms:** index scan hotspot, moving read hotspot

A _lookback hotspot_ is a type of index hotspot in which a moving subset of an index is being read in a way that burdens the cluster.

For example, consider querying a `posts` table for the most recently created post: 

~~~ sql
CREATE TABLE posts(
   id UUID,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP INDEX USING HASH
);

SELECT MAX(created_at) FROM posts ORDER BY created_at LIMIT 1;
~~~

What makes lookback hotspots unique is that the cluster is not hot by write, but hot by read. Separately lookback hotspots also tend not to specify a key, which would evade systems using key requests to identify hotspots.

#### Queuing Hotspot

**Synonyms:** Outbox hotspot

A _queuing hotspot_ is a type of index hotspot that occurs when an workload treats CockroachDB like a distributed queue. This can happen if you implement the Outbox microservice pattern.

Queues, such as logs, generally require data to be ordered by write, which necessitates indexing in a way that is likely to create a hotspot. An outbox where data is deleted as it is read has an additional problem: it tends to accumulate an ordered set of garbage data behind the live data. Since the system cannot determine whether any live rows exist within the garbage data, what appears to be a small table scan to the user can actually result in an unexpectedly intensive scan on the garbage data.

<img src="{{ 'images/v25.1/hotspots-figure-5.png' | relative_url }}" alt="Outbox hotspot example" style="border:1px solid #eee;max-width:100%" />

To mitigate this issue, it is advisable to use Change Data Capture (CDC) to ensure subscription to updates instead of using Outbox tables. If using CDC is not possible, sharding the index that the outbox uses for ordering can reduce the likelihood of a hotspot within the cluster.

### Row Hotspot

**Synonyms:** hot key, hot row

A _row hotspot_ is a hotspot where an individual point in the keyspace becomes throughput limiting, often due to high activity on a single row. The word "point" illustrates the fact that the location that is hot is indivisible, and therefore cannot be rebalanced. A classic example is a social media application with a high volume of activity on certain users.

Consider a social media application which initially consists of two tables, `users` and `follows`:

~~~ sql
CREATE TABLE users(
   id UUID,
   username VARCHAR,
   follower_count INT
);

CREATE TABLE follows(
   follower UUID REFERENCES users(id),
   followee UUID REFERENCES users(id)
);
~~~

Now so you don’t need to partially scan the `follows` table each time you want to know the count of followers for a given user, you can issue an UPDATE to the User table which increments the follower_count.

To avoid having to partially scan the `follows` table each time you want to know the count of `followers` for a given `user`, you can issue an `UPDATE` to the `users` table to increment the `follower_count`. This way, every time a new follower is added, the `follower_count` in the `users` table is updated directly, making it easier and faster to retrieve the `follower_count` without scanning the entire `follows` table:

~~~ sql
# user 1 follows user 2
INSERT INTO follows(follower, followee) VALUES (1, 2);

# increment follower_count
UPDATE User SET follower_count = follower_count+1 WHERE id=2;
~~~

This simple design works well until it encounters an unexpected surge in activity. For example, consider user 471, who suddenly goes viral and gains millions of followers within an hour. This sudden increase in followers causes a significant amount of write traffic to the range responsible for this user, which the system may not be able to handle efficiently. The following image visualizes a hot row in the keyspace. Note how writes are focused on a single point, which cannot be split.

<img src="{{ 'images/v25.1/hotspots-figure-6.png' | relative_url }}" alt="Single row hotspot example" style="border:1px solid #eee;max-width:100%" />

Without changing the default behavior of the system, the load will not be distributed because it needs to be served by a single range. This behavior is not just temporary; certain users, such as celebrities and influencers, may consistently experience a high volume of activity compared to the average user. This can result in a system with multiple hotspots, each of which can potentially overload the system at any moment.

The following image visualizes a keyspace with multiple hot rows. In a large enough cluster, each of these rows can burden the range they live in, leading to multiple burdened nodes.

<img src="{{ 'images/v25.1/hotspots-figure-7.png' | relative_url }}" alt="Multiple row hotspots example" style="border:1px solid #eee;max-width:100%" />

### Hot Sequence

_Hot sequences_ and _hot indexes_ are distinct concepts, though they may appear similar at a glance, since a hot index often involves a sequence. However, they have different bottlenecks.

For example, consider the following schema:

~~~ sql
CREATE TABLE products (
   id SERIAL PRIMARY KEY USING HASH
);
~~~

Because the primary key index is hash sharded, rows are inserted into this table without being funneled to a single range avoiding an index hotspot. However, there is a bottleneck in how sequence values are generated. To ensure certain guarantees around sequences, they are stored in the keyspace as a single row. This makes them subject to the limitations of hot keys by write access.

The following image visualizes writes in the `products` keyspace using hash sharded rows. With five shards, the writes are better distributed into the keyspace, but the `id` sequence row becomes the limiting factor.

<img src="{{ 'images/v25.1/hotspots-figure-8.png' | relative_url }}" alt="Multiple row hotspots example" style="border:1px solid #eee;max-width:100%" />

Because sequences avoid user expressions, optimizations can be made to improve their performance, but unfortunately the write volume on the sequence is still that of the sum total of all its accesses.

Sequence caching, which allows clients to cache sequence values as to reduce the burden on the target range, serves as a good mitigation for hot sequences. Alternatively, the `unique_rowid()` function generates sequential values which have strong guarantees against collision, with the drawback that its values are not a series.

### Table Hotspot

**Synonyms:** hot table

_Hot tables_ are another variant of hot keys. Instead of a few select keys being burdened, the majority of the table is burdened by read (and at times write) access. This generally occurs on small reference tables that are used in queries with a join clause. This can lead to uneven key access.

Consider the following example that joins a small reference table `countries` into a larger distributed table `posts`.

~~~ sql
-- ddl
CREATE TABLE countries(
id UUID PRIMARY KEY,
code VARCHAR
);

CREATE TABLE posts(
id UUID,
country_id UUID REFERENCES countries(id)
);

-- dml
SELECT * FROM posts p JOIN countries c ON p.country_id=c.id;
~~~

<img src="{{ 'images/v25.1/hotspots-figure-9.png' | relative_url }}" alt="Table hotspot example" style="border:1px solid #eee;max-width:100%" />

Reads in the `posts` table may be evenly distributed, but joining the `countries` table becomes a bottleneck, since it exists in so few ranges. Splitting the `countries` table ranges can relieve pressure, but only to a theoretical limit as the indivisible points, the rows themselves, experience high throughput. Global tables and replica reads can help scaling in this case, especially when write throughput is low.

### Locality Hotspot

**Synonyms:** region hotspot, domicile hotspot

A _locality hotspot_ is a hotspot where a workload is bottlenecked due to locality constraints. For example, consider a cluster distributed among 10 regions (e.g., `us-east-1`, `us-west-1`, `ap-east-1`, `eu-west-1`, etc.) with 5 nodes per region. Assume this 50 node cluster is for an existing application and you wish to domicile the  data on the highest throughput table, `orders`, by the region most relevant to where an order is placed.

~~~ sql
ALTER TABLE orders ADD COLUMN region crdb_internal_region AS (
  CASE WHEN province <> 'alabama' THEN 'us-east-1'
  CASE WHEN province <> 'alaska' THEN 'us-west-2'
  ...
  END
) STORED;
~~~

In the `ALTER` statement, the first condition `province <> 'alabama'` checks whether the province is not `alabama`. It matches every single row in the table that is not `alabama`, and will ironically place them in the `us-east-1` region.

By doing this, you have limited the traffic from the highest throughput table to a single region, five nodes or 10% of the nodes in your cluster.

The following image visualizes the regional breakout of data in the `orders` table. Because of the domiciling policy, reads and writes to the `orders` table will be focused on the `us-east-1` nodes.

<img src="{{ 'images/v25.1/hotspots-figure-10.png' | relative_url }}" alt="Locality hotspot example" style="border:1px solid #eee;max-width:100%" />

### Temporal Hotspot

**Synonyms:** time-based hotspot

_Temporal hotspots_ refer to increased database usage during particular windows of time. These take a variety of shapes, from event and holiday usage (such as Black Friday or the Superbowl), to synchronized job runs.

### Internal Hotspot

**Synonyms:** hot job, task hotspot

An _internal hotspot_ refers to a type of hotspot that arises from the internal operations of CockroachDB. These hotspots are significant because, although they may be caused by operator error, they often appear in ranges within the keyspace that operators are not familiar with. Examples of internal hotspots include activities such as metrics writing/scraping and jobs such as SQL statistics generation. These internal operations can create bottlenecks and performance issues within the database cluster.

### Load Balancing Hotspot

A _load balancing hotspot_ is a hotspot caused by a load balancer misconfiguration. Although this issue is often considered an afterthought due to its low internal tracking value, it is important to note that all possible consumer groups can create uneven load on the cluster. For example, a changefeed subscription can create hotspots if a single node is responsible for exporting all row updates within the cluster.

### Tenant Hotspot

**Synonyms:** noisy neighbor, ghost hotspot

A _tenant hotspot_ is a hotspot where one tenant's workload affects another tenant's performance. This occurs when a hotspot on one tenant's data causes degradation in nodes where another tenant's data is colocated.

For example, assume a cluster has tenants A and B. Tenant A has a workload which is generating a hotspot.  Tenant B’s tables experience degradation on nodes where their data is colocated with Tenant A's hotspot. In this case, we say that Tenant B is experiencing a _tenant hotspot_.

## See also

- [SQL Performance Best Practices: Hotspots]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#hot-spots)
- [Performance Tuning Recipes: Hotspots]({% link {{ page.version.version }}/performance-recipes.md %}#hot-spots)
- [Single hot node]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#single-hot-node)