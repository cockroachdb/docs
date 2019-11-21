---
title: Production Checklist
summary: Learn how to move from testing to production on your CockroachCloud cluster.
toc: true
build_for: [cockroachcloud]
---

This page provides important recommendations for CockroachCloud production deployments.

## Follow the SQL Best Practices

To ensure optimal SQL performance for your CockroachCloud cluster, follow the best practices described in the [SQL Performance Best Practices](performance-best-practices-overview.html) guide.

## Use a small pool of persistent connections

Multiple active connections to the database enable efficient use of the available database resources. However, creating new authenticated connections to the database is CPU and memory-intensive and also adds to the latency since the application has to wait for database to authenticate the connection.

Connection pooling helps resolve this dilemma by creating a set of authenticated connections that can be reused to connect to the database. To determine the size of the connection pool, our recommendation is to start your testing with a pool size of  `(core_count * 2) + ssd_count)`, where `core_count` is the total number of cores in the cluster, and `ssd_count` is the total number of SSDs in the cluster (for CockroachCloud, consider 1 SSD per node). The optimal pool size will vary based on your workload and application, and may be smaller than that.

In addition to setting a maximum connection pool size, the idle connection pool size must also be set. Our recommendation is to set the idle connection pool size equal to the maximum pool size. While this uses more application server memory, this allows there to be many connections when concurrency is high, without having to dial a new connection for every new operation.

## Authorize the right network

CockroachCloud requires you to authorize the networks that can access the cluster to prevent denial-of-service and brute force password attacks. During the application development phase, you might have authorized only your local machine’s network. To move into production, you need to authorize your application server’s network.

To verify that you have authorized the application server's network, navigate to the [**Networking** page](cockroachcloud-connect-to-your-cluster.html#step-1-authorize-your-network) on the CockroachCloud Console and check if you see the application server network in the list of authorized networks. If you don't see the application server network in the list, [authorize the network](cockroachcloud-connect-to-your-cluster.html#step-1-authorize-your-network).
