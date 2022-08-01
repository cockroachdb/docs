---
title: API Support Policy
summary: Learn about Cockroach Labs's policy for supporting CockroachDB APIs.
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
| Stable   | Supported for interfacing with third-party automated tools.               | [Backward-incompatible changes](#backward-incompatible-changes) may be introduced in new major versions.<br />[Backward-compatible changes](#backward-compatible-changes) may be introduced in new minor versions. |
| Unstable | Supported for consumption by humans. Not supported for automation.        | [Backward-incompatible changes](#backward-incompatible-changes) may be introduced in new minor and major versions.                                                                                                 |
| Reserved | Intended for use by CockroachDB developers. Not supported for public use. | N/A                                                                                                                                                                                                                |
Backward-incompatible changes to **stable APIs** are highlighted in the [release notes](../releases/index.html#production-releases) for major CockroachDB versions. Users are asked to [consider backward-incompatible changes before upgrading](upgrade-cockroach-version.html#review-breaking-changes) to a new CockroachDB version.

### Backward-incompatible changes

The following changes are also known as "breaking changes":

- Removal or renaming of an endpoint, [built-in function](functions-and-operators.html#built-in-functions), [cluster setting](cluster-settings.html), or session variable.
- Removal or renaming of a SQL statement or syntax.
- Addition, removal, or renaming of a mandatory command-line flag or HTTP field.
- Removal or renaming of an optional command-line flag or HTTP field.
- Change in behavior of a [built-in function](functions-and-operators.html#built-in-functions) without fixing a bug or PostgreSQL incompatibility.
- Removal or renaming of possible values in an `ENUM` session variable or [cluster setting](cluster-settings.html).
- Change in behavior of a [structured log event](eventlog.html) type, including the [logging channel](logging-overview.html#logging-channels) it is emitted on.
- Renaming of a [structured log event](eventlog.html) type or payload field.

### Backward-compatible changes

The following list is not exhaustive:

- Addition of an optional command-line flag or HTTP field.
- Change in non-interactive [`cockroach sql`](cockroach-sql.html) shell input or output.
- Removal or change of any functionality documented as Preview or otherwise not fully supported.
- Marking functionality as deprecated via in-line documentation, hints, or warnings without removing it altogether.
- Addition or removal of a metric.
- Addition of a structured log event type or payload field.
- Addition of a new [logging channel](logging-overview.html#logging-channels).

### Versioning

A stable API may be assigned a new version number in two situations:

- When changes are introduced to the API.
- When a new CockroachDB version is released.

## APIs

{{site.data.alerts.callout_info}}
A *mixed* API includes both stable and unstable features.
{{site.data.alerts.end}}

| Interface                                                               | Policy   | Versioning                                                                             | Notes                                                                                                                                                        | Availability                                                      |
|-------------------------------------------------------------------------|----------|----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| [PostgreSQL wire protocol](postgresql-compatibility.html)               | Stable   | Versioned concurrently with CockroachDB.                                               | Compatible with PostgreSQL version 13.                                                                                                                       | All products                                                      |
| [SQL syntax](sql-feature-support.html)                                  | Mixed    | Versioned concurrently with CockroachDB.                                               | Best-effort policy to add and not remove SQL syntax. All `SHOW` statements are unstable, as described in the following row.                                  | All products                                                      |
| `SHOW` SQL statements                                                   | Unstable | Versioned concurrently with CockroachDB.                                               | This includes all documented SQL `SHOW` statements, which display unstable output.                                                                           | All products                                                      |
| [`information_schema` system catalog](information-schema.html)          | Stable   | Versioned concurrently with CockroachDB.                                               |                                                                                                                                                              | All products                                                      |
| [`pg_catalog` system catalog](pg-catalog.html)                          | Stable   | Versioned concurrently with CockroachDB.                                               |                                                                                                                                                              | All products                                                      |
| [`pg_extension` system catalog](pg-extension.html)                      | Stable   | Versioned concurrently with CockroachDB.                                               |                                                                                                                                                              | All products                                                      |
| [`crdb_internal` system catalog](crdb-internal.html)                    | Reserved | Versioned concurrently with CockroachDB.                                               | A subset of the `crdb_internal` system catalog is stable, as defined [here](crdb-internal.html#tables).                                                      | All products                                                      |
| [Built-in functions](functions-and-operators.html#built-in-functions)   | Mixed    | Versioned concurrently with CockroachDB.                                               | Any built-in functions prefixed with `crdb_internal` are reserved.                                                                                           | All products                                                      |
| [`cockroach` commands](cockroach-commands.html)                         | Mixed    | Versioned concurrently with CockroachDB.                                               |                                                                                                                                                              | All products                                                      |
| [Health Endpoints](monitoring-and-alerting.html#health-endpoints)       | Stable   | No new versions forthcoming.                                                           |                                                                                                                                                              | All products                                                      |
| [Prometheus Endpoint](monitoring-and-alerting.html#prometheus-endpoint) | Stable   | No new versions forthcoming.                                                           | Although this endpoint is not versioned, individual metrics may be added or removed in each CockroachDB release. No changes are expected to response format. | {{ site.data.products.dedicated }}, {{ site.data.products.core }} |
| [Cluster API](cluster-api.html)                                         | Mixed    | [Versioned independently from CockroachDB.](cluster-api.html#versioning-and-stability) | For information on supported endpoints, see [Cluster API](cluster-api.html).                                                                                 | {{ site.data.products.dedicated }}, {{ site.data.products.core }} |
| [DB Console](ui-overview.html)                                          | Unstable | N/A                                                                                    | For stable access to the information present in this tool, use the [Cluster API](cluster-api.html).                                                          | {{ site.data.products.dedicated }}, {{ site.data.products.core }} |
| [Logging](logging-overview.html)                                        | Mixed    | Versioned concurrently with CockroachDB.                                               | Stability varies by [event type](eventlog.html). Structured events are stable and unstructured events are unstable.                                          | {{ site.data.products.core }}                                     |
| `ccloud` CLI                                                            | Mixed    | Versioned independently from CockroachDB.                                              | Default output is unstable. Specify the `–json` argument in the CLI for stable output that follows the versioning scheme.                                    | {{ site.data.products.db }}                                       |
| [{{ site.data.products.db }} API](../cockroachcloud/cloud-api.html)     | Stable   | Versioned independently from CockroachDB.                                              |                                                                                                                                                              | {{ site.data.products.db }}                                       |
| {{ site.data.products.db }} Console                                     | Unstable | N/A                                                                                    |                                                                                                                                                              | {{ site.data.products.db }}                                       |
| [Advanced Debug endpoints](ui-debug-pages.html)                         | Reserved | N/A                                                                                    |                                                                                                                                                              | N/A                                                               |

## See also

- [Release Support Policy](../releases/release-support-policy.html)
- [Monitoring and Alerting](monitoring-and-alerting.html)