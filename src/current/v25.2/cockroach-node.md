---
title: cockroach node
summary: To view details for each node in the cluster, use the cockroach node command with the appropriate subcommands and flags.
toc: true
key: view-node-details.html
docs_area: reference.cli
---

To view details for each node in the cluster, use the `cockroach node` [command]({% link {{ page.version.version }}/cockroach-commands.md %}) with the appropriate subcommands and flags.

The `cockroach node` command is also used to stop or remove nodes from the cluster. For details, see [Node Shutdown]({% link {{ page.version.version }}/node-shutdown.md %}).

## Subcommands

Subcommand | Usage
-----------|------
`ls` | List the ID of each node in the cluster, excluding those that have been decommissioned and are offline.
`status` | View the status of one or all nodes, excluding nodes that have been decommissioned and taken offline. Depending on flags used, this can include details about range/replicas, disk usage, and decommissioning progress.
`decommission` | Decommission nodes for removal from the cluster. For more information, see [Decommission nodes](#decommission-nodes).
`recommission` | Recommission nodes that are decommissioning. If the decommissioning node has already reached the [draining stage]({% link {{ page.version.version }}/node-shutdown.md %}?filters=decommission#draining), you may need to restart the node after it is recommissioned. For details, see [Node Shutdown]({% link {{ page.version.version }}/node-shutdown.md %}#recommission-nodes).
`drain` | Drain nodes in preparation for process termination. Draining always occurs when sending a termination signal or decommissioning a node. The `drain` subcommand is used to drain nodes without also decommissioning or shutting them down. For details, see [Node Shutdown]({% link {{ page.version.version }}/node-shutdown.md %}).

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
$ cockroach node drain <node ID> <flags>
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

The `node decommission` subcommand also supports the following general flags. For more information, see `cockroach node decommission --help`.

Flag | Description
-----|------------
`--checks` | <a name="decommission-checks"></a> Whether to perform a set of "decommissioning pre-flight checks". Possible values: `enabled`, `strict`, or `skip`. If `enabled`, CockroachDB will check if a node can successfully complete decommissioning given the current state of the cluster. If errors are detected that would result in the inability to complete node decommissioning, they will be printed to `STDERR` and the command will exit *without attempting to perform node decommissioning*. For more information, see [Remove nodes]({% link {{ page.version.version }}/node-shutdown.md %}?filters=decommission#remove-nodes).<br/><br/>**Default:** `enabled`
`--dry-run` | Performs the same decommissioning checks as the `--checks` flag, but without attempting to decommission the node. When `cockroach node decommission {nodeID} --dry-run` is executed, it runs the checks, prints the status of those checks, and exits.
`--wait` | When to return to the client. Possible values: `all`, `none`.<br><br>If `all`, the command returns to the client only after all replicas on all specified nodes have been transferred to other nodes. If any specified nodes are offline, the command will not return to the client until those nodes are back online.<br><br>If `none`, the command does not wait for the decommissioning process to complete; it returns to the client after starting the decommissioning process on all specified nodes that are online. Any specified nodes that are offline will automatically be marked as decommissioning; if they come back online, the cluster will recognize this status and will not rebalance data to the nodes.<br><br>**Default:** `all`
`--self` | **Deprecated.** Instead, specify a node ID explicitly in addition to the `--host` flag.

The `node drain` subcommand also supports the following general flags:

Flag | Description
-----|------------
`--drain-wait` | Amount of time to wait for the node to drain before returning to the client. If draining fails to complete within this duration, you must re-initiate the command to continue the drain. A very long drain may indicate an anomaly, and you should manually inspect the server to determine what blocks the drain.<br><br>CockroachDB automatically increases the verbosity of logging when it detects a stall in the range lease transfer stage of `node drain`. Messages logged during such a stall include the time an attempt occurred, the total duration stalled waiting for the transfer attempt to complete, and the lease that is being transferred.<br><br>**Default:** `10m`
`--self` | Applies the operation to the node against which the command was run (e.g., via `--host`).
`--shutdown` | After draining completes, the `cockroach` process shuts down automatically on the node.

The `node recommission` subcommand also supports the following general flag:

Flag | Description
-----|------------
`--self` | Applies the operation to the node against which the command was run (e.g., via `--host`).

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

The `node decommission`, `node recommission`, and `node drain` subcommands also support the following client connection flags:

Flag | Description
-----|------------
`--cluster-name` | The cluster name to use to verify the cluster's identity. If the cluster has a cluster name, you must include this flag. For more information, see [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. This flag must be paired with `--cluster-name`. For more information, see [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#general).

See [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %}) for more details.

### Logging

{% include {{ page.version.version }}/misc/logging-defaults.md %}

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
`locality` | The [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) information specified for the node.<br><br>**Required flag:** None
`updated_at` | The date and time when the node last recorded the information displayed in this command's output. When healthy, a new status should be recorded every 10 seconds or so, but when unhealthy this command's stats may be much older.<br><br>**Required flag:** None
`started_at` | The date and time when the node was started.<br><br>**Required flag:** None
`replicas_leaders` | The number of range replicas on the node that are the Raft leader for their range. See `replicas_leaseholders` below for more details.<br><br>**Required flag:** `--ranges` or `--all`
`replicas_leaseholders` | The number of range replicas on the node that are the leaseholder for their range. A  "leaseholder" replica handles all read requests for a range and directs write requests to the range's Raft leader (usually the same replica as the leaseholder).<br><br>**Required flag:** `--ranges` or `--all`
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
`is_decommissioning` | If `true`, the node is either undergoing or has completed the [decommissioning process]({% link {{ page.version.version }}/node-shutdown.md %}?filters=decommission#node-shutdown-sequence).<br><br>**Required flag:** `--decommission` or `--all`
`is_draining` | If `true`, the node is either undergoing or has completed the [draining process]({% link {{ page.version.version }}/node-shutdown.md %}#node-shutdown-sequence).<br><br>**Required flag:** `--decommission` or `--all`

### `node decommission`

Field | Description
------|------------
`id` | The ID of the node.
`is_live` | If `true`, the node is live.
`replicas` | The number of replicas on the node that are active members of a range. After the decommissioning process completes, this should be 0.
`is_decommissioning` | If `true`, the node is either undergoing or has completed the [decommissioning process]({% link {{ page.version.version }}/node-shutdown.md %}?filters=decommission#node-shutdown-sequence).
`is_draining` | If `true`, the node is either undergoing or has completed the [draining process]({% link {{ page.version.version }}/node-shutdown.md %}#node-shutdown-sequence).

If the rebalancing stalls during decommissioning, replicas that have yet to move are printed to the [SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}) and written to the [`OPS` logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels) with the message `possible decommission stall detected`. [By default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), the `OPS` channel logs output to a `cockroach.log` file.

### `node recommission`

Field | Description
------|------------
`id` | The ID of the node.
`is_live` | If `true`, the node is live.
`replicas` | The number of replicas on the node that are active members of a range. After the decommissioning process completes, this should be 0.
`is_decommissioning` | If `true`, the node is either undergoing or has completed the [decommissioning process]({% link {{ page.version.version }}/node-shutdown.md %}?filters=decommission#node-shutdown-sequence).
`is_draining` | If `true`, the node is either undergoing or has completed the [draining process]({% link {{ page.version.version }}/node-shutdown.md %}#node-shutdown-sequence).

## Examples

### Setup

To follow along with the examples, start [an insecure cluster]({% link {{ page.version.version }}/start-a-local-cluster.md %}), with [localities]({% link {{ page.version.version }}/cockroach-start.md %}#locality) defined.

### List node IDs

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

The `is_live` and `is_available` columns give you information about a node's current status:

- `is_live`: The node is up and running
- `is_available`: The node is part of the [quorum]({% link {{ page.version.version }}/architecture/replication-layer.md %}#overview).

Only nodes that are both `is_live: true` and `is_available: true` can participate in the cluster. If either are `false`, check the logs so you can troubleshoot the node(s) in question.

For example, the following indicates a healthy cluster, where a majority of the nodes are up (`is_live: true`) and a quorum can be reached (`is_available: true` for live nodes):

{% include_cached copy-clipboard.html %}
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

The following indicates an unhealthy cluster, where a majority of nodes are down (`is_live: false`), and thereby quorum cannot be reached (`is_available: false` for all nodes):

{% include_cached copy-clipboard.html %}
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

### Drain nodes

See [Drain a node manually]({% link {{ page.version.version }}/node-shutdown.md %}#drain-a-node-manually).

### Decommission nodes

See [Remove nodes]({% link {{ page.version.version }}/node-shutdown.md %}?filters=decommission#remove-nodes).

### Recommission nodes

See [Recommission Nodes]({% link {{ page.version.version }}/node-shutdown.md %}?filters=decommission#recommission-nodes).

## See also

- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [Node Shutdown]({% link {{ page.version.version }}/node-shutdown.md %})
