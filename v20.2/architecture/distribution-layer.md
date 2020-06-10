---
title: Distribution Layer
summary: The distribution layer of CockroachDB's architecture provides a unified view of your cluster's data.
toc: true
---

The distribution layer of CockroachDB's architecture provides a unified view of your cluster's data.

{{site.data.alerts.callout_info}}
If you haven't already, we recommend reading the [Architecture Overview](overview.html).
{{site.data.alerts.end}}

## Overview

To make all data in your cluster accessible from any node, CockroachDB stores data in a monolithic sorted map of key-value pairs. This key-space describes all of the data in your cluster, as well as its location, and is divided into what we call "ranges", contiguous chunks of the key-space, so that every key can always be found in a single range.

CockroachDB implements a sorted map to enable:

  - **Simple lookups**: Because we identify which nodes are responsible for certain portions of the data, queries are able to quickly locate where to find the data they want.
  - **Efficient scans**: By defining the order of data, it's easy to find data within a particular range during a scan.

### Monolithic sorted map structure

The monolithic sorted map is comprised of two fundamental elements:

- System data, which include **meta ranges** that describe the locations of data in your cluster (among many other cluster-wide and local data elements)
- User data, which store your cluster's **table data**

#### Meta ranges

The locations of all ranges in your cluster are stored in a two-level index at the beginning of your key-space, known as meta ranges, where the first level (`meta1`) addresses the second, and the second (`meta2`) addresses data in the cluster. Importantly, every node has information on where to locate the `meta1` range (known as its range descriptor, detailed below), and the range is never split.

This meta range structure lets us address up to 4EiB of user data by default: we can address 2^(18 + 18) = 2^36 ranges; each range addresses 2^26 B, and altogether we address 2^(36+26) B = 2^62 B = 4EiB. However, with larger range sizes, it's possible to expand this capacity even further.

Meta ranges are treated mostly like normal ranges and are accessed and replicated just like other elements of your cluster's KV data.

Each node caches values of the `meta2` range it has accessed before, which optimizes access of that data in the future. Whenever a node discovers that its `meta2` cache is invalid for a specific key, the cache is updated by performing a regular read on the `meta2` range.

#### Table data

After the node's meta ranges is the KV data your cluster stores.

Each table and its secondary indexes initially map to a single range, where each key-value pair in the range represents a single row in the table (also called the primary index because the table is sorted by the primary key) or a single row in a secondary index. As soon as a range reaches 512 MiB in size, it splits into two ranges. This process continues as a table and its indexes continue growing. Once a table is split across multiple ranges, it's likely that the table and secondary indexes will be stored in separate ranges. However, a range can still contain data for both the table and a secondary index. 

The default 512 MiB range size represents a sweet spot for us between a size that's small enough to move quickly between nodes, but large enough to store a meaningfully contiguous set of data whose keys are more likely to be accessed together. These ranges are then shuffled around your cluster to ensure survivability.

These table ranges are replicated (in the aptly named replication layer), and have the addresses of each replica stored in the `meta2` range.

### Using the monolithic sorted map

When a node receives a request, it looks at the meta ranges to find out which node it needs to route the request to by comparing the keys in the request to the keys in its `meta2` range.

These meta ranges are heavily cached, so this is normally handled without having to send an RPC to the node actually containing the `meta2` ranges.

The node then sends those KV operations to the leaseholder identified in the `meta2` range. However, it's possible that the data moved, in which case the node that no longer has the information replies to the requesting node where it's now located. In this case we go back to the `meta2` range to get more up-to-date information and try again.

### Interactions with other layers

In relationship to other layers in CockroachDB, the distribution layer:

- Receives requests from the transaction layer on the same node.
- Identifies which nodes should receive the request, and then sends the request to the proper node's replication layer.

## Technical details and components

### gRPC

gRPC is the software nodes use to communicate with one another. Because the distribution layer is the first layer to communicate with other nodes, CockroachDB implements gRPC here.

gRPC requires inputs and outputs to be formatted as protocol buffers (protobufs). To leverage gRPC, CockroachDB implements a protocol-buffer-based API defined in `api.proto`.

