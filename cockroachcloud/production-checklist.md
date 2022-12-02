---
title: Production Checklist
summary: Learn how to move from testing to production on your CockroachDB Cloud cluster.
toc: true
cloud: true
docs_area: deploy
---

This page provides important recommendations for {{ site.data.products.db }} production deployments.

## Follow the SQL Best Practices

To ensure optimal SQL performance for your {{ site.data.products.db }} cluster, follow the best practices described in the [SQL Performance Best Practices](../{{site.versions["cloud"]}}/performance-best-practices-overview.html) guide.

## Use a pool of persistent connections

Creating the appropriate size pool of connections is critical to gaining maximum performance in an application. Too few connections in the pool will result in high latency as each operation waits for a connection to open up. But adding too many connections to the pool can also result in high latency as each connection thread is being run in parallel by the system. The time it takes for many threads to complete in parallel is typically higher than the time it takes a smaller number of threads to run sequentially.

For guidance on sizing, validating, and using connection pools with CockroachDB, see [Use Connection Pools](../{{site.versions["cloud"]}}/connection-pooling.html).

## Keeping connections current

After an application establishes a connection to {{ site.data.products.db }}, those connections can occasionally become invalid. This could be due to changes in the cluster topography, rolling [upgrades](upgrade-policy.html) and restarts, network disruptions, or cloud infrastructure unavailability.

Make sure connection validation and retry logic is used by your application. Validating and retrying connections is typically handled by the driver, framework, or the connection pool used by an application. For guidance on connection pool sizing, connection validation, and connection retry logic, see [Use Connection Pools](../{{site.versions["cloud"]}}/connection-pooling.html).

{% include common/transaction-retries.md %}

## Authorize the right network (Dedicated)

{{ site.data.products.dedicated }} requires you to authorize the networks that can access the cluster to prevent denial-of-service and brute force password attacks. During the application development phase, you might have authorized only your local machine’s network. To move into production, you need to authorize your application server’s network.

To verify that you have authorized the application server's network, navigate to the [**Networking** page](connect-to-your-cluster.html#step-1-authorize-your-network) on the {{ site.data.products.db }} Console and check if you see the application server network in the list of authorized networks. If you do not see the application server network in the list, [authorize the network](connect-to-your-cluster.html#step-1-authorize-your-network).
