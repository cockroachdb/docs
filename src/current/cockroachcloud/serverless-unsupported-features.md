---
title: Unsupported Features in CockroachDB Serverless
summary: Summary of CockroachDB features that are not supported in CockroachDB Serverless
toc: true
docs_area: reference
---

CockroachDB {{ site.data.products.serverless }} is a [managed multi-tenant deployment of CockroachDB]({% link cockroachcloud/architecture.md %}#cockroachdb-serverless) that automatically scales up and down based on the load on the cluster. CockroachDB {{ site.data.products.serverless }} works with almost all workloads that CockroachDB supports, but there are feature differences between CockroachDB {{ site.data.products.core }} or CockroachDB {{ site.data.products.dedicated }} clusters and CockroachDB {{ site.data.products.serverless }} clusters. This topic describes the features that are either unsupported or partially supported in CockroachDB {{ site.data.products.serverless }} clusters. Cockroach Labs intends to eliminate these feature gaps in future releases of CockroachDB {{ site.data.products.serverless }}.

## Change data capture

You can't collect [metrics per changefeed](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/monitor-and-debug-changefeeds#using-changefeed-metrics-labels).

You can't configure [alerts on changefeeds](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/monitoring-and-alerting#changefeed-is-experiencing-high-latency).

## Backups

CockroachDB {{ site.data.products.serverless }} clusters only support automated full backups. Automated [incremental](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups) and [revision history](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-backups-with-revision-history-and-restore-from-a-point-in-time) backups are not supported. However, you can take manual [incremental and revision history backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}#examples) to your own [storage location](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage).

Automated database and table level backups are not supported in CockroachDB {{ site.data.products.serverless }}. However, you can take manual [database and table level backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}#examples) to your own [storage location](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage).

Both CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }} clusters do not support automated [locality-aware backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-and-restore-locality-aware-backups). However, you can take manual locality-aware backups to your own [cloud storage location](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage).

{{site.data.alerts.callout_info}}
{% include {{ site.current_cloud_version }}/backups/serverless-locality-aware.md %}
{{site.data.alerts.end}}

## Adding and removing regions

You cannot currently edit an existing CockroachDB {{ site.data.products.serverless }} to add or remove regions after it has been created. Instead you can [back up and restore]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) your data into a new CockroachDB {{ site.data.products.serverless }} cluster with the desired region configuration.

## Range management

The [`ALTER TABLE ... SPLIT AT`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-table#split-at) and [`ALTER RANGE ... RELOCATE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-range#relocate) statements are not supported in CockroachDB {{ site.data.products.serverless }}.

## Self service upgrades

CockroachDB {{ site.data.products.serverless }} is a fully managed multi-tenant deployment of CockroachDB. Major and patch upgrades of CockroachDB are handled by Cockroach Labs, and [can't be initiated by users]({% link cockroachcloud/serverless-faqs.md %}#can-i-upgrade-the-version-of-cockroachdb-my-cockroachdb-serverless-cluster-is-running-on).

## Monitoring workloads and cluster health

The [DB Console](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-overview) is not supported in CockroachDB {{ site.data.products.serverless }}. The CockroachDB [Cloud Console]({% link cockroachcloud/cluster-overview-page.md %}) provides metrics and graphs to monitor the health, performance, and state of your cluster.

The Cloud Console provides a subset of observability information from the DB Console including [**SQL Metrics**]({% link cockroachcloud/metrics-page.md %}), [**SQL Activity**]({% link cockroachcloud/statements-page.md %}), [**Jobs**]({% link cockroachcloud/jobs-page.md %}), and [**Databases**](databases-page.html) information. The Cloud Console does not include information from the following DB Console pages:

- Non-SQL metrics
- Network Latency
- Hot ranges
- Advanced Debug

The Cloud Console also does not currently provide the following features available in the DB Console:

- [Direct actions to drop unused indexes](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-databases-page#index-recommendations) on the **Insights** and **Databases** pages
- [Direct actions to create missing indexes](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-insights-page#schema-insights-tab) and [replace existing indexes](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-insights-page#schema-insights-tab) on the **Insights** page

CockroachDB {{ site.data.products.serverless }} clusters do not expose [Prometheus endpoints](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/monitor-cockroachdb-with-prometheus).

## Audit logs

There is no self-service way of accessing [audit logs]({% link cockroachcloud/sql-audit-logging.md %}) for CockroachDB {{ site.data.products.serverless }} clusters. If you are running production workloads and need access to audit logs, contact [Cockroach Labs Support](https://support.cockroachlabs.com).

## Encryption

Cluster storage for CockroachDB {{ site.data.products.serverless }} is encrypted at rest by the cloud provider. [Customer-managed encryption keys]({% link cockroachcloud/managing-cmek.md %}) (CMEK) are not supported in CockroachDB {{ site.data.products.serverless }}. CMEK is available only in [CockroachDB {{ site.data.products.dedicated }} advanced]({% link cockroachcloud/create-your-cluster.md %}).

## Network security

[Private clusters]({% link cockroachcloud/private-clusters.md %}), compliance with [PCI DSS]({% link cockroachcloud/pci-dss.md %}), and compliance with [HIPAA]({% link cockroachcloud/pci-dss.md %}#hipaa) are not supported in {{ site.data.products.serverless }}. These features are available only in [CockroachDB {{ site.data.products.dedicated }} advanced]({% link cockroachcloud/create-your-cluster.md %}).
