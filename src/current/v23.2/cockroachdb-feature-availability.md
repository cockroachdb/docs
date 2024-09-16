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
Limited access                   | Feature is publicly documented but not yet available widely. This feature may have limitations and/or capabilities that may change or be added based on feedback, before being promoted to GA. | Opt-in </br>Contact your Cockroach Labs account team.
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
[Exporting logs to Azure Monitor]({% link cockroachcloud/export-logs.md %}?filters=azure-monitor-log-export) from your CockroachDB {{ site.data.products.dedicated }} cluster hosted on Azure is in limited access. Once the export is configured, logs will flow from all nodes in all regions of your CockroachDB {{ site.data.products.dedicated }} cluster to Azure Monitor. To express interest and try it out, contact [Support](https://support.cockroachlabs.com/hc).

### Export metrics to Azure Monitor
[Exporting Metrics to Azure Monitor]({% link cockroachcloud/export-metrics.md %}?filters=azure-monitor-metrics-export) from a CockroachDB {{ site.data.products.dedicated }} cluster hosted on Azure is in limited access. Once the export is configured, metrics will flow from all nodes in all regions of your CockroachDB {{ site.data.products.dedicated }} cluster to your chosen cloud metrics sink. To express interest and try it out, contact [Support](https://support.cockroachlabs.com/hc).

### AWS PrivateLink for CockroachDB Serverless

[Connecting privately to a multi-region CockroachDB Serverless cluster using AWS PrivateLink]({% link cockroachcloud/aws-privatelink.md %}?filters=serverless) is in limited access. This can help your organization meet its security requirements and reduce your cluster's exposure to public networks. To express interest and try it out, contact [Support](https://support.cockroachlabs.com/hc).

## Features in preview

{{site.data.alerts.callout_info}}
**The following features are in preview** and are subject to change. To share feedback and/or issues, contact [Support](https://support.cockroachlabs.com/hc).
{{site.data.alerts.end}}

### CockroachDB Cloud Folders

[Organizing CockroachDB {{ site.data.products.cloud }} clusters using folders]({% link cockroachcloud/folders.md %}) is in preview. Folders allow you to organize and manage access to your clusters according to your organization's requirements. For example, you can create top-level folders for each business unit in your organization, and within those folders, organize clusters by geographic location and then by  level of maturity, such as production, staging, and testing.

### Custom Metrics Chart page for CockroachDB {{ site.data.products.cloud }} clusters

The [**Custom Metrics Chart** page]({% link cockroachcloud/custom-metrics-chart-page.md %}) for CockroachDB {{ site.data.products.cloud }} clusters allows you to create custom charts showing the time series data for an available metric or combination of metrics.

### Export metrics from CockroachDB {{ site.data.products.dedicated }} clusters
[Exporting metrics from CockroachDB {{ site.data.products.dedicated }}]({% link cockroachcloud/export-metrics.md %}) to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) or [Datadog](https://www.datadoghq.com/) using the [Cloud API]({% link cockroachcloud/cloud-api.md %}) is in preview. Once the export is configured, metrics will flow from all nodes in all regions of your CockroachDB {{ site.data.products.dedicated }} cluster to your chosen cloud metrics sink.

{{site.data.alerts.callout_info}}
Exporting metrics to Azure Monitor is in limited access. Refer to [Exporting metrics to Azure Monitor](#export-metrics-to-azure-monitor).
{{site.data.alerts.end}}

### Convert a schema from Oracle or Microsoft SQL Server

Using the [Migrations page]({% link cockroachcloud/migrations-page.md %}) to convert a schema from Oracle or Microsoft SQL Server is in preview.

### Schema conversion summary report

The [schema-conversion summary report]({% link cockroachcloud/migrations-page.md %}#summary-report) in the Migrations page is in preview. This report displays the results of the schema analysis and provides bulk actions you can apply to update the schema, is in preview.

### SQL Shell

The [SQL Shell]({% link cockroachcloud/sql-shell.md %}) in the CockroachDB {{ site.data.products.cloud }} Console is in preview. The SQL Shell enables you to run [queries]({% link {{ page.version.version }}/selection-queries.md %}) on your CockroachDB {{ site.data.products.cloud }} cluster directly from your browser.

### Restore a CockroachDB {{ site.data.products.dedicated }} cluster from a managed-service backup

[Restoring an entire CockroachDB {{ site.data.products.dedicated }} cluster from a managed-service backup]({% link cockroachcloud/use-managed-service-backups.md %}#restore-a-cluster) is in preview. Managed-service backups are automated backups of clusters in CockroachDB {{ site.data.products.cloud }} that are stored in Cockroach Labs' cloud storage.

### Log SQL Statistics to Datadog

You can [log `sampled_query` and `sampled_transaction` events to Datadog]({% link {{ page.version.version }}/log-sql-statistics-to-datadog.md %}) for finer granularity and long-term retention of SQL statistics, and to reduce the performance impacts of logging these events locally. The [`sampled_query` events]({% link {{ page.version.version }}/eventlog.md %}#sampled_query) and the [`sampled_transaction` events]({% link {{ page.version.version }}/eventlog.md %}#sampled_transaction) contain common SQL event and execution details for transactions, and statements.

CockroachDB supports a built-in integration with [Datadog](https://www.datadoghq.com/) which sends these events as logs via the [Datadog HTTP API](https://docs.datadoghq.com/api/latest/logs/). This integration is the recommended path to achieve high throughput data ingestion, which will in turn provide more query and transaction events for greater workload observability.

### Custom Metrics Chart page for CockroachDB {{ site.data.products.cloud }} clusters

The [**Custom Metrics Chart** page]({% link cockroachcloud/custom-metrics-chart-page.md %}) for CockroachDB {{ site.data.products.cloud }} clusters allows you to create custom charts showing the time series data for an available metric or combination of metrics.

### Log SQL Statistics to Datadog

Configure [logging of `sampled_query` events to Datadog]({% link {{ page.version.version }}/log-sql-statistics-to-datadog.md %}) for finer granularity and long-term retention of SQL statistics. The [`sampled_query` events]({% link {{ page.version.version }}/eventlog.md %}#sampled_query) contain common SQL event and execution details for sessions, transactions, and statements.

CockroachDB supports a built-in integration with [Datadog](https://www.datadoghq.com/) which sends query events as logs via the [Datadog HTTP API](https://docs.datadoghq.com/api/latest/logs/). This integration is the recommended path to achieve high throughput data ingestion, which will in turn provide more query events for greater workload observability.

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

### Check for constraint violations with `SCRUB`

Checks the consistency of [`UNIQUE`]({% link {{ page.version.version }}/unique.md %}) indexes, [`CHECK`]({% link {{ page.version.version }}/check.md %}) constraints, and more. Partially implemented; see [cockroachdb/cockroach#10425](https://github.com/cockroachdb/cockroach/issues/10425) for details.

{{site.data.alerts.callout_info}}
This example uses the `users` table from our open-source, fictional peer-to-peer vehicle-sharing application, [MovR]({% link {{ page.version.version }}/movr.md %}).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
>  EXPERIMENTAL SCRUB table movr.users;
~~~

~~~
 job_uuid |        error_type        | database | table |                       primary_key                        |         timestamp         | repaired |                                                                                                                                                                         details
----------+--------------------------+----------+-------+----------------------------------------------------------+---------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
          | index_key_decoding_error | movr     | users | ('boston','0009eeb5-d779-4bf8-b1bd-8566533b105c')        | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'06484 Christine Villages\\nGrantport, TN 01572'", "city": "'boston'", "credit_card": "'4634253150884'", "id": "'0009eeb5-d779-4bf8-b1bd-8566533b105c'", "name": "'Jessica Webb'"}}
          | index_key_decoding_error | movr     | users | ('los angeles','0001252c-fc16-4006-b6dc-c6b1a0fd1f5b')   | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'91309 Warner Springs\\nLake Danielmouth, PR 33400'", "city": "'los angeles'", "credit_card": "'3584736360686445'", "id": "'0001252c-fc16-4006-b6dc-c6b1a0fd1f5b'", "name": "'Rebecca Gibson'"}}
          | index_key_decoding_error | movr     | users | ('new york','000169a5-e337-4441-b664-dae63e682980')      | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'0787 Christopher Highway Apt. 363\\nHamptonmouth, TX 91864-2620'", "city": "'new york'", "credit_card": "'4578562547256688'", "id": "'000169a5-e337-4441-b664-dae63e682980'", "name": "'Christopher Johnson'"}}
          | index_key_decoding_error | movr     | users | ('paris','00089fc4-e5b1-48f6-9f0b-409905f228c4')         | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'46735 Martin Summit\\nMichaelview, OH 10906-5889'", "city": "'paris'", "credit_card": "'5102207609888778'", "id": "'00089fc4-e5b1-48f6-9f0b-409905f228c4'", "name": "'Nicole Fuller'"}}
          | index_key_decoding_error | movr     | users | ('rome','000209fc-69a1-4dd5-8053-3b5e5769876d')          | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'473 Barrera Vista Apt. 890\\nYeseniaburgh, CO 78087'", "city": "'rome'", "credit_card": "'3534605564661093'", "id": "'000209fc-69a1-4dd5-8053-3b5e5769876d'", "name": "'Sheryl Shea'"}}
          | index_key_decoding_error | movr     | users | ('san francisco','00058767-1e83-4e18-999f-13b5a74d7225') | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'5664 Acevedo Drive Suite 829\\nHernandezview, MI 13516'", "city": "'san francisco'", "credit_card": "'376185496850202'", "id": "'00058767-1e83-4e18-999f-13b5a74d7225'", "name": "'Kevin Turner'"}}
          | index_key_decoding_error | movr     | users | ('seattle','0002e904-1256-4528-8b5f-abad16e695ff')       | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'81499 Samuel Crescent Suite 631\\nLake Christopherborough, PR 50401'", "city": "'seattle'", "credit_card": "'38743493725890'", "id": "'0002e904-1256-4528-8b5f-abad16e695ff'", "name": "'Mark Williams'"}}
          | index_key_decoding_error | movr     | users | ('washington dc','00007caf-2014-4696-85b0-840e7d8b6db9') | 2018-10-18 16:00:38.65916 | f        | {"error_message": "key ordering did not match datum ordering. IndexDescriptor=ASC", "index_name": "primary", "row_data": {"address": "e'4578 Holder Trafficway\\nReynoldsside, IL 23520-7418'", "city": "'washington dc'", "credit_card": "'30454993082943'", "id": "'00007caf-2014-4696-85b0-840e7d8b6db9'", "name": "'Marie Miller'"}}
(8 rows)
~~~

### Super regions

[Super regions]({% link {{ page.version.version }}/multiregion-overview.md %}#super-regions) allow you to define a set of database regions such that schema objects will have all of their replicas stored _only_ in regions that are members of the super region. The primary use case for super regions is data domiciling.

### Export metrics from CockroachDB {{ site.data.products.dedicated }} clusters

CockroachDB {{ site.data.products.dedicated }} users can use the [Cloud API]({% link cockroachcloud/cloud-api.md %}) to configure [metrics export]({% link cockroachcloud/export-metrics.md %}) to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) or [Datadog](https://www.datadoghq.com/). Once the export is configured, metrics will flow from all nodes in all regions of your CockroachDB {{ site.data.products.dedicated }} cluster to your chosen cloud metrics sink.

### Show range information for a specific row

The [`SHOW RANGE ... FOR ROW`]({% link {{ page.version.version }}/show-range-for-row.md %}) statement shows information about a [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) for a particular row of data. This information is useful for verifying how SQL data maps to underlying ranges, and where the replicas for a range are located.

### Alter column types

CockroachDB supports [altering the column types]({% link {{ page.version.version }}/alter-table.md %}#alter-column-data-types) of existing tables, with certain limitations. To enable altering column types, set the `enable_experimental_alter_column_type_general` [session variable]({% link {{ page.version.version }}/show-vars.md %}) to `true`.

### Temporary objects

[Temporary tables]({% link {{ page.version.version }}/temporary-tables.md %}), [temporary views]({% link {{ page.version.version }}/views.md %}#temporary-views), and [temporary sequences]({% link {{ page.version.version }}/create-sequence.md %}#temporary-sequences) are in preview in CockroachDB. If you create too many temporary objects in a session, the performance of DDL operations will degrade. Performance limitations could persist long after creating the temporary objects. For more details, see [cockroachdb/cockroach#46260](https://github.com/cockroachdb/cockroach/issues/46260).

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

### Core implementation of changefeeds

The [`EXPERIMENTAL CHANGEFEED FOR`]({% link {{ page.version.version }}/changefeed-for.md %}) statement creates a new core changefeed, which streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled. A core changefeed can watch one table or multiple tables in a comma-separated list.

### Changefeed metrics labels

{% include {{ page.version.version }}/cdc/metrics-labels.md %}

For usage details, see the [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) page.

### Google Pub/Sub sink for changefeeds

Changefeeds can deliver messages to a [Google Cloud Pub/Sub sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub), which is integrated with Google Cloud Platform.

### Multiple active portals

The multiple active portals feature of the Postgres wire protocol (pgwire) is available, with limitations.  For more information, see [Multiple active portals]({% link {{ page.version.version }}/postgresql-compatibility.md %}#multiple-active-portals).

### Physical Cluster Replication

{% include_cached new-in.html version="v23.2" %}[Physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) continuously sends all data at the byte level from a primary cluster to an independent standby cluster. Existing data and ongoing changes on the active primary cluster, which is serving application data, replicate asynchronously to the passive standby cluster. In a disaster recovery scenario, you can cut over from the unavailable primary cluster to the standby cluster. This will stop the replication stream, reset the standby cluster to a point in time where all ingested data is consistent, and mark the standby as ready to accept application traffic. Physical cluster replication is in preview for CockroachDB Self-Hosted, and is an [enterprise-only]({% link {{ page.version.version }}/enterprise-licensing.md %}) feature. To share feedback and/or issues, contact [Support](https://support.cockroachlabs.com/hc).

### Super regions

[Super regions]({% link {{ page.version.version }}/multiregion-overview.md %}#super-regions) allow you to define a set of database regions such that schema objects will have all of their replicas stored _only_ in regions that are members of the super region. The primary use case for super regions is data domiciling.

### `cockroach` commands

The table below lists the [`cockroach` commands]({% link {{ page.version.version }}/cockroach-commands.md %}) available in preview in CockroachDB.

Command                                     | Description
--------------------------------------------+-------------
[`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %})     | Start a temporary, in-memory CockroachDB cluster, and open an interactive SQL shell to it.
[`cockroach sqlfmt`]({% link {{ page.version.version }}/cockroach-sqlfmt.md %}) | Reformat SQL queries for enhanced clarity.

## See Also

- [`SHOW {session variable}`]({% link {{ page.version.version }}/show-vars.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %})
- [`ALTER TABLE ... EXPERIMENTAL_AUDIT`]({% link {{ page.version.version }}/alter-table.md %}#experimental_audit)
- [`SHOW TRACE FOR SESSION`]({% link {{ page.version.version }}/show-trace.md %})
- [`SHOW RANGE ... FOR ROW`]({% link {{ page.version.version }}/show-range-for-row.md %})
