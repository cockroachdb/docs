---
title: Stop or Remove a Node
summary: Learn why and how to temporarily stop a CockroachDB node.
toc: false
---

<span class="version-tag">Changed in v1.1:</span> This page shows you how to use the `cockroach quit` [command](cockroach-commands.html) to either temporarily stop a node that you plan to restart or permanently remove a node that has already been [decommissioned](decommission-a-node.html).

Generally, you temporarily stop nodes during the process of [upgrading your cluster's version of CockroachDB](upgrade-cockroach-version.html), whereas you permanently remove nodes when downsizing a cluster.

<div id="toc"></div>

## Stopping vs. Removing Nodes

To differentiate between stopping and removing nodes, it's important to first understand three concepts:

- **Range**: CockroachDB stores all user data and almost all system data in a giant sorted map of key value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.

- **Range Replica:** CockroachDB replicates each range (3 times by default) and stores each replica on a different node.

- **Range Lease:** For each range, one of its replicas holds the "range lease". The replica with the lease is the one that receives and coordinates all read and write requests for the range.

When you **temporarily stop a node**, CockroachDB lets the node finish all in-flight requests and transfers any range leases off the node before shutting it down. Range replicas are left on the node in the expectation that it will rejoin the cluster (specifically in the case of version upgrades). If the node does not rejoin within approximately 5 minutes, however, CockroachDB automatically rebalances the node's range replicas to other nodes, using unaffected replicas on other nodes as sources.

When you **permanently remove a node**, the only difference is that the range replicas are actively moved off the node before the node shuts down.

## Synopsis

~~~ shell
# Temporarily stop a node:
$ cockroach quit <flags except --decommission>

# Permanently remove a node:
$ cockroach quit --decommission <other flags>

# View help:
$ cockroach quit --help
~~~

## Flags

The `quit` command supports the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--decommission` | If specified, the node will be permanently removed instead of temporarily stopped.<br><br>Use this flag with `cockroach quit` after decommissioning the node with the [`cockroach node decommission`](decommission-a-node.html) command.
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:**`localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

### Logging

By default, the `quit` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Examples

### Temporarily stop a node

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

To temporarily stop a node running in the background:

1. [Install the `cockroach` binary](install-cockroachdb.html) on a machine separate from the node:

2. Run the `cockroach quit` command without the `--decommission` flag:

    <div class="filter-content" markdown="1" data-scope="secure">
    ~~~ shell
    $ cockroach quit --certs-dir=certs --host=<address of node to stop>
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="insecure">
    ~~~ shell
    $ cockroach quit --insecure --host=<address of node to stop>
    ~~~
    </div>

To stop a node running in the foreground, either follow the instructions above or SSH onto the node and press `CTRL + c`.

### Permanently decommission and remove a node

{% include cli/decommission-a-node.html %}

## See Also

- [Other Cockroach Commands](cockroach-commands.html)
- [Decommission a Node](decommission-a-node.html)
