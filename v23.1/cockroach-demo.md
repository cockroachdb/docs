---
title: cockroach demo
summary: Use cockroach demo to open a SQL shell to a temporary, in-memory, CockroachDB cluster.
toc: true
docs_area: reference.cli
---

The `cockroach demo` [command](cockroach-commands.html) starts a temporary, in-memory CockroachDB cluster of one or more nodes, with or without a preloaded dataset, and opens an interactive SQL shell to the cluster.

- All [SQL shell](#sql-shell) commands, client-side options, help, and shortcuts supported by the [`cockroach sql`](cockroach-sql.html) command are also supported by `cockroach demo`.
- The in-memory cluster persists only as long as the SQL shell is open. As soon as the shell is exited, the cluster and all its data are permanently destroyed. This command is therefore recommended only as an easy way to experiment with the CockroachDB SQL dialect.
- By default, `cockroach demo` starts in secure mode using TLS certificates to encrypt network communication. It also serves a local [DB Console](#connection-parameters) that does not use TLS encryption.
- Each instance of `cockroach demo` loads a temporary [Enterprise license](https://www.cockroachlabs.com/get-cockroachdb/enterprise/) that expires after 24 hours. To prevent the loading of a temporary license, set the `--disable-demo-license` flag.
-  `cockroach demo` opens the SQL shell with a new [SQL user](security-reference/authorization.html#sql-users) named `demo`. The `demo` user is assigned a random password and granted the [`admin` role](security-reference/authorization.html#admin-role).

{{site.data.alerts.callout_danger}}
`cockroach demo` is designed for testing purposes only. It is not suitable for production deployments. To see a list of recommendations for production deployments, see the [Production Checklist](recommended-production-settings.html).
{{site.data.alerts.end}}

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

Execute SQL from the command line against a demo cluster:

~~~ shell
$ cockroach demo --execute="<sql statement>;<sql statement>" --execute="<sql-statement>" <other flags>
~~~

Start a multi-node demo cluster:

~~~ shell
$ cockroach demo --nodes=<number of nodes> <other flags>
~~~

Start a multi-region demo cluster with default region and zone localities:

~~~ shell
$ cockroach demo --global --nodes=<number of nodes>
~~~

Start a multi-region demo cluster with manually defined localities:

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
By default, the `movr` dataset is pre-loaded into a demo cluster. To load a different dataset, use [`cockroach demo <dataset>`](#load-a-sample-dataset-into-a-demo-cluster). To start a demo cluster without a pre-loaded dataset, pass the `--no-example-database` flag.
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
`--auto-enable-rangefeeds` | Override the default behavior of `cockroach demo`, which has rangefeeds enabled on startup.  If you do not need to use [changefeeds](create-and-configure-changefeeds.html) with your demo cluster, use `--auto-enable-rangefeeds=false` to disable rangefeeds and improve performance. See [Enable rangefeeds](create-and-configure-changefeeds.html#enable-rangefeeds) for more detail. <br><br>**Default:** `true`
`--cache` | For each demo node, the total size for caches. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit, for example: <br><br>`--cache=.25`<br>`--cache=25%`<br>`--cache=1000000000 ----> 1000000000 bytes`<br>`--cache=1GB ----> 1000000000 bytes`<br>`--cache=1GiB ----> 1073741824 bytes` <br><br>**Default:** `64MiB`
`--demo-locality` | Specify [locality](cockroach-start.html#locality) information for each demo node. The input is a colon-separated list of key-value pairs, where the i<sup>th</sup> pair is the locality setting for the i<sup>th</sup> demo cockroach node.<br><br>For example, the following option assigns node 1's region to `us-east1` and availability zone to `1`, node 2's region to `us-east2` and availability zone to `2`, and node 3's region to `us-east3` and availability zone to `3`:<br><br>`--demo-locality=region=us-east1,az=1:region=us-east1,az=2:region=us-east1,az=3`<br><br>By default, `cockroach demo` uses sample region (`region`) and availability zone (`az`) replica localities for each node specified with the `--nodes` flag.
`--disable-demo-license` |  Start the demo cluster without loading a temporary [Enterprise license](https://www.cockroachlabs.com/get-started-cockroachdb/) that expires after 24 hours.<br><br>Setting the `COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING` environment variable will also prevent the loading of a temporary license, along with preventing the sharing of anonymized [diagnostic details](diagnostics-reporting.html) with Cockroach Labs.
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility. This can also be enabled within the interactive SQL shell via the `\set echo` [shell command](#commands).
`--embedded` |  Minimizes the SQL shell [welcome text](#welcome-text) to be appropriate for embedding in playground-type environments. Specifically, this flag removes details that users in an embedded environment have no control over (e.g., networking information).
`--no-example-database` |  Start the demo cluster without a pre-loaded dataset.<br>To obtain this behavior automatically in every new `cockroach demo` session, set the `COCKROACH_NO_EXAMPLE_DATABASE` environment variable to `true`.
`--execute`<br><br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons.<br><br>If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--format` for formatting options).
`--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](cockroach-sql.html#session-and-output-types); `tsv` otherwise<br /><br />This flag corresponds to the `display_format` [client-side option](#client-side-options) for use in interactive sessions.
`--geo-partitioned-replicas` | Start a 9-node demo cluster with [geo-partitioning](partitioning.html) applied to the [`movr`](movr.html) database.
`--global` | <a name="global-flag"></a>Simulates a [multi-region cluster](simulate-a-multi-region-cluster-on-localhost.html) which sets the [`--locality` flag on node startup](cockroach-start.html#locality) to three different regions. It also simulates the network latency that would occur between them given the specified localities. In order for this to operate as expected, with 3 nodes in each of 3 regions, you must also pass the `--nodes 9` argument.
`--http-port` |  Specifies a custom HTTP port to the [DB Console](ui-overview.html) for the first node of the demo cluster.<br><br>In multi-node clusters, the HTTP ports for additional clusters increase from the port of the first node, in increments of 1. For example, if the first node has an HTTP port of `5000`, the second node will have the HTTP port `5001`.
`--insecure` |  Include this to start the demo cluster in insecure mode.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--listening-url-file` |   The file to which the node's SQL connection URL will be written as soon as the demo cluster is initialized and the node is ready to accept connections. <br><br>This flag is useful for automation because it allows you to wait until the demo cluster has been initialized so that subsequent commands can connect automatically.
`--max-sql-memory` | For each demo node, the maximum in-memory storage capacity for temporary SQL data, including prepared queries and intermediate data rows during query execution. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit, for example:<br><br>`--max-sql-memory=.25`<br>`--max-sql-memory=25%`<br>`--max-sql-memory=10000000000 ----> 1000000000 bytes`<br>`--max-sql-memory=1GB ----> 1000000000 bytes`<br>`--max-sql-memory=1GiB ----> 1073741824 bytes`<br><br>**Default:** `128MiB`
`--nodes` | Specify the number of in-memory nodes to create for the demo.<br><br>**Default:** 1
`--safe-updates` | Disallow potentially unsafe SQL statements, including `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE ... DROP COLUMN`.<br><br>**Default:** `true` for [interactive sessions](cockroach-sql.html#session-and-output-types); `false` otherwise<br><br>Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the `sql_safe_updates` [session variable](set-vars.html).
`--set` | Set a [client-side option](#client-side-options) before starting the SQL shell or executing SQL statements from the command line via `--execute`. This flag may be specified multiple times, once per option.<br><br>After starting the SQL shell, the `\set` and `unset` commands can be use to enable and disable client-side options as well.
`--sql-port` |  Specifies a custom SQL port for the first node of the demo cluster.<br><br>In multi-node clusters, the SQL ports for additional clusters increase from the port of the first node, in increments of 1. For example, if the first node has the SQL port `3000`, the second node will the SQL port `3001`.
`--with-load` |  Run a demo [`movr`](movr.html) workload against the preloaded `movr` database.<br><br> When running a multi-node demo cluster, load is balanced across all nodes.

### Logging

By default, the `demo` command does not log messages.

If you need to troubleshoot this command's behavior, you can [customize its logging behavior](configure-logs.html).

## SQL shell

### Welcome text

When the SQL shell connects to the demo cluster at startup, it prints a welcome text with some tips and cluster details. Most of these details resemble the [welcome text](cockroach-sql.html#welcome-message) that is printed when connecting `cockroach sql` to a permanent cluster. `cockroach demo` also includes some [connection parameters](#connection-parameters) for connecting to the DB Console or for connecting another SQL client to the demo cluster.

~~~ shell
#
# Welcome to the CockroachDB demo database!
#
# You are connected to a temporary, in-memory CockroachDB cluster of 9 nodes.
#
# This demo session will attempt to enable Enterprise features
# by acquiring a temporary license from Cockroach Labs in the background.
# To disable this behavior, set the environment variable
# COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING=true.
#
# Beginning initialization of the movr dataset, please wait...
#
# Waiting for license acquisition to complete...
#
# Partitioning the demo database, please wait...
#
# The cluster has been preloaded with the "movr" dataset
# (MovR is a fictional vehicle sharing company).
#
# Reminder: your changes to data stored in the demo session will not be saved!
#
# If you wish to access this demo cluster using another tool, you will need
# the following details:
#
#   - Connection parameters:
#     (webui)    http://127.0.0.1:8080/demologin?password=demo55826&username=demo
#     (sql)      postgresql://demo:demo55826@127.0.0.1:26257/movr?sslmode=require
#     (sql/jdbc) jdbc:postgresql://127.0.0.1:26257/movr?password=demo55826&sslmode=require&user=demo
#     (sql/unix) postgresql://demo:demo55826@/movr?host=%2Fvar%2Ffolders%2F8c%2F915dtgrx5_57bvc5tq4kpvqr0000gn%2FT%2Fdemo699845497&port=26257
#
#   To display connection parameters for other nodes, use \demo ls.
#   - Username: "demo", password: "demo55826"
#   - Directory with certificate files (for certain SQL drivers/tools): /var/folders/8c/915dtgrx5_57bvc5tq4kpvqr0000gn/T/demo699845497
#
# Server version: CockroachDB CCL {{ page.release_info.version }} (x86_64-apple-darwin20.5.0, built {{ page.release_info.build_time }}) (same version as client)
# Cluster ID: f78b7feb-b6cf-4396-9d7f-494982d7d81e
# Organization: Cockroach Demo
#
# Enter \? for a brief introduction.
#
~~~

### Connection parameters

The SQL shell welcome text includes connection parameters for accessing the DB Console and for connecting other SQL clients to the demo cluster:

~~~
#   - Connection parameters:
#     (webui)    http://127.0.0.1:8080/demologin?password=demo55826&username=demo
#     (sql)      postgresql://demo:demo55826@127.0.0.1:26257/movr?sslmode=require
#     (sql/jdbc) jdbc:postgresql://127.0.0.1:26257/movr?password=demo55826&sslmode=require&user=demo
#     (sql/unix) postgresql://demo:demo55826@/movr?host=%2Fvar%2Ffolders%2F8c%2F915dtgrx5_57bvc5tq4kpvqr0000gn%2FT%2Fdemo699845497&port=26257
~~~

Parameter | Description
----------|------------
`webui` | Use this link to access a local [DB Console](ui-overview.html) to the demo cluster.
`sql` | Use this connection URL for standard sql/tcp connections from other SQL clients such as [`cockroach sql`](cockroach-sql.html).<br>The default SQL port for the first node of a demo cluster is `26257`.
`sql/unix` | Use this connection URL to establish a [Unix domain socket connection](cockroach-sql.html#connect-to-a-cluster-listening-for-unix-domain-socket-connections) with a client that is installed on the same machine.

{{site.data.alerts.callout_info}}
You do not need to create or specify node and client certificates in `sql` or `sql/unix` connection URLs. Instead, you can securely connect to the demo cluster with the random password generated for the `demo` user.
{{site.data.alerts.end}}

When running a multi-node demo cluster, use the `\demo ls` [shell command](#commands) to list the connection parameters for all nodes:

{% include_cached copy-clipboard.html %}
~~~ sql
> \demo ls
~~~

~~~
node 1:
  (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257

node 2:
  (webui)    http://127.0.0.1:8081/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26258?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26258

node 3:
  (webui)    http://127.0.0.1:8082/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26259?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26259
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
`\demo add region=<region>,zone=<zone>` |  Add a node to a single-region or multi-region demo cluster. [See an example](#add-shut-down-and-restart-nodes-in-a-multi-node-demo-cluster).
`\demo shutdown <node number>` | Shuts down a node in a multi-node demo cluster.<br><br>This command simulates stopping a node that can be restarted. [See an example](#add-shut-down-and-restart-nodes-in-a-multi-node-demo-cluster).
`\demo restart <node number>` | Restarts a node in a multi-node demo cluster. [See an example](#add-shut-down-and-restart-nodes-in-a-multi-node-demo-cluster).
`\demo decommission <node number>` | Decommissions a node in a multi-node demo cluster.<br><br>This command simulates [decommissioning a node](node-shutdown.html?filters=decommission).
`\demo recommission <node number>` | Recommissions a decommissioned node in a multi-node demo cluster.

### Client-side options

{% include {{ page.version.version }}/sql/shell-options.md %}

### Help

{% include {{ page.version.version }}/sql/shell-help.md %}

### Shortcuts

{% include {{ page.version.version }}/sql/shell-shortcuts.md %}

### macOS terminal configuration

{% include {{ page.version.version }}/sql/macos-terminal-configuration.md %}

## Diagnostics reporting

By default, `cockroach demo` shares anonymous usage details with Cockroach Labs. To opt out, set the [`diagnostics.reporting.enabled`](diagnostics-reporting.html#after-cluster-initialization) [cluster setting](cluster-settings.html) to `false`. You can also opt out by setting the [`COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING`](diagnostics-reporting.html#at-cluster-initialization) environment variable to `false` before running `cockroach demo`.

## Examples

In these examples, we demonstrate how to start a shell with `cockroach demo`. For more SQL shell features, see the [`cockroach sql` examples](cockroach-sql.html#examples).

### Start a single-node demo cluster

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo
~~~

By default, `cockroach demo` loads the `movr` dataset in to the demo cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | owner | estimated_row_count | locality
--------------+----------------------------+-------+-------+---------------------+-----------
  public      | promo_codes                | table | demo  |                1000 | NULL
  public      | rides                      | table | demo  |                 500 | NULL
  public      | user_promo_codes           | table | demo  |                   0 | NULL
  public      | users                      | table | demo  |                  50 | NULL
  public      | vehicle_location_histories | table | demo  |                1000 | NULL
  public      | vehicles                   | table | demo  |                  15 | NULL
(6 rows)
~~~

You can query the pre-loaded data:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city STRING NOT NULL,
    name STRING,
    dl STRING UNIQUE,
    address STRING
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (city, name) VALUES ('new york', 'Catherine Nelson');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM drivers;
~~~

~~~
                   id                  |   city   |       name       |  dl  | address
---------------------------------------+----------+------------------+------+----------
  4d363104-2c48-43b5-aa1e-955b81415c7d | new york | Catherine Nelson | NULL | NULL
(1 row)
~~~

### Start a multi-node demo cluster

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --nodes=3
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> \demo ls
~~~

~~~
node 1:
  (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257

node 2:
  (webui)    http://127.0.0.1:8081/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26258?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26258

node 3:
  (webui)    http://127.0.0.1:8082/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26259?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26259
~~~

### Load a sample dataset into a demo cluster

By default, `cockroach demo` loads the `movr` dataset in to the demo cluster. To pre-load any of the other [available datasets](#datasets) using `cockroach demo <dataset>`. For example, to load the `ycsb` dataset:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo ycsb
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name | table_name | type  | owner | estimated_row_count | locality
--------------+------------+-------+-------+---------------------+-----------
  public      | usertable  | table | demo  |                   0 | NULL
(1 row)
~~~

### Run load against a demo cluster

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --with-load
~~~

This command starts a demo cluster with the `movr` database preloaded and then inserts rows into each table in the `movr` database. You can monitor the workload progress on the [DB Console](ui-overview-dashboard.html#sql-statements).

When running a multi-node demo cluster, load is balanced across all nodes.

### Execute SQL from the command-line against a demo cluster

{% include_cached copy-clipboard.html %}
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
---------------------------------------+----------+------------------+------+----------
  dd6afc4c-bf31-455e-bb6d-bfb8f18ad6cc | new york | Catherine Nelson | NULL | NULL
(1 row)
~~~

### Connect an additional SQL client to the demo cluster

In addition to the interactive SQL shell that opens when you run `cockroach demo`, you can use the [connection parameters](#connection-parameters) in the welcome text to connect additional SQL clients to the cluster.

1. Use `\demo ls` to list the connection parameters for each node in the demo cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    \demo ls
    ~~~

    ~~~
    node 1:
      (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
      (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
      (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257

    node 2:
      (webui)    http://127.0.0.1:8081/demologin?password=demo76950&username=demo
      (sql)      postgres://demo:demo76950@127.0.0.1:26258?sslmode=require
      (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26258

    node 3:
      (webui)    http://127.0.0.1:8082/demologin?password=demo76950&username=demo
      (sql)      postgres://demo:demo76950@127.0.0.1:26259?sslmode=require
      (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26259
    ~~~

1. Open a new terminal and run [`cockroach sql`](cockroach-sql.html) with the `--url` flag set to the `sql` connection URL of the node to which you want to connect:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url='postgres://demo:demo53628@127.0.0.1:26259?sslmode=require'
    ~~~

    You can also use this URL to connect an application to the demo cluster as the `demo` user.

### Start a multi-region demo cluster

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --global --nodes 9
~~~

This command starts a 9-node demo cluster with the `movr` database preloaded and region and zone localities set at the cluster level.

{{site.data.alerts.callout_info}}
The `--global` flag is an experimental feature of `cockroach demo`. The interface and output are subject to change.
{{site.data.alerts.end}}

For a tutorial that uses a demo cluster to demonstrate CockroachDB's multi-region capabilities, see [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html).

### Add, shut down, and restart nodes in a multi-node demo cluster

In a multi-node demo cluster, you can use `\demo` [shell commands](#commands) to add, shut down, restart, decommission, and recommission individual nodes.

{% include common/experimental-warning.md %}

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --nodes=9
~~~

{{site.data.alerts.callout_info}}
`cockroach demo` does not support the `\demo add` and `\demo shutdown` commands in demo clusters started with the `--global` flag.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW REGIONS FROM CLUSTER;
~~~

~~~
     region    |  zones
---------------+----------
  europe-west1 | {b,c,d}
  us-east1     | {b,c,d}
  us-west1     | {a,b,c}
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> \demo ls
~~~

~~~
node 1:
  (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257

node 2:
  (webui)    http://127.0.0.1:8081/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26258?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26258

node 3:
  (webui)    http://127.0.0.1:8082/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26259?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26259

node 4:
  (webui)    http://127.0.0.1:8083/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26260?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26260

node 5:
  (webui)    http://127.0.0.1:8084/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26261?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26261

node 6:
  (webui)    http://127.0.0.1:8085/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26262?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26262

node 7:
  (webui)    http://127.0.0.1:8086/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26263?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26263

node 8:
  (webui)    http://127.0.0.1:8087/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26264?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26264

node 9:
  (webui)    http://127.0.0.1:8088/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26265?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26265
~~~

You can shut down and restart any node by node id. For example, to shut down the 3rd node and then restart it:

{% include_cached copy-clipboard.html %}
~~~ sql
> \demo shutdown 3
~~~

~~~
node 3 has been shutdown
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> \demo restart 3
~~~

~~~
node 3 has been restarted
~~~

You can also decommission the 3rd node and then recommission it:

{% include_cached copy-clipboard.html %}
~~~ sql
> \demo decommission 3
~~~

~~~
node 3 has been decommissioned
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> \demo recommission 3
~~~

~~~
node 3 has been recommissioned
~~~

To add a new node to the cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> \demo add region=us-central1,zone=a
~~~

~~~
node 10 has been added with locality "region=us-central1,zone=a"
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW REGIONS FROM CLUSTER;
~~~

~~~
     region    |  zones
---------------+----------
  europe-west1 | {b,c,d}
  us-central1  | {a}
  us-east1     | {b,c,d}
  us-west1     | {a,b,c}
(4 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> \demo ls
~~~

~~~
node 1:
  (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257

node 2:
  (webui)    http://127.0.0.1:8081/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26258?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26258

...

node 10:
  (webui)    http://127.0.0.1:8089/demologin?password=demo76950&username=demo
  (sql)      postgres://demo:demo76950@127.0.0.1:26266?sslmode=require
  (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26266
~~~

### Try your own scenario

In addition to using one of the [pre-loaded dataset](#datasets), you can create your own database (e.g., [`CREATE DATABASE <yourdb>;`](create-database.html)), or use the empty `defaultdb` database (e.g., [`SET DATABASE defaultdb;`](set-vars.html)) to test our your own scenario involving any CockroachDB SQL features you are interested in.

## See also

- [`cockroach sql`](cockroach-sql.html)
- [`cockroach workload`](cockroach-workload.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [MovR: Vehicle-Sharing App](movr.html)
