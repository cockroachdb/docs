---
title: cockroach start
summary: Start a new multi-node cluster or add nodes to an existing multi-node cluster.
toc: true
key: start-a-node.html
docs_area: reference.cli
---

{% assign version = page.version.version | replace: ".", "" %}
{% assign start_cmd = site.data[version]["cockroach-commands"] | where: "command_id", "cockroach_start" | first %}

This page explains the `cockroach start` [command]({% link {{ page.version.version }}/cockroach-commands.md %}), which you use to start a new multi-node cluster or add nodes to an existing cluster.

{{site.data.alerts.callout_success}}
If you need a simple single-node backend for app development, use [`cockroach start-single-node`]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) instead, and follow the best practices for local testing described in [Test Your Application]({% link {{ page.version.version }}/local-testing.md %}).

For quick SQL testing, consider using [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) to start a temporary, in-memory cluster with immediate access to an interactive SQL shell.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Node-level settings are defined by [flags](#flags) passed to the `cockroach start` command and cannot be changed without stopping and restarting the node. In contrast, some cluster-wide settings are defined via SQL statements and can be updated anytime after a cluster has been started. For more details, see [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %}).
{{site.data.alerts.end}}

## Synopsis

Start a node to be part of a new multi-node cluster:

~~~ shell
{{ start_cmd.synopsis.start_new_cluster }}
~~~

Initialize a new multi-node cluster:

~~~ shell
{{ start_cmd.synopsis.initialize_cluster }}
~~~

Add a node to an existing cluster:

~~~ shell
{{ start_cmd.synopsis.add_node }}
~~~

View help:

~~~ shell
{{ start_cmd.synopsis.view_help }}
~~~

## Flags

The `cockroach start` command supports the following [general-use](#general), [networking](#networking), [security](#security), and [logging](#logging) flags.

Many flags have useful defaults that can be overridden by specifying the flags explicitly. If you specify flags explicitly, however, be sure to do so each time the node is restarted, as they will not be remembered. The one exception is the `--join` flag, which is stored in a node's data directory. We still recommend specifying the `--join` flag every time, as this will allow nodes to rejoin the cluster even if their data directory was destroyed.

### General

{% include {{ page.version.version }}/reference/flags-table.md flags=start_cmd.flags.general %}

### Networking

{% include {{ page.version.version }}/reference/flags-table.md flags=start_cmd.flags.networking %}

### Security

{% include {{ page.version.version }}/reference/flags-table.md flags=start_cmd.flags.security %}

### Locality

The `--locality` flag accepts arbitrary key-value pairs that describe the location of the node. Locality should include a `region` key-value if you are using CockroachDB's [Multi-region SQL capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}).

Depending on your deployment you can also specify country, availability zone, etc. The key-value pairs should be ordered into _locality tiers_ from most inclusive to least inclusive (e.g., region before availability zone as in `region=eu-west-1,zone=eu-west-1a`), and the keys and order of key-value pairs must be the same on all nodes. It's typically better to include more pairs than fewer.

- Specifying a region with a `region` tier is required in order to enable CockroachDB's [multi-region capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}).

- CockroachDB spreads the replicas of each piece of data across as diverse a set of localities as possible, with the order determining the priority. Locality can also be used to influence the location of data replicas in various ways using high-level [multi-region SQL capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}) or low-level [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-constraints).

- When there is high latency between nodes (e.g., cross-availability zone deployments), CockroachDB uses locality to move range leases closer to the current workload, reducing network round trips and improving read performance, also known as ["follow-the-workload"]({% link {{ page.version.version }}/topology-follow-the-workload.md %}). In a deployment across more than 3 availability zones, however, to ensure that all data benefits from "follow-the-workload", you must increase your replication factor to match the total number of availability zones.

- Locality is also a prerequisite for using the [Multi-region SQL abstractions]({% link {{ page.version.version }}/multiregion-overview.md %}), [table partitioning]({% link {{ page.version.version }}/partitioning.md %}), and [**Node Map**]({% link {{ page.version.version }}/enable-node-map.md %}) {{site.data.products.enterprise}} features.

<a name="locality-example"></a>

#### Example

The following shell commands use the `--locality` flag to start 9 nodes to run across 3 regions: `us-east-1`, `us-west-1`, and `europe-west-1`. Each region's nodes are further spread across different availability zones within that region.

{{site.data.alerts.callout_info}}
This example follows the conventions required to use CockroachDB's [multi-region capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}).
{{site.data.alerts.end}}

Nodes in `us-east-1`:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1a # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1b # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1c # ... other required flags go here
~~~

Nodes in `us-west-1`:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-west-1,zone=us-west-1a # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-west-1,zone=us-west-1b # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-west-1,zone=us-west-1c # ... other required flags go here
~~~

Nodes in `europe-west-1`:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=europe-west-1,zone=europe-west-1a # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=europe-west-1,zone=europe-west-1b # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=europe-west-1,zone=europe-west-1c # ... other required flags go here
~~~

For another multi-region example, see [Start a multi-region cluster](#start-a-multi-region-cluster).

For more information about how to use CockroachDB's multi-region capabilities, see the [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).

#### Load-based lease rebalancing in uneven latency deployments

When nodes are started with the `--locality` flag, CockroachDB attempts to place the replica lease holder (the replica that client requests are forwarded to) on the node closest to the source of the request. This means as client requests move geographically, so too does the replica lease holder.

However, you might see increased latency caused by a consistently high rate of lease transfers between datacenters in the following case:

- Your cluster runs in datacenters which are very different distances away from each other.
- Each node was started with a single tier of `--locality`, e.g., `--locality=datacenter=a`.
- Most client requests get sent to a single datacenter because that's where all your application traffic is.

To detect if this is happening, open the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), select the **Queues** dashboard, hover over the **Replication Queue** graph, and check the **Leases Transferred / second** data point. If the value is consistently larger than 0, you should consider stopping and restarting each node with additional tiers of locality to improve request latency.

For example, let's say that latency is 10ms from nodes in datacenter A to nodes in datacenter B but is 100ms from nodes in datacenter A to nodes in datacenter C. To ensure A's and B's relative proximity is factored into lease holder rebalancing, you could restart the nodes in datacenter A and B with a common region, `--locality=region=foo,datacenter=a` and `--locality=region=foo,datacenter=b`, while restarting nodes in datacenter C with a different region, `--locality=region=bar,datacenter=c`.

### Storage

- [Storage engine](#storage-engine)
- [Store](#store)
- [Write Ahead Log (WAL) Failover](#write-ahead-log-wal-failover)

#### Storage engine

The `--storage-engine` flag is used to choose the storage engine used by the node. Note that this setting applies to all [stores](#store) on the node, including the [temp store](#temp-dir).

 As of v21.1 and later, CockroachDB always uses the [Pebble storage engine]({% link {{ page.version.version }}/architecture/storage-layer.md %}#pebble). As such, `pebble` is the default and only option for the `--storage-engine` flag.

#### Store

The `--store` flag allows you to specify details about a node's storage.

To start a node with multiple disks or SSDs, provide a separate `--store` flag for each disk when starting the `cockroach` process on the node. For more details about stores, see [Start a Node]({% link {{ page.version.version }}/cockroach-start.md %}#store).

  {{site.data.alerts.callout_danger}}
  If you start a node with multiple `--store` flags, it is not possible to scale back down to only using a single store on the node. Instead, you must decommission the node and start a new node with the updated `--store`.
  {{site.data.alerts.end}}

The `--store` flag supports the following fields. Note that commas are used to separate fields, and so are forbidden in all field values.

{{site.data.alerts.callout_info}}
In-memory storage is not suitable for production deployments at this time.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/prod-guidance-store-volume.md %}
{{site.data.alerts.end}}

{% include {{ page.version.version }}/reference/flags-table.md flags=start_cmd.flags.store %}

#### Write Ahead Log (WAL) failover

{% include {{ page.version.version }}/wal-failover-intro.md %}

This page has basic instructions on how to enable WAL failover, disable WAL failover, and monitor WAL failover.

For more detailed instructions showing how to use, test, and monitor WAL failover, as well as descriptions of how WAL failover works in multi-store configurations, see [WAL Failover]({% link {{ page.version.version }}/wal-failover.md %}).

##### Enable WAL failover

To enable WAL failover, you must take one of the following actions:

- Pass [`--wal-failover=among-stores`](#flag-wal-failover) to `cockroach start`, or
- Set the environment variable `COCKROACH_WAL_FAILOVER=among-stores` before starting the node.

[Writing log files to local disk]({% link {{ page.version.version }}/configure-logs.md %}#output-to-files) using the default configuration can lead to cluster instability in the event of a [disk stall]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls). It's not enough to failover your WAL writes to another disk: you must also write your log files in such a way that the forward progress of your cluster is not stalled due to disk unavailability.

Therefore, if you enable WAL failover and log to local disks, you must also update your [logging]({% link {{page.version.version}}/logging-overview.md %}) configuration as follows:

1. Disable [audit logging]({% link {{ page.version.version }}/sql-audit-logging.md %}). File-based audit logging cannot coexist with the WAL failover feature. File-based audit logging provides guarantees that every log message makes it to disk, or CockroachDB must be shut down. For this reason, resuming operations in the face of disk unavailability is not compatible with audit logging.
1. Enable asynchronous buffering of [`file-groups` log sinks]({% link {{ page.version.version }}/configure-logs.md %}#output-to-files) using the `buffering` configuration option. The `buffering` configuration can be applied to [`file-defaults`]({% link {{ page.version.version }}/configure-logs.md %}#configure-logging-defaults) or individual `file-groups` as needed. Note that enabling asynchronous buffering of `file-groups` log sinks is in [preview]({% link {{page.version.version}}/cockroachdb-feature-availability.md %}#features-in-preview).
1. Set `max-staleness: 1s` and `flush-trigger-size: 256KiB`.
1. When `buffering` is enabled, `buffered-writes` must be explicitly disabled as shown in the following example. This is necessary because `buffered-writes` does not provide true asynchronous disk access, but rather a small buffer. If the small buffer fills up, it can cause internal routines performing logging operations to hang. This will in turn cause internal routines doing other important work to hang, potentially affecting cluster stability.
1. The recommended logging configuration for using file-based logging with WAL failover is as follows:

    {% include {{ page.version.version }}/wal-failover-log-config.md %}

As an alternative to logging to local disks, you can configure [remote log sinks]({% link {{page.version.version}}/logging-use-cases.md %}#network-logging) that are not correlated with the availability of your cluster's local disks. However, this will make troubleshooting using [`cockroach debug zip`]({% link {{ page.version.version}}/cockroach-debug-zip.md %}) more difficult, since the output of that command will not include the (remotely stored) log files.

##### Disable WAL failover

To disable WAL failover, you must [restart the node]({% link {{ page.version.version }}/node-shutdown.md %}#stop-and-restart-a-node) and either:

- Pass the [`--wal-failover=disabled`](#flag-wal-failover) flag to `cockroach start`, or
- Set the environment variable `COCKROACH_WAL_FAILOVER=disabled` before restarting the node.

##### Monitor WAL failover

{% include {{ page.version.version }}/wal-failover-metrics.md %}

### Logging

By [default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), `cockroach start` writes all messages to log files, and prints nothing to `stderr`. This includes events with `INFO` [severity]({% link {{ page.version.version }}/logging.md %}#logging-levels-severities) and higher. However, you can [customize the logging behavior]({% link {{ page.version.version }}/configure-logs.md %}) of this command by using the `--log` flag:

{% include {{ page.version.version }}/misc/logging-flags.md %}

#### Defaults

See the [default logging configuration]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration).

## Standard output

When you run cockroach start, helpful details are printed to the standard output:

~~~ shell
CockroachDB node starting at {{ now | date: "%Y-%m-%d %H:%M:%S.%6 +0000 UTC" }}
build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}} (go1.12.6)
webui:               http://localhost:8080
sql:                 postgresql://root@localhost:26257?sslmode=disable
sql (JDBC):          jdbc:postgresql://localhost:26257/defaultdb?sslmode=disable&user=root
RPC client flags:    cockroach <client cmd> --host=localhost:26257 --insecure
logs:                /Users/<username>/node1/logs
temp dir:            /Users/<username>/node1/cockroach-temp242232154
external I/O path:   /Users/<username>/node1/extern
store[0]:            path=/Users/<username>/node1
status:              initialized new cluster
clusterID:           8a681a16-9623-4fc1-a537-77e9255daafd
nodeID:              1
~~~

{{site.data.alerts.callout_success}}
These details are also written to the `INFO` log in the `/logs` directory. You can retrieve them with a command like `grep 'node starting' node1/logs/cockroach.log -A 11`.
{{site.data.alerts.end}}

Field | Description
------|------------
{% for field in start_cmd.standard_output.fields -%}
`{{ field.field }}` | {{ field.description }}
{% endfor %}

## Examples

### Start a multi-node cluster

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

To start a multi-node cluster, run the `cockroach start` command for each node, setting the `--join` flag to the addresses of the initial nodes.

{% include {{ page.version.version }}/prod-deployment/join-flag-single-region.md %}

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/prod-deployment/join-flag-multi-region.md %}
{{site.data.alerts.end}}

<div class="filter-content" markdown="1" data-scope="secure">

{{site.data.alerts.callout_success}}
Before starting the cluster, use [`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %}) to generate node and client certificates for a secure cluster connection.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--advertise-addr=<node1 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--advertise-addr=<node2 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--advertise-addr=<node3 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--advertise-addr=<node1 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--advertise-addr=<node2 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--advertise-addr=<node3 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

</div>

Then run the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command against any node to perform a one-time cluster initialization:

<div class="filter-content" markdown="1" data-scope="secure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init \
--certs-dir=certs \
--host=<address of any node>
~~~

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init \
--insecure \
--host=<address of any node>
~~~

</div>

### Start a multi-region cluster

In this example we will start a multi-node [local cluster]({% link {{ page.version.version }}/start-a-local-cluster.md %}) with a multi-region setup that uses the same regions (passed to the [`--locality`](#locality) flag) as the multi-region MovR demo application.

1. Start a node in the `us-east1` region:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start --locality=region=us-east1,zone=us-east-1a \
                      --insecure --store=/tmp/node0 \
                      --listen-addr=localhost:26257 \
                      --http-port=8888 \
                      --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

1. Start a node in the `us-west1` region:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start --locality=region=us-west1,zone=us-west-1a \
                      --insecure \
                      --store=/tmp/node2 \
                      --listen-addr=localhost:26259 \
                      --http-port=8890 \
                      --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

1. Start a node in the `europe-west1` region:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start --locality=region=europe-west1,zone=europe-west-1a \
                      --insecure \
                      --store=/tmp/node1 \
                      --listen-addr=localhost:26258 \
                      --http-port=8889 \
                      --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

1. Initialize the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach init --insecure --host=localhost --port=26257
    ~~~

1. Connect to the cluster using [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --host=localhost --port=26257 --insecure
    ~~~

1. Issue the [`SHOW REGIONS`]({% link {{ page.version.version }}/show-regions.md %}) statement to verify that the list of regions is expected:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW REGIONS;
    ~~~

    ~~~
        region    | zones | database_names | primary_region_of
    ---------------+-------+----------------+--------------------
      europe-west1 | {}    | {}             | {}
      us-east1     | {}    | {}             | {}
      us-west1     | {}    | {}             | {}
    (3 rows)
    ~~~

For more information about running CockroachDB multi-region, see the [Multi-region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).

{{site.data.alerts.callout_info}}
For more information about the `--locality` flag, see [Locality](#locality).
{{site.data.alerts.end}}

### Start a multi-node cluster across private networks

**Scenario:**

- You have a cluster that spans GCE and AWS.
- The nodes on each cloud can reach each other on public addresses, but the private addresses aren't reachable from the other cloud.

**Approach:**

1. Start each node on GCE with `--locality` set to describe its location, `--locality-advertise-addr` set to advertise its private address to other nodes in on GCE, `--advertise-addr` set to advertise its public address to nodes on AWS, and `--join` set to the public addresses of 3-5 of the initial nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --locality=cloud=gce \
    --locality-advertise-addr=cloud=gce@<private address of node> \
    --advertise-addr=<public address of node> \
    --join=<public address of node1>,<public address of node2>,<public address of node3> \
    --cache=.25 \
    --max-sql-memory=.25
    ~~~

1. Start each node on AWS with `--locality` set to describe its location, `--locality-advertise-addr` set to advertise its private address to other nodes on AWS, `--advertise-addr` set to advertise its public address to nodes on GCE, and `--join` set to the public addresses of 3-5 of the initial nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --locality=cloud=aws \
    --locality-advertise-addr=cloud=aws@<private address of node> \
    --advertise-addr=<public address of node> \
    --join=<public address of node1>,<public address of node2>,<public address of node3> \
    --cache=.25 \
    --max-sql-memory=.25
    ~~~

1. Run the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command against any node to perform a one-time cluster initialization:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init \
    --certs-dir=certs \
    --host=<address of any node>
    ~~~

### Add a node to a cluster

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

To add a node to an existing cluster, run the `cockroach start` command, setting the `--join` flag to the same addresses you used when [starting the cluster](#start-a-multi-node-cluster):

<div class="filter-content" markdown="1" data-scope="secure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--advertise-addr=<node4 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--advertise-addr=<node4 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

</div>

### Create a table with node locality information

Start a three-node cluster with locality information specified in the `cockroach start` commands:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --port=26257 --http-port=26258 --store=cockroach-data/1 --cache=256MiB --locality=region=eu-west-1,cloud=aws,zone=eu-west-1a
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --port=26259 --http-port=26260 --store=cockroach-data/2 --cache=256MiB --join=localhost:26257 --locality=region=eu-west-1,cloud=aws,zone=eu-west-1b
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --port=26261 --http-port=26262 --store=cockroach-data/3 --cache=256MiB --join=localhost:26257 --locality=region=eu-west-1,cloud=aws,zone=eu-west-1c
~~~

You can use the [`crdb_internal.locality_value`]({% link {{ page.version.version }}/functions-and-operators.md %}#system-info-functions) built-in function to return the current node's locality information from inside a SQL shell. The example below uses the output of `crdb_internal.locality_value('zone')` as the `DEFAULT` value to use for the `zone` column of new rows. Other available locality keys for the running three-node cluster include `region` and `cloud`.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE charges (
  zone STRING NOT NULL DEFAULT crdb_internal.locality_value('zone'),
  id INT PRIMARY KEY NOT NULL
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO charges (id) VALUES (1);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM charges WHERE id = 1;
~~~

~~~
     zone    | id
+------------+----+
  eu-west-1a |  1
(1 row)
~~~

The `zone ` column has the zone of the node on which the row was created.

In a separate terminal window, open a SQL shell to a different node on the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --port 26259
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO charges (id) VALUES (2);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM charges WHERE id = 2;
~~~

~~~
     zone    | id
+------------+----+
  eu-west-1b |  2
(1 row)
~~~

In a separate terminal window, open a SQL shell to the third node:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --port 26261
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO charges (id) VALUES (3);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM charges WHERE id = 3;
~~~

~~~
     zone    | id
+------------+----+
  eu-west-1c |  3
(1 row)
~~~

### Start a cluster with separate RPC and SQL networks

Separating the network addresses used for intra-cluster RPC traffic and application SQL connections can provide an additional level of protection against security issues as a form of [defense in depth](https://wikipedia.org/wiki/Defense_in_depth_(computing)). This separation is accomplished with a combination of the [`--sql-addr` flag](#networking) and firewall rules or other network-level access control (which must be maintained outside of CockroachDB).

For example, suppose you want to use port `26257` for SQL connections and `26258` for intra-cluster traffic. Set up firewall rules so that the CockroachDB nodes can reach each other on port `26258`, but other machines cannot. Start the CockroachDB processes as follows:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --sql-addr=:26257 --listen-addr=:26258 --join=node1:26258,node2:26258,node3:26258 --certs-dir=~/cockroach-certs
~~~

Note the use of port `26258` (the value for `listen-addr`, not `sql-addr`) in the `--join` flag. Also, if your environment requires the use of the `--advertise-addr` flag, you should probably also use the `--advertise-sql-addr` flag when using a separate SQL address.

Clusters using this configuration with client certificate authentication may also wish to use [split client CA certificates]({% link {{ page.version.version }}/create-security-certificates-custom-ca.md %}#split-ca-certificates).

## See also

- [Initialize a Cluster]({% link {{ page.version.version }}/cockroach-init.md %})
- [Manual Deployment]({% link {{ page.version.version }}/manual-deployment.md %})
- [Kubernetes Overview]({% link {{ page.version.version }}/kubernetes-overview.md %})
- [Local Deployment]({% link {{ page.version.version }}/start-a-local-cluster.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})