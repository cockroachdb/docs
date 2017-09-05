---
title: Stop a Node
summary: Learn how to temporarily stop a CockroachDB node.
toc: false
---

This page shows you how to use the `cockroach quit` [command](cockroach-commands.html) to temporarily stop a node that you plan to restart, for example, during the process of [upgrading your cluster's version of CockroachDB](upgrade-cockroach-version.html).

For information about permanently removing nodes to downsize a cluster or react to hardware failures, see [Remove a Node](remove-a-node.html).

<div id="toc"></div>

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
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--decommission` | If specified, the node will be permanently removed instead of temporarily stopped. See [Remove a Node](remove-a-node.html) for more details.
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:**`localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

### Logging

By default, the `quit` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Examples

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

### Stop a Node from the Machine Where It's Running

1. SSH to the machine where the node is running.

2. If the node is running in the background, run the `cockroach quit` command without the `--decommission` flag:

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

    If the node is running in the foreground, press `CTRL + c`.

### Stop a Node from Another Machine

1. [Install the `cockroach` binary](install-cockroachdb.html) on a machine separate from the node.

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

## See Also

- [Other Cockroach Commands](cockroach-commands.html)
- [Permanently Remove Nodes from a Cluster](remove-nodes.html)
