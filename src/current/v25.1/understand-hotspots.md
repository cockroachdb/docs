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

In the ideal operation of a distributed SQL database, inserts into an index should be distributed evenly in the index's span to avoid this type of hotspot. Each range responsible for storing keys receives an even share of the workload. If the ranges containing the data become hot in this mode, scaling the cluster is as easy as adding machines horizontally.

This first hotspot pattern, the index hotspot, is illustrated in the following examples.

#### Example 1

Consider a table `users` which contains one of the following primary keys:

1. `user_uuid`, a `UUID`
1. `user_id`, an incrementing integer value

In the first case, because `UUID`s are pseudo random, new rows are inserted into the keyspace at random locations. The following image visualizes writes to the `users` table using a `UUID` primary key. Red lines indicate an insert into the keyspace.

<img src="{{ 'images/v25.1/hotspots-figure-2.png' | relative_url }}" alt="UUID primary key" style="border:1px solid #eee;max-width:100%" />

In the second case, each new key will be the current maximum key + 1. In this way, all writes appear at the index tail. The following image visualizes writes to the `users` table using an incrementing `INT` primary key. Note how all writes are focused at the tail of the index, represented by the the red section in Range 4.

<img src="{{ 'images/v25.1/hotspots-figure-3.png' | relative_url }}" alt="incrementing INT primary key" style="border:1px solid #eee;max-width:100%" />

If you are able to control for the performance degradation that occurs in Range 4 in the second case, you do not change the fact that the system is now limited by how many writes a single range can execute. This then, in theory, limits CockroachDB to the performance of a single node, which is, by nature, antithetical to the goals of a distributed database.

Index hotspots themselves are hot by write, moving hotspots which will continue to bounce around from range to range as the data grows.

#### Example 2

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

In this page, the phrase _index hotspot_ will be reserved for a hot by write hotspot on an index, even though indexes can become hot due to read. This is because it is the most common hotspot pattern that occurs now and in the future as workloads continue to be migrated from legacy single-node installations. Hot by read index hotspots are defined below as _lookback hotspots_.

#### Resolving Index Hotspots

The resolution of the index hotspot often depends on the user’s requirements for the data. If the sequential nature of the index serves no purpose, it’s recommended to change the writes into the index to be randomly distributed. Ideally, primary keys in this instance would be set to UUIDs, if the customer’s tolerance for swapover or even downtime allows it.

If inserting in order(ish) is important, the index itself can be hash sharded, which means that it is still stored in order, albeit in some number of shards. Consider a users table, with a primary key ID INTEGER, which is hash sharded with 4 shards, and a hashing function of modulo 4. An illustration of this example is below:



Now the writes are distributed into the tails of the shards, rather than the tail of the whole index. The distribution goes up with the number of shards in your index, which benefits from writes, but becomes more challenging for scans. If you mean to scan a subset of the data, you then need to scan each shard of the index.
Paradoxical Performance Implications
A note on the golden key hotspot is that they paradoxically increase the efficiency of CRDB from a standpoint of # of CPU cycles per write. It is assumed that this is primarily for write compactions, as index hotspots continually march in a single direction, the ss tables generated by them end up having little overlap, and therefore incur little of the write throughput of a properly distributed workload.
Lookback Hotspots, another type of index hotspot
Synonyms: Index scan hotspot, Moving read hotspot

A lookback hotspot is a type of read hotspot in which a moving subset of an index is being read in a way that burdens the cluster.

CREATE TABLE posts(
   id UUID,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP INDEX USING HASH
);


SELECT MAX(created_at) FROM posts ORDER BY created_at LIMIT 1;

Lookback hotspots are a form of index hotspot, but what makes them unique is that the cluster isn’t hot by write behavior, it’s hot by read. Separately lookback hotspots also tend not to specify a key, which would evade systems using key requests to identify hotspots.

Evidence of lookback hotspots has been observed in production, but more effort in reproduction is required to confirm they are a problematic pattern.
Queuing Hotspot
Synonyms: Outbox hotspot, Kafkroach database
A queuing hotspot is also an index hotspot occurs when an application workload treats CRDB like a distributed queue. Queuing hotspots have been seen in production where customers have implemented the Outbox microservice pattern.

Queues, logs like this generally require the data be ordered by write, and therefore indexed in a way which is likely to create a hotspot. An outbox in which data is deleted as its read has a secondary problem in that it’s likely to accumulate an ordered set of garbage data behind the live data. Because the system has no way of knowing whether any live rows live within the garbage data, what seems like a table scan on a small table to the user can actually end up being a surprisingly intensive scan on garbage data.



Where possible, it’s advisable to use CDC to ensure subscription to updates instead of Outbox tables. If that’s impossible, sharding the index that the outbox uses for ordering will reduce the likelihood of a hotspot within one’s cluster.

### Row Hotspot

Synonyms: Hot Key, Hot Row

Row hotspots are a type of hotspot in which individual points in the keyspace become throughput limiting. I use the word point to illustrate the fact that the locations which are hot are indivisible, and therefore cannot be rebalanced. A classic example of this can be described as the following:

Consider any social media application, twitter, threads, instagram, which initially consists of two tables, a users entity and a follows relation (schema below).

CREATE TABLE users(
	id UUID,
       username VARCHAR,
	follower_count INT
);

CREATE TABLE follows(
follower UUID REFERENCES users(id),
	followee UUID REFERENCES users(id)
);

Now so you don’t need to partially scan the Follows table each time you want to know the count of followers for a given user, you can issue an UPDATE to the User table which increments the follower_count.

