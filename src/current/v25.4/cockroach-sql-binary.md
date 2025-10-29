---
title: cockroach-sql
summary: cockroach-sql is a client for executing SQL statements from an interactive shell or directly from the command line.
toc: true
docs_area: reference.cli
---

The `cockroach-sql` command is a client for executing SQL statements from an interactive shell or directly from the command line. To use this client, run `cockroach-sql` as described below.

{{site.data.alerts.callout_info}}
`cockroach-sql` is functionally equivalent to the [`cockroach sql` command]({% link {{ page.version.version }}/cockroach-sql.md %}).
{{site.data.alerts.end}}

To exit the interactive shell, enter **\q**, **quit**, **exit**, or **Ctrl+D**.

The output of `cockroach-sql` when used non-interactively is part of a stable interface, and can be used programmatically, with the exception of informational output lines that begin with the hash symbol (`#`). Informational output can change from release to release, and should not be used programmatically.

## Install `cockroach-sql`

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="mac"><strong>Mac</strong></button>
    <button class="filter-button page-level" data-scope="linux"><strong>Linux</strong></button>
    <button class="filter-button page-level" data-scope="windows"><strong>Windows</strong></button>
</div>

1. Visit [Releases]({% link releases/index.md %}) and download the SQL Shell binary for CockroachDB.

<section class="filter-content" markdown="1" data-scope="linux">
1. Follow the instructions to [install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}) on your local system. The resulting `cockroach` binary supports only `cockroach sql` subcommands.
</section>

<section class="filter-content" markdown="1" data-scope="mac">
1. Follow the instructions to [install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}) on your local system. The resulting `cockroach` binary supports only `cockroach sql` subcommands.
</section>

<section class="filter-content" markdown="1" data-scope="windows">
1. Follow the instructions to [install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}) on your local system. The resulting `cockroach.exe` binary supports only `cockroach sql` subcommands.
</section>

## Before you begin