For more information about gRPC, see the [official gRPC documentation](http://www.grpc.io/docs/guides/).

### BatchRequest

All KV operation requests are bundled into a [protobuf](https://en.wikipedia.org/wiki/Protocol_Buffers), known as a `BatchRequest`. The destination of this batch is identified in the `BatchRequest` header, as well as a pointer to the request's transaction record. (On the other side, when a node is replying to a `BatchRequest`, it uses a protobuf––`BatchResponse`.)

This `BatchRequest` is also what's used to send requests between nodes using gRPC, which accepts and sends protocol buffers.

### DistSender

The gateway/coordinating node's `DistSender` receives `BatchRequest`s from its own `TxnCoordSender`. `DistSender` is then responsible for breaking up `BatchRequests` and routing a new set of `BatchRequests` to the nodes it identifies contain the data using its `meta2` ranges. It will use the cache to send the request to the leaseholder, but it's also prepared to try the other replicas, in order of "proximity." The replica that the cache says is the leaseholder is simply moved to the front of the list of replicas to be tried and then an RPC is sent to all of them, in order.

Requests received by a non-leaseholder fail with an error pointing at the replica's last known leaseholder. These requests are retried transparently with the updated lease by the gateway node and never reach the client.

As nodes begin replying to these commands, `DistSender` also aggregates the results in preparation for returning them to the client.

### Meta range KV structure

Like all other data in your cluster, meta ranges are structured as KV pairs. Both meta ranges have a similar structure:

~~~
metaX/successorKey -> LeaseholderAddress, [list of other nodes containing data]
~~~

Element | Description
--------|------------------------
`metaX` | The level of meta range. Here we use a simplified `meta1` or `meta2`, but these are actually represented in `cockroach` as `\x02` and `\x03` respectively.
`successorKey` | The first key *greater* than the key you're scanning for. This makes CockroachDB's scans efficient; it simply scans the keys until it finds a value greater than the key it's looking for, and that is where it finds the relevant data.<br/><br/>The `successorKey` for the end of a keyspace is identified as `maxKey`.
`LeaseholderAddress` | The replica primarily responsible for reads and writes, known as the leaseholder. The replication layer contains more information about [leases](replication-layer.html#leases).

Here's an example:

~~~
meta2/M -> node1:26257, node2:26257, node3:26257
~~~

In this case, the replica on `node1` is the leaseholder, and nodes 2 and 3 also contain replicas.

#### Example

Let's imagine we have an alphabetically sorted column, which we use for lookups. Here are what the meta ranges would approximately look like:

1. `meta1` contains the address for the nodes containing the `meta2` replicas.

    ~~~
    # Points to meta2 range for keys [A-M)
    meta1/M -> node1:26257, node2:26257, node3:26257

    # Points to meta2 range for keys [M-Z]
    meta1/maxKey -> node4:26257, node5:26257, node6:26257
    ~~~

2. `meta2` contains addresses for the nodes containing the replicas of each range in the cluster, the first of which is the [leaseholder](replication-layer.html#leases).

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

### Table data KV structure

Key-value data, which represents the data in your tables using the following structure:

~~~
/<table Id>/<index id>/<indexed column values> -> <non-indexed/STORING column values>
~~~

The table itself is stored with an `index_id` of 1 for its `PRIMARY KEY` columns, with the rest of the columns in the table considered as stored/covered columns.

### Range descriptors

Each range in CockroachDB contains metadata, known as a range descriptor. A range descriptor is comprised of the following:

- A sequential RangeID
- The keyspace (i.e., the set of keys) the range contains; for example, the first and last `<indexed column values>` in the table data KV structure above. This determines the `meta2` range's keys.
- The addresses of nodes containing replicas of the range, with its leaseholder (which is responsible for its reads and writes) in the first position. This determines the `meta2` range's key's values.

Because range descriptors comprise the key-value data of the `meta2` range, each node's `meta2` cache also stores range descriptors.

Range descriptors are updated whenever there are:

- Membership changes to a range's Raft group (discussed in more detail in the [Replication Layer](replication-layer.html#membership-changes-rebalance-repair))
- Leaseholder changes
- Range splits

All of these updates to the range descriptor occur locally on the range, and then propagate to the `meta2` range.

### Range splits

By default, CockroachDB attempts to keep ranges/replicas at 512 MiB. Once a range reaches that limit we split it into two smaller ranges (composed of contiguous key spaces).

During this range split, the node creates a new Raft group containing all of the same members as the range that was split. The fact that there are now two ranges also means that there is a transaction that updates `meta2` with the new keyspace boundaries, as well as the addresses of the nodes using the range descriptor.

## Technical interactions with other layers

### Distribution and transaction layer

The Distribution layer's `DistSender` receives `BatchRequests` from its own node's `TxnCoordSender`, housed in the Transaction layer.

### Distribution and replication layer

The Distribution layer routes `BatchRequests` to nodes containing ranges of data, which is ultimately routed to the Raft group leader or leaseholder, which are handled in the replication layer.

## What's next?

Learn how CockroachDB copies data and ensures consistency in the [replication layer](replication-layer.html).
