---
title: Production Checklist
summary: Learn how to move from testing to production on your CockroachCloud cluster.
toc: true
redirect_from:
- ../v20.2/cockroachcloud-production-checklist.html
---

This page provides important recommendations for CockroachCloud production deployments.

## Follow the SQL Best Practices

To ensure optimal SQL performance for your CockroachCloud cluster, follow the best practices described in the [SQL Performance Best Practices](../{{site.versions["stable"]}}/performance-best-practices-overview.html) guide.

## Use a pool of persistent connections

Creating the appropriate size pool of connections is critical to gaining maximum performance in an application. Too few connections in the pool will result in high latency as each operation waits for a connection to open up. But adding too many connections to the pool can also result in high latency as each connection thread is being run in parallel by the system. The time it takes for many threads to complete in parallel is typically higher than the time it takes a smaller number of threads to run sequentially.

For guidance on sizing, validating, and using connection pools with CockroachDB, see [Use Connection Pools](../{{site.versions["stable"]}}/connection-pooling.html).

## Authorize the right network

CockroachCloud requires you to authorize the networks that can access the cluster to prevent denial-of-service and brute force password attacks. During the application development phase, you might have authorized only your local machine’s network. To move into production, you need to authorize your application server’s network.

To verify that you have authorized the application server's network, navigate to the [**Networking** page](connect-to-your-cluster.html#step-1-authorize-your-network) on the CockroachCloud Console and check if you see the application server network in the list of authorized networks. If you don't see the application server network in the list, [authorize the network](connect-to-your-cluster.html#step-1-authorize-your-network).