# user 1 follows user 2
INSERT INTO Follows(follower, followee) VALUES (1, 2);

# increment the follower_count
UPDATE User SET follower_count = follower_count+1 WHERE id=2;

This, like many simple designs, works until it doesn’t. Consider user 471, who, upon a happy accident, goes viral - accumulating millions of followers in the span of an hour. All of a sudden the range which is responsible for this user is receiving write traffic which it is unable to handle.


Figure 4: A visualization of a hot row in the keyspace. Note how writes are focused on a single point, which cannot be split.

Without changing the default behavior of the system, the load will not be distributed, as it needs to be served by a single range. Note that this behavior isn’t strictly transitory too, there may be certain users, celebrities and influencers for example, who continually experience a high volume of activity with respect to the average user. This can lead to a system which has a number of hotspots, waiting at any minute to overload the system.

Figure 5: A visualization of a system with multiple hot rows. In a large enough cluster, each of these rows can burden the range they live in, leading to multiple burdened nodes.

### Hot Sequence

It’s important to note that hot sequences are distinct from hot indexes. At a distance, it’s fairly easy to squint and consider them the same, as a hot index often involves a sequence, but under the hood they have different bottlenecks, and therefore deserve different names. Consider the following schema:

CREATE TABLE products (
id SERIAL PRIMARY KEY USING HASH
);

Because we have hash sharded the primary key index, we can insert rows into this table without worrying about them being funneled to a single range. Where then lies the issue?

The actual bottleneck is in how sequence values are generated. To ensure certain guarantees around sequences, they are stored in the keyspace, as a single row and therefore become subject to the limitations of hot keys by write access.


Figure 6. A visualization of writes in the products keyspace using hash sharded rows. With 5 shards, the writes are better distributed into the keyspace, but the id sequence table / row becomes the limiting factor.

Because sequences avoid user expressions, optimizations can be made to improve their performance, but unfortunately the write volume on the sequence is still that of the sum total of all its accesses.

Something that distinguishes hot sequences not only from hot indexes but also more traditional hot keys is that modifying application behavior will not fix the bottleneck in the system. Sequence caching, which allows clients to cache sequence values as to reduce the burden on the target range, serves as a good fix for hot sequences. Alternatively, the unique_rowid function generates sequential values which have strong guarantees against collision, with the drawback that its values are not a series.

### Table Hotspot

Synonyms: Hot Table

Hot tables are another variant of hot keys, though instead of a few select keys being burdened, the majority of the table is burdened by read (and at times write) access. Generally this occurs on small reference tables which are used in queries with a join clause. Consider the below illustrative example:

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


Figure 7. Joining a small reference table into larger, distributed tables can lead to uneven key access.

Reads here among the posts table may be evenly distributed, but joining the countries table becomes a bottleneck, since it exists in so few ranges. Splitting the table ranges can relieve pressure, but only to a theoretical limit as the indivisible points, the rows themselves, experience high throughput. Global tables and replica reads can help scaling in this case, especially when write throughput is low.

### Locality Hotspot

Synonyms: Region Hotspot, Domicile Hotspot

A locality hotspot is a hotspot in which a workload is bottlenecked due to locality constraints. Consider a cluster distributed among 10 regions (e.g. us-east-1, us-west-1, ap-east-1, eu-west-1, etc) consisting of 5 nodes per region. Let’s say that this 50 node cluster is for an existing application, and that the company wishes to domicile its data on its highest throughput table, orders by the region most relevant to where it is placed.


ALTER TABLE orders ADD COLUMN region crdb_internal_region AS (
  CASE WHEN province <> 'alabama' THEN 'us-east-1'
  CASE WHEN province <> 'alaska' THEN 'us-west-2'
  ...
  END
) STORED;

Looking at the above query, the first condition province <> ‘alabama’, meaning if the province is not in alabama, matches every single row in that table which isn’t Alabama, and will ironically place them in the us-east-1 region.

By doing this you’ve limited the traffic from your highest throughput table to a single region, five nodes or 10% of the nodes in your cluster.



Figure 8. A visualization of the regional breakout of data in the orders table. Because of the domiciling policy, reads and writes to the orders table will be focused on the us-east-1 nodes.

### Temporal Hotspot

Synonyms: Time-based Hotspot

Temporal hotspots refer to increased database usage during particular windows of time. These take a variety of shapes, from event and holiday usage (like Black Friday or the Superbowl), to synchronized job runs, to 

### Internal Hotspot

Synonyms: Hot Job, Task Hotspot

“Internal hotspot” is a phrase used to describe hotspots which result from the operation of internal CRDB operation. They’re an important thing to define as, though they may be caused by operator error they will often show up in ranges in the keyspace that operators are unfamiliar with. Examples of this include metrics writing / scraping and jobs like SQL stats.

### Load Balancing Hotspot

There are instances where misconfiguration of LB have caused hotspots. Though this section is mostly an afterthought, as its low value to keep track of internally, it should be noted that all possible consumer groups can create uneven load on the cluster; changefeed subscription for example has created hotspots as a single node can be responsible for exporting all row updates within the cluster.

### Noisy Neighbor

Synonyms: Tenant Hotspot, Ghost hotspot
“Tenant hotspots” refer to when a hotspot occurs on a node, but for a tenant other than the operator who observes it. Assume tenants A and B in a cluster. A has a workload which is generating a hotspot, and B’s tables experience degradation in nodes where their data is colocated with the hotspot. In this case, we say that Tenant B is experiencing a tenant hotspot.

Possible Example
