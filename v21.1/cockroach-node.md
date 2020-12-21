---
title: cockroach node
summary: To view details for each node in the cluster, use the cockroach node command with the appropriate subcommands and flags.
toc: true
redirect_from: view-node-details.html
key: view-node-details.html
---

To view details for each node in the cluster, use the `cockroach node` [command](cockroach-commands.html) with the appropriate subcommands and flags.

The `cockroach node` command is also used in the process of decommissioning nodes for removal from the cluster. See [Decommission Nodes](remove-nodes.html) for more details.

## Subcommands

Subcommand | Usage
-----------|------
`ls` | List the ID of each node in the cluster, excluding those that have been decommissioned and are offline.
`status` | View the status of one or all nodes, excluding nodes that have been decommissioned and taken offline. Depending on flags used, this can include details about range/replicas, disk usage, and decommissioning progress.
`decommission` | Decommission nodes for removal from the cluster. See [Decommission Nodes](remove-nodes.html) for more details.
`recommission` | Recommission nodes that have been decommissioned. See [Recommission Nodes](remove-nodes.html#recommission-nodes) for more details.
`drain` | Drain nodes of SQL clients, [distributed SQL](architecture/sql-layer.html#distsql) queries, and range leases, and prevent ranges from rebalancing onto the node. This is normally done by sending `SIGTERM` during [node shutdown](cockroach-quit.html), but the `drain` subcommand provides operators an option to interactively monitor, and if necessary intervene in, the draining process.

## Synopsis

List the IDs of active and inactive nodes:

~~~ shell
$ cockroach node ls <flags>
~~~

Show status details for active and inactive nodes:

~~~ shell
$ cockroach node status <flags>
~~~

Show status and range/replica details for active and inactive nodes:

~~~ shell
$ cockroach node status --ranges <flags>
~~~

Show status and disk usage details for active and inactive nodes:

~~~ shell
$ cockroach node status --stats <flags>
~~~

Show status and decommissioning details for active and inactive nodes:

~~~ shell
$ cockroach node status --decommission <flags>
~~~

Show complete status details for active and inactive nodes:

~~~ shell
$ cockroach node status --all <flags>
~~~

Show status details for a specific node:

~~~ shell
$ cockroach node status <node ID> <flags>
~~~

Decommission nodes:

~~~ shell
$ cockroach node decommission <node IDs> <flags>
~~~

Recommission nodes:

~~~ shell
$ cockroach node recommission <node IDs> <flags>
~~~

Drain nodes:

~~~ shell
$ cockroach node drain <flags>
~~~

View help:

~~~ shell
$ cockroach node --help
~~~
~~~ shell
$ cockroach node <subcommand> --help
~~~

## Flags

All `node` subcommands support the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `table`, `records`, `sql`, `html`.<br><br>**Default:** `tsv`

The `node ls` subcommand also supports the following general flags:

Flag | Description
-----|------------
`--timeout` | Set the duration of time that the subcommand is allowed to run before it returns an error and prints partial information. The timeout is specified with a suffix of `s` for seconds, `m` for minutes, and `h` for hours. If this flag is not set, the subcommand may hang.

The `node status` subcommand also supports the following general flags:

Flag | Description
-----|------------
`--all` | Show all node details.
`--decommission` | Show node decommissioning details.
`--ranges` | Show node details for ranges and replicas.
`--stats` | Show node disk usage details.
`--timeout` | Set the duration of time that the subcommand is allowed to run before it returns an error and prints partial information. The timeout is specified with a suffix of `s` for seconds, `m` for minutes, and `h` for hours. If this flag is not set, the subcommand may hang.

The `node decommission` subcommand also supports the following general flags:

Flag | Description
-----|------------
`--wait` | When to return to the client. Possible values: `all`, `none`.<br><br>If `all`, the command returns to the client only after all replicas on all specified nodes have been transferred to other nodes. If any specified nodes are offline, the command will not return to the client until those nodes are back online.<br><br>If `none`, the command does not wait for the decommissioning process to complete; it returns to the client after starting the decommissioning process on all specified nodes that are online. Any specified nodes that are offline will automatically be marked as decommissioning; if they come back online, the cluster will recognize this status and will not rebalance data to the nodes.<br><br>**Default:** `all`
`--self` | Applies the operation to the node against which the command was run (e.g., via `--host`).

The `node drain` subcommand also supports the following general flag:

Flag | Description
-----|------------
`--drain-wait` | Amount of time to wait for the node to drain before returning to the client. <br><br>**Default:** `10m`

The `node recommission` subcommand also supports the following general flag:

Flag | Description
-----|------------
`--self` | Applies the operation to the node against which the command was run (e.g., via `--host`).

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

The `node decommission`, `node recommission`, and `node drain` subcommands also support the following client connection flags:

Flag | Description
-----|------------
`--cluster-name` | The cluster name to use to verify the cluster's identity. If the cluster has a cluster name, you must include this flag. For more information, see [`cockroach start`](cockroach-start.html#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. This flag must be paired with `--cluster-name`. For more information, see [`cockroach start`](cockroach-start.html#general).

See [Client Connection Parameters](connection-parameters.html) for more details.

### Logging

By default, the `node` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Response

The `cockroach node` subcommands return the following fields for each node.

### `node ls`

Field | Description
------|------------
`id` | The ID of the node.

### `node status`

Field | Description
------|------------
`id` | The ID of the node.<br><br>**Required flag:** None
`address` | The address of the node.<br><br>**Required flag:** None
`build` | The version of CockroachDB running on the node. If the binary was built from source, this will be the SHA hash of the commit used.<br><br>**Required flag:** None
`locality` | The [locality](cockroach-start.html#locality) information specified for the node.<br><br>**Required flag:** None
`updated_at` | The date and time when the node last recorded the information displayed in this command's output. When healthy, a new status should be recorded every 10 seconds or so, but when unhealthy this command's stats may be much older.<br><br>**Required flag:** None
`started_at` | The date and time when the node was started.<br><br>**Required flag:** None
`replicas_leaders` | The number of range replicas on the node that are the Raft leader for their range. See `replicas_leaseholders` below for more details.<br><br>**Required flag:** `--ranges` or `--all`
`replicas_leaseholders` | The number of range replicas on the node that are the leaseholder for their range. A "leaseholder" replica handles all read requests for a range and directs write requests to the range's Raft leader (usually the same replica as the leaseholder).<br><br>**Required flag:** `--ranges` or `--all`
`ranges` | The number of ranges that have replicas on the node.<br><br>**Required flag:** `--ranges` or `--all`
`ranges_unavailable` | The number of unavailable ranges that have replicas on the node.<br><br>**Required flag:** `--ranges` or `--all`
`ranges_underreplicated` | The number of underreplicated ranges that have replicas on the node.<br><br>**Required flag:** `--ranges` or `--all`
`live_bytes` | The amount of live data used by both applications and the CockroachDB system. This excludes historical and deleted data.<br><br>**Required flag:** `--stats` or `--all`
`key_bytes` | The amount of live and non-live data from keys in the key-value storage layer. This does not include data used by the CockroachDB system.<br><br>**Required flag:** `--stats` or `--all`
`value_bytes` | The amount of live and non-live data from values in the key-value storage layer. This does not include data used by the CockroachDB system.<br><br>**Required flag:** `--stats` or `--all`
`intent_bytes` | The amount of non-live data associated with uncommitted (or recently-committed) transactions.<br><br>**Required flag:** `--stats` or `--all`
`system_bytes` | The amount of data used just by the CockroachDB system.<br><br>**Required flag:** `--stats` or `--all`
`is_available` | If `true`, the node is currently available.<br><br>**Required flag:** None
`is_live` | If `true`, the node is currently live. <br><br>For unavailable clusters (with an unresponsive DB Console), running the `node status` command and monitoring the `is_live` field is the only way to identify the live nodes in the cluster. However, you need to run the `node status` command on a live node to identify the other live nodes in an unavailable cluster. Figuring out a live node to run the command is a trial-and-error process, so run the command against each node until you get one that responds. <br><br> See [Identify live nodes in an unavailable cluster](#identify-live-nodes-in-an-unavailable-cluster) for more details. <br><br>**Required flag:** None
`gossiped_replicas` | The number of replicas on the node that are active members of a range. After the decommissioning process completes, this should be 0.<br><br>**Required flag:** `--decommission` or `--all`
`is_decommissioning` | If `true`, the node's range replicas are being transferred to other nodes. This happens when a live node is marked for [decommissioning](remove-nodes.html).<br><br>**Required flag:** `--decommission` or `--all`
`is_draining` | If `true`, the node is being drained of in-flight SQL connections, new SQL connections are rejected, and the [`/health?ready=1` monitoring endpoint](monitoring-and-alerting.html#health-ready-1) starts returning a `503 Service Unavailable` status. This happens when a live node is being [stopped](cockroach-quit.html).<br><br>**Required flag:** `--decommission` or `--all`

### `node decommission`

Field | Description
------|------------
`id` | The ID of the node.
`is_live` | If `true`, the node is live.
`replicas` | The number of replicas on the node that are active members of a range. After the decommissioning process completes, this should be 0.
`is_decommissioning` | If `true`, the node's range replicas are being transferred to other nodes. This happens when a live node is marked for [decommissioning](remove-nodes.html).
`is_draining` | If `true`, the node is being drained of in-flight SQL connections, new SQL connections are rejected, and the [`/health?ready=1` monitoring endpoint](monitoring-and-alerting.html#health-ready-1) starts returning a `503 Service Unavailable` status. This happens when a live node is being [stopped](cockroach-quit.html).

### `node recommission`

Field | Description
------|------------
`id` | The ID of the node.
`is_live` | If `true`, the node is live.
`replicas` | The number of replicas on the node that are active members of a range. After the decommissioning process completes, this should be 0.
`is_decommissioning` | If `true`, the node's range replicas are being transferred to other nodes. This happens when a live node is marked for [decommissioning](remove-nodes.html).
`is_draining` | If `true`, the node is being drained of in-flight SQL connections, new SQL connections are rejected, and the [`/health?ready=1` monitoring endpoint](monitoring-and-alerting.html#health-ready-1) starts returning a `503 Service Unavailable` status. This happens when a live node is being [stopped](cockroach-quit.html).

## Examples

### Setup

To follow along with the examples, start [an insecure cluster](start-a-local-cluster.html), with [localities](cockroach-start.html#locality) defined.

### List node IDs

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node ls --insecure
~~~

~~~
  id
+----+
   1
   2
   3
(3 rows)
~~~

### Show the status of a single node

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status 1 --host=localhost:26257 --insecure
~~~

~~~
  id |     address     |   sql_address   |                  build                  |            started_at            |           updated_at            |      locality       | is_available | is_live
+----+-----------------+-----------------+-----------------------------------------+----------------------------------+---------------------------------+---------------------+--------------+---------+
   1 | localhost:26257 | localhost:26257 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:54.308502+00:00 | 2019-10-01 20:05:43.85563+00:00 | region=us-east,az=1 | true         | true
(1 row)
~~~

### Show the status of all nodes

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status --host=localhost:26257 --insecure
~~~

~~~
  id |     address     |   sql_address   |                  build                  |            started_at            |            updated_at            |        locality        | is_available | is_live
+----+-----------------+-----------------+-----------------------------------------+----------------------------------+----------------------------------+------------------------+--------------+---------+
   1 | localhost:26257 | localhost:26257 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:54.308502+00:00 | 2019-10-01 20:06:15.356886+00:00 | region=us-east,az=1    | true         | true
   2 | localhost:26258 | localhost:26258 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:54.551761+00:00 | 2019-10-01 20:06:15.583967+00:00 | region=us-central,az=2 | true         | true
   3 | localhost:26259 | localhost:26259 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:55.178577+00:00 | 2019-10-01 20:06:16.204549+00:00 | region=us-west,az=3    | true         | true
(3 rows)
~~~

### Identify live nodes in an unavailable cluster

The `is_live` and `is_available` fields are marked as `true` as long as a majority of the nodes are up, and a quorum can be reached:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach quit --host=localhost:26258 --insecure
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status --host=localhost:26257 --insecure
~~~

~~~
  id |     address     |   sql_address   |                  build                  |            started_at            |            updated_at            |        locality        | is_available | is_live
+----+-----------------+-----------------+-----------------------------------------+----------------------------------+----------------------------------+------------------------+--------------+---------+
   1 | localhost:26257 | localhost:26257 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:54.308502+00:00 | 2019-10-01 20:07:04.857339+00:00 | region=us-east,az=1    | true         | true
   2 | localhost:26258 | localhost:26258 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:54.551761+00:00 | 2019-10-01 20:06:48.555863+00:00 | region=us-central,az=2 | false        | false
   3 | localhost:26259 | localhost:26259 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:55.178577+00:00 | 2019-10-01 20:07:01.207697+00:00 | region=us-west,az=3    | true         | true
(3 rows)
~~~

If a majority of nodes are down and a quorum cannot be reached, the `is_live` field is marked as `true` for the nodes that are up, but the `is_available` field is marked as `false` for all nodes:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach quit --host=localhost:26259 --insecure
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status --host=localhost:26257 --insecure
~~~

~~~
  id |     address     |   sql_address   |                  build                  |            started_at            |            updated_at            |        locality        | is_available | is_live
+----+-----------------+-----------------+-----------------------------------------+----------------------------------+----------------------------------+------------------------+--------------+---------+
   1 | localhost:26257 | localhost:26257 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:54.308502+00:00 | 2019-10-01 20:07:37.464249+00:00 | region=us-east,az=1    | false        | true
   2 | localhost:26258 | localhost:26258 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:54.551761+00:00 | 2019-10-01 20:07:37.464259+00:00 | region=us-central,az=2 | false        | false
   3 | localhost:26259 | localhost:26259 | v19.2.0-alpha.20190606-2479-gd98e0839dc | 2019-10-01 20:04:55.178577+00:00 | 2019-10-01 20:07:37.464265+00:00 | region=us-west,az=3    | false        | false
(3 rows)
~~~

{{site.data.alerts.callout_info}}
You need to run the `node status` command on a live node to identify the other live nodes in an unavailable cluster. Figuring out a live node to run the command is a trial-and-error process, so run the command against each node until you get one that responds.
{{site.data.alerts.end}}

### Decommission nodes

See [Decommission Nodes](remove-nodes.html)

### Recommission nodes

See [Recommission Nodes](remove-nodes.html#recommission-nodes)

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [Decommission Nodes](remove-nodes.html)
