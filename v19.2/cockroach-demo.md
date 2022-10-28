---
title: cockroach demo
summary: Use cockroach demo to open a SQL shell to a temporary, in-memory, single-node CockroachDB cluster.
toc: true
---

The `cockroach demo` [command](cockroach-commands.html) starts a temporary, in-memory CockroachDB cluster, a preloaded dataset, and opens an [interactive SQL shell](cockroach-sql.html) to the cluster.

The in-memory cluster persists only as long as the SQL shell is open. As soon as the shell is exited, the cluster and all its data are permanently destroyed. This command is therefore recommended only as an easy way to experiment with the CockroachDB SQL dialect.


<span class="version-tag">New in v19.2:</span> Each instance of `cockroach demo` loads a temporary [enterprise license](https://www.cockroachlabs.com/get-cockroachdb/enterprise/) that expires after an hour.

## Synopsis

Start an interactive SQL shell:

~~~ shell
$ cockroach demo <flags>
~~~

Load a sample dataset and start an interactive SQL shell:

~~~ shell
$ cockroach demo <dataset> <flags>
~~~

Execute SQL from the command line:

~~~ shell
$ cockroach demo --execute="<sql statement>;<sql statement>" --execute="<sql-statement>" <flags>
~~~

Exit the interactive SQL shell:

~~~ shell
$ \q
ctrl-d
~~~

View help:

~~~ shell
$ cockroach demo --help
~~~

## Datasets

Workload | Description
---------|------------
`bank` | A `bank` database, with one `bank` table containing account details.
`intro` | An `intro` database, with one table, `mytable`, with a hidden message.
`movr` | A `movr` database, with several tables of data for the [MovR example application](movr.html).<br><br><span class="version-tag">New in v19.2:</span> By default, `cockroach demo` loads the `movr` database as the [current database](sql-name-resolution.html#current-database), with sample region (`region`) and availability zone (`az`) replica localities for each node specified with the [`--nodes` flag](cockroach-demo.html#flags).
`startrek` | A `startrek` database, with two tables, `episodes` and `quotes`.
`tpcc` | A `tpcc` database, with a rich schema of multiple tables.

## Flags

The `demo` command supports the following general-use flags.

Flag | Description
-----|------------
`--demo-locality` | <span class="version-tag">New in v19.2:</span> Specify [locality](cockroach-start.html#locality) information for each demo node. The input is a colon-separated list of key-value pairs, where the i<sup>th</sup> pair is the locality setting for the i<sup>th</sup> demo cockroach node.<br><br>For example, the following option assigns node 1's region to `us-east1` and availability zone to `1`, node 2's region to `us-east2` and availability zone to `2`, and node 3's region to `us-east3` and availability zone to `3`:<br><br>`--demo-locality=region=us-east1,az=1:region=us-east1,az=2:region=us-east1,az=3`<br><br>By default, `cockroach demo` uses sample region (`region`) and availability zone (`az`) replica localities for each node specified with the `--nodes` flag.
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility. This can also be enabled within the interactive SQL shell via the `\set echo` [shell command](cockroach-sql.html#commands).
`--execute`<br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons.<br><br>If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--format` for formatting options).
`--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](cockroach-sql.html#session-and-output-types); `tsv` otherwise<br /><br />This flag corresponds to the `display_format` [client-side option](cockroach-sql.html#client-side-options) for use in interactive sessions.
`--geo-partitioned-replicas` | <span class="version-tag">New in v19.2:</span> Start a 9-node demo cluster with the [Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html) topology pattern applied to the [`movr`](movr.html) database.
`--nodes` | <span class="version-tag">New in v19.2:</span> Specify the number of in-memory nodes to create for the demo.<br><br>**Default:** 1
`--safe-updates` | Disallow potentially unsafe SQL statements, including `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE ... DROP COLUMN`.<br><br>**Default:** `true` for [interactive sessions](cockroach-sql.html#session-and-output-types); `false` otherwise<br><br>Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the `sql_safe_updates` [session variable](set-vars.html).
`--set` | Set a [client-side option](cockroach-sql.html#client-side-options) before starting the SQL shell or executing SQL statements from the command line via `--execute`. This flag may be specified multiple times, once per option.<br><br>After starting the SQL shell, the `\set` and `unset` commands can be use to enable and disable client-side options as well.
`--with-load` |  <span class="version-tag">New in v19.2:</span> Run a demo [`movr`](movr.html) workload against the preloaded `movr` database.

## Logging

By default, the `demo` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## SQL shell

All [SQL shell commands, client-side options, help, and shortcuts](cockroach-sql.html#sql-shell) supported by the `cockroach sql` command are also supported by the `cockroach demo` command.

## Web UI

When the SQL shell connects to the in-memory cluster, it prints a welcome text with some tips and CockroachDB version and cluster details. Most of these details resemble the [welcome text](cockroach-sql.html#welcome-message) that gets printed when connecting `cockroach sql` to a permanent cluster. However, one unique detail to note is the **Web UI** link. For the duration of the cluster, you can open the Web UI for the cluster at this link.

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

## Diagnostics Reporting

By default, `cockroach demo` shares anonymous usage details with Cockroach Labs. To opt out, set the [`diagnostics.reporting.enabled`](diagnostics-reporting.html#after-cluster-initialization) [cluster setting](cluster-settings.html) to `false`. You can also opt out by setting the [`COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING`](diagnostics-reporting.html#at-cluster-initialization) environment variable to `false` before running `cockroach demo`.

## Example

In these examples, we demonstrate how to start a shell with `cockroach demo`. For more SQL shell features, see the [`cockroach sql` examples](cockroach-sql.html#examples).

### Start an interactive SQL shell

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo
~~~

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

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

### Load a sample dataset and start an interactive SQL shell

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo movr --nodes=3 --demo-locality=region=us-east1:region=us-central1:region=us-west1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
          table_name
+----------------------------+
  promo_codes
  rides
  user_promo_codes
  users
  vehicle_location_histories
  vehicles
(6 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE city = 'new york';
~~~

~~~
                   id                  |   city   |       name       |           address           | credit_card
+--------------------------------------+----------+------------------+-----------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills        | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57 | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61 | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8   | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley              | 0792553487
(5 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

### Execute SQL from the command-line

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

### Run `cockroach demo` with a workload

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --with-load
~~~

This command starts a demo cluster with the `movr` database preloaded and then inserts rows into each table in the `movr` database. You can monitor the workload progress on the [Admin UI](admin-ui-overview-dashboard.html#sql-queries).

### Start a multi-region demo cluster with automatic geo-partitioning

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --geo-partitioned-replicas
~~~

This command starts a 9-node demo cluster with the `movr` database preloaded, and [partitions](partitioning.html) and [zone constraints](configure-replication-zones.html) applied to the primary and secondary indexes. For more information, see the [Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html) topology pattern.

### Try your own scenario

In addition to using one of the [pre-loaded dataset](#datasets), you can create your own database (e.g., [`CREATE DATABASE <yourdb>;`](create-database.html)), or use the empty `defaultdb` database (e.g., [`SET DATABASE defaultdb;`](set-vars.html)) to test our your own scenario involving any CockroachDB SQL features you are interested in.

## See also

- [`cockroach sql`](cockroach-sql.html)
- [`cockroach workload`](cockroach-workload.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [MovR: Vehicle-Sharing App](movr.html)
