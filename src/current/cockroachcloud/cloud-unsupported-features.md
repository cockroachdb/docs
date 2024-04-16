---
title: Unsupported Features in CockroachDB Cloud
summary: Summary of CockroachDB features that are not supported for some CockroachDB Cloud plans
toc: true
docs_area: reference
---

This topic describes the features that are either unsupported or partially supported in some CockroachDB {{ site.data.products.cloud }} plans. 

## Change data capture

You can't collect [metrics per changefeed](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/monitor-and-debug-changefeeds#using-changefeed-metrics-labels) or configure [alerts on changefeeds](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/monitoring-and-alerting#changefeed-is-experiencing-high-latency) for CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters.

## Backups

CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters only support automated full backups. Automated [incremental](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups) and [revision history](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-backups-with-revision-history-and-restore-from-a-point-in-time) backups are not supported. However, you can take manual [incremental and revision history backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}#examples) to your own [storage location](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage).

Automated database and table level backups are not supported in CockroachDB CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }}. However, you can take manual [database and table level backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}#examples) to your own [storage location](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage).

CockroachDB {{ site.data.products.basic }}, {{ site.data.products.standard }}, and {{ site.data.products.advanced }} clusters do not support automated [locality-aware backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-and-restore-locality-aware-backups). However, you can take manual locality-aware backups to your own [cloud storage location](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage).

{{site.data.alerts.callout_info}}
{% include cockroachcloud/backups/locality-aware-multi-tenant.md %}
{{site.data.alerts.end}}

## Adding and removing regions

You cannot currently edit an existing CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} to remove regions after it has been created. Instead you can [back up and restore]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) your data into a new CockroachDB {{ site.data.products.basic }} or {{ site.data.products.standard }} cluster with the desired region configuration.

## Range management

The [`ALTER TABLE ... SPLIT AT`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-table#split-at) and [`ALTER RANGE ... RELOCATE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-range#relocate) statements are not supported in CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters.

## Self service upgrades

CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} are fully managed multi-tenant deployments of CockroachDB. Major and patch upgrades of CockroachDB are handled by Cockroach Labs, and can't be initiated by users.

## Monitoring workloads and cluster health

The [DB Console](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-overview) is not supported in CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }}. The CockroachDB [Cloud Console]({% link cockroachcloud/cluster-overview-page.md %}) provides metrics and graphs to monitor the health, performance, and state of your cluster.

The Cloud Console provides a subset of observability information from the DB Console including [**Metrics**]({% link cockroachcloud/metrics.md %}#cockroachdb-cloud-console-metrics-page), [**SQL Activity**]({% link cockroachcloud/statements-page.md %}), [**Jobs**]({% link cockroachcloud/jobs-page.md %}), and [**Databases**](databases-page.html) information. The Cloud Console does not include information from the following DB Console pages:

- Non-SQL metrics
- Network Latency
- Hot ranges
- Advanced Debug

The Cloud Console also does not currently provide the following features available in the DB Console:

- [Direct actions to drop unused indexes](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-databases-page#index-recommendations) on the **Insights** and **Databases** pages
- [Direct actions to create missing indexes](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-insights-page#schema-insights-tab) and [replace existing indexes](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-insights-page#schema-insights-tab) on the **Insights** page

CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters do not expose [Prometheus endpoints](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/monitor-cockroachdb-with-prometheus).

## Audit logs

There is no self-service way of accessing [audit logs]({% link cockroachcloud/sql-audit-logging.md %}) for CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters. If you are running production workloads and need access to audit logs, contact [Cockroach Labs Support](https://support.cockroachlabs.com).

## Encryption

Cluster storage for CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} is encrypted at rest by the cloud provider. [Customer-managed encryption keys]({% link cockroachcloud/managing-cmek.md %}) (CMEK) are not supported in CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }}. CMEK is available only in [CockroachDB {{ site.data.products.advanced }} with security add-ons enabled]({% link cockroachcloud/create-an-advanced-cluster.md %}).

## Network security

[Private clusters]({% link cockroachcloud/private-clusters.md %}), compliance with [PCI DSS]({% link cockroachcloud/pci-dss.md %}), and compliance with [HIPAA]({% link cockroachcloud/pci-dss.md %}#hipaa) are not supported in {{ site.data.products.basic }} and {{ site.data.products.standard }}. These features are available only in [CockroachDB {{ site.data.products.advanced }} with security add-ons enabled]({% link cockroachcloud/create-an-advanced-cluster.md %}).
