---
title: Distribution Layer
summary: 
toc: false
---

Present a unified view of many replicated KV ranges.

<div id="toc"></div>

## Overview

CockroachDB is a distributed, fault-tolerant database, which means that you must have data spread among many nodes in the same cluster; all of which is replicated at least 3 times. However, all of the data still needs to be easily accessible. To achieve this Cockroach uses a monolithic sorted map, which is an order-preserving distribution.

CockroachDB implements an order-preserving distribution because:
  - We can do efficient scans. With a consistent hashing scheme, if you want to get all of the data between key A and key Z, you have to query all the shards and aggregate the data, depending on how you do it. This is simplification. 
  - The reality is that when you do a SQL query, a select of some sort, it can be very complex.broken down into scans. A lot of those scans are fairly small, and you certainly don't want to ask all the nodes for the information. You want to be able to go directly to the ones that have the data you're looking for.

To represent this order-preserving distribution, CockroachDB implements (what we refer to as) a monolithic sorted map. This is essentially a sorted key-value range that describes all of the data in your cluster.

### Monolithic Sorted Map Structure

The monolithic sorted map is comprised of two fundamental elements:

- System keys, which include meta ranges that describe the locations of data in your cluster (among many other cluster-wide and local data elements)
- Table data keys, which store your cluster's data

#### Meta Ranges

To address data, the location of all ranges in your cluster are stored in a two-level index at the beginning of your key-space, known as *Meta Ranges*. Importantly, these are treated mostly like normal ranges and are read and replicated just like other elements of your cluster's KV data. 

1. `meta1` contains address for block of ranges in `meta2`. These blocks cover the entire keyspace of your cluster. For example:

    ~~~
    meta1\xff -> dcrama1:8000, dcrama2:8000, dcrama3:8000
    ~~~

    Importantly, the `meta1` range is never split. Its Range Descriptor (detailed below) is also shared with all nodes in the cluster to ensure nodes can always address data in the rest of the cluster.

2. `meta2` contains address for individual ranges in cluster. Importantly this address is actually the address of the node known to be the leaseholder (which is the node responsible for reads and writes for ranges of data and is discussed in greater detail in the Replication Layer), followed by the other nodes to which the data is replicated.

    For example:
	meta2<lastkey0> -> dcrama1:8000, dcrama2:8000, dcrama3:8000

	Whenever a node access a key on another node, it caches the value in its `meta2` range. If the `meta2` cache misses, the value is evicted and the new set of addresses for the key it's accessing is updated by performing a regular read from the `meta2` range.

#### Your Cluster's Data

After the node's meta-ranges come the key-value pairs it stored, which are structured like this:

~~~
/database/table/<primary key column values> -> non-primary key column values
...the rest of the table's data...
/database/table/<secondary index column values> -> STORING/COVERING column values
~~~

This key-value data is broken up into 64MiB sections of contiguous key-space known as ranges. However, not all ranges on a node are contiguous with one another. This represents a sweet spot for us between a size that's small enough to move quickly between nodes, but large enough to store meaningfully contiguous set of data whose keys are more likely to be accessed together.

### Using the Monolithic Sorted Map

When a node receives a request, its looks at the Meta Ranges to find out which node it needs to route the request to by comparing the keys in the request to the keys in its `meta2` range.

The node then sends those KV operations to the node identified in the `meta2` range. However, it's possible that the data moved, in which case the node that no longer has the information replies to the requesting node where it's now located.

## Components

### gRPC

Above when we're discussing a node forwarding a request to another node, that leverages gRPC to communicate between nodes.

gRPC requires inputs and outputs to be formatted as protocol buffers (or protobuffs). To leverage gRPC to communicate between nodes, CockroachDB implements a protocol-buffer-based API is defined in `api.proto`.

You can find much more information about gRPC at http://www.grpc.io/docs/guides/

### BatchRequest

All KV operation requests are bundled into a protocol buffer known as BatchRequest––the destination of this batch is identified in the `BatchRequest` header, as well as a pointer to the request's transaction record. (On the other side, when a node is replying to a BatchRequest, it uses a protobuff––`BatchResponse`.)

This BatchRequest is also what's used to send requests between nodes using gRPC, which accepts and sends protocol buffers.

### DistSender

The gateway/coordinating node's `DistSender` receives `BatchRequest`s from its own `TxnCoordSender`. `DistSender` is then responsible for breaking up `BatchRequests` and routing a new set of `BatchRequests` to the nodes it identifies contain the data using its `meta2` ranges.  It will use the cache to send the request to the lease holder, but it's also prepared to try the other replicas, in order of "proximity". The replica that the cache says is the leaseholder is simply moved to the front of the list of replicas to be tried and then an RPC is sent to all of them, in order.

Requests received by a non-lease holder (for the HLC timestamp specified in the request's header) fail with an error pointing at the replica's last known lease holder. These requests are retried transparently with the updated lease by the gateway node and never reach the client.

As nodes begin replying to these commands, `DistSender` also aggregates the results in preparation for returning them to the client.

### Range Descriptors

All ranges in CockroachDB contain metadata, which is known as a "range descriptor":

- A sequential RangeID
- The keyspace the range contains
- The addresses of nodes containing replicas of the range, with its leaseholder (which is responsible for its reads and writes) in the first position

Whenever there are membership changes to a range's Raft group (discussed in more detail in the Replication Layer) or its leaseholder, the range updates its `meta2` values so it can be located by any node in the system.

### Range Splits

By default, CockroachDB attempts to keep ranges/replicas at 64MiB; this is a sweet spot between a large enough size to contain a meaningful amount of data, while being small enough to allow rapid replication between nodes.

Once a range reaches that limit we split it into two 32 MiB ranges (composed of contiguous key spaces). Once this happens, the node creates a new Raft group containing all of the same members as the range that was split. The fact that there are now two ranges also means that there is a transaction that updates `meta2` with the new keyspace boundaries, as well as the addresses of the nodes from the Range Descriptor.

## Interactions with Other Layers

The Distribution Layer's `DistSender` receives `BatchRequests` from its own node's `TxnCoordSender`.

The Distribution Layer routes `BatchRequests` to nodes containing ranges of data.
