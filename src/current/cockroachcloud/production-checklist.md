---
title: Production Checklist
summary: Learn how to move from testing to production on your CockroachDB Cloud cluster.
toc: true
cloud: true
docs_area: deploy
---

This page provides important recommendations for CockroachDB {{ site.data.products.cloud }} production deployments.

## Follow the SQL Best Practices

To ensure optimal SQL performance for your CockroachDB {{ site.data.products.cloud }} cluster, follow the best practices described in the [SQL Performance Best Practices](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/performance-best-practices-overview) guide.

## Use a pool of persistent connections

Creating the appropriate size pool of connections is critical to gaining maximum performance in an application. Too few connections in the pool will result in high latency as each operation waits for a connection to open up. But adding too many connections to the pool can also result in high latency as each connection thread is being run in parallel by the system. The time it takes for many threads to complete in parallel is typically higher than the time it takes a smaller number of threads to run sequentially.

For guidance on sizing, validating, and using connection pools with CockroachDB, see [Use Connection Pools](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/connection-pooling).

## Keeping connections current

After an application establishes a connection to CockroachDB {{ site.data.products.cloud }}, those connections can occasionally become invalid. This could be due to changes in the cluster topography, rolling [upgrades]({% link cockroachcloud/upgrade-policy.md %}) and restarts, network disruptions, or cloud infrastructure unavailability.

Make sure connection validation and retry logic is used by your application. Validating and retrying connections is typically handled by the driver, framework, or the connection pool used by an application. For guidance on connection pool sizing, connection validation, and connection retry logic, see [Use Connection Pools](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/connection-pooling).

## Transaction retries

When several transactions try to modify the same underlying data concurrently, they may experience [contention](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/performance-best-practices-overview#transaction-contention) that leads to [transaction retries](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/transactions#transaction-retries). To avoid failures in production, your application should be engineered to handle transaction retries using [client-side retry handling](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/transaction-retry-error-reference#client-side-retry-handling).

## Authorize the right network (Dedicated)

CockroachDB {{ site.data.products.dedicated }} requires you to authorize the networks that can access the cluster to prevent denial-of-service and brute force password attacks. During the application development phase, you might have authorized only your local machine’s network. To move into production, you need to authorize your application server’s network.

To verify that you have authorized the application server's network, navigate to the [**Networking** page]({% link cockroachcloud/connect-to-your-cluster.md %}#authorize-your-network) on the CockroachDB {{ site.data.products.cloud }} Console and check if you see the application server network in the list of authorized networks. If you do not see the application server network in the list, [authorize the network]({% link cockroachcloud/connect-to-your-cluster.md %}#authorize-your-network).

## Configure PCI ready features (Dedicated advanced)

CockroachDB {{ site.data.products.dedicated }} advanced has access to all features required for [PCI readiness]({% link cockroachcloud/pci-dss.md %}). You must configure these settings to make your cluster PCI-ready:

- [CockroachDB {{ site.data.products.cloud }} Organization Audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %})
- [SClusterQL audit log export]({% link cockroachcloud/export-logs.md %})
- [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/managing-cmek.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})
- Single Sign-On (SSO) for your [CockroachDB {{ site.data.products.cloud }} organization]({% link cockroachcloud/configure-cloud-org-sso.md %}) and your [clusters]({% link cockroachcloud/cloud-sso-sql.md %})
- [Network security]({% link cockroachcloud/network-authorization.md %})

You can check the status of these features on the [**PCI ready**](cluster-overview-page.html?filters=dedicated#pci-ready-dedicated-advanced) page of the CockroachDB {{ site.data.products.cloud }} Console.
