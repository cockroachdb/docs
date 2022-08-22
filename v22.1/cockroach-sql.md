---
title: cockroach sql
summary: CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line.
toc: true
key: use-the-built-in-sql-client.html
docs_area: reference.cli
---

CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line. To use this client, run the `cockroach sql` [command](cockroach-commands.html) as described below.

To exit the interactive shell, use `\q`, `quit`, `exit`, or `ctrl-d`.

{{site.data.alerts.callout_success}}
If you want to experiment with CockroachDB SQL but do not have a cluster already running, you can use the [`cockroach demo`](cockroach-demo.html) command to open a shell to a temporary, in-memory cluster.
{{site.data.alerts.end}}

The output of `cockroach sql` when used non-interactively is part of a stable interface, and can be used programmatically, with the exception of informational output lines that begin with the hash symbol (`#`). Informational output can change from release to release, and should not be used programmatically.

## Prerequisites

The [role option of the user](create-role.html#role-options) logging in must be `LOGIN` or `SQLLOGIN`, which are granted by default. If the user's role option has been set to `NOLOGIN` or `NOSQLLOGIN`, the user cannot log in using the SQL CLI with any authentication method.

## Synopsis

Start the interactive SQL shell:

~~~ shell
$ cockroach sql <flags>
~~~

Execute SQL from the command line:

~~~ shell
$ cockroach sql --execute="<sql statement>;<sql statement>" --execute="<sql-statement>" <flags>
~~~
~~~ shell
$ echo "<sql statement>;<sql statement>" | cockroach sql <flags>
~~~
~~~ shell
$ cockroach sql <flags> --file file-containing-statements.sql
~~~

Exit the interactive SQL shell:

~~~ sql
> \q
~~~

~~~ sql
> quit
~~~

~~~ sql
> exit
~~~

~~~ shell
ctrl-d
~~~

View help:

~~~ shell
$ cockroach sql --help
~~~

## Flags

The `sql` command supports the following types of flags:

- [General Use](#general)
- [Client Connection](#client-connection)
- [Logging](#logging)

### General

- To start an interactive SQL shell, run `cockroach sql` with all appropriate connection flags or use just the [`--url` flag](#sql-flag-url), which includes [connection details](connection-parameters.html#connect-using-a-url).
- To execute SQL statements from the command line, use the [`--execute` flag](#sql-flag-execute).

Flag | Description
-----|------------
`--database`<br><br>`-d` | A database name to use as [current database](sql-name-resolution.html#current-database) in the newly created session.
`--embedded` |  Minimizes the SQL shell [welcome text](#welcome-message) to be appropriate for embedding in playground-type environments. Specifically, this flag removes details that users in an embedded environment have no control over (e.g., networking information).
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility. For a demonstration, see the [example](#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility) below.<br><br>This can also be enabled within the interactive SQL shell via the `\set echo` [shell command](#commands).
<a name="sql-flag-execute"></a> `--execute`<br><br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons. If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--format` for formatting options).<br><br>For a demonstration of this and other ways to execute SQL from the command line, see the [example](#execute-sql-statements-from-the-command-line) below.
`--file <filename>`<br><br>`-f <filename>` |  Read SQL statements from `<filename>`.
<a name="sql-flag-format"></a> `--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](#session-and-output-types); `tsv` otherwise<br /><br />This flag corresponds to the `display_format` [client-side option](#client-side-options).
`--read-only` | **New in v22.1:** Sets the `default_transaction_read_only` [session variable](show-vars.html#supported-variables) to `on` upon connecting.
`--safe-updates` | Disallow potentially unsafe SQL statements, including `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE ... DROP COLUMN`.<br><br>**Default:** `true` for [interactive sessions](#session-and-output-types); `false` otherwise<br /><br />Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the `sql_safe_updates` [session variable](set-vars.html).
`--set` | Set a [client-side option](#client-side-options) before starting the SQL shell or executing SQL statements from the command line via `--execute`. This flag may be specified multiple times, once per option.<br><br>After starting the SQL shell, the `\set` and `unset` commands can be use to enable and disable client-side options as well.
`--watch` | Repeat the SQL statements specified with `--execute` or `-e` until a SQL error occurs or the process is terminated. `--watch` applies to all `--execute` or `-e` flags in use.<br />You must also specify an interval at which to repeat the statement, followed by a time unit. For example, to specify an interval of 5 seconds, use `5s`.<br /><br /> Note that this flag is intended for simple monitoring scenarios during development and testing. See the [example](#repeat-a-sql-statement) below.


### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

### Logging

{% include {{ page.version.version }}/misc/logging-defaults.md %}

## Session and output types

`cockroach sql` exhibits different behaviors depending on whether or not the session is interactive and/or whether or not the session outputs on a terminal.

- A session is **interactive** when `cockroach sql` is invoked without the `-e` or `-f` flag, and the input is a terminal. In such cases:
    - The [`errexit` option](#sql-option-errexit) defaults to `false`.
    - The [`check_syntax` option](#sql-option-check-syntax) defaults to `true` if supported by the CockroachDB server (this is checked when the shell starts up).
    - **Ctrl+C** at the prompt will only terminate the shell if no other input was entered on the same line already.
    - The shell will attempt to set the `safe_updates` [session variable](set-vars.html) to `true` on the server.
    - The shell continues to read input after the last command entered.
- A session **outputs on a terminal** when output is not redirected to a file. In such cases:
    - The [`--format` flag](#sql-flag-format) and its corresponding [`display_format` option](#sql-option-display-format) default to `table`. These default to `tsv` otherwise.
    - The `show_times` option defaults to `true`.

When a session is both interactive and outputs on a terminal, `cockroach sql` also activates the interactive prompt with a line editor that can be used to modify the current line of input. Also, command history becomes active.

## SQL shell

### Welcome message

When the SQL shell connects (or reconnects) to a CockroachDB node, it prints a welcome text with some tips and CockroachDB version and cluster details:

~~~ shell
#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
#
# Server version: CockroachDB CCL {{page.release_info.version}} (x86_64-apple-darwin17.7.0, built 2019/09/13 00:07:19, go1.12.6) (same version as client)
# Cluster ID: 7fb9f5b4-a801-4851-92e9-c0db292d03f1
#
# Enter \? for a brief introduction.
#
>
~~~

The **Version** and **Cluster ID** details are particularly noteworthy:

- When the client and server versions of CockroachDB are the same, the shell prints the `Server version` followed by `(same version as client)`.
- When the client and server versions are different, the shell prints both the `Client version` and `Server version`. In this case, you may want to [plan an upgrade](upgrade-cockroach-version.html) of older client or server versions.
- Since every CockroachDB cluster has a unique ID, you can use the `Cluster ID` field to verify that your client is always connecting to the correct cluster.

### Commands

{% include {{ page.version.version }}/sql/shell-commands.md %}

### Client-side options

{% include {{ page.version.version }}/sql/shell-options.md %}

### Help

{% include {{ page.version.version }}/sql/shell-help.md %}

### Shortcuts

{% include {{ page.version.version }}/sql/shell-shortcuts.md %}

### Error messages and `SQLSTATE` codes

{% include {{ page.version.version }}/sql/sql-errors.md %}

## Examples

{% include {{ page.version.version }}/sql/sql-examples.md %}

## See also

- [Client Connection Parameters](connection-parameters.html)
- [`cockroach demo`](cockroach-demo.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
