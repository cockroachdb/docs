---
title: Distribution Layer
summary: 
toc: false
---

The Distribution Layer of CockroachDB's architecture provides a unified view of your cluster's data.

{{site.data.alerts.callout_info}}If you haven't already, we recommend reading the <a href="overview.html">Architecture Overivew</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Overview

CockroachDB distributes data across your entire cluster to maximize survivability, but still needs provide trivial access to all keys. To achieve reliable addressing across a distributed deployment, CockroachDB organizes your cluster's data in a monolithic sorted map of key-value pairs. This keyspace describes all of your data and is broken into small range sizes and then replicated among the nodes in your cluster, with accounting done to track all of a range's replicas physical locations (i.e., nodes).

By using a sorted (rather than hashed) map, CockroachDB enables:

  - **Efficient scans**: By ordering data, scanning over ranges of data is both simple and fast.
  - **Lookups with less overhead**: Rather than maintaining the location of each individual key, CockroachDB tracks the address of entire ranges, resulting in much simpler operations.

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

Nodes also cache values of the `meta2` ranges it has accessed before, which optimizes access of that data in the future. Whenever a node discovers that its `meta2` cache is invalid for a specific key, the cache is updated by performing a regular read on the `meta2` ranges.

This structure lets CockroachDB address up to 4EB of user data by default: we can address 2^(18 + 18) = 2^36 ranges; each range addresses 2^26 B, and altogether we address 2^(36+26) B = 2^62 B = 4EB. However, with larger range sizes, it's possible to expand this capacity even further.

#### Table Data

Following the cluster's meta ranges is your table data, stored as KV pairs.

- **Keys** are the table's indexed columns (e.g. your table's `PRIMARY KEY`)
- **Values** are the non-indexed/stored columns (e.g. the rest of your table's columns)

### Using the Monolithic Sorted Map

When a node receives a request, it looks at the Meta Ranges to find out which node it needs to route the request to by comparing the keys in the request to the keys in its `meta2` range.

These meta ranges are heavily cached, so this is normally handled without having to send an RPC to the node actually containing the `meta2` ranges.

The node then sends those KV operations to the Leaseholder identified in the `meta2` range. However, it's possible that the data moved, in which case the node that no longer has the information replies to the requesting node where it's now located. In this case we go back to the `meta2` range to get more up-to-date information and try again.

#### Example

For a client to read the key `12345`, it would go through this process:

1. The node responsible for the request (known as the Gateway) uses its local data to find out where `meta1` is located and sends its request to it.
2. `meta1` finds the addresses of the `meta2` replicas for keys in your cluster between––for example––`10000` and `19999`, and returns these addresses.
3. The Gateway sends the request to the first node in the list, which looks up in its `meta2` range the address of the replicas for the keyspace between `12000` and `12999`.
4. Lastly, the Gateway sends the request to the first node in this list, which will process the request because it contains the data you're looking for.

Often times, this process is be optimized if the Gateway had looked up a nearby key before because it would have a cache of the `meta2` address and wouldn't need to get information from `meta1`.

### Interactions with Other Layers

In relationship to other layers in CockroachDB, the Distribution Layer:

- Receives requests from the Transaction Layer on the same node.
- Identifies which nodes should receive the request, and then sends the request to the proper node's Replication Layer.

## Technical Details & Components

### gRPC

Nodes communicate with one another using gRPC, which lets them both send and receive protocol buffers ([protobuf](https://en.wikipedia.org/wiki/Protocol_Buffers)). To leverage gRPC, CockroachDB implements a protocol-buffer-based API defined in `api.proto`.

For more information about gRPC, see the [official gRPC documentation](http://www.grpc.io/docs/guides/).

### BatchRequest

To send KV operations between nodes, the `TxnCoordSender` bundles them into a protobuf known as a `BatchRequest`. Each `BatchRequest` also includes its destination, as well as a pointer to the request's Transaction Record. (On the other side, when a node is replying to a `BatchRequest`, it uses a protobuf––`BatchResponse`.)

Because this is inter-node communication, `BatchRequest`s and `BatchResponse`s leverage gRPC.

### DistSender

The Gateway Node's `DistSender` receives `BatchRequest`s from its own `TxnCoordSender`. `DistSender` then finds the replicas responsible for keys in the `BatchRequest` it received, and breaks it up into new `BatchRequest`s with updated destinations.

`DistSender` first tries to send the `BatchRequest` to the node it believes is currently responsible for the range (known as the [Leaseholder](replication-layer.html#leases)). However, if the Leaseholder doesn't respond, `DistSender` sends a `BatchRequest` to each replica containing the key it's aware of in [the order it's listed](#meta-range-kv-structure).

If a non-Leaserholder node receives a request, the request fails with an error pointing at the replica's last known Leaseholder. (Though this retry hapens transparently within CockroachDB and never reaches the client).

As nodes begin replying to these commands, `DistSender` also aggregates the results in preparation for returning them to the client.

### Meta Range KV Structure

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

#### Example

Let's imagine we have an alphabetically sorted column, which we use for lookups. Here are what the meta ranges would approximately look like: 

1. `meta1` contains the address for the nodes containing the `meta2` replicas.

    ~~~
    # Points to meta2 range for keys [A-M)
    meta1/M -> node1:26257, node2:26257, node3:26257

    # Points to meta2 range for keys [M-Z]
    meta1/maxKey -> node4:26257, node5:26257, node6:26257
    ~~~

2. `meta2` contains addresses for the nodes containing the replicas of each range in the cluster, the first of which is the [Leaseholder](replication-layer.html#leases).

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

### Table Data KV Structure

Key-Value data, which represents the data in your tables using the following structure:

~~~
/<table Id>/<index id>/<indexed column values> -> <non-indexed/STORING column values>
~~~

The table itself is stored with an `index_id` of 1 for its `PRIMARY KEY` columns, with the rest of the columns in the table considered as stored/covered columns.

### Range Descriptors

Each range in CockroachDB contains metadata, known as a Range Descriptor. A Range Descriptor is comprised of the following:

- A sequential RangeID
- The keyspace (i.e., the set of keys) the range contains; for example, the first and last `<indexed column values>` in the Table Data KV Structure above. This determines the `meta2` range's keys.
- The addresses of nodes containing replicas of the range, with its Leaseholder (which is responsible for its reads and writes) in the first position. This determines the `meta2` range's key's values.

Because Range Descriptors comprise the key-value data of the `meta2` range, each node's `meta2` cache also stores Range Descriptors.

Range Descriptors are updated whenever there are:
- Membership changes to a range's Raft group (discussed in more detail in the [Replication Layer](replication-layer.html#membership-changes-rebalance-repair))
- Leaseholder changes
- Range splits

After occurring locally on the node containing the range, they're propogated to the `meta2` range.

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
