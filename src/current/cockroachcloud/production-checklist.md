---
title: Production Checklist
summary: Learn how to move from testing to production on your CockroachDB Cloud cluster.
toc: true
cloud: true
docs_area: deploy
---

Before deploying CockroachDB {{ site.data.products.cloud }} in production, it is important to understand the Shared Responsibility Model that delineates the responsibilities of Cockroach Labs and the customer in managing CockroachDB {{ site.data.products.cloud }} clusters.

Under the Shared Responsibility Model, Cockroach Labs is responsible for the following tasks:

- Cluster and cloud service availability and reliability.
- Maintenance and security of hardware and operating systems.
- Database and security patches.
- Automated cluster backups.

The customer is responsible for the following tasks:

- Estimating workload and sizing the cluster.
- Scaling clusters based on workload.
- Ensuring sufficient disk, compute, and memory capacity for each cluster.
- Monitoring cluster health and application performance.
- Ensuring that the workload is distributed appropriately across the nodes of the cluster.
- Performance tuning of SQL queries and schema.
- Initiating major version upgrades and selecting maintenance windows for patch releases.
- (Optional) Taking customer-owned backups.

This page provides important recommendations for CockroachDB {{ site.data.products.cloud }} production tasks for which the customer is responsible.

## Deployment options

When planning your deployment, it is important to carefully review and choose the [deployment options](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/choose-a-deployment-option) that best meet your scale, cost, security, and resiliency requirements.

Make sure your cluster has sufficient storage, CPU, and memory to handle the workload. The general formula to calculate the storage requirement is as follows:

`raw data (storage, in GB) * replication factor (3 by default) * remove 40% to account for compression (0.6) * headroom (1.5-2)`

For an example, refer to [Plan your Dedicated cluster]({% link cockroachcloud/plan-your-cluster.md %}).

## Topology patterns

When planning your deployment, it is important to carefully review and choose the [topology patterns](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/topology-patterns) that best meet your latency and resiliency requirements. This is especially crucial for multi-region deployments.

## Cluster management

