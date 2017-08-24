---
title: Decommission a Node
summary: Prepare a node to be permanently removed from a cluster.
toc: false
---

<span class="version-tag">New in v1.1:</span> Before [permanently removing a node](stop-a-node.html) from a cluster, use the `cockroach node decommission` command to decommission the node. This process prepares the node to be safely removed by transferring all range replicas and range leases on the node to other nodes of the cluster. For more on these concepts, see [Stopping vs. Decommissioning Nodes](stop-a-node.html#stopping-vs-removing-nodes).

To temporarily stop a node during the process of [upgrading your cluster's version of CockroachDB](upgrade-cockroach-version.html), use the [`cockroach quit`](stop-a-node.html) command without the `--decommission` flag instead.

<div id="toc"></div>

## Considerations

As explained [here](stop-a-node.html#stopping-vs-removing-nodes), CockroachDB stores data in a giant sorted map of key-vaue pairs that is divided into "ranges", contiguous chunks of the keyspace. Each "range" is replicated (3 times by default), with each range replica stored on a different node (CockroachDB never allows more than one replica of a range on a single node).

With this in mind, before decommissioning a node, make sure other nodes are available to take over the range replicas from the node. If no other nodes are available, the decommission process will hang indefinitely.

Consider some scenarios:

### 3-node cluster with 3-way replication

In this scenario, each range is replicated 3 times, with each replica on a different node:

<div style="text-align: center;"><img src="{{ 'images/decommission-scenario1.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you try to decommission a node, the process will hang indefinitely because the cluster can't move the decommissioned node's replicas to the other 2 nodes, which already have a replica of each range:

<div style="text-align: center;"><img src="{{ 'images/decommission-scenario1.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

To successfully decommission a node, you need to first add a 4th node:

<div style="text-align: center;"><img src="{{ 'images/decommission-scenario1.3.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

### 5-node cluster with 3-way replication

In this scenario, like in the scenario above, each range is replicated 3 times, with each replica on a different node:

<div style="text-align: center;"><img src="{{ 'images/decommission-scenario2.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you decommission a node, the process will run successfully because the cluster will be able to move the node's replicas to other nodes without doubling up any range replicas:

<div style="text-align: center;"><img src="{{ 'images/decommission-scenario2.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

### 5-node cluster with 5-way replication for a specific table

In this scenario, a [custom replication zone](configure-replication-zones.html#create-a-replication-zone-for-a-table) has been set to replicate a specific table 5 times (range 6), while all other data is replicated 3 times:

<div style="text-align: center;"><img src="{{ 'images/decommission-scenario3.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you try to decommission a node, the cluster will successfully rebalance all ranges but range 6. Since range 6 requires 5 replicas (based on the table-specific replication zone), and since CockroachDB won't allow more than a single replica of any range on a single node, the decommission process will hang indefinitely:

<div style="text-align: center;"><img src="{{ 'images/decommission-scenario3.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

To successfully decommission a node, you need to first add a 6th node:

<div style="text-align: center;"><img src="{{ 'images/decommission-scenario3.3.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

## Synopsis

~~~ shell
# Decommission one or more nodes:
$ cockroach node decommission <node IDs> <other flags>

# View help:
$ cockroach node decommission --help
~~~

## Flags

The `cockroach node decommission` command supports the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--format` | How to disply table rows printed to the standard output. Possible values: `tsv`, `csv`, `pretty`, `records`, `sql`, `html`.<br><br>**Default:** `tsv`
`--wait` | When to return the client issuing the `node decommision` command. Possible values: `all`, `live`, `none`.<br><br>If `all`, the command returns to the client only after all specified nodes are fully decommissioned (0 range replicas, 0 range leases). If any specified nodes are offline, the command won't return to the client until those nodes are back online and fully decommissioned.<br><br>If `live`, the command returns to the client after all online nodes are fully decommissioned. Any specified nodes that are offline will automatically be decommissioned once they're back online. In this case, you need to manually check the remaining nodes' decommissioning process.<br><br>If `none`, the command does not wait for decommissioning to finish; it returns to the client after starting the decommissioning process on all specified nodes that are online. Any specified nodes that are offline will automatically be decommissioned once they're back online. In this case, you need to manually check all specified nodes' decommissioning process.<br><br>**Default:** `all`

### Logging

By default, the `node` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Example

### Decommission and remove a node

{% include cli/decommission-a-node.html %}

### Check the status of decommissioning nodes

When decommissioning nodes, if the command returns to the client before all specified nodes have finished decommissioning (e.g., when using `--wait=none` or `--wait=live`), it's important to check the status before proceeding to [remove a node](stop-a-node.html):

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div><br>

<div class="filter-content" markdown="1" data-scope="secure">
~~~ shell
$ cockroach node status --decommission --certs-dir=certs --host=<address of any node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
~~~ shell
$ cockroach node status --decommission --insecure --host=<address of any node>
~~~
</div>

~~~
+----+-----------------------+---------------------+---------------------+---------------------+---------+-------------------+--------------------+-------------+
| id |        address        |        build        |     updated_at      |     started_at      | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+-----------------------+---------------------+---------------------+---------------------+---------+-------------------+--------------------+-------------+
|  1 | 165.227.60.76:26257   | v1.1-alpha.20170817 | 2017-09-01 16:09:25 | 2017-08-30 16:17:05 | true    |                93 | false              | false       |
|  2 | 192.241.239.201:26257 | v1.1-alpha.20170817 | 2017-09-01 16:09:20 | 2017-08-30 16:18:20 | true    |                93 | false              | false       |
|  3 | 67.207.91.36:26257    | v1.1-alpha.20170817 | 2017-09-01 16:09:21 | 2017-08-30 16:19:20 | true    |                93 | false              | false       |
|  4 | 138.197.12.74:26257   | v1.1-alpha.20170817 | 2017-09-01 15:55:23 | 2017-08-30 16:20:13 | false   |                 0 | true               | true        |
+----+-----------------------+---------------------+---------------------+---------------------+---------+-------------------+--------------------+-------------+
(4 rows)
~~~

## See Also
