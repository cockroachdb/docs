---
title: View Node Details
summary: To view details for each node in the cluster, use the cockroach node command with the appropriate subcommands and flags.
toc: true
---

To view details for each node in the cluster, use the `cockroach node` [command](cockroach-commands.html) with the appropriate subcommands and flags.

The `cockroach node` command is also used in the process of decommissioning nodes for permanent removal. See [Remove Nodes](remove-nodes.html) for more details.


## Subcommands

Subcommand | Usage
-----------|------
`ls` | List the ID of each node in the cluster, excluding those that have been decommissioned and are offline.
`status` | View the status of one or all nodes, excluding nodes that have been decommissioned and taken offline. Depending on flags used, this can include details about range/replicas, disk usage, and decommissioning progress.
`decommission` | Decommission nodes for permanent removal. See [Remove Nodes](remove-nodes.html) for more details.
`recommission` | Recommission nodes that were accidentally decommissioned. See [Recommission Nodes](remove-nodes.html#recommission-nodes) for more details.

## Synopsis

~~~ shell
# List the IDs of active and inactive nodes:
$ cockroach node ls <flags>

# Show status details for active and inactive nodes:
$ cockroach node status <flags>

# Show status and range/replica details for active and inactive nodes:
$ cockroach node status --ranges <flags>

# Show status and disk usage details for active and inactive nodes:
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

The `node decommission` subcommand also supports the following general flag:

Flag | Description
-----|------------
`--wait` | When to return to the client. Possible values: `all`, `none`.<br><br>If `all`, the command returns to the client only after all specified nodes are fully decommissioned. If any specified nodes are offline, the command will not return to the client until those nodes are back online.<br><br>If `none`, the command does not wait for decommissioning to finish; it returns to the client after starting the decommissioning process on all specified nodes that are online. Any specified nodes that are offline will automatically be marked as decommissioned; if they come back online, the cluster will recognize this status and will not rebalance data to the nodes.<br><br>**Default:** `all`

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

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
`is_available` | If `true`, the node is currently available.<br><br>**Required flag:** None
`is_live` | If `true`, the node is currently live. <br><br>For unavailable clusters (with an unresponsive Admin UI), running the `node status` command and monitoring the `is_live` field is the only way to identify the live nodes in the cluster. However, you need to run the `node status` command on a live node to identify the other live nodes in an unavailable cluster. Figuring out a live node to run the command is a trial-and-error process, so run the command against each node until you get one that responds. <br><br> See [Identify live nodes in an unavailable cluster](#identify-live-nodes-in-an-unavailable-cluster) for more details. <br><br>**Required flag:** None
`gossiped_replicas` | The number of replicas on the node that are active members of a range. After decommissioning, this should be 0.<br><br>**Required flag:** `--decommission` or `--all`
`is_decommissioning` | If `true`, the node is marked for decommissioning. See [Remove Nodes](remove-nodes.html) for more details.<br><br>**Required flag:** `--decommission` or `--all`
`is_draining` | If `true`, the range replicas and range leases are being moved off the node. This happens when a live node is being decommissioned. See [Remove Nodes](remove-nodes.html) for more details.<br><br>**Required flag:** `--decommission` or `--all`

### `node decommission`

Field | Description
------|------------
`id` | The ID of the node.
`is_live` | If `true`, the node is live.
`replicas` | The number of replicas on the node that are active members of a range. After decommissioning, this should be 0.
`is_decommissioning` | If `true`, the node is marked for decommissioning. See [Remove Nodes](remove-nodes.html) for more details.
`is_draining` | If `true`, the range replicas and range leases are being moved off the node. This happens when a live node is being decommissioned. See [Remove Nodes](remove-nodes.html) for more details.

### `node recommission`

Field | Description
------|------------
`id` | The ID of the node.
`is_live` | If `true`, the node is live.
`replicas` | The number of replicas on the node that are active members of a range. After decommissioning, this should be 0.
`is_decommissioning` | If `true`, the node is marked for decommissioning. See [Remove Nodes](remove-nodes.html) for more details.
`is_draining` | If `true`, the range replicas and range leases are being moved off the node. This happens when a live node is being decommissioned. See [Remove Nodes](remove-nodes.html) for more details.

## Examples

### List node IDs

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node ls --host=165.227.60.76 --certs-dir=certs
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

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status 1 --host=165.227.60.76 --certs-dir=certs
~~~

~~~
+----+-----------------------+---------+---------------------+---------------------+---------+
| id |        address        |  build  |     updated_at      |     started_at      | is_live |
+----+-----------------------+---------+---------------------+---------------------+---------+
|  1 | 165.227.60.76:26257   | 91a299d | 2017-09-07 18:16:03 | 2017-09-07 16:30:13 | true    |
+----+-----------------------+---------+---------------------+---------------------+---------+
(1 row)
~~~

### Show the status of all nodes

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status --host=165.227.60.76 --certs-dir=certs
~~~

~~~
  id |     address           |                build                 |            started_at            |            updated_at            | is_available | is_live  
+----+-----------------------+--------------------------------------+----------------------------------+----------------------------------+--------------+---------+
   1 | 165.227.60.76:26257   | v2.1.0-beta.20180917-146-g19ca36c89a | 2018-09-18 17:24:30.797131+00:00 | 2018-09-18 17:25:20.351483+00:00 | true         | true     
   2 | 192.241.239.201:26257 | v2.1.0-beta.20180917-146-g19ca36c89a | 2018-09-18 17:24:38.914482+00:00 | 2018-09-18 17:25:23.984197+00:00 | true         | true     
   3 | 67.207.91.36:26257    | v2.1.0-beta.20180917-146-g19ca36c89a | 2018-09-18 17:24:57.957116+00:00 | 2018-09-18 17:25:20.535474+00:00 | true         | true
(3 rows)
~~~

### Identify live nodes in an unavailable cluster

The `is_live` and `is_available` fields are marked as `true` as long as a majority of the nodes are up, and a quorum can be reached:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach quit --host=192.241.239.201 --certs-dir=certs
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status --host=165.227.60.76 --certs-dir=certs
~~~

~~~
   id |     address           |                build                 |            started_at            |            updated_at            | is_available | is_live  
+-----+-----------------------+--------------------------------------+----------------------------------+----------------------------------+--------------+---------+
    1 | 165.227.60.76:26257   | v2.1.0-beta.20180917-146-g19ca36c89a | 2018-09-18 17:24:30.797131+00:00 | 2018-09-18 17:54:21.894586+00:00 | true         | true     
    2 | 192.241.239.201:26257 | v2.1.0-beta.20180917-146-g19ca36c89a | 2018-09-18 17:50:17.839323+00:00 | 2018-09-18 17:52:06.172624+00:00 | false        | false    
    3 | 67.207.91.36:26257    | v2.1.0-beta.20180917-146-g19ca36c89a | 2018-09-18 17:50:10.961166+00:00 | 2018-09-18 17:54:24.925007+00:00 | true         | true     
(3 rows)
~~~

If a majority of nodes are down and a quorum cannot be reached, the `is_live` field is marked as `true` for the nodes that are up, but the `is_available` field is marked as `false` for all nodes:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach quit --host=67.207.91.36 --certs-dir=certs
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status --host=165.227.60.76 --certs-dir=certs
~~~

~~~
  id |     address           |                build                 |            started_at            |            updated_at            | is_available | is_live  
+----+-----------------------+--------------------------------------+----------------------------------+----------------------------------+--------------+---------+
   1 | 165.227.60.76:26257   | v2.1.0-beta.20180917-146-g19ca36c89a | 2018-09-18 17:24:30.797131+00:00 | 2018-09-18 17:30:48.860329+00:00 | false        | true     
   2 | 192.241.239.201:26257 | v2.1.0-beta.20180917-146-g19ca36c89a | 2018-09-18 17:24:38.914482+00:00 | 2018-09-18 17:25:31.137222+00:00 | false        | false    
   3 | 67.207.91.36:26257    | v2.1.0-beta.20180917-146-g19ca36c89a | 2018-09-18 17:24:57.957116+00:00 | 2018-09-18 17:30:49.943822+00:00 | false        | false    
(3 rows)
~~~

{{site.data.alerts.callout_info}}
You need to run the `node status` command on a live node to identify the other live nodes in an unavailable cluster. Figuring out a live node to run the command is a trial-and-error process, so run the command against each node until you get one that responds.
{{site.data.alerts.end}}

### Decommission nodes

See [Remove Nodes](remove-nodes.html)

### Recommission nodes

See [Recommission Nodes](remove-nodes.html#recommission-nodes)

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [Remove Nodes](remove-nodes.html)