You can create and manage CockroachDB {{ site.data.products.cloud }} clusters using the [Cloud Console](http://cockroachlabs.cloud), [Cloud API]({% link cockroachcloud/cloud-api.md %}), [ccloud CLI]({% link cockroachcloud/ccloud-get-started.md %}), or the [Terraform provider]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}).

## Network authorization

CockroachDB {{ site.data.products.cloud }} requires you to authorize the networks that can access the cluster in order to prevent denial-of-service and brute force password attacks. During the application development phase, you might have authorized only your local machine’s network. To move into production, you need to authorize your the networks used by your application servers.

To verify that you have authorized an application server's network, navigate to the [Networking page]({% link cockroachcloud/connect-to-your-cluster.md %}#authorize-your-network) on the  CockroachDB {{ site.data.products.cloud }} Console and verify that the application server network is listed under **Authorized Networks**. If the network is not listed, you can add it to authorize the network.

{{site.data.alerts.callout_danger}}
Production clusters should not authorize `0.0.0.0/0`, which allows all networks. While developing and testing your application on CockroachDB {{ site.data.products.dedicated }}, you may have manually added `0.0.0.0/0` to the allowlist. CockroachDB {{ site.data.products.serverless }} allowlists `0.0.0.0/0` by default. Before moving into production, make sure you delete the allowlist entry for the `0.0.0.0/0` network.
{{site.data.alerts.end}}

For enhanced network security and reduced network latency, you can set up private connectivity so that inbound connections to your cluster from your cloud tenant are made over the cloud provider's private network rather than over the public internet. For CockroachDB {{ site.data.products.dedicated }} clusters deployed on GCP, refer to [Google Cloud Platform (GCP) Virtual Private Cloud (VPC) peering]({% link cockroachcloud/network-authorization.md %}#vpc-peering). For CockroachDB {{ site.data.products.dedicated }} clusters or multi-region CockroachDB {{ site.data.products.serverless }} clusters deployed on AWS, refer to [Amazon Web Service (AWS) PrivateLink]({% link cockroachcloud/network-authorization.md %}#aws-privatelink).

## Transaction retries

When several transactions try to modify the same underlying data concurrently, they may experience [contention](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/performance-best-practices-overview#transaction-contention) that leads to [transaction retries](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/transactions#transaction-retries). To avoid failures in production, your application should be engineered to handle transaction retries using [client-side retry handling](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/transaction-retry-error-reference#client-side-retry-handling).

## SQL Best Practices

To ensure optimal SQL performance for your CockroachDB {{ site.data.products.cloud }} cluster, follow the best practices described in the [SQL Performance Best Practices](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/performance-best-practices-overview) guide.

## Use a pool of persistent connections

Creating the appropriate size pool of connections is critical to gaining maximum performance in an application. Too few connections in the pool will result in high latency as each operation waits for a connection to open up. But adding too many connections to the pool can also result in high latency as each connection thread is being run in parallel by the system. The time it takes for many threads to complete in parallel is typically higher than the time it takes a smaller number of threads to run sequentially.

For guidance on sizing, validating, and using connection pools with CockroachDB, refer to [Use Connection Pools](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/connection-pooling).

## Keeping connections current

After an application establishes a connection to CockroachDB {{ site.data.products.cloud }}, those connections can occasionally become invalid. This could be due to changes in the cluster topography, rolling [upgrades]({% link cockroachcloud/upgrade-policy.md %}) and restarts, network disruptions, or cloud infrastructure unavailability.

Set the maximum lifetime of a connection to between 5 and 30 minutes. {{ site.data.products.dedicated }} and {{ site.data.products.serverless }} support 30 minutes as the maximum connection lifetime. When a node is shut down or restarted, client connections can be reset after 30 minutes, causing a disruption to applications.

## Monitoring and alerting

Even with CockroachDB's various [built-in safeguards](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/frequently-asked-questions#how-does-cockroachdb-survive-failures) against failure, it is critical to actively monitor the overall health and performance of a cluster running in production and to create alerting rules that promptly send notifications when there are events that require investigation or intervention.

To use the CockroachDB {{ site.data.products.cloud }} Console to monitor and set alerts on important events and metrics, refer to [Monitoring and Alerting]({% link cockroachcloud/cluster-overview-page.md %}). You can also set up monitoring with [Datadog]({% link cockroachcloud/tools-page.md %}#monitor-cockroachdb-dedicated-with-datadog) or [CloudWatch]({% link cockroachcloud/export-metrics.md %}).

## Backup and restore

For CockroachDB {{ site.data.products.serverless }} clusters, Cockroach Labs takes [full cluster backups](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/take-full-and-incremental-backups#full-backups) hourly, and retains them for 30 days. Full backups for a deleted cluster are retained for 30 days after it is deleted.

For CockroachDB {{ site.data.products.dedicated }} clusters, Cockroach Labs takes [full cluster backups](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/take-full-and-incremental-backups#full-backups) daily and [incremental cluster backups](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/take-full-and-incremental-backups#incremental-backups) hourly. Full backups are retained for 30 days, and incremental backups are retained for 7 days. After a cluster is deleted, Cockroach Labs will retain daily full backups for 30 days from when the backup was originally taken. There are no newly created backups after a cluster is deleted.

Backups are stored in a single-region cluster's region or a multi-region cluster's primary region.

Cluster data can be restored to the current cluster or a different cluster in the same organization. A table or database can be selectively restored from the **Backups** tab.

{{site.data.alerts.callout_danger}}
Restoring to a cluster will completely erase all data in the destination cluster. All cluster data will be replaced with the data from the backup. The destination cluster will be unavailable while this operation is in progress. This operation cannot be canceled, paused, or reversed.
{{site.data.alerts.end}}

You can [manage your own backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}), including incremental, database, and table-level backups. When you perform a manual backup, you must specify a storage location, which can be on your local system or in cloud storage.

## Patches and upgrades

CockroachDB {{ site.data.products.cloud }} supports the latest major version of CockroachDB and the version immediately preceding it. Support for these versions includes patch version upgrades and security patches.

### Major version upgrades

Major version upgrades are automatic for CockroachDB {{ site.data.products.serverless }} clusters and opt-in for CockroachDB {{ site.data.products.dedicated }} clusters. [Cluster Operators]({% link cockroachcloud/authorization.md %}#cluster-operator) must initiate major version upgrades for CockroachDB {{ site.data.products.dedicated }} clusters. When a major version upgrade is initiated for a cluster, it subsequently will be upgrade to the latest patch version automatically.

Since upgrading a cluster can have a significant impact on your workload, make sure you review the release notes for the latest version for backward compatibility, cluster setting changes, deprecations, and known limitations. Cockroach Labs recommends initiating the upgrade during off-peak periods. After the upgrade, carefully monitor cluster and application health. If you notice functional or performance regression, you can roll back the changes for up to 72 hours before the upgrade is automatically finalized. After an upgrade, some features might be unavailable until the upgrade is finalized. For more information, refer [Major version upgrades]({% link cockroachcloud/upgrade-policy.md %}#major-version-upgrades).

### Patch upgrades

For CockroachDB {{ site.data.products.dedicated }} clusters, [Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator) can [set a weekly 6-hour maintenance window]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window) during which available maintenance and patch upgrades will be applied. Patch upgrades can also be [deferred for 60 days]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window). If no maintenance window is configured, CockroachDB {{ site.data.products.dedicated }} clusters will be automatically upgraded to the latest supported patch version as soon as it becomes available.

For more information, refer to [Patch version upgrades]({% link cockroachcloud/upgrade-policy.md %}#patch-version-upgrades).

## PCI ready features (Dedicated advanced)

CockroachDB {{ site.data.products.dedicated }} advanced has access to all features required for [PCI readiness]({% link cockroachcloud/pci-dss.md %}). You must configure these settings to make your cluster PCI-ready:

- [CockroachDB {{ site.data.products.cloud }} Organization Audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %})
- [Cluster SQL audit log export]({% link cockroachcloud/export-logs.md %})
- [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/managing-cmek.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})
- Single Sign-On (SSO) for your [CockroachDB {{ site.data.products.cloud }} organization]({% link cockroachcloud/configure-cloud-org-sso.md %}) and your [clusters]({% link cockroachcloud/cloud-sso-sql.md %})
- [Network security]({% link cockroachcloud/network-authorization.md %})

You can check the status of these features on the [**PCI ready**](cluster-overview-page.html?filters=dedicated#pci-ready-dedicated-advanced) page of the CockroachDB {{ site.data.products.cloud }} Console.
