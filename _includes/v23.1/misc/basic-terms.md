## CockroachDB architecture terms

### Cluster
A group of interconnected CockroachDB nodes that function as a distributed SQL database. Nodes collaboratively organize transactions, and rebalance workload and data storage to optimize performance and fault-tolerance.

Each cluster has its own authorization hierarchy, meaning that users and roles must be defined on that specific cluster.

A CockroachDB cluster can live in CockroachDB Cloud, within a customer [Organization](glossary.html#organization), or can be self-hosted.

### Node
An individual instance of CockroachDB. One or more nodes form a cluster.

### Range 
<a name="architecture-range"></a>
CockroachDB stores all user data (tables, indexes, etc.) and almost all system data in a sorted map of key-value pairs. This keyspace is divided into contiguous chunks called _ranges_, such that every key is found in one range.<br/><br/>From a SQL perspective, a table and its secondary indexes initially map to a single range, where each key-value pair in the range represents a single row in the table (also called the _primary index_ because the table is sorted by the primary key) or a single row in a secondary index. As soon as the size of a range reaches 512 MiB ([the default](../configure-replication-zones.html#range-max-bytes)), it is split into two ranges. This process continues for these new ranges as the table and its indexes continue growing.

### Replica
<a name="architecture-replica"></a>
A copy of a range stored on a node. By default, there are three [replicas](../configure-replication-zones.html#num_replicas) of each range on different nodes.

### Leaseholder
<a name="architecture-leaseholder"></a>
The replica that holds the "range lease." This replica receives and coordinates all read and write requests for the range.<br/><br/>For most types of tables and queries, the leaseholder is the only replica that can serve consistent reads (reads that return "the latest" data).

### Raft protocol
<a name="architecture-raft"></a>
The [consensus protocol](replication-layer.html#raft) employed in CockroachDB that ensures that your data is safely stored on multiple nodes and that those nodes agree on the current state even if some of them are temporarily disconnected.

### Raft leader
For each range, the replica that is the "leader" for write requests. The leader uses the Raft protocol to ensure that a majority of replicas (the leader and enough followers) agree, based on their Raft logs, before committing the write. The Raft leader is almost always the same replica as the leaseholder.

### Raft log
A time-ordered log of writes to a range that its replicas have agreed on. This log exists on-disk with each replica and is the range's source of truth for consistent replication.
