---
title: Distribution Layer
summary: 
toc: false
---

The Distribution Layer of CockroachDB's architecture provides a unified view of your cluster's data.

{{site.data.alerts.callout_info}}If you haven't already, we recommend reading the <a href="overview.html">Architecture Overivew</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Overview

CockroachDB distributes data across your entire cluster to maximize survivability but still needs to provide trivial access to all keys. To achieve reliable addressing across a distributed deployment, CockroachDB organizes your cluster's data in a monolithic sorted map of key-value pairs. This keyspace describes all of your data and is broken into small range sizes and then replicated among the nodes in your cluster, with accounting done to track the physical locations (i.e., nodes) of all of a range's replicas.

By sorting this map (as opposed to hashing it), CockroachDB enables efficient scans; when data is ordered, it's both faster and simpler to scan over its subsets.

### Monolithic Sorted Map Structure

The monolithic sorted map is comprised of two fundamental elements:

- System data, which include **meta ranges** that describe the locations of data in your cluster (among many other cluster-wide and local data elements)
- User data, which store your cluster's **table data**

#### Meta Ranges

The locations of all ranges in your cluster are stored in a two-level index at the beginning of your keyspace, known as *meta ranges*, which are split into two levels:

- The first level (`meta1`) is a single range that has a keyspace representing all data in the cluster. Its individual keys represent larger ranges of your cluster's keys, and their values are the addresses of the replicas of the second-level meta ranges responsible for those keys.
- The second level (`meta2`) represents the keyspace more granularly, and contains the addresses of the replicas responsible for smaller ranges of keys. However, because this set of data is likely much larger than a single range, it is distributed among many ranges (and therefore many nodes), which is why its addresses must be tracked by `meta1`.

Meta ranges are treated mostly like normal ranges and are accessed and replicated just like other elements of your cluster's KV data, with the exception of never splitting the `meta1` range.

For this two-level indexing to work, though, every node keeps information on where to locate the `meta1` range.

Nodes also cache values of the `meta1` and `meta2` ranges they have accessed before, which optimizes access of that data in the future. Whenever a node discovers that a cached value has become invalid, the cache is updated by performing a regular read.

This structure lets CockroachDB address up to 4EB of user data by default: we can address 2^(18 + 18) = 2^36 ranges; each range addresses 2^26 B, and altogether we address 2^(36+26) B = 2^62 B = 4EB. However, with larger range sizes, it's possible to expand this capacity even further.

#### Table Data

Following the cluster's meta ranges is your table data, stored as KV pairs.

- **Keys** are the table's indexed columns. This includes your table's `PRIMARY KEY` or explicitly indexed columns, such as those identified through `CREATE INDEX`.
- **Values** are the non-indexed/stored columns. For the table's data, this includes all of the non-`PRIMARY KEY` columns. In explicitly created indexes, this includes columns identified in the [`STORING`](../create-index.html#store-columns) clause.

### Using the Monolithic Sorted Map

Any operation for a key must be routed to its range's "[Leaseholder](replication-layer.html#leases)." This is a node elected to handle reads and writes for the range, but there is nothing intrinsically special about it, and any node can serve as the leaseholder.

Whenever a node receives a request for a key for which it is not the Leaseholder, it routes the request to the Leaseholder using the monolithic sorted map.

1. The node that received the request (known as the Gateway), looks in its Leaseholder cache, which stores the address of the replica last identified as the Leaseholder for the key.

    If the node doesn't have a value in its Leaseholder cache, it looks in its `meta2` cache for the address of the replicas where it can find the key.

    If the `meta2` cache lookup also misses, it looks up the address of the `meta2` range in its `meta1` cache. If *that* lookup misses, it reads from the actual `meta1` range and then populates its `meta1` and `meta2` caches.

2. The node sends the request to the node identified in its Leaseholder cache, or a node from its `meta2` cache.

    If the node that receives the request *is not* the Leaseholder, but does contain the range, it responds with the address of the Leaseholder. The requesting node then updates it Leaseholder cache with this value, and sends the request to that node.

    If the node doesn't contain the range at all, it errors, and the requesting node performs a read from `meta2` and updates it cache, and then begins this step again.

Once the Leaseholder processes the request, it responds to the Gateway node.

### Interactions with Other Layers

In relationship to other layers in CockroachDB, the Distribution Layer:

- Receives requests from the Transaction Layer on the same node.
- Identifies which nodes should receive the request, and then sends the request to the proper node's Replication Layer.

## Technical Details & Components

### gRPC

