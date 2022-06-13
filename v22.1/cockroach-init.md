---
title: cockroach init
summary: Perform a one-time-only initialization of a CockroachDB cluster.
toc: true
key: initialize-a-cluster.html
docs_area: reference.cli
---

This page explains the `cockroach init` [command](cockroach-commands.html), which you use to perform a one-time initialization of a new multi-node cluster. For a full tutorial of the cluster startup and initialization process, see one of the [Manual Deployment](manual-deployment.html) tutorials.

{{site.data.alerts.callout_info}}
When starting a single-node cluster with [`cockroach start-single-node`](cockroach-start-single-node.html), you do not need to use the `cockroach init` command.
{{site.data.alerts.end}}

## Synopsis

Perform a one-time initialization of a cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init <flags>
~~~

View help:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init --help
~~~

## Flags

The `cockroach init` command supports the following [client connection](#client-connection) and [logging](#logging) flags.

{{site.data.alerts.callout_info}}
`cockroach init` must target one of the nodes that was listed with [`--join`](cockroach-start.html#networking) when starting the cluster. Otherwise, the command will not initialize the cluster correctly.
{{site.data.alerts.end}}

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}
`--cluster-name` | The cluster name to use to verify the cluster's identity. If the cluster has a cluster name, you must include this flag. For more information, see [`cockroach start`](cockroach-start.html#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. This flag must be paired with `--cluster-name`. For more information, see [`cockroach start`](cockroach-start.html#general).

See [Client Connection Parameters](connection-parameters.html) for details.

### Logging

{% include {{ page.version.version }}/misc/logging-defaults.md %}

## Examples

Usage of `cockroach init` assumes that nodes have already been started with [`cockroach start`](cockroach-start.html) and are waiting to be initialized as a new cluster. For a more detailed tutorial, see one of the [Manual Deployment](manual-deployment.html) tutorials.

### Initialize a Cluster on a Node's Machine

<section class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</section>

<section class="filter-content" markdown="1" data-scope="secure">
1. SSH to the machine where the node has been started. This must be a node that was listed with [`--join`](cockroach-start.html#networking) when starting the cluster.

2. Make sure the `client.root.crt` and `client.root.key` files for the `root` user are on the machine.

3. Run the `cockroach init` command with the `--certs-dir` flag set to the directory containing the `ca.crt` file and the files for the `root` user, and with the `--host` flag set to the address of the current node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --certs-dir=certs --host=<address of this node>
    ~~~

    At this point, all the nodes complete startup and print helpful details to the [standard output](cockroach-start.html#standard-output), such as the CockroachDB version, the URL for the DB Console, and the SQL URL for clients.
</section>

<section class="filter-content" markdown="1" data-scope="insecure">
1. SSH to the machine where the node has been started. This must be a node that was listed with [`--join`](cockroach-start.html#networking) when starting the cluster.

2. Run the `cockroach init` command with the `--host` flag set to the address of the current node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=<address of this node>
    ~~~

    At this point, all the nodes complete startup and print helpful details to the [standard output](cockroach-start.html#standard-output), such as the CockroachDB version, the URL for the DB Console, and the SQL URL for clients.
</section>

### Initialize a cluster from another machine

<section class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</section>

<section class="filter-content" markdown="1" data-scope="secure">
1. [Install the `cockroach` binary](install-cockroachdb.html) on a machine separate from the node.

2. Create a `certs` directory and copy the CA certificate and the client certificate and key for the `root` user into the directory.

3. Run the `cockroach init` command with the `--certs-dir` flag set to the directory containing the `ca.crt` file and the files for the `root` user, and with the `--host` flag set to the address of the node. This must be a node that was listed with [`--join`](cockroach-start.html#networking) when starting the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --certs-dir=certs --host=<address of any node on --join list>
    ~~~

    At this point, all the nodes complete startup and print helpful details to the [standard output](cockroach-start.html#standard-output), such as the CockroachDB version, the URL for the DB Console, and the SQL URL for clients.
</section>

<section class="filter-content" markdown="1" data-scope="insecure">
1. [Install the `cockroach` binary](install-cockroachdb.html) on a machine separate from the node.

2. Run the `cockroach init` command with the `--host` flag set to the address of the node. This must be a node that was listed with [`--join`](cockroach-start.html#networking) when starting the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=<address of any node on --join list>
    ~~~

    At this point, all the nodes complete startup and print helpful details to the [standard output](cockroach-start.html#standard-output), such as the CockroachDB version, the URL for the DB Console, and the SQL URL for clients.
</section>

## See also

- [Manual Deployment](manual-deployment.html)
- [Orchestrated Deployment](orchestration.html)
- [Local Deployment](start-a-local-cluster.html)
- [`cockroach start`](cockroach-start.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
