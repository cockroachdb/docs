---
title: Session Variables
summary: A list of supported session variables that can be used with the SET statement to modify the current configuration of the client session.
toc: true
docs_area: reference.sql
---

The [`SET`]({{ page.version.version }}/set-vars.md) statement can modify one of the session configuration variables. These can also be queried via [`SHOW`]({{ page.version.version }}/show-vars.md). By default, session variable values are set for the duration of the current session.

CockroachDB supports setting session variables for the duration of a single transaction, using [the `LOCAL` keyword]({{ page.version.version }}/set-vars.md#set-local).

## Supported variables


## See also

- [`SET {session variable}`]({{ page.version.version }}/set-vars.md)
- [`SET TRANSACTION`]({{ page.version.version }}/set-transaction.md)
- [`SET CLUSTER SETTING`]({{ page.version.version }}/set-cluster-setting.md)
- [`SHOW {session variable}`]({{ page.version.version }}/show-vars.md)
- [The `TIMESTAMP` and `TIMESTAMPTZ` data types.]({{ page.version.version }}/timestamp.md)
- [`SHOW TRACE FOR SESSION`]({{ page.version.version }}/show-trace.md)
- [`pg_catalog`]({{ page.version.version }}/pg-catalog.md)
- [`SHOW DEFAULT SESSION VARIABLES FOR ROLE`]({{ page.version.version }}/show-default-session-variables-for-role.md)