Nodes communicate with one another using gRPC, which lets them both send and receive protocol buffers ([protobuf](https://en.wikipedia.org/wiki/Protocol_Buffers)). To leverage gRPC, CockroachDB implements a protocol-buffer-based API defined in `api.proto`.

For more information about gRPC, see the [official gRPC documentation](http://www.grpc.io/docs/guides/).

### BatchRequest

To send KV operations between nodes, [`client.Txn`](transaction-layer.html#client-txn-and-txncoordsender) bundles them into a protobuf known as a `BatchRequest`. Each `BatchRequest` also includes its destination, as well as a pointer to the request's Transaction Record. (On the other side, when a node is replying to a `BatchRequest`, it uses a protobuf––`BatchResponse`.)

Because this is inter-node communication, `BatchRequest`s and `BatchResponse`s leverage gRPC.

### DistSender

The Gateway Node's `DistSender` receives `BatchRequest`s from its own `TxnCoordSender`. `DistSender` then finds the replicas responsible for keys in the `BatchRequest` it received, and breaks it up into new `BatchRequest`s with updated destinations.

`DistSender` first tries to send the `BatchRequest` to the node it believes is currently responsible for the range (known as the [Leaseholder](replication-layer.html#leases)). However, if the Leaseholder doesn't respond, `DistSender` sends a `BatchRequest` to each replica containing the key it's aware of in [the order it's listed](#meta-range-kv-structure).

If a non-Leaserholder node receives a request, the request fails with an error pointing at the replica's last known Leaseholder. This retry happens transparently within CockroachDB and never reaches the client.

As nodes begin replying to these commands, `DistSender` also aggregates the results in preparation for returning them to the client.

### System Data

To maintain system-wide information, CockroachDB leverages a number of system tables, which are all stored as key-value pairs.

#### Meta Range KV Structure

Like all other data in your cluster, meta ranges are structured as KV pairs. Both meta ranges have a similar structure:

~~~
metaX/successorKey -> LeaseholderAddress, [list of other nodes containing data]
~~~

Element | Description
--------|------------------------
`metaX` | The level of meta range. Here we use a simplified `meta1` or `meta2`, but these are actually represented in `cockroach` as `\x02` and `\x03` respectively.
`successorKey` | The first key *greater* than the key you're scanning for. This makes CockroachDB's scans efficient; it simply scans the keys until it finds a value greater than the key it's looking for, and that is where it finds the relevant data.<br/><br/>The `successorKey` for the end of a keyspace is identified as `maxKey`.
`LeaseholderAddress` | The replica primarily responsible for reads and writes, known as the Leaseholder. The Replication Layer contains more information about [Leases](replication-layer.html#leases).

Here's an example:

~~~
meta2/M -> node1:26257, node2:26257, node3:26257
~~~

In this case, the replica on `node1` is the Leaseholder for the keys before `M`, and nodes 2 and 3 also contain replicas.

**Example**

Let's imagine we have an alphabetically sorted column, which we use for lookups. Here are what the meta ranges would approximately look like: 

1. `meta1` contains the address for the nodes containing the `meta2` replicas.

    ~~~
    # Points to meta2 range for keys [A-M)
    meta1/M -> node1:26257, node2:26257, node3:26257

    # Points to meta2 range for keys [M-Z]
    meta1/maxKey -> node4:26257, node5:26257, node6:26257
    ~~~

2. `meta2` contains addresses for the nodes containing the replicas of each range in the cluster.

    ~~~
    # Contains [A-G)
    meta2/G -> node1:26257, node2:26257, node3:26257

    # Contains [G-M)
    meta2/M -> node1:26257, node2:26257, node3:26257

    #Contains [M-Z)
    meta2/Z -> node4:26257, node5:26257, node6:26257

    #Contains [Z-maxKey)
    meta2/maxKey->  node4:26257, node5:26257, node6:26257
    ~~~


#### Node Liveness

CockroachDB tracks each node's availability within a "node liveness" table, which nodes must regularly write to or are considered inactive.

Note that nodes are always considered inactive when they cannot update their node liveness record. This means that even if a node is able to communicate with some other nodes, but not with the Leaseholder for the range containing its node liveness record, it will eventually be marked as inactive even if the `cockroach` process is still running.

### User Data

The data you store in CockroachDB is represented using the following structure:

~~~
/<table Id>/<index id>/<indexed column values> -> <non-indexed/STORING column values>
~~~

The table itself is stored with an `index_id` of 1 for its `PRIMARY KEY` columns, with the rest of the columns in the table considered as stored/covered columns.

### Range Descriptors

Each range in CockroachDB contains metadata, known as a Range Descriptor. A Range Descriptor is comprised of the following:

- A sequential RangeID
- The keyspace (i.e., the set of keys) the range contains; for example, the first and last `<indexed column values>` in the Table Data KV Structure above. This determines the `meta2` range's keys.
- The addresses of nodes containing replicas of the range. This determines the `meta2` range's keys' values.

Range Descriptors are updated whenever there are:

- Membership changes to a range's Raft group (discussed in more detail in the [Replication Layer](replication-layer.html#membership-changes-rebalance-repair))
- Leaseholder changes
- Range splits

After occurring locally on the node containing the range, changes propagate to the `meta2` range.

### Range Splits

By default, CockroachDB attempts to keep ranges/replicas at 64MiB. Once a range reaches that limit we split it into two 32 MiB ranges (composed of contiguous key spaces).

During this range split, the node creates a new Raft group containing all of the same members as the range that was split. The fact that there are now two ranges also means that there is a transaction that updates `meta2` with the new keyspace boundaries, as well as the addresses of the nodes using the Range Descriptor.

## Technical Interactions with Other Layers

### Distribution & Transaction Layer

The Distribution Layer's `DistSender` receives `BatchRequests` from its own node's `TxnCoordSender`, housed in the Transaction Layer.

### Distribution & Replication Layer

The Distribution Layer routes `BatchRequests` to nodes containing ranges of data, which is ultimately routed to the Raft group leader or Leaseholder, which are handled in the Replication Layer.

## What's Next?

Learn how CockroachDB copies data and ensures consistency in the [Replication Layer](replication-layer.html).
