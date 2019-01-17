---
title: View Node Details
summary: To view details for each node in the cluster, use the cockroach node command with the appropriate subcommands and flags.
toc: true
---

To view details for each node in the cluster, use the `cockroach node` [command](cockroach-commands.html) with the appropriate subcommands and flags.

<span class="version-tag">New in v1.1:</span> The `cockroach node` command is also used in the process of decommissioning nodes for permanent removal. See [Remove Nodes](remove-nodes.html) for more details.


## Subcommands

Subcommand | Usage
-----------|------
`ls` | List the ID of each active node in the cluster. This does not include dead nodes or inactive nodes (i.e., nodes that have been decommissioned). To retrieve the IDS for inactive nodes, use `node status --decommision`.
`status` | View the status of one or all nodes. Depending on flags used, this can include details about range/replicas, disk usage, and decommissioning progress.
`decommission` | <span class="version-tag">New in v1.1:</span> Decommission nodes for permanent removal. See [Remove Nodes](remove-nodes.html) for more details.
`recommission` | <span class="version-tag">New in v1.1:</span> Recommission nodes that were accidentally decommissioned. See [Recommission Nodes](remove-nodes.html#recommission-nodes) for more details.

## Synopsis

~~~ shell
# List the IDs of active nodes:
$ cockroach node ls <flags>

# Show status details for active nodes:
$ cockroach node status <flags>

# Show status and range/replica details for active nodes:
$ cockroach node status --ranges <flags>

# Show status and disk usage details for active nodes:
$ cockroach node status --stats <flags>

# Show status and decommissioning details for active and inactive nodes:
$ cockroach node status --decommission <flags>

# Show complete status details for active and inactive nodes:
$ cockroach node status --all <flags>

# Show status details for a specific node:
$ cockroach node status <node ID> <flags>

# Decommission nodes:
$ cockroach node decommission <node IDs> <flags>

# Recommission nodes:
$ cockroach node recommission <node IDs> <flags>

# View help:
$ cockroach node --help
$ cockroach node ls --help
$ cockroach node status --help
$ cockroach node decommission --help
$ cockroach node recommission --help
~~~

## Flags

All `node` subcommands support the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `pretty`, `records`, `sql`, `html`.<br><br>**Default:** `tsv`

The `node status` subcommand also supports the following general flags:

Flag | Description
-----|------------
`--all` | Show all node details.
`--decommission` | Show node decommissioning details.
`--ranges` | Show node details for ranges and replicas.
`--stats` | Show node disk usage details.

The `node decommission` subcommand also supports the following general flag:

Flag | Description
-----|------------
`--wait` | When to return to the client. Possible values: `all`, `live`, `none`.<br><br>If `all`, the command returns to the client only after all specified nodes are fully decommissioned. If any specified nodes are offline, the command will not return to the client until those nodes are back online.<br><br>If `live`, the command returns to the client after all online nodes are fully decommissioned. Any specified nodes that are offline will automatically will be marked as decommissioned; if they come back online, the cluster will recognize this status and will not rebalance data to the nodes.<br><br>If `none`, the command does not wait for decommissioning to finish; it returns to the client after starting the decommissioning process on all specified nodes that are online. Any specified nodes that are offline will automatically be marked as decommissioned; if they come back online, the cluster will recognize this status and will not rebalance data to the nodes.<br><br>**Default:** `all`

### Client Connection

{% include {{ page.version.version }}/sql/connection-parameters-with-url.md %}

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
`is_live` | If `true`, the node is currently live.<br><br>**Required flag:** `--decommission` or `--all`
`gossiped_replicas` | The number of replicas on the node that are active members of a range. After decommissioning, this should be 0.<br><br>**Required flag:** `--decommission` or `--all`
`is_decommissioning` | If `true`, the node is marked for decommissioning. See [Remove Nodes](remove-nodes.html) for more details.<br><br>**Required flag:** `--decommission` or `--all`
`is_draining` | If `true`, the range replicas and range leases are being moved off the node. This happens when a live node is being decommissioned. See [Remove Nodes](remove-nodes.html) for more details.<br><br>**Required flag:** `--decommission` or `--all`

### `node decommission`

Field | Description
------|------------
`id` | The ID of the node.
`is_live` | If `true`, the node is live.
`gossiped_replicas` | The number of replicas on the node that are active members of a range. After decommissioning, this should be 0.
`is_decommissioning` | If `true`, the node is marked for decommissioning. See [Remove Nodes](remove-nodes.html) for more details.
`is_draining` | If `true`, the range replicas and range leases are being moved off the node. This happens when a live node is being decommissioned. See [Remove Nodes](remove-nodes.html) for more details.

### `node recommission`

Field | Description
------|------------
`id` | The ID of the node.
`is_live` | If `true`, the node is live.
`gossiped_replicas` | The number of replicas on the node that are active members of a range. After decommissioning, this should be 0.
`is_decommissioning` | If `true`, the node is marked for decommissioning. See [Remove Nodes](remove-nodes.html) for more details.
`is_draining` | If `true`, the range replicas and range leases are being moved off the node. This happens when a live node is being decommissioned. See [Remove Nodes](remove-nodes.html) for more details.

## Examples

### List node IDs

~~~ shell
$ cockroach node ls --insecure
~~~

~~~
+----+
| id |
+----+
|  1 |
|  2 |
|  3 |
|  4 |
|  5 |
+----+
~~~

### Show the status of a single node

~~~ shell
$ cockroach node status 1 --insecure
~~~

~~~
+----+-----------------------+---------+---------------------+---------------------+
| id |        address        |  build  |     updated_at      |     started_at      |
+----+-----------------------+---------+---------------------+---------------------+
|  1 | 165.227.60.76:26257   | 91a299d | 2017-09-07 18:16:03 | 2017-09-07 16:30:13 |
+----+-----------------------+---------+---------------------+---------------------+
(1 row)
~~~

### Show the status of all nodes

~~~ shell
$ cockroach node status --insecure
~~~

~~~
+----+-----------------------+---------+---------------------+---------------------+
| id |        address        |  build  |     updated_at      |     started_at      |
+----+-----------------------+---------+---------------------+---------------------+
|  1 | 165.227.60.76:26257   | 91a299d | 2017-09-07 18:16:03 | 2017-09-07 16:30:13 |
|  2 | 192.241.239.201:26257 | 91a299d | 2017-09-07 18:16:05 | 2017-09-07 16:30:45 |
|  3 | 67.207.91.36:26257    | 91a299d | 2017-09-07 18:16:06 | 2017-09-07 16:31:06 |
|  4 | 138.197.12.74:26257   | 91a299d | 2017-09-07 18:16:03 | 2017-09-07 16:44:23 |
|  5 | 174.138.50.192:26257  | 91a299d | 2017-09-07 18:16:07 | 2017-09-07 17:12:57 |
+----+-----------------------+---------+---------------------+---------------------+
(5 rows)
~~~

### Decommission nodes

See [Remove Nodes](remove-nodes.html)

### Recommission nodes

See [Recommission Nodes](remove-nodes.html#recommission-nodes)

## See Also

- [Other Cockroach Commands](cockroach-commands.html)
- [Remove Nodes](remove-nodes.html)