- The [role option of the user]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options) logging in must be `LOGIN` or `SQLLOGIN`, which are granted by default. If the user has been set to use the `NOLOGIN` role or the `NOSQLLOGIN` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (or the legacy `NOSQLLOGIN` role option), the user cannot log in using the SQL CLI with any authentication method.
- **macOS users only:** By default, macOS-based terminals do not enable handling of the Alt key modifier. This prevents access to many keyboard shortcuts in the unix shell and `cockroach sql`. See the section [macOS terminal configuration](#macos-terminal-configuration) below for details.

## Synopsis

Start the interactive SQL shell:

~~~ shell
$ cockroach-sql <flags>
~~~

Execute SQL from the command line:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql -e="<sql statement>;<sql statement>" -e="<sql-statement>" <flags>
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ echo "<sql statement>;<sql statement>" | cockroach-sql <flags>
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql <flags> -f file-containing-statements.sql
~~~

Exit the interactive SQL shell:

~~~ sql
> \q
~~~

View help:

~~~ shell
$ cockroach-sql --help
~~~

## Flags

The `sql` command supports the following types of flags:

- [General Use](#general)
- [Client Connection](#client-connection)
- [Logging](#logging)

### General

- To start an interactive SQL shell, run `cockroach-sql` with all appropriate connection flags or use just the [`--url` flag](#sql-flag-url), which includes [connection details]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url).
- To execute SQL statements from the command line, use the [`--execute` flag](#sql-flag-execute).

Flag | Description
-----|------------
`--database`<br><br>`-d` | A database name to use as [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database) in the newly created session.
`--embedded` |  Minimizes the SQL shell [welcome text](#welcome-message) to be appropriate for embedding in playground-type environments. Specifically, this flag removes details that users in an embedded environment have no control over (e.g., networking information).
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility. For a demonstration, see the [example](#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility) below.<br><br>This can also be enabled within the interactive SQL shell via the `\set echo` [shell command](#commands).
<a name="sql-flag-execute"></a> `--execute`<br><br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons. If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--format` for formatting options).<br><br>For a demonstration of this and other ways to execute SQL from the command line, see the [example](#execute-sql-statements-from-the-command-line) below.
`--file <filename>`<br><br>`-f <filename>` |  Read SQL statements from `<filename>`.
<a name="sql-flag-format"></a> `--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](#session-and-output-types); `tsv` otherwise<br /><br />This flag corresponds to the `display_format` [client-side option](#client-side-options).
`--read-only` | Sets the `default_transaction_read_only` [session variable]({% link {{ page.version.version }}/show-vars.md %}#supported-variables) to `on` upon connecting.
`--safe-updates` <a name="flag-safe-updates"></a> | Disallow potentially unsafe SQL statements. For the complete list of disallowed statements, refer to the documentation for the [`sql_safe_updates` session variable]({% link {{ page.version.version }}/set-vars.md %}#sql-safe-updates).<br /><br />**Default:** `true` for [interactive sessions](#session-and-output-types); `false` otherwise<br /><br />Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the [`sql_safe_updates` session variable]({% link {{ page.version.version }}/set-vars.md %}#sql-safe-updates).
`--set` | Set a [client-side option](#client-side-options) before starting the SQL shell or executing SQL statements from the command line via `--execute`. This flag may be specified multiple times, once per option.<br><br>After starting the SQL shell, the `\set` and `unset` commands can be use to enable and disable client-side options as well.
`--watch` | Repeat the SQL statements specified with `--execute` or `-e` until a SQL error occurs or the process is terminated. `--watch` applies to all `--execute` or `-e` flags in use.<br />You must also specify an interval at which to repeat the statement, followed by a time unit. For example, to specify an interval of 5 seconds, use `5s`.<br /><br /> Note that this flag is intended for simple monitoring scenarios during development and testing. See the [example](#repeat-a-sql-statement) below.


### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

See [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %}) for more details.

### Logging

{% include {{ page.version.version }}/misc/logging-defaults.md %}

## Session and output types

`cockroach-sql` exhibits different behaviors depending on whether or not the session is interactive and/or whether or not the session outputs on a terminal.

- A session is **interactive** when `cockroach-sql` is invoked without the `-e` or `-f` flag, and the input is a terminal. In such cases:
    - The [`errexit` option](#sql-option-errexit) defaults to `false`.
    - The [`check_syntax` option](#sql-option-check-syntax) defaults to `true` if supported by the CockroachDB server (this is checked when the shell starts up).
    - **Ctrl+C** at the prompt will only terminate the shell if no other input was entered on the same line already.
    - The shell will attempt to set the `safe_updates` [session variable]({% link {{ page.version.version }}/set-vars.md %}) to `true` on the server.
    - The shell continues to read input after the last command entered.
- A session **outputs on a terminal** when output is not redirected to a file. In such cases:
    - The [`--format` flag](#sql-flag-format) and its corresponding [`display_format` option](#sql-option-display-format) default to `table`. These default to `tsv` otherwise.
    - The `show_times` option defaults to `true`.

When a session is both interactive and outputs on a terminal, `cockroach-sql` also activates the interactive prompt with a line editor that can be used to modify the current line of input. Also, command history becomes active.

## SQL shell

### Welcome message

When the SQL shell connects (or reconnects) to a CockroachDB node, it prints a welcome text with some tips and CockroachDB version and cluster details:

~~~ shell
#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
#
# Server version: CockroachDB CCL {{page.release_info.version}} (x86_64-apple-darwin17.7.0, built {{page.release_info.build_time}}) (same version as client)
# Cluster ID: 7fb9f5b4-a801-4851-92e9-c0db292d03f1
#
# Enter \? for a brief introduction.
#
>
~~~

The **Version** and **Cluster ID** details are particularly noteworthy:

- When the client and server versions of CockroachDB are the same, the shell prints the `Server version` followed by `(same version as client)`.
- When the client and server versions are different, the shell prints both the `Client version` and `Server version`. In this case, you may want to [plan an upgrade]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}) of earlier client or server versions.
- Since every CockroachDB cluster has a unique ID, you can use the `Cluster ID` field to verify that your client is always connecting to the correct cluster.

### Commands

{% include {{ page.version.version }}/sql/shell-commands.md %}

### Client-side options

{% include {{ page.version.version }}/sql/shell-options.md %}

### Help

{% include {{ page.version.version }}/sql/shell-help.md %}

### Shortcuts

{% include {{ page.version.version }}/sql/shell-shortcuts.md %}

### macOS terminal configuration

{% include {{ page.version.version }}/sql/macos-terminal-configuration.md %}

### Error messages and `SQLSTATE` codes

{% include {{ page.version.version }}/sql/sql-errors.md %}

## Examples

{% include {{ page.version.version }}/sql/sql-examples.md %}

## See also

- [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %})
- [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Learn CockroachDB SQL]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %})
