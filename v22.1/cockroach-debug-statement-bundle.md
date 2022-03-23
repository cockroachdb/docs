---
title: cockroach debug statement-bundle
summary: Learn the command for recreating dowloaded statement diagnostics bundles.
toc: true
docs_area: reference.cli
---

Use the `cockroach debug statement-bundle` [command](cockroach-commands.html) to recreate downloaded statement diagnostics bundles generated from the [DB Console](ui-statements-page.html#diagnostics) or [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#explain-analyze-debug).

## Required privileges

Only members of the `admin` role can run `cockroach statement-diag`. By default, the `root` user belongs to the `admin` role.

## Subcommands

Subcommand | Usage
-----------|------
`recreate` | Recreate downloaded statement diagnostics bundles.

## Synopsis

Recreate a downloaded diagnostics bundle dowloaded into a `.zip` file:

~~~ shell
$ cockroach debug statement-bundle recreate <bundle filename> <flags>
~~~

## Flags

- All `statement-bundle` subcommands support several [client connection](#client-connection) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility.
`--explain-cmd string` | Set the `EXPLAIN` command used to produce the final output when displaying all optimal explain plans with `--placeholder` (default `EXPLAIN`). Example: `EXPLAIN(OPT)`.
`--format string` | Select how to display table rows in results. Supported values: `tsv`, `csv`, `table`, `records`, `sql`, `raw`, `html`. If unspecified, defaults to `tsv` for non-interactive sessions and `table` for interactive sessions.
`--placeholder stringArray` | A map of placeholder ID to fully-qualified table column to get the program to produce all optimal of explain plans with each of the histogram values for each column replaced in its placeholder.

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

### Logging

{% include {{ page.version.version }}/misc/logging-defaults.md %}

## Examples

### Setup

These examples assume you are running [an insecure cluster](start-a-local-cluster.html) and have requested and/or generated statement diagnostics bundles using the [DB Console](ui-statements-page.html#diagnostics) or [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#explain-analyze-debug).

### Recreate a statement diagnostics bundle

1. List statement diagnostics bundles and/or activation requests:

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

1. Download a statement diagnostics bundle to `bundle.zip`:

    ~~~ shell
    $ cockroach statement-diag download 603820372518502401 bundle.zip --insecure
    ~~~

1. Recreate the downloaded statement diagnostics bundle `bundle.zip`:

    ~~~ shell
    $ cockroach debug statement-bundle recreate bundle.zip --insecure
    ~~~

## See also

- [DB Console Statement Details page](ui-statements-page.html#dianostics)
- [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#explain-analyze-debug)
- [`cockroach` Commands Overview](cockroach-commands.html)
