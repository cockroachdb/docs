---
title: Stop a Node
summary: Learn how to stop a node.
toc: true
---

This page shows you how to use the `cockroach quit` [command](cockroach-commands.html) to stop a node.


## Overview

### How It Works

When you stop a node, CockroachDB lets the node finish in-flight requests and transfers all **range leases** off the node before shutting it down. If the node then stays offline for more than 5 minutes, the cluster considers the node dead and starts to transfer its **range replicas** to other nodes as well.

After that, if the node comes back online, its range replicas will determine whether or not they are still valid members of replica groups. If a range replica is still valid and any data in its range has changed, it will receive updates from another replica in the group. If a range replica is no longer valid, it will be removed from the node.

Basic terms:

- **Range**: CockroachDB stores all user data and almost all system data in a giant sorted map of key value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
- **Range Replica:** CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
- **Range Lease:** For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.

### Considerations

Before temporarily stopping a node to [upgrade its version of CockroachDB](upgrade-cockroach-version.html), if you expect the node to be offline for longer than 5 minutes, you should first set the `server.time_until_store_dead` [cluster setting](cluster-settings.html) to higher than the `5m0s` default. For example, if you think the node might be offline for up to 8 minutes, you might change this setting as follows:

~~~ sql
> SET CLUSTER SETTING server.time_until_store_dead = 10m0s;
~~~

## Synopsis

~~~ shell
# Stop a node:
$ cockroach quit <flags>

# View help:
$ cockroach quit --help
~~~

## Flags

The `quit` command supports the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). If the cluster is secure, this directory must contain a valid CA certificate and a client certificate and key for the `root` user. Client certificates for other users are not supported.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:**`localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

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

- [Upgrade a Cluster's Version](upgrade-cockroach-version.html)
- [Other Cockroach Commands](cockroach-commands.html)
