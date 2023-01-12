---
title: Unsupported Features in CockroachDB Serverless
summary: Summary of CockroachDB features that are not supported in CockroachDB Serverless
toc: true
docs_area: reference
---

{{ site.data.products.serverless }} is a [managed multi-tenant deployment of CockroachDB](architecture.html#cockroachdb-serverless) that automatically scales up and down based on the load on the cluster. {{ site.data.products.serverless }} works with almost all workloads that CockroachDB supports, but there are feature differences between {{ site.data.products.core }} or {{ site.data.products.dedicated }} clusters and {{ site.data.products.serverless }} clusters. This topic describes the features that are either unsupported or partially supported in {{ site.data.products.serverless }} clusters. Cockroach Labs intends to eliminate these feature gaps in future releases of {{ site.data.products.serverless }}.

## Change data capture

[Distributed SQL (DistSQL)](../{{site.current_cloud_version}}/architecture/sql-layer.html#distsql) is not supported, which improves the performance of changefeeds.

You can't collect [metrics per changefeed](../{{site.current_cloud_version}}/monitor-and-debug-changefeeds.html#using-changefeed-metrics-labels).

You can't configure [alerts on changefeeds](../{{site.current_cloud_version}}/monitoring-and-alerting.html#changefeed-is-experiencing-high-latency).

## Backups

{{ site.data.products.serverless }} only support automated full backups. Automated [incremental](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html) and [revision history](../{{site.current_cloud_version}}/take-backups-with-revision-history-and-restore-from-a-point-in-time.html) backups are not supported. However, [user managed incremental and revision history backups](run-bulk-operations.html#backup-and-restore-data) using user provided storage locations are supported.

Automated database and table level backups are not supported in {{ site.data.products.serverless }}. However, [user managed database and table level backups](run-bulk-operations.html#backup-and-restore-data) using user provided storage locations are supported.

Both {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters do not support automated [locality-aware backups](../{{site.current_cloud_version}}/take-and-restore-locality-aware-backups.html). However, user managed locality-aware backups using user provided storage locations are supported in {{ site.data.products.serverless }}, {{ site.data.products.dedicated }}, and {{ site.data.products.core }} clusters. That is, you need to configure and manage your own locality-aware backups.

## Performance

[Distributed SQL (DistSQL)](../{{site.current_cloud_version}}/architecture/sql-layer.html#distsql) is not supported in {{ site.data.products.serverless }} clusters, so users do not benefit from the improved query performance that DistSQL offers, especially for online analytical processing (OLAP) queries and bulk operations like [`IMPORT`](../{{site.current_cloud_version}}/import.html).

## Multi-region clusters

{{ site.data.products.serverless }} is only supported in a single region, and does not support [multi-region](../{{site.current_cloud_version}}/multiregion-overview.html) features.

## Follower reads

[Follower reads](../{{site.current_cloud_version}}/follower-reads.html) are not supported in {{ site.data.products.serverless }} clusters.

## Range management

The [`ALTER TABLE ... SPLIT AT`](../{{site.current_cloud_version}}/split-at.html) and [`ALTER RANGE ... RELOCATE`](../{{site.current_cloud_version}}/alter-range-relocate.html) statements are not supported in {{ site.data.products.serverless }}.

## Query cancellation using pgwire

[Canceling queries from client drivers/ORMs using the PostgreSQL wire protocol (pgwire)](../{{site.current_cloud_version}}/cancel-query.html#considerations) is not supported in {{ site.data.products.serverless }}.

## Self service upgrades

{{ site.data.products.serverless }} is a fully managed multi-tenant deployment of CockroachDB. Major and minor upgrades of CockroachDB are handled by Cockroach Labs, and [can't be initiated by users](serverless-faqs.html#can-i-upgrade-the-version-of-cockroachdb-my-cockroachdb-serverless-cluster-is-running-on).

## Monitoring workloads and cluster health

The [DB Console](../{{site.current_cloud_version}}/ui-overview.html) is not supported in {{ site.data.products.serverless }}. The CockroachDB [Cloud Console](cluster-overview-page.html) provides metrics and graphs to monitor the health, performance, and state of your cluster.

The Cloud Console provides a subset of observability information from the DB Console including **SQL Metrics**, **SQL Activity**, and **Databases** information. The Cloud Console does not include information from the following DB Console pages:

- Non-SQL metrics
- Network Latency
- Hot ranges
- Jobs
- Advanced Debug

{{ site.data.products.serverless }} clusters do not expose [Prometheus endpoints](../{{site.current_cloud_version}}/monitor-cockroachdb-with-prometheus.html).

## Audit logs

There is no self-service way of accessing [audit logs](sql-audit-logging.html) for {{ site.data.products.serverless }} clusters. If you are running production workloads and need access to audit logs, contact [Cockroach Labs Support](https://support.cockroachlabs.com).

## Encryption

[Encryption at rest](../{{site.current_cloud_version}}/security-reference/encryption.html#encryption-at-rest) is not supported in {{ site.data.products.serverless }} clusters.

[Customer-managed encryption keys](managing-cmek.html) (CMEK) are not supported in {{ site.data.products.serverless }} clusters.
