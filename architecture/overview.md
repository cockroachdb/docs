---
title: Architecture: Overview
summary: 
toc: false
---

## Goals

CockroachDB was designed in service of the following goals:

- Make life easier for humans. This means being low-touch and highly automated for operators and simple to reason about for developers.
- Provide scale without sacrificing consistency. This means enabling distributed transactions, as well as removing the pain of eventual consistency issues and stale reads.
- Create an always-on database that continues accepting reads and writes without creating any conflicts.
- Allow flexible deployment on any cloud, without tying you to any platform.
- Leverage the power of orchestration tools.

## Glossary

### Terms

It's helpful to understand a few terms when reading our architecture documentation.

Term | Definition
-----|-----------
**Cluster** | Your CockroachDB deployment, which acts as a single logical database
**Node** | An individual server running CockroachDB; you join many nodes together to create a cluster
**Range** | A subset of your cluster's data (rows from a table)
**Replica** | Copies of your ranges, which are stored on at least 3 nodes to ensure survivability

### Concepts

CockroachDB heavily relies on the following concepts, so understanding them will help you understand what our architecture achieves.

Term | Definition
-----|-----------
**Consistency** | CockroachDB uses this term in a few different ways, but most commonly as consistency in terms of the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem). In this context, consistency means that every read receives the most recent write or an error. Most often we refer to consistency as the CAP theorem guarantee we prioritize in face of all others, making us what's known as "CP" database.<br/><br/>However, CockroachDB does also also support [consistency in terms of ACID semantics](https://en.wikipedia.org/wiki/Consistency_(database_systems)). To confuse matters slightly, what we typically refer to as consistency (in the CAP theorem sense), is also tightly coupled to our support of [isolation in terms of ACID semantics](https://en.wikipedia.org/wiki/Isolation_(database_systems)).
**Consensus** | When an action is performed on a range, a majority of nodes containing a replica of it acknowledge the action. When an action *doesn't* achieve consensus, forward progress halts to ensure consistency within the cluster.
**Replication **| Copying ranges from one node to another. Each node containing a replica communicates with all other nodes that contain that data to ensure any changes to it achieve consensus.
**Transactions** | A set of [atomic operations](https://en.wikipedia.org/wiki/Atomicity_(database_systems)), meaning either all of the operations in the transactions successfully complete or all of them are abandoned. This is a crucial component for a consistent system to ensure developers
**Multi-Active Availability** | A consensus-based notion of high availability that lets all nodes in a cluster receive reads and writes, even during a failover, without creating any conflicts.
**Distributed SQL** | Though CockroachDB distributes your data cross nodes in your cluster, your entire cluster still acts as a single logical database. To achieve this, there are a number of performance-enhancing pieces of architecture you'll see mentioned through these docs.

## Overview

Developers interact with CockroachDB through a SQL API, which we've modeled after PostgreSQL. These requests can be sent to any node; all of them behave symmetrically.

All that's required to add a node to the cluster is starting the `cockroach` process with a `join` flag set to the host of any other node in the cluster.

After receiving a SQL RPC, the node converts the statement into operations that work with our distributed key-value store. These operations have access to a cache which details where each piece of data is laid out on your cluster, where they go and perform reads and writes.

Data is distributed algorithmically by CockroachDB, with all data being replicated >3 times to ensure survivability. This way, if nodes go down, you still have back ups of the data which can be used for reads and writes, as well as replicating the data to any new nodes that join.

Because every node is symmetrical, they can each accept requests and return results. Because CockroachDB is distributed, nodes continually communicate with each other whenever they make changes to ranges of data, ensuring industry-leading isolation guarantees, giving you consistent reads from all nodes in your cluster.

However, while that high-level overview gives you a notion of what CockroachDB does, you can also look at how the `cockroach` process operates on each of these nodes to more fully understand our architecture.

### Layers

At the highest level, CockroachDB converts client's SQL statements into key-value (KV) data, which is distributed among nodes and written to disk in RocksDB. Our architecture is the process by which we accomplish that, which is manifested as a number of layers that interact with those directly above and below it as relatively opaque services.

Level | Layer Name | Purpose
------|------------|--------
1 | SQL | Translate client SQL queries to KV operations.
2 | Transactional | Allow atomic changes to multiple KV entries
3 | Distribution | Present replicated KV ranges as a single entity
4 | Replication | Consistently and synchronously replicate KV ranges across many nodes. This layer also enables consistent reads via leases.
5 | Storage | Write and read KV data on disk.
