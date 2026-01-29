---
title: CockroachDB Feature Availability
summary: Learn about the features available in preview and limited access in CockroachDB
toc: true
docs_area: reference.sql
key: experimental-features.html
---

Some CockroachDB features are made available in phases prior to being launched in general availability (GA). This page defines the different levels of CockroachDB {{ page.version.version }} feature availability and lists the features in each phase.

{{site.data.alerts.callout_info}}
This page outlines _feature availability_, which is separate from Cockroach Labs' [Release Support Policy]({% link releases/release-support-policy.md %}) or [API Support Policy]({% link {{ page.version.version }}/api-support-policy.md %}).
{{site.data.alerts.end}}

## Feature availability phases

Phase                            | Definition | Accessibility
---------------------------------+------------+-------------
Private preview                  | Feature is available to select customers and not publicly documented. | Invite-only
Limited access                   | Feature is publicly documented but not yet available widely. This feature may have limitations and/or capabilities that may change or be added based on feedback, before being promoted to GA. | Opt-in <br />Contact your Cockroach Labs account team.
[Preview](#features-in-preview)  | Feature is publicly available and documented. This feature may have limitations and/or capabilities that may change or be added based on feedback, before being promoted to GA. | Public
General availability (GA)        | Feature is publicly available and documented. | Public

{{site.data.alerts.callout_info}}
Any feature made available in a phase prior to GA is provided without any warranties of any kind. Such features are not subject to any technical support or uptime availability commitments unless Cockroach Labs explicitly states otherwise in writing.
{{site.data.alerts.end}}

## Features in limited access

{{site.data.alerts.callout_info}}
**The following features are in limited access** and are subject to change. To begin validating a limited access feature and share feedback and/or issues, contact [Support](https://support.cockroachlabs.com/hc).
{{site.data.alerts.end}}

### Export logs to Azure Monitor

[Exporting logs to Azure Monitor]({% link cockroachcloud/export-logs-advanced.md %}?filters=azure-monitor-log-export) from your CockroachDB {{ site.data.products.advanced }} cluster hosted on Azure is in limited access. Once the export is configured, logs will flow from all nodes in all regions of your CockroachDB {{ site.data.products.advanced }} cluster to Azure Monitor. To express interest and try it out, contact [Support](https://support.cockroachlabs.com/hc).

### Export metrics to Azure Monitor

[Exporting Metrics to Azure Monitor]({% link cockroachcloud/export-metrics-advanced.md %}?filters=azure-monitor-metrics-export) from a CockroachDB {{ site.data.products.advanced }} cluster hosted on Azure is in limited access. Once the export is configured, metrics will flow from all nodes in all regions of your CockroachDB {{ site.data.products.advanced }} cluster to your chosen cloud metrics sink. To express interest and try it out, contact [Support](https://support.cockroachlabs.com/hc).

### Egress private endpoints

[Egress private endpoints]({% link cockroachcloud/egress-private-endpoints.md %}) are secure network connections between a CockroachDB {{ site.data.products.advanced }} cluster and the rest of your private cloud infrastructure. Egress endpoints let CockroachDB send outbound information, such as [changefeed targets]({% link {{ page.version.version }}/change-data-capture-overview.md %}), to other cloud services over a private network link. To express interest and try it out, contact [Support](https://support.cockroachlabs.com/hc).

### Cluster SSO backed by LDAP

[Cluster SSO]({% link {{ page.version.version }}/sso-sql.md %}) using an identity stored in LDAP is in Limited Access. The [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `server.auth_log.sql_sessions.enabled`, which logs more details about cluster authentication failures, is also in Limited Access.

## Features in preview

{{site.data.alerts.callout_info}}
**The following features are in preview** and are subject to change. To share feedback and/or issues, contact [Support](https://support.cockroachlabs.com/hc).
{{site.data.alerts.end}}

### `LTREE` data type

The [`LTREE` data type]({% link {{ page.version.version }}/ltree.md %}) stores hierarchical tree-like structures. `LTREE` is useful for efficiently querying and managing hierarchical data without using recursive joins.

### Prometheus-compatible `metrics` endpoint

[`http://<host>:<http-port>/metrics` Prometheus-compatible endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}#metrics) is enhanced with additional static labels.

The `metrics` Prometheus endpoint is commonly used and is the default in Prometheus configurations.

### Value separation

[Value separation]({% link {{ page.version.version }}/architecture/storage-layer.md %}#value-separation) reduces write amplification by storing large values separately from the LSM in blob files. Value separation can reduce write amplification by up to 50% for large-value workloads, while introducing minor read overhead and a slight increase in disk space usage. This feature is available in Preview.

### `database` and `application_name` labels for certain metrics

The following cluster settings enable the [`database` and `application_name` labels for certain metrics]({% link {{ page.version.version }}/multi-dimensional-metrics.md %}#enable-database-and-application_name-labels), along with their internal counterparts if they exist:

- `sql.metrics.database_name.enabled`
- `sql.metrics.application_name.enabled`

By default, these cluster settings are disabled.

### JSONPath queries

[JSONPath]({% link {{ page.version.version }}/jsonpath.md %}) expressions and functions can be used to query and filter [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) data, using [JSONPath expressions]({% link {{ page.version.version }}/jsonpath.md %}#jsonpath-expression) as arguments in [JSONPath functions]({% link {{ page.version.version }}/jsonpath.md %}#jsonpath-functions).

### Workload-level index recommendations

The SQL built-in function [workload_index_recs]({% link {{ page.version.version }}/ui-insights-page.md %}#workload_index_recs-function) returns index recommendations and the fingerprint IDs of the statements they impact.

### Triggers

[Triggers]({% link {{ page.version.version }}/triggers.md %}) are in Preview. A trigger executes a function when one or more specified SQL operations is performed on a table. Triggers respond to data changes by adding logic within the database, rather than in an application. They can be used to modify data before it is inserted, maintain data consistency across rows or tables, or record an update to a row.

### JWT authorization

[JWT authorization]({% link {{ page.version.version }}/jwt-authorization.md %}) allows CockroachDB to automatically assign roles to users based on group claims in their JWT tokens. When a client connects using a JWT token, the cluster extracts group information and maps each group to a corresponding cluster role, simplifying access control for organizations using identity providers.

### OIDC authorization for DB Console

[OIDC authorization for DB Console]({% link {{ page.version.version }}/oidc-authorization.md %}) allows CockroachDB to automatically assign roles to users based on group claims when they log into the DB Console via OIDC. The cluster extracts group information from ID tokens or access tokens and maps each group to a corresponding cluster role, streamlining access management for DB Console users.

### Admission control for ingesting snapshots

The [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `kvadmission.store.snapshot_ingest_bandwidth_control.enabled` is in Preview. When configured, it limits the disk impact of ingesting snapshots on a node.

### Admission control to limit the bandwidth for a store

The [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `kvadmission.store.provisioned_bandwidth` is in Preview. When configured, the store's bandwidth is limited to the configured bandwidth, expressed in bytes per second,

### CockroachDB Standard

CockroachDB {{ site.data.products.standard }} is our new, [enterprise-ready plan](https://www.cockroachlabs.com/pricing), recommended for most applications. You can start small with [provisioned capacity that can scale on demand]({% link cockroachcloud/plan-your-cluster.md %}), along with enterprise-level security and availability. Compute for CockroachDB {{ site.data.products.standard }} is pre-provisioned and storage is usage-based. You can easily switch a CockroachDB {{ site.data.products.basic }} cluster to CockroachDB {{ site.data.products.standard }} in place.

### CockroachDB Cloud Folders

[Organizing CockroachDB {{ site.data.products.cloud }} clusters using folders]({% link cockroachcloud/folders.md %}) is in preview. Folders allow you to organize and manage access to your clusters according to your organization's requirements. For example, you can create top-level folders for each business unit in your organization, and within those folders, organize clusters by geographic location and then by  level of maturity, such as production, staging, and testing.

### Read from standby in physical cluster replication (PCR) for CockroachDB {{ site.data.products.core }}
 
The [`READ VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %}#options) option allows you to set up a PCR stream that also creates a [read-only virtual cluster]({% link {{ page.version.version }}/read-from-standby.md %}) on the standby cluster. You can create a PCR job as per the [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}) guide and then add the option to the [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %}) statement.

### Custom Metrics Chart page for CockroachDB {{ site.data.products.cloud }} clusters

The [**Custom Metrics Chart** page]({% link cockroachcloud/custom-metrics-chart-page.md %}) for CockroachDB {{ site.data.products.cloud }} clusters allows you to create custom charts showing the time series data for an available metric or combination of metrics.

### Export metrics from CockroachDB {{ site.data.products.advanced }} clusters

[Exporting metrics from CockroachDB {{ site.data.products.advanced }}]({% link cockroachcloud/export-metrics-advanced.md %}) to [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) or [Datadog](https://www.datadoghq.com/) using the [Cloud API]({% link cockroachcloud/cloud-api.md %}) is in preview. Once the export is configured, metrics will flow from all nodes in all regions of your CockroachDB {{ site.data.products.advanced }} cluster to your chosen cloud metrics sink.

[Exporting metrics from CockroachDB {{ site.data.products.advanced }} to Prometheus]({% link cockroachcloud/export-metrics-advanced.md %}?filters=prometheus-metrics-export) using the [Cloud API]({% link cockroachcloud/cloud-api.md %}) is in preview for clusters hosted on Azure. It is in general availability for clusters hosted on AWS and GCP.

{{site.data.alerts.callout_info}}
Exporting metrics to Azure Monitor is in limited access. Refer to [Export metrics to Azure Monitor](#export-metrics-to-azure-monitor).
{{site.data.alerts.end}}

### Convert a schema from Oracle or Microsoft SQL Server

Using the [Migrations page]({% link cockroachcloud/migrations-page.md %}) to convert a schema from Oracle or Microsoft SQL Server is in preview.

### Schema conversion summary report

The [schema-conversion summary report]({% link cockroachcloud/migrations-page.md %}#summary-report) in the Migrations page is in preview. This report displays the results of the schema analysis and provides bulk actions you can apply to update the schema, is in preview.

### Cloud SQL Shell

The [SQL Shell]({% link cockroachcloud/sql-shell.md %}) in the CockroachDB {{ site.data.products.cloud }} Console is in preview. The SQL Shell enables you to run [queries]({% link {{ page.version.version }}/selection-queries.md %}) on your CockroachDB {{ site.data.products.cloud }} cluster directly from your browser.

### Log SQL Activity to Datadog

You can [log `sampled_query` and `sampled_transaction` events to Datadog]({% link {{ page.version.version }}/log-sql-activity-to-datadog.md %}) for finer granularity and long-term retention of SQL activity, and to reduce the performance impacts of logging these events locally. The [`sampled_query` events]({% link {{ page.version.version }}/eventlog.md %}#sampled_query) and the [`sampled_transaction` events]({% link {{ page.version.version }}/eventlog.md %}#sampled_transaction) contain common SQL event and execution details for transactions, and statements.

CockroachDB supports a built-in integration with [Datadog](https://www.datadoghq.com/) which sends these events as logs via the [Datadog HTTP API](https://docs.datadoghq.com/api/latest/logs/). This integration is the recommended path to achieve high throughput data ingestion, which will in turn provide more query and transaction events for greater workload observability.

### Role-based SQL audit logging

[Role-based SQL audit logging]({% link {{ page.version.version }}/role-based-audit-logging.md %}) gives you detailed information about queries being executed against your system by specific users or roles. An event of type [`role_based_audit_event`]({% link {{ page.version.version }}/eventlog.md %}#role_based_audit_event) is recorded when an executed query belongs to a user whose role membership corresponds to a role that is enabled to emit an audit log via the [`sql.log.user_audit` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-log-user-audit). The event is logged in the [`SENSITIVE_ACCESS`]({% link {{ page.version.version }}/logging.md %}#sensitive_access) logging channel.

### Table-based SQL audit logging

With [table-based SQL audit logging]({% link {{ page.version.version }}/sql-audit-logging.md %}) you can log all queries against a table to a file, for security purposes. For more information, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`]({% link {{ page.version.version }}/alter-table.md %}#experimental_audit).

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE t EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

### Show table fingerprints

Table fingerprints are used to compute an identification string of an entire table, for the purpose of gauging whether two tables have the same data. This is useful, for example, when restoring a table from backup.

Example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_FINGERPRINTS FROM TABLE t;
~~~

~~~
 index_name |     fingerprint
------------+---------------------
 primary    | 1999042440040364641
(1 row)
~~~

### KV event tracing

Use session tracing (via [`SHOW TRACE FOR SESSION`]({% link {{ page.version.version }}/show-trace.md %})) to report the replicas of all KV events that occur during its execution.

Example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET tracing = on;
> SELECT * from t;
> SET tracing = off;
> SHOW EXPERIMENTAL_REPLICA TRACE FOR SESSION;
~~~

~~~
            timestamp             | node_id | store_id | replica_id
----------------------------------+---------+----------+------------
 2018-10-18 15:50:13.345879+00:00 |       3 |        3 |          7
 2018-10-18 15:50:20.628383+00:00 |       2 |        2 |         26
~~~

### Show range information for a specific row

The [`SHOW RANGE ... FOR ROW`]({% link {{ page.version.version }}/show-range-for-row.md %}) statement shows information about a [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) for a particular row of data. This information is useful for verifying how SQL data maps to underlying ranges, and where the replicas for a range are located.

### Temporary objects

[Temporary tables]({% link {{ page.version.version }}/temporary-tables.md %}), [temporary views]({% link {{ page.version.version }}/views.md %}#temporary-views), and [temporary sequences]({% link {{ page.version.version }}/create-sequence.md %}#temporary-sequences) are in preview in CockroachDB. If you create too many temporary objects in a session, the performance of DDL operations will degrade. Dropping large numbers of temporary objects in rapid succession can also enqueue many [schema change GC jobs]({% link {{ page.version.version }}/show-jobs.md %}), which may further degrade cluster performance. This performance degradation could persist long after creating the temporary objects. For more details, see [cockroachdb/cockroach#46260](https://github.com/cockroachdb/cockroach/issues/46260).

To enable temporary objects, set the `experimental_enable_temp_tables` [session variable]({% link {{ page.version.version }}/show-vars.md %}) to `on`.

### Password authentication without TLS

For deployments where transport security is already handled at the infrastructure level (e.g., IPSec with DMZ), and TLS-based transport security is not possible or not desirable, CockroachDB supports delegating transport security to the infrastructure with the flag `--accept-sql-without-tls` for [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#security).

With this flag, SQL clients can establish a session over TCP without a TLS handshake. They still need to present valid authentication credentials, for example a password in the default configuration. Different authentication schemes can be further configured as per `server.host_based_authentication.configuration`.

Example:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --user=jpointsman --insecure
~~~

~~~
  # Welcome to the CockroachDB SQL shell.
  # All statements must be terminated by a semicolon.
  # To exit, type: \q.
  #
  Enter password:
~~~

### Apache Pulsar changefeed sink

Changefeeds can deliver messages to [Apache Pulsar](https://pulsar.apache.org/docs).

A Pulsar sink URI:

{% include_cached copy-clipboard.html %}
~~~
pulsar://localhost:6650
~~~

{% include {{ page.version.version }}/cdc/apache-pulsar-unsupported.md %}

For an Apache Pulsar setup example, refer to the [Changefeed Examples]({% link {{ page.version.version }}/changefeed-examples.md %}#create-a-changefeed-connected-to-an-apache-pulsar-sink) page.

### Core implementation of changefeeds

The [`EXPERIMENTAL CHANGEFEED FOR`]({% link {{ page.version.version }}/changefeed-for.md %}) statement creates a new basic changefeed, which streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled. A basic changefeed can watch one table or multiple tables in a comma-separated list.

### Multiple active portals

The multiple active portals feature of the Postgres wire protocol (pgwire) is available, with limitations.  For more information, see [Multiple active portals]({% link {{ page.version.version }}/postgresql-compatibility.md %}#multiple-active-portals).

### Super regions

[Super regions]({% link {{ page.version.version }}/multiregion-overview.md %}#super-regions) allow you to define a set of database regions such that schema objects will have all of their replicas stored _only_ in regions that are members of the super region. The primary use case for super regions is data domiciling.

### Physical cluster replication data verification

You can verify data between a primary and standby cluster with the `SHOW EXPERIMENTAL FINGERPRINTS` statement, which uses the current replicated time in a [physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) job to run a point-in-time fingerprint. The `SHOW EXPERIMENTAL_FINGERPRINTS` statement verifies that data transmission and ingestion is working as expected while the replication stream is running. This tool is for data verification only; if you encounter a fingerprint mismatch, contact [Support](https://support.cockroachlabs.com/hc/en-us). For more information, refer to the [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}#data-verification) page.

### `cockroach` commands

The table below lists the [`cockroach` commands]({% link {{ page.version.version }}/cockroach-commands.md %}) available in preview in CockroachDB.

Command                                     | Description
--------------------------------------------+-------------
[`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %})     | Start a temporary, in-memory CockroachDB cluster, and open an interactive SQL shell to it.
[`cockroach sqlfmt`]({% link {{ page.version.version }}/cockroach-sqlfmt.md %}) | Reformat SQL queries for enhanced clarity.

### Leader leases

{% include {{ page.version.version }}/leader-leases-intro.md %}

For more information, see [Architecture > Replication Layer > Leader leases]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leader-leases).

### Buffered Writes

Buffered Writes enhance transaction throughput and reduce operational cost by minimizing the number of round-trips between the [gateway node]({% link {{ page.version.version }}/architecture/sql-layer.md %}#gateway-node) and the other nodes during write operations.

For more information, refer to [Buffered writes]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#buffered-writes).

## See Also

- [`SHOW {session variable}`]({% link {{ page.version.version }}/show-vars.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %})
- [`ALTER TABLE ... EXPERIMENTAL_AUDIT`]({% link {{ page.version.version }}/alter-table.md %}#experimental_audit)
- [`SHOW TRACE FOR SESSION`]({% link {{ page.version.version }}/show-trace.md %})
- [`SHOW RANGE ... FOR ROW`]({% link {{ page.version.version }}/show-range-for-row.md %})
