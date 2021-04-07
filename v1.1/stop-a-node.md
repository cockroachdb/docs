---
title: Stop a Node
summary: This page shows you how to use the cockroach quit command to temporarily stop a node that you plan to restart.
toc: true
---

This page shows you how to use the `cockroach quit` [command](cockroach-commands.html) to temporarily stop a node that you plan to restart, for example, during the process of [upgrading your cluster's version of CockroachDB](upgrade-cockroach-version.html).

For information about permanently removing nodes to downsize a cluster or react to hardware failures, see [Remove Nodes](remove-nodes.html).


## Overview

### How It Works

- Cancels all current sessions without waiting.
- Transfers all **range leases** and Raft leadership to other nodes.
- Gossips its draining state to the cluster so that no leases are transferred to the draining node. Note that this is a best effort, so other nodes may not receive the gossip info in time.
- No new ranges are transferred to the draining node, to avoid a possible loss of quorum after the node shuts down.

If the node then stays offline for a certain amount of time (5 minutes by default), the cluster considers the node dead and starts to transfer its **range replicas** to other nodes as well.

After that, if the node comes back online, its range replicas will determine whether or not they are still valid members of replica groups. If a range replica is still valid and any data in its range has changed, it will receive updates from another replica in the group. If a range replica is no longer valid, it will be removed from the node.

Basic terms:

- **Range**: CockroachDB stores all user data and almost all system data in a giant sorted map of key value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
- **Range Replica:** CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
- **Range Lease:** For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.

### Considerations

As mentioned above, by default, if a node stays offline for more than 5 minutes, the cluster will consider it dead and will rebalance its data to other nodes. Therefore, before temporarily stopping nodes, if you expect any node to be offline for longer than 5 minutes, you should first set the `server.time_until_store_dead` [cluster setting](cluster-settings.html) to higher than the `5m0s` default.

For example, let's say you're upgrading system software on a group of servers, and the nodes running on the servers may be offline for up to 15 minutes as a result. Before shutting down the nodes, you would change the `server.time_until_store_dead` cluster setting as follows:

~~~ sql
> SET CLUSTER SETTING server.time_until_store_dead = '15m0s';
~~~

After completing the system upgrades and restarting the nodes, you would then change the setting back to its default:

~~~ sql
> SET CLUSTER SETTING server.time_until_store_dead = '5m0s';
~~~

## Synopsis

~~~ shell
# Temporarily stop a node:
$ cockroach quit <flags>

# View help:
$ cockroach quit --help
~~~

## Flags

The `quit` command supports the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--decommission` | If specified, the node will be permanently removed instead of temporarily stopped. See [Remove Nodes](remove-nodes.html) for more details.

### Client Connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

### Logging

By default, the `quit` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Examples

### Stop a Node from the Machine Where It's Running

1. SSH to the machine where the node is running.

2. If the node is running in the background and you are using a process manager for automatic restarts, use the process manager to stop the `cockroach` process without restarting it.

    If the node is running in the background and you are not using a process manager, send a kill signal to the `cockroach` process, for example:

    ~~~ shell
    $ pkill cockroach
    ~~~

    If the node is running in the foreground, press `CTRL-C`.

3. Verify that the `cockroach` process has stopped:

    ~~~ shell
    $ ps aux | grep cockroach
    ~~~

    Alternately, you can check the node's logs for the message `server drained and shutdown completed`.

### Stop a Node from Another Machine

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

<div class="filter-content" markdown="1" data-scope="secure">
1. [Install the `cockroach` binary](install-cockroachdb.html) on a machine separate from the node.

2. Create a `certs` directory and copy the CA certificate and the client certificate and key for the `root` user into the directory.

3. Run the `cockroach quit` command without the `--decommission` flag:

    ~~~ shell
    $ cockroach quit --certs-dir=certs --host=<address of node to stop>
    ~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
1. [Install the `cockroach` binary](install-cockroachdb.html) on a machine separate from the node.

2. Run the `cockroach quit` command without the `--decommission` flag:

    ~~~ shell
    $ cockroach quit --insecure --host=<address of node to stop>
    ~~~
</div>

## See Also

- [Other Cockroach Commands](cockroach-commands.html)
- [Permanently Remove Nodes from a Cluster](remove-nodes.html)
- [Upgrade a Cluster's Version](upgrade-cockroach-version.html)
