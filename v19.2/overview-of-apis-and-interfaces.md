---
title: Overview of CockroachDB Interfaces
summary: High-level list of interfaces to CockroachDB.
toc: true
---

Interfaces to CockroachDB include:

- The [command-line interface](cockroach-commands.html), which consists of the `cockroach` commands.
- The [SQL interface](sql-feature-support.html), which includes standard SQL with CockroachDB and PostgreSQL extensions.

    The CockroachDB SQL interface also includes:
  - The client-server protocol for SQL clients. CockroachDB uses a subset of PostgreSQL's low level client-server byte protocol, called [pgwire](https://godoc.org/github.com/cockroachdb/cockroach/pkg/sql/pgwire), for data flow between CockroachDB clients and nodes.
  - SQL [session variables](show-vars.html), which configure a SQL session.
  - SQL introspection interfaces, as exposed by the `information_schema`, `pg_catalog` and `crdb_internal` schemas.
- The [Admin UI](admin-ui-overview.html), which consists of an in-browser cluster visualization and management panel.
- The [HTTP status endpoints](monitoring-and-alerting.html), which provide access to CockroachDB status variables.
- The [RPC endpoints](https://github.com/cockroachdb/cockroach/blob/master/pkg/server/serverpb/admin.proto), which provide access to CockroachDB internal status and APIs.
- The [cluster settings](cluster-settings.html), which configure nodes in a cluster.

Each interface has parts that are programmable and non-programmable. For more information about the stability categories of interfaces for programmability, see [Interface Types](interface-types.html).

## See also

- [Interface Types](interface-types.html)
- [Stability Guarantees](compatibility-and-programmability-guarantees.html)
