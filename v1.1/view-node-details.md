---
title: View Node Details
summary: To view details for each node in the cluster, use the cockroach node command with the appropriate subcommands and flags.
toc: false
---

To view details for each node in the cluster, use the `cockroach node` [command](cockroach-commands.html) with the appropriate subcommands and flags.

The `cockroach node` command is also used in the process of decommissioning nodes for permanent removal. See [Remove a Node](remove-a-node.html) for more details.

<div id="toc"></div>

## Subcommands

Subcommand | Usage
-----------|------
`ls` | List the ID of each node in the cluster.
`status` | View the status of one or all nodes.
`decommission` | Decommission nodes for permanent removal. See [Remove Nodes](remove-nodes.html) for more details.
`recommission` | Recommission nodes that were accidentally decommissioned. See [Recommission Nodes](remove-nodes.html#recommission-nodes) for more details.

## Synopsis

~~~ shell
# List node IDs:
$ cockroach node ls <flags>

# Show the status of nodes:
$ cockroach node status <optional node ID> <flags>

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
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--format` | How to disply table rows printed to the standard output. Possible values: `tsv`, `csv`, `pretty`, `records`, `sql`, `html`.<br><br>**Default:** `tsv`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

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
`--wait` | When to return to the client. Possible values: `all`, `live`, `none`.<br><br>If `all`, the command returns to the client only after all specified nodes are fully decommissioned. If any specified nodes are offline, the command won't return to the client until those nodes are back online.<br><br>If `live`, the command returns to the client after all online nodes are fully decommissioned. Any specified nodes that are offline will automatically will be marked as decommissioned; if they come back online, the cluster will recognize this status and will not rebalance data to the nodes.<br><br>If `none`, the command does not wait for decommissioning to finish; it returns to the client after starting the decommissioning process on all specified nodes that are online. Any specified nodes that are offline will automatically be marked as decommissioned; if they come back online, the cluster will recognize this status and will not rebalance data to the nodes.<br><br>**Default:** `all`

### Logging

By default, the `node` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Response

For the `node ls` command, only the `id` field is returned for each node. For the `node status` command, all of the following fields are returned for each node.

Field | Description
----------|------------
`id` |
`address` |
`build` |
`updated_at` |
`started_at` |
`live_bytes` |
`key_bytes` |
`value_bytes` |
`intent_bytes` |
`system_bytes` |
`leader_ranges` |
`repl_ranges` |
`avail_ranges` |

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
+----+
~~~

### Show the status of a single node

~~~ shell
$ cockroach node status 1 --insecure
~~~

~~~
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
| id |     address     |           build           |     updated_at      |     started_at      | live_bytes | key_bytes | value_bytes | intent_bytes | system_bytes | leader_ranges | repl_ranges | avail_ranges |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
|  1 | localhost:26257 | beta-20160421-42-g62a0fd2 | 2016-04-21 14:41:11 | 2016-04-21 14:12:21 |    4162883 |      4343 |     4159321 |            0 |         3459 |             4 |           4 |            4 |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
~~~

### Show the status of all nodes

~~~ shell
$ cockroach node status --insecure
~~~

~~~
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
| id |     address     |           build           |     updated_at      |     started_at      | live_bytes | key_bytes | value_bytes | intent_bytes | system_bytes | leader_ranges | repl_ranges | avail_ranges |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
|  1 | localhost:26257 | beta-20160421-42-g62a0fd2 | 2016-04-21 14:41:51 | 2016-04-21 14:12:21 |    4260491 |      4343 |     4256929 |            0 |         3459 |             4 |           4 |            4 |
|  2 | localhost:26258 | beta-20160421-42-g62a0fd2 | 2016-04-21 14:41:53 | 2016-04-21 14:12:53 |    4268625 |      4343 |     4265063 |            0 |         3459 |             1 |           1 |            1 |
|  3 | localhost:26259 | beta-20160421-42-g62a0fd2 | 2016-04-21 14:41:48 | 2016-04-21 14:13:18 |    4252357 |      4343 |     4248795 |            0 |         3459 |             0 |           0 |            0 |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
~~~

### Decommission nodes

See [Remove Nodes](remove-nodes.html)

### Recommission nodes

See [Recommission Nodes](remove-nodes.html#recommission-nodes)

## See Also

- [Other Cockroach Commands](cockroach-commands.html)
- [Remove Nodes](remove-nodes.html)
