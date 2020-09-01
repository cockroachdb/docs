---
title: Overview of APIs and interfaces
summary: High-level list of programmable and other interfaces in CockroachDB.
toc: true
---

The external interfaces of CockroachDB are:

- The [command line
  interfaces](programmability-of-command-line-interfaces.html): the inputs
  and outputs of the [`cockroach` sub-commands](cockroach-commands.html).

- The SQL interfaces:
  - The [Client-server protocol](client-server-protocol.html) for SQL clients (pgwire): the byte structure of the flow of data between CockroachDB clients and nodes.
  - The [SQL functional behavior](sql-functional-behavior-guarantees.html): which row sets / result counts are produced for a given input query.
  - The [SQL session variables](programmability-of-session-variables.html): the list and effects of session variables (`SHOW all` / `SET`).
  - The [SQL introspection interfaces](introspection-interfaces.html): the contents of `information_schema`, `pg_catalog` and `crdb_internal` tables.
  - The [SQL operational complexity](time-and-memory-cost-model.html): max time and space complexity of individual SQL operators as a function of the input and operational parameters.

- [The remaining interfaces](programmability-of-other-interfaces.html):
  - The [Web UI components](programmability-of-other-interfaces.html#web-ui-components): the in-browser cluster visualization and management panel.
  - The [HTTP status endpoints](programmability-of-other-interfaces.html#http-status-endpoints): the direct URLs that provide access to CockroachDB status variables.
  - The [RPC endpoints](programmability-of-other-interfaces.html#rpc-endpoints): the HTTP and RPC endpoints tht provide access to CockroachDB internal status and APIs.
  - The [Cluster Settings](programmability-of-other-interfaces.html#cluster-settings): the list and effects of [cluster-wide settings](cluster-settings.html).

Each of these interfaces have separate public/programmable,
public/non-programmable and reserved parts. These are detailed in the
respective pages.

## See also

- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
