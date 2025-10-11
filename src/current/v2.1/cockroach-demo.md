---
title: Open a SQL Shell to a Temporary Cluster
summary: Use cockroach demo to open a SQL shell to a temporary, in-memory, single-node CockroachDB cluster.
toc: true
---

<span class="version-tag">New in v2.1:</span> The `cockroach demo` [command](cockroach-commands.html) starts a temporary, in-memory, single-node CockroachDB cluster, optionally with a pre-loaded dataset, and opens an [interactive SQL shell](use-the-built-in-sql-client.html) to the cluster.  

The in-memory cluster persists only as long as the SQL shell is open. As soon as the shell is exited, the cluster and all its data are permanently destroyed. This command is therefore recommended only as an easy way to experiment with the CockroachDB SQL dialect.

## Synopsis

~~~ shell
# Start an interactive SQL shell:
$ cockroach demo <flags>

# Load a sample dataset and start an interactive SQL shell:
$ cockroach demo <dataset> <flags>

# Execute SQL from the command line:
$ cockroach demo --execute="<sql statement>;<sql statement>" --execute="<sql-statement>" <flags>

# Exit the interactive SQL shell:
$ \q
ctrl-d

# View help:
$ cockroach demo --help
~~~

## Datasets

Workload | Description
---------|------------
`bank` | A `bank` database, with one `bank` table containing account details.
`intro` | An `intro` database, with one table, `mytable`, with a hidden message.
`startrek` | A `startrek` database, with two tables, `episodes` and `quotes`.
`tpcc` | A `tpcc` database, with a rich schema of multiple tables.

## Flags

The `demo` command supports the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility.<br><br>This can also be enabled within the interactive SQL shell via the `\set echo` [shell command](use-the-built-in-sql-client.html#commands).
`--execute`<br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons. If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--format` for formatting options).
`--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](use-the-built-in-sql-client.html#session-and-output-types); `tsv` otherwise<br /><br />This flag corresponds to the `display_format` [client-side option](use-the-built-in-sql-client.html#client-side-options) for use in interactive sessions.
`--safe-updates` | Disallow potentially unsafe SQL statements, including `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE ... DROP COLUMN`.<br><br>**Default:** `true` for [interactive sessions](use-the-built-in-sql-client.html#session-and-output-types); `false` otherwise<br><br>Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the `sql_safe_updates` [session variable](set-vars.html).
`--set` | Set a [client-side option](use-the-built-in-sql-client.html#client-side-options) before starting the SQL shell or executing SQL statements from the command line via `--execute`. This flag may be specified multiple times, once per option.<br><br>After starting the SQL shell, the `\set` and `unset` commands can be use to enable and disable client-side options as well.

### Logging

By default, the `demo` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## SQL shell

All [SQL shell commands, client-side options, help, and shortcuts](use-the-built-in-sql-client.html#sql-shell) supported by the `cockroach sql` command are also supported by the `cockroach demo` command.

## Web UI

When the SQL shell connects to the in-memory cluster, it prints a welcome text with some tips and CockroachDB version and cluster details. Most of these details resemble the [welcome text](use-the-built-in-sql-client.html#welcome-message) that gets printed when connecting `cockroach sql` to a permanent cluster. However, one unique detail to note is the **Web UI** link. For the duration of the cluster, you can open the Web UI for the cluster at this link.

~~~ shell
#
# Welcome to the CockroachDB demo database!
#
# You are connected to a temporary, in-memory CockroachDB
# instance. Your changes will not be saved!
#
# Web UI: http://127.0.0.1:60105
#
# Server version: CockroachDB CCL v2.1.0-alpha.20180702-281-g07a11b8e8c-dirty (x86_64-apple-darwin17.6.0, built 2018/07/08 14:00:29, go1.10.1) (same version as client)
# Cluster ID: 61b41af6-fb2c-4d9a-8a91-0a31933b3d31
#
# Enter \? for a brief introduction.
#
root@127.0.0.1:60104/defaultdb>
~~~

## Example

In these examples, we demonstrate how to start a shell with `cockroach demo`. For more SQL shell features, see the [`cockroach sql` examples](use-the-built-in-sql-client.html#examples).

### Start an interactive SQL shell

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE t1 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name STRING);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO t1 (name) VALUES ('Tom Thumb');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1;
~~~

~~~
+--------------------------------------+-----------+
|                  id                  |   name    |
+--------------------------------------+-----------+
| 5d2e6faa-a78f-4ef3-845f-6e174bbb41fa | Tom Thumb |
+--------------------------------------+-----------+
(1 row)

Time: 9.539973ms
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> \q
~~~

### Load a sample dataset and start an interactive SQL shell

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo startrek
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM startrek;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM startrek.episodes WHERE stardate > 5500;
~~~

~~~
  id | season | num |               title               | stardate
+----+--------+-----+-----------------------------------+----------+
  60 |      3 |   5 | Is There in Truth No Beauty?      |   5630.7
  62 |      3 |   7 | Day of the Dove                   |   5630.3
  64 |      3 |   9 | The Tholian Web                   |   5693.2
  65 |      3 |  10 | Plato's Stepchildren              |   5784.2
  66 |      3 |  11 | Wink of an Eye                    |   5710.5
  69 |      3 |  14 | Whom Gods Destroy                 |   5718.3
  70 |      3 |  15 | Let That Be Your Last Battlefield |   5730.2
  73 |      3 |  18 | The Lights of Zetar               |   5725.3
  74 |      3 |  19 | Requiem for Methuselah            |   5843.7
  75 |      3 |  20 | The Way to Eden                   |   5832.3
  76 |      3 |  21 | The Cloud Minders                 |   5818.4
  77 |      3 |  22 | The Savage Curtain                |   5906.4
  78 |      3 |  23 | All Our Yesterdays                |   5943.7
  79 |      3 |  24 | Turnabout Intruder                |   5928.5
(14 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> \q
~~~

### Execute SQL from the command-line

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo \
--execute="CREATE TABLE t1 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name STRING);" \
--execute="INSERT INTO t1 (name) VALUES ('Tom Thumb');" \
--execute="SELECT * FROM t1;"
~~~

~~~
CREATE TABLE
INSERT 1
+--------------------------------------+-----------+
|                  id                  |   name    |
+--------------------------------------+-----------+
| 53476f43-d737-4506-ad83-4469c977f77c | Tom Thumb |
+--------------------------------------+-----------+
(1 row)
~~~

## See also

- [`cockroach sql`](use-the-built-in-sql-client.html)
- [`cockroach workload`](cockroach-workload.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
