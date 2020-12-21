---
title: cockroach demo
summary: Use cockroach demo to open a SQL shell to a temporary, in-memory, CockroachDB cluster.
toc: true
---

The `cockroach demo` [command](cockroach-commands.html) starts a temporary, in-memory CockroachDB cluster of one or more nodes, with or without a preloaded dataset, and opens an interactive SQL shell to the cluster.

- All [SQL shell](#sql-shell) commands, client-side options, help, and shortcuts supported by the [`cockroach sql`](cockroach-sql.html) command are also supported by `cockroach demo`.
- The in-memory cluster persists only as long as the SQL shell is open. As soon as the shell is exited, the cluster and all its data are permanently destroyed. This command is therefore recommended only as an easy way to experiment with the CockroachDB SQL dialect.
- Each instance of `cockroach demo` loads a temporary [enterprise license](https://www.cockroachlabs.com/get-cockroachdb) that expires after an hour. To prevent the loading of a temporary license, set the `--disable-demo-license` flag.

## Synopsis

View help for `cockroach demo`:

~~~ shell
$ cockroach demo --help
~~~

Start a single-node demo cluster with the `movr` dataset pre-loaded:

~~~ shell
$ cockroach demo <flags>
~~~

Load a different dataset into a demo cluster:

~~~ shell
$ cockroach demo <dataset> <flags>
~~~

Run the `movr` workload against a demo cluster:

~~~ shell
$ cockroach demo --with-load <other flags>
~~~

Execute SQL from the command line against a demo cluster

~~~ shell
$ cockroach demo --execute="<sql statement>;<sql statement>" --execute="<sql-statement>" <other flags>
~~~

Start a multi-node demo cluster:

~~~ shell
$ cockroach demo --nodes=<number of nodes> <other flags>
~~~

Start a multi-region demo cluster with automatic geo-partitioning

~~~ shell
$ cockroach demo --geo-partitioned-replicas <other flags>
~~~

Start a multi-region demo cluster with manually defined localities

~~~ shell
$ cockroach demo --nodes=<number of nodes> --demo-locality=<key:value pair per node> <other flags>
~~~

Stop a demo cluster:

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


## Datasets

{{site.data.alerts.callout_success}}
By default, the `movr` dataset is pre-loaded into a demo cluster. To load a different dataset, use [`cockroach demo <dataset>`](#load-a-sample-dataset-into-a-demo-cluster). To start a demo cluster without a pre-loaded dataset, pass the `--empty` flag.

{{site.data.alerts.end}}

Workload | Description
---------|------------
`bank` | A `bank` database, with one `bank` table containing account details.
`intro` | An `intro` database, with one table, `mytable`, with a hidden message.
`kv` | A `kv` database, with one key-value-style table.
`movr` | A `movr` database, with several tables of data for the [MovR example application](movr.html).<br><br>By default, `cockroach demo` loads the `movr` database as the [current database](sql-name-resolution.html#current-database), with sample region (`region`) and availability zone (`az`) replica localities for each node specified with the [`--nodes` flag](cockroach-demo.html#flags).
`startrek` | A `startrek` database, with two tables, `episodes` and `quotes`.
`tpcc` | A `tpcc` database, with a rich schema of multiple tables.
`ycsb` | A `ycsb` database, with a `usertable` from the Yahoo! Cloud Serving Benchmark.

## Flags

### General

The `demo` command supports the following general-use flags.

Flag | Description
-----|------------
`--cache` | For each demo node, the total size for caches. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit, for example: <br><br>`--cache=.25`<br>`--cache=25%`<br>`--cache=1000000000 ----> 1000000000 bytes`<br>`--cache=1GB ----> 1000000000 bytes`<br>`--cache=1GiB ----> 1073741824 bytes` <br><br>**Default:** `64MiB`
`--demo-locality` | Specify [locality](cockroach-start.html#locality) information for each demo node. The input is a colon-separated list of key-value pairs, where the i<sup>th</sup> pair is the locality setting for the i<sup>th</sup> demo cockroach node.<br><br>For example, the following option assigns node 1's region to `us-east1` and availability zone to `1`, node 2's region to `us-east2` and availability zone to `2`, and node 3's region to `us-east3` and availability zone to `3`:<br><br>`--demo-locality=region=us-east1,az=1:region=us-east1,az=2:region=us-east1,az=3`<br><br>By default, `cockroach demo` uses sample region (`region`) and availability zone (`az`) replica localities for each node specified with the `--nodes` flag.
`--disable-demo-license` |  Start the demo cluster without loading a temporary [enterprise license](https://www.cockroachlabs.com/get-cockroachdb) that expires after an hour.<br><br>Setting the `COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING` environment variable will also prevent the loading of a temporary license, along with preventing the sharing of anonymized [diagnostic details](diagnostics-reporting.html) with Cockroach Labs.
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility. This can also be enabled within the interactive SQL shell via the `\set echo` [shell command](#commands).
`--empty` | Start the demo cluster without a pre-loaded dataset.
`--execute`<br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons.<br><br>If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--format` for formatting options).
`--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](cockroach-sql.html#session-and-output-types); `tsv` otherwise<br /><br />This flag corresponds to the `display_format` [client-side option](#client-side-options) for use in interactive sessions.
`--geo-partitioned-replicas` | Start a 9-node demo cluster with the [Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html) topology pattern applied to the [`movr`](movr.html) database.
`--insecure` |  Set this to `false` to start the demo cluster in secure mode using TLS certificates to encrypt network communication. `--insecure=false` gives you an easy way test out CockroachDB [authorization features](authorization.html) and also creates a password (`admin`) for the `root` user for logging into the DB Console.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--max-sql-memory` | For each demo node, the maximum in-memory storage capacity for temporary SQL data, including prepared queries and intermediate data rows during query execution. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit, for example:<br><br>`--max-sql-memory=.25`<br>`--max-sql-memory=25%`<br>`--max-sql-memory=10000000000 ----> 1000000000 bytes`<br>`--max-sql-memory=1GB ----> 1000000000 bytes`<br>`--max-sql-memory=1GiB ----> 1073741824 bytes`<br><br>**Default:** `128MiB`
`--nodes` | Specify the number of in-memory nodes to create for the demo.<br><br>**Default:** 1
`--safe-updates` | Disallow potentially unsafe SQL statements, including `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE ... DROP COLUMN`.<br><br>**Default:** `true` for [interactive sessions](cockroach-sql.html#session-and-output-types); `false` otherwise<br><br>Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the `sql_safe_updates` [session variable](set-vars.html).
`--set` | Set a [client-side option](#client-side-options) before starting the SQL shell or executing SQL statements from the command line via `--execute`. This flag may be specified multiple times, once per option.<br><br>After starting the SQL shell, the `\set` and `unset` commands can be use to enable and disable client-side options as well.
`--with-load` |  Run a demo [`movr`](movr.html) workload against the preloaded `movr` database.<br><br> When running a multi-node demo cluster, load is balanced across all nodes.

### Logging

By default, the `demo` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## SQL shell

### Welcome text

When the SQL shell connects to the demo cluster at startup, it prints a welcome text with some tips and cluster details. Most of these details resemble the [welcome text](cockroach-sql.html#welcome-message) that is printed when connecting `cockroach sql` to a permanent cluster. `cockroach demo` also includes some [connection parameters](#connection-parameters) for connecting to the DB Console or for connecting another SQL client to the demo cluster.

~~~ shell
#
# Welcome to the CockroachDB demo database!
#
# You are connected to a temporary, in-memory CockroachDB cluster of 1 node.
#
# This demo session will attempt to enable enterprise features
# by acquiring a temporary license from Cockroach Labs in the background.
# To disable this behavior, set the environment variable
# COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING=true.
#
# Beginning initialization of the movr dataset, please wait...
#
# The cluster has been preloaded with the "movr" dataset
# (MovR is a fictional vehicle sharing company).
#
# Reminder: your changes to data stored in the demo session will not be saved!
#
# Connection parameters:
#   (console) http://127.0.0.1:59403
#   (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo635924269&port=26257
#   (sql/tcp) postgres://root:admin@127.0.0.1:59405?sslmode=require
#
#
# The user "root" with password "admin" has been created. Use it to access the Web UI!
#
# Server version: CockroachDB CCL v20.2.0 (x86_64-apple-darwin19.6.0, built , go1.14.4) (same version as client)
# Cluster ID: d4055073-8b30-490b-97bf-39ced0cd6471
# Organization: Cockroach Demo
#
# Enter \? for a brief introduction.
##
~~~

### Connection parameters

The SQL shell welcome text includes connection parameters for accessing the DB Console and for connecting other SQL clients to the demo cluster:

~~~
# Connection parameters:
#   (console) http://127.0.0.1:50037
#   (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo294284060&port=26257
#   (sql/tcp) postgres://root:admin@127.0.0.1:50039?sslmode=require
~~~

Parameter | Description
----------|------------
`console` | Use this link to access a local [DB Console](ui-overview.html). To login, use the `root` user with password `admin`.
`sql` | Use this connection URL to establish a [Unix domain socket connection](cockroach-sql.html#connect-to-a-cluster-listening-for-unix-domain-socket-connections) with a client that is installed on the same machine.
`sql/tcp` | Use this connection URL for standard sql/tcp connections from other SQL clients such as [`cockroach sql`](cockroach-sql.html).

{{site.data.alerts.callout_info}}
You do not need to create or specify node and client certificates in `sql` or `sql/tcp` connection URLs.
{{site.data.alerts.end}}

When running a multi-node demo cluster, use the `\demo ls` [shell command](#commands) to list the connection parameters for all nodes:

{% include copy-clipboard.html %}
~~~ sql
> \demo ls
~~~

~~~
node 1:
  (console) http://127.0.0.1:50037
  (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo294284060&port=26257
  (sql/tcp) postgres://root:admin@127.0.0.1:50039?sslmode=require

node 2:
  (console) http://127.0.0.1:50040
  (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo294284060&port=26258
  (sql/tcp) postgres://root:admin@127.0.0.1:50042?sslmode=require

node 3:
  (console) http://127.0.0.1:50048
  (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo294284060&port=26259
  (sql/tcp) postgres://root:admin@127.0.0.1:50050?sslmode=require
~~~

### Commands

- [General](#general)
- [Demo-specific](#demo-specific)

#### General

{% include {{ page.version.version }}/sql/shell-commands.md %}

#### Demo-specific

`cockroach demo` offers the following additional shell commands. Note that these commands are **experimental** and their interface and output are subject to change.

Command | Usage
--------|------
`\demo ls` | List the demo nodes and their connection URLs.
`\demo shutdown <node number>` | Shuts down a node in a multi-node demo cluster.<br><br>This command simulates stopping a node that can be restarted. [See an example](#shut-down-and-restart-nodes-in-a-multi-node-demo-cluster).
`\demo restart <node number>` | Restarts a node in a multi-node demo cluster. [See an example](#shut-down-and-restart-nodes-in-a-multi-node-demo-cluster).
`\demo decommission <node number>` | Decommissions a node in a multi-node demo cluster.<br><br>This command simulates [decommissioning a node](remove-nodes.html).
`\demo recommission <node number>` | Recommissions a decommissioned node in a multi-node demo cluster.

### Client-side options

{% include {{ page.version.version }}/sql/shell-options.md %}

### Help

{% include {{ page.version.version }}/sql/shell-help.md %}

### Shortcuts

{% include {{ page.version.version }}/sql/shell-shortcuts.md %}

## Diagnostics reporting

By default, `cockroach demo` shares anonymous usage details with Cockroach Labs. To opt out, set the [`diagnostics.reporting.enabled`](diagnostics-reporting.html#after-cluster-initialization) [cluster setting](cluster-settings.html) to `false`. You can also opt out by setting the [`COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING`](diagnostics-reporting.html#at-cluster-initialization) environment variable to `false` before running `cockroach demo`.

## Examples

In these examples, we demonstrate how to start a shell with `cockroach demo`. For more SQL shell features, see the [`cockroach sql` examples](cockroach-sql.html#examples).

### Start a single-node demo cluster

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo
~~~

By default, `cockroach demo` loads the `movr` dataset in to the demo cluster:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | promo_codes                | table |                1000
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |                  50
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(6 rows)
~~~

You can query the pre-loaded data:

{% include copy-clipboard.html %}
~~~ sql
> SELECT name FROM users LIMIT 10;
~~~

~~~
         name
-----------------------
  Tyler Dalton
  Dillon Martin
  Deborah Carson
  David Stanton
  Maria Weber
  Brian Campbell
  Carl Mcguire
  Jennifer Sanders
  Cindy Medina
  Daniel Hernandez MD
(10 rows)
~~~

You can also create and query new tables:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (
    id UUID DEFAULT gen_random_uuid(),
    city STRING NOT NULL,
    name STRING,
    dl STRING UNIQUE,
    address STRING,
    CONSTRAINT primary_key PRIMARY KEY (city ASC, id ASC)
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (city, name) VALUES ('new york', 'Catherine Nelson');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM drivers;
~~~

~~~
                   id                  |   city   |       name       |  dl  | address
+--------------------------------------+----------+------------------+------+---------+
  df3dc272-b572-4ca4-88c8-e9974dbd381a | new york | Catherine Nelson | NULL | NULL
(1 row)
~~~

### Start a multi-node demo cluster

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --nodes=3
~~~

### Load a sample dataset into a demo cluster

By default, `cockroach demo` loads the `movr` dataset in to the demo cluster. To pre-load any of the other [available datasets](#datasets) using `cockroach demo <dataset>`. For example, to load the `ycsb` dataset:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo ycsb
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name | table_name | type  | owner | estimated_row_count
--------------+------------+-------+-------+----------------------
  public      | usertable  | table | demo  |                   0
(1 row)
~~~

### Run load against a demo cluster

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --with-load
~~~

This command starts a demo cluster with the `movr` database preloaded and then inserts rows into each table in the `movr` database. You can monitor the workload progress on the [DB Console](ui-overview-dashboard.html#sql-queries).

When running a multi-node demo cluster, load is balanced across all nodes.

### Execute SQL from the command-line against a demo cluster

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo \
--execute="CREATE TABLE drivers (
    id UUID DEFAULT gen_random_uuid(),
    city STRING NOT NULL,
    name STRING,
    dl STRING UNIQUE,
    address STRING,
    CONSTRAINT primary_key PRIMARY KEY (city ASC, id ASC)
);" \
--execute="INSERT INTO drivers (city, name) VALUES ('new york', 'Catherine Nelson');" \
--execute="SELECT * FROM drivers;"
~~~

~~~
CREATE TABLE
INSERT 1
                   id                  |   city   |       name       |  dl  | address
+--------------------------------------+----------+------------------+------+---------+
  df3dc272-b572-4ca4-88c8-e9974dbd381a | new york | Catherine Nelson | NULL | NULL
(1 row)
~~~

### Connect an additional SQL client to the demo cluster

In addition to the interactive SQL shell that opens when you run `cockroach demo`, you can use the [connection parameters](#connection-parameters) in the welcome text to connect additional SQL clients to the cluster.

First, use `\demo ls` to list the connection parameters for each node in the demo cluster:

{% include copy-clipboard.html %}
~~~ sql
> \demo ls
~~~

~~~
node 1:
  (console) http://127.0.0.1:54880
  (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo200406637&port=26257
  (sql/tcp) postgres://root:admin@127.0.0.1:54882?sslmode=require

node 2:
  (console) http://127.0.0.1:54883
  (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo200406637&port=26258
  (sql/tcp) postgres://root:admin@127.0.0.1:54885?sslmode=require

node 3:
  (console) http://127.0.0.1:54891
  (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fk1%2Fr048yqpd7_9337rgxm9vb_gw0000gn%2FT%2Fdemo200406637&port=26259
  (sql/tcp) postgres://root:admin@127.0.0.1:54893?sslmode=require
~~~

Then open a new terminal and run [`cockroach sql`](cockroach-sql.html) with the `--url` flag set to the `sql/tcp` connection URL of the node to which you want to connect:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --url='postgres://root:admin@127.0.0.1:54885?sslmode=require'
~~~

You can also use this URL to connect an application to the demo cluster.  

### Start a multi-region demo cluster with automatic geo-partitioning

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --geo-partitioned-replicas
~~~

This command starts a 9-node demo cluster with the `movr` database preloaded, and [partitions](partitioning.html) and [zone constraints](configure-replication-zones.html) applied to the primary and secondary indexes. For more information, see the [Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html) topology pattern.

### Shut down and restart nodes in a multi-node demo cluster

In a multi-node demo cluster, you can use `\demo` [shell commands](#commands) to shut down, restart, decommission, and recommission individual nodes.

{% include {{ page.version.version }}/misc/experimental-warning.md %}

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --nodes=3
~~~

You can shutdown the 3rd node and then restart it:

{% include copy-clipboard.html %}
~~~ sql
> \demo shutdown 3
~~~

~~~
node 3 has been shutdown
~~~

{% include copy-clipboard.html %}
~~~ sql
> \demo restart 3
~~~

~~~
node 3 has been restarted
~~~

You can also decommission the 3rd node and then recommission it:

{% include copy-clipboard.html %}
~~~ sql
> \demo decommission 3
~~~

~~~
node 3 has been decommissioned
~~~

{% include copy-clipboard.html %}
~~~ sql
> \demo recommission 3
~~~

~~~
node 3 has been recommissioned
~~~

### Try your own scenario

In addition to using one of the [pre-loaded dataset](#datasets), you can create your own database (e.g., [`CREATE DATABASE <yourdb>;`](create-database.html)), or use the empty `defaultdb` database (e.g., [`SET DATABASE defaultdb;`](set-database.html)) to test our your own scenario involving any CockroachDB SQL features you are interested in.

## See also

- [`cockroach sql`](cockroach-sql.html)
- [`cockroach workload`](cockroach-workload.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [MovR: Vehicle-Sharing App](movr.html)
