---
title: cockroach statement-diag
summary: Use statement-diag to manage and download statement diagnostics bundles.
toc: true
---

 The `cockroach statement-diag` [command](cockroach-commands.html) can be used to manage and download statement diagnostics bundles generated from the [DB Console](ui-statements-page.html#diagnostics) or [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#explain-analyze-debug).

## Required privileges

Only members of the `admin` role can run `cockroach statement-diag`. By default, the `root` user belongs to the `admin` role.

## Subcommands

Subcommand | Usage
-----------|------
`list` | List available statement diagnostics bundles and outstanding activation requests.
`download` | Download a specified diagnostics bundle into a `.zip` file.
`delete` | Delete a statement diagnostics bundle(s).
`cancel` | Cancel an outstanding activation request(s).

## Synopsis

List available statement diagnostics bundles and outstanding activation requests:

~~~ shell
$ cockroach statement-diag list <flags>
~~~

Download a specified diagnostics bundle into a `.zip` file:

~~~ shell
$ cockroach statement-diag download <diagnostics ID> <bundle filename> <flags>
~~~

Delete a statement diagnostics bundle:

~~~ shell
$ cockroach statement-diag delete <diagnostics ID> <flags>
~~~

Delete all statement diagnostics bundles:

~~~ shell
$ cockroach statement-diag delete --all <flags>
~~~

Cancel an outstanding activation request:

~~~ shell
$ cockroach statement-diag cancel <diagnostics ID> <flags>
~~~

Cancel all outstanding activation requests:

~~~ shell
$ cockroach statement-diag cancel --all <flags>
~~~

## Flags

- The `delete` and `cancel` subcommands support one [general-use](#general) flag.
- All `statement-diag` subcommands support several [client connection](#client-connection) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--all` | Apply to all bundles or activation requests.

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

### Logging

By default, the `statement-diag` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Examples

### Setup

These examples assume you are running [an insecure cluster](start-a-local-cluster.html) and have requested and/or generated statement diagnostics bundles using the [DB Console](ui-statements-page.html#diagnostics) or [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#explain-analyze-debug).

### Download a statement diagnostics bundle

List statement diagnostics bundles and/or activation requests:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach statement-diag list --insecure
~~~

~~~
Statement diagnostics bundles:
  ID                  Collection time          Statement
  603820372518502401  2020-11-02 18:29:13 UTC  CREATE DATABASE bank

Outstanding activation requests:
  ID                  Activation time          Statement
  603811900498804737  2020-11-02 17:46:08 UTC  SELECT * FROM bank.accounts
~~~

Download a statement diagnostics bundle to `bundle.zip`:

~~~ shell
$ cockroach statement-diag download 603820372518502401 bundle.zip --insecure
~~~

### Delete all statement diagnostics bundles

Delete all statement diagnostics bundles:

~~~ shell
$ cockroach statement-diag delete --all --insecure
~~~

### Cancel an activation request

List statement diagnostics bundles and/or activation requests:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach statement-diag list --insecure
~~~

~~~
Outstanding activation requests:
  ID                  Activation time          Statement
  603811900498804737  2020-11-02 17:46:08 UTC  SELECT * FROM bank.accounts
~~~

Delete an activation request:

~~~ shell
$ cockroach statement-diag cancel 603811900498804737 --insecure
~~~

## See also

- [DB Console Statement Details page](ui-statements-page.html#statement-details-page)
- [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#explain-analyze-debug)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)
