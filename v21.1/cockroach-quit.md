---
title: cockroach quit
summary: Learn how to temporarily stop a CockroachDB node.
toc: true
redirect_from: stop-a-node.html
key: stop-a-node.html
---

{{site.data.alerts.callout_danger}}
`cockroach quit` is deprecated. To stop a node, do one of the following:

{% include {{ page.version.version }}/prod-deployment/node-shutdown.md %}
{{site.data.alerts.end}}

This page shows you how to use the `cockroach quit` [command](cockroach-commands.html) to temporarily stop a node that you plan to restart.

You might do this, for example, during the process of [upgrading your cluster's version of CockroachDB](upgrade-cockroach-version.html) or to perform planned maintenance (e.g., upgrading system software).

{{site.data.alerts.callout_info}}
In other scenarios, such as when downsizing a cluster or reacting to hardware failures, it's best to remove nodes from your cluster entirely. For information about this, see [Decommission Nodes](remove-nodes.html).
{{site.data.alerts.end}}

## Overview

### How it works

When you stop a node, it performs the following steps:

- Finishes in-flight requests. Note that this is a best effort that times out after the duration specified by the `server.shutdown.query_wait` [cluster setting](cluster-settings.html).
- Gossips its draining state to the cluster, so that other nodes do not try to distribute query planning to the draining node. Note that this is a best effort that times out after the duration specified by the `server.shutdown.drain_wait` [cluster setting](cluster-settings.html), so other nodes may not receive the gossip info in time.

If the node then stays offline for a certain amount of time (5 minutes by default), the cluster considers the node dead and starts to transfer its **range replicas** to other nodes as well.

After that, if the node comes back online, its range replicas will determine whether or not they are still valid members of replica groups. If a range replica is still valid and any data in its range has changed, it will receive updates from another replica in the group. If a range replica is no longer valid, it will be removed from the node.

Basic terms:

- **Range**: CockroachDB stores all user data and almost all system data in a giant sorted map of key value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
- **Range Replica:** CockroachDB replicates each range (3 times by default) and stores each replica on a different node.

### Considerations

{% include {{ page.version.version }}/faq/planned-maintenance.md %}

## Synopsis

Temporarily stop a node:

~~~ shell
$ cockroach quit <flags>
~~~

View help:

~~~ shell
$ cockroach quit --help
~~~

## Flags

The `quit` command supports the following [general-use](#general), [client connection](#client-connection), and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--drain-wait` | Amount of time to wait for the node to drain before stopping the node. See [`cockroach node drain`](cockroach-node.html) for more details.<br><br>**Default:** `10m`

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}
`--cluster-name` | The cluster name to use to verify the cluster's identity. If the cluster has a cluster name, you must include this flag. For more information, see [`cockroach start`](cockroach-start.html#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. This flag must be paired with `--cluster-name`. For more information, see [`cockroach start`](cockroach-start.html#general).

See [Client Connection Parameters](connection-parameters.html) for more details.

### Logging

By default, the `quit` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Examples

### Stop a node from the machine where it's running

1. SSH to the machine where the node is running.

2. If the node is running in the background and you are using a process manager for automatic restarts, use the process manager to stop the `cockroach` process without restarting it.

    If the node is running in the background and you are not using a process manager, send a kill signal to the `cockroach` process, for example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill cockroach
    ~~~

    If the node is running in the foreground, press `CTRL-C`.

3. Verify that the `cockroach` process has stopped:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ps aux | grep cockroach
    ~~~

    Alternately, you can check the node's logs for the message `server drained and shutdown completed`.

### Stop a node from another machine

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

<section class="filter-content" markdown="1" data-scope="secure">
1. [Install the `cockroach` binary](install-cockroachdb.html) on a machine separate from the node.

2. Create a `certs` directory and copy the CA certificate and the client certificate and key for the `root` user into the directory.

3. Run the `cockroach quit` command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --host=<address of node to stop>
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="insecure">
1. [Install the `cockroach` binary](install-cockroachdb.html) on a machine separate from the node.

2. Run the `cockroach quit` command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=<address of node to stop>
    ~~~
</section>

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [Decommission Nodes](remove-nodes.html)
- [Upgrade a Cluster's Version](upgrade-cockroach-version.html)
