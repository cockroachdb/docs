---
title: API Support Policy
summary: Learn about Cockroach Labs' policy for supporting CockroachDB APIs.
toc: true
docs_area: reference
---

Cockroach Labs exposes various application programming interfaces (APIs).

The vast majority of changes to these interfaces are seamless additions of new functionality. However, some changes are backward-incompatible and may require you to adjust your integration. Changes to an API are introduced according to its support policy.

This page includes the following information:

- Our API [support policies](#support-policies).
- Our definitions of [backward-incompatible](#backward-incompatible-changes) and [backward-compatible](#backward-compatible-changes) changes.
- A summary of [APIs](#apis) that CockroachDB makes available.

## Support policies

| Type     | Description                                                               | Guarantees                                                                                                                                                                                                         |
|----------|---------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Stable   | Supported for interfacing with third-party automated tools.               | [Backward-incompatible changes](#backward-incompatible-changes) may be introduced in new major versions.<br />[Backward-compatible changes](#backward-compatible-changes) may be introduced in new patch versions. |
| Unstable | Supported for consumption by humans. Not supported for automation.        | [Backward-incompatible changes](#backward-incompatible-changes) may be introduced in new major and patch versions.                                                                                                 |
| Reserved | Intended for use by CockroachDB developers. Not supported for public use. | N/A                                                                                                                                                                                                                |

Backward-incompatible changes to **stable APIs** are highlighted in the [release notes]({% link releases/index.md %}#production-releases) for major CockroachDB versions. Users are asked to [consider backward-incompatible changes before upgrading]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#review-breaking-changes) to a new CockroachDB version.

### Backward-incompatible changes

A change is *backward-incompatible* when existing automation requires an update in order to continue working. These changes are also known as "breaking changes":

- Removal or renaming of an endpoint, [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#built-in-functions), [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), or session variable.
- Removal or renaming of a SQL statement or syntax.
- Addition, removal, or renaming of a mandatory command-line flag or HTTP field.
- Removal or renaming of an optional command-line flag or HTTP field.
- Change in behavior of a [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#built-in-functions) without fixing a bug or PostgreSQL incompatibility.
- Removal or renaming of possible values in an `ENUM` session variable or [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}).
- Change in non-interactive [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) shell input or output.
- Change in behavior of a [structured log event]({% link {{ page.version.version }}/eventlog.md %}) type, including the [logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels) it is emitted on.
- Renaming of a [structured log event]({% link {{ page.version.version }}/eventlog.md %}) type or payload field.

### Backward-compatible changes

A change is *backward-compatible* when existing automation continues to work without updates.

The following list is not exhaustive:

- Addition of an optional command-line flag or HTTP field.
- Removal or change of any functionality documented as Preview or otherwise not fully supported.
- Marking functionality as deprecated via in-line documentation, hints, or warnings without removing it altogether.
- Addition or removal of a metric.
- Addition of a structured log event type or payload field.
- Addition of a new [logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels).

### Versioning

A stable API may be assigned a new version number in two situations:

- When changes are introduced to the API.
- When a new CockroachDB version is released.

## APIs

{{site.data.alerts.callout_info}}
A *mixed* API includes both stable and unstable features.
{{site.data.alerts.end}}

| Interface                                        | Policy   | Versioning                               | Notes                                                                                                                                                                                                                      | Availability                                                 |
|--------------------------------------------------|----------|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| [PostgreSQL wire protocol][pg-wire]              | Stable   | Versioned concurrently with CockroachDB  | Compatible with PostgreSQL version 13.                                                                                                                                                                                     | All products                                                 |
| [SQL syntax][sql-syntax]                         | Mixed    | Versioned concurrently with CockroachDB  | Best-effort policy to add and not remove SQL syntax. All `SHOW` statements are unstable, as described in the following row.                                                                                                | All products                                                 |
| `SHOW` SQL statements                            | Unstable | Versioned concurrently with CockroachDB  | This includes all documented SQL `SHOW` statements, which display unstable output.                                                                                                                                         | All products                                                 |
| [information_schema system catalog][info-schema] | Stable   | Versioned concurrently with CockroachDB  |                                                                                                                                                                                                                            | All products                                                 |
| [pg_catalog system catalog][pg-catalog]          | Stable   | Versioned concurrently with CockroachDB  |                                                                                                                                                                                                                            | All products                                                 |
| [pg_extension system catalog][pg-extension]      | Stable   | Versioned concurrently with CockroachDB  |                                                                                                                                                                                                                            | All products                                                 |
| [crdb_internal system catalog][crdb-internal]    | Reserved | Versioned concurrently with CockroachDB  | A [subset of the crdb_internal system catalog][crdb-internal-subset] is stable.                                                                                                                                            | All products                                                 |
| [Built-in functions][built-in-functions]         | Mixed    | Versioned concurrently with CockroachDB  | Any built-in functions prefixed with `crdb_internal` are reserved.                                                                                                                                                         | All products                                                 |
| [cockroach commands][cockroach-commands]         | Mixed    | Versioned concurrently with CockroachDB  | Stability considerations for `cockroach sql` are described in the following row.                                                                                                                                           | All products                                                 |
| [cockroach sql shell][cockroach-sql]             | Mixed    | Versioned concurrently with CockroachDB  | When used non-interactively, `cockroach sql` is stable unless your usage relies on unstable input or output. Any `cockroach sql` output prefixed by `#` is unstable. When used interactively, `cockroach sql` is unstable. | All products                                                 |
| [Health endpoints][health-endpoints]             | Stable   | No new versions forthcoming.             |                                                                                                                                                                                                                            | All products                                                 |
| [Prometheus endpoint][prometheus-endpoint]       | Stable   | No new versions forthcoming.             | Although this endpoint is not versioned, individual metrics may be added or removed in each CockroachDB release. No changes are expected to response format.                                                               | CockroachDB Standard, CockroachDB Advanced, CockroachDB Core |
| [Cluster API][cluster-api]                       | Mixed    | Versioned independently from CockroachDB | For information on supported endpoints, versioning, and stability, refer to [Cluster API][cluster-api].                                                                                                                    | CockroachDB Advanced, CockroachDB Core                       |
| [DB Console][db-console]                         | Unstable | N/A                                      | For stable access to the information present in this tool, use the [Cluster API][cluster-api].                                                                                                                             | CockroachDB Advanced, CockroachDB Core |
| [Logging][logging-overview]                      | Mixed    | Versioned concurrently with CockroachDB  | Stability varies by [event type][eventlog]. Structured events are stable and unstructured events are unstable.                                                                                                             | CockroachDB Standard, CockroachDB Advanced, CockroachDB Core |
| [ccloud CLI][ccloud-cli]                         | Mixed    | Versioned independently from CockroachDB | Default output is unstable. Specify the `–json` argument in the CLI for stable output that follows the versioning scheme.                                                                                                  | CockroachDB Cloud                                            |
| [CockroachDB Cloud API][cloud-api]               | Stable   | Versioned independently from CockroachDB |                                                                                                                                                                                                                            | CockroachDB Cloud                                            |
| [CockroachDB Cloud Console][cloud-console]       | Unstable | N/A                                      |                                                                                                                                                                                                                            | CockroachDB Cloud                                            |
| [Advanced Debug endpoints][ui-debug-pages]       | Reserved | N/A                                      |                                                                                                                                                                                                                            | N/A                                                          |

[pg-wire]: {% link {{ page.version.version }}/postgresql-compatibility.md %}
[sql-syntax]: {% link {{ page.version.version }}/sql-feature-support.md %}
[info-schema]: {% link {{ page.version.version }}/information-schema.md %}
[pg-catalog]: {% link {{ page.version.version }}/pg-catalog.md %}
[pg-extension]: {% link {{ page.version.version }}/pg-extension.md %}
[crdb-internal]: {% link {{ page.version.version }}/crdb-internal.md %}
[crdb-internal-subset]: {% link {{ page.version.version }}/crdb-internal.md %}#tables
[built-in-functions]: {% link {{ page.version.version }}/functions-and-operators.md %}#built-in-functions
[cockroach-commands]: {% link {{ page.version.version }}/cockroach-commands.md %}
[cockroach-sql]: {% link {{ page.version.version }}/cockroach-sql.md %}
[health-endpoints]: {% link {{ page.version.version }}/monitoring-and-alerting.md %}#health-endpoints
[prometheus-endpoint]: {% link {{ page.version.version }}/monitoring-and-alerting.md %}#prometheus-endpoint
[cluster-api]: {% link {{ page.version.version }}/cluster-api.md %}
[db-console]: {% link {{ page.version.version }}/ui-overview.md %}
[logging-overview]: {% link {{ page.version.version }}/logging-overview.md %}
[eventlog]: {% link {{ page.version.version }}/eventlog.md %}
[ccloud-cli]: {% link cockroachcloud/ccloud-get-started.md %}
[cloud-api]: {% link cockroachcloud/cloud-api.md %}
[cloud-console]: {% link cockroachcloud/create-an-account.md %}#log-in-to-your-account
[ui-debug-pages]: {% link {{ page.version.version }}/ui-debug-pages.md %}

## See also

- [Release Support Policy]({% link releases/release-support-policy.md %})
- [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %})
