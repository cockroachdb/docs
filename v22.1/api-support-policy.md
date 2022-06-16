---
title: API Support Policy
summary: Learn about Cockroach Labs' policy for supporting CockroachDB APIs.
toc: true
docs_area: reference
---

Cockroach Labs exposes various application programming interfaces (APIs).

The vast majority of changes to these interfaces are seamless additions of new functionality. However, some changes are backward-incompatible and may require you to adjust your integration. Changes to an API are introduced according to its *stability guarantees*, which depend on its *support policy*.

This page includes the following information:

- Our [support policies](#support-policies) for each type of API.
- Our [stability guarantees](#stability-guarantees) for supported APIs.
- A summary of [APIs](#apis) that CockroachDB makes available.

## Support policies

| Type             | Description                                                               | Stability guarantees |
|------------------|---------------------------------------------------------------------------|----------------------|
| Programmable     | Supported for interfacing with third-party automated tools.               | ✓                    |
| Non-programmable | Supported for consumption by humans. Not supported for automation.        |                      |
| Reserved         | Intended for use by CockroachDB developers. Not supported for public use. |                      |

### Stability guarantees

An API is *stable* if it does not receive backward-incompatible changes. API stability implies programmability.

The following stability guarantees apply to **programmable** APIs. These APIs remain stable within major versions:

- Backward-incompatible changes may be introduced in new major versions.
- Backward-compatible changes may be introduced in new minor versions.

Stability guarantees do **not** apply to non-programmable and reserved APIs:

- Backward-incompatible changes may be introduced in new minor and major versions.

#### API changes

The following types of API changes qualify as *backward-incompatible* (or "breaking changes"):

- Removal of an endpoint, SQL statement, [built-in function](functions-and-operators.html#built-in-functions), [cluster setting](cluster-settings.html), or session variable.
- Addition or removal of a mandatory or optional command-line flag.
- Change in SQL statement syntax, HTTP request format, HTTP response format, or structured log format.
- Change in data type, default value, or behavior of a [built-in function](functions-and-operators.html#built-in-functions), [cluster setting](cluster-settings.html), or session variable.
- Change to [authorization](security-reference/authorization.html) requirements.

The following types of API changes qualify as *backward-compatible*. This list is not exhaustive.

- Removal or change of any functionality documented or named as "experimental", "beta", or otherwise not fully supported.
- Deprecation of any functionality without removal.
- Addition or removal of a metric.
- Change in SQL response format or unstructured log format.

{{site.data.alerts.callout_success}}
Backward-incompatible changes to CockroachDB, including those affecting programmable APIs, are identified in the [release notes](../releases/index.html#production-releases) for major CockroachDB versions. Users are asked to [consider backward-incompatible changes before upgrading](upgrade-cockroach-version.html#review-breaking-changes) to a new CockroachDB version.
{{site.data.alerts.end}}

#### Versioning

A programmable API may be assigned a new version number in two situations:

- When changes are introduced to the API.
- When a new CockroachDB version is released.

The assignment of a **major** version number to a [programmable API](#support-policies) indicates that the API is stable within that major version.

## APIs

{{site.data.alerts.callout_info}}
A *mixed* API includes both programmable and non-programmable features. [Stability guarantees](#stability-guarantees) apply to the programmable features.
{{site.data.alerts.end}}

### CockroachDB

These interfaces are hosted by the CockroachDB application binary. They are available in {{ site.data.products.serverless }}, {{ site.data.products.dedicated }}, and {{ site.data.products.core }}.

| Interface                                                               | Type             | Versioning                                                                             | Notes                                                                                                                                                        |
|-------------------------------------------------------------------------|------------------|----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [PostgreSQL wire protocol](postgresql-compatibility.html)               | Programmable     | Versioned concurrently with CockroachDB.                                               | Compatible with PostgreSQL version 13.                                                                                                                       |
| [SQL](sql-feature-support.html)                                         | Mixed            | Versioned concurrently with CockroachDB.                                               | Programmability varies by SQL statement. For example, `SELECT` statements are programmable and `SHOW` statements are not programmable.                       |
| [`crdb_internal` system catalog](crdb-internal.html)                    | Mixed            | Versioned concurrently with CockroachDB.                                               | A subset of the `crdb_internal` system catalog is programmable, as defined [here](crdb-internal.html#tables).                                                |
| [`information_schema` system catalog](information-schema.html)          | TBC in review    | Versioned concurrently with CockroachDB.                                               |                                                                                                                                                              |
| [`pg_catalog` system catalog](pg-catalog.html)                          | TBC in review    | Versioned concurrently with CockroachDB.                                               |                                                                                                                                                              |
| [`pg_extension` system catalog](pg-extension.html)                      | TBC in review    | Versioned concurrently with CockroachDB.                                               |                                                                                                                                                              |
| [Health Endpoints](monitoring-and-alerting.html#health-endpoints)       | Programmable     | No new versions forthcoming.                                                           |                                                                                                                                                              |
| [Prometheus Endpoint](monitoring-and-alerting.html#prometheus-endpoint) | Programmable     | No new versions forthcoming.                                                           | Although this endpoint is not versioned, individual metrics may be added or removed in each CockroachDB release. No changes are expected to response format. |
| [Cluster API](cluster-api.html)                                         | Programmable     | [Versioned independently from CockroachDB.](cluster-api.html#versioning-and-stability) |                                                                                                                                                              |
| [Logging](logging-overview.html)                                        | Mixed            | Versioned concurrently with CockroachDB.                                               | Programmability varies by [event type](eventlog.html). Structured events are programmable and unstructured events are not programmable.                      |
| [`cockroach` commands](cockroach-commands.html)                         | Non-programmable | N/A                                                                                    |                                                                                                                                                              |
| [DB Console](ui-overview.html)                                          | Non-programmable | N/A                                                                                    | For programmable access to the information present in this tool, use the [Cluster API](cluster-api.html).                                                    |
| [Advanced Debug endpoints](ui-debug-pages.html)                         | Reserved         | N/A                                                                                    |                                                                                                                                                              |

### {{ site.data.products.db }}

These interfaces are available in {{ site.data.products.serverless-plan }} and {{ site.data.products.dedicated }}.

| Interface                                                           | Type             | Versioning                                | Notes                                                                                                                                   |
|---------------------------------------------------------------------|------------------|-------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `ccloud` CLI                                                        | Mixed            | Versioned independently from CockroachDB. | Default output is non-programmable. Specify the `–json` argument in the CLI for programmable output that follows the versioning scheme. |
| [{{ site.data.products.db }} API](../cockroachcloud/cloud-api.html) | Programmable     | Versioned independently from CockroachDB. |                                                                                                                                         |
| {{ site.data.products.db }} Console                                 | Non-programmable | N/A                                       |                                                                                                                                         |

## See also

- [Release Support Policy](../releases/release-support-policy.html)
- [Monitoring and Alerting](monitoring-and-alerting.html)