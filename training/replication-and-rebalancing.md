---
title: Replication & Rebalancing
summary: Learn how CockroachDB replicated and rebalances your data to survive failures.
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Replication &amp; Rebalancing](https://docs.google.com/presentation/d/1rOSpwKD48T4OsFRFwnrRo-7x6dLK9Gr2pg9oBRTaChg/edit#slide=id.g18624943e3_0_0)

## Lab

In this lab, we'll show you that CockroachDB is a fault-tolerant database by taking down one of the nodes and showing that the cluster keeps operating.

### Before You Start

To complete this lab, we assume you have [a 3-node cluster and a load generator running](3-node-local-insecure-cluster-load-gen.html).

### Step 1. Watch Data Rebalance

Now open the Admin UI at `http://localhost:8080` and hover over the **SQL Queries** graph at the top. After a minute or so, you'll see that the load generator is executing approximately 95% reads and 5% writes across all nodes:

<img src="{{ 'images/admin_ui_sql_queries.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

Scroll down a bit and hover over the **Replicas per Node** graph. Because CockroachDB replicates each piece of data 3 times by default, the replica count on each of your 3 nodes should be identical:

<img src="{{ 'images/admin_ui_replicas_migration.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Step 2. Kill a Node

Back in your terminal, kill one of your `cockroach` processes:

~~~ shell
$ cockroach quit --insecure
~~~

This kills the first node, though it doesn't really matter which node you kill because we're running a load balancer.

### Step 3. Check Your Cluster's Availability

Now pop back to the Admin UI, and you'll see that your cluster continued serving data and that the Summary Panel will show that you have a Suspect node that might be dead. If you wait > 5 minutes, it will become identified as dead.

This shows that CockroachDB tolerated a single failure, which is what we promised (n-1)/2 where n = 3.

### Step 4. Restart Your Downed Node

You can now rejoin your first node to the cluster:

~~~ shell
$ cockroach start --insecure --join=localhost:26258
~~~

### Step 5. Stop the Load Generator

We won't use the load generator again, so you can stop it.

### Up Next

- [Importing Data](importing-data.html)
