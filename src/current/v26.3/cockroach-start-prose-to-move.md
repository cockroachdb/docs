# Content to Move from cockroach-start.md

This document describes all of the conceptual/how-to documentation from the original `cockroach start` page that should be moved to other parts of the documentation.

## From Flags Section

### Introductory text about flags:

The `cockroach start` command supports the following [general-use](#general), [networking](#networking), [security](#security), and [logging](#logging) flags.

Many flags have useful defaults that can be overridden by specifying the flags explicitly. If you specify flags explicitly, however, be sure to do so each time the node is restarted, as they will not be remembered. The one exception is the `--join` flag, which is stored in a node's data directory. We still recommend specifying the `--join` flag every time, as this will allow nodes to rejoin the cluster even if their data directory was destroyed.

## Locality Section

The `--locality` flag accepts arbitrary key-value pairs that describe the location of the node. Locality should include a `region` key-value if you are using CockroachDB's [Multi-region SQL capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}).

Depending on your deployment you can also specify country, availability zone, etc. The key-value pairs should be ordered into _locality tiers_ from most inclusive to least inclusive (e.g., region before availability zone as in `region=eu-west-1,zone=eu-west-1a`), and the keys and order of key-value pairs must be the same on all nodes. It's typically better to include more pairs than fewer.

- Specifying a region with a `region` tier is required in order to enable CockroachDB's [multi-region capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}).

- CockroachDB spreads the replicas of each piece of data across as diverse a set of localities as possible, with the order determining the priority. Locality can also be used to influence the location of data replicas in various ways using high-level [multi-region SQL capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}) or low-level [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-constraints).

- When there is high latency between nodes (e.g., cross-availability zone deployments), CockroachDB uses locality to move range leases closer to the current workload, reducing network round trips and improving read performance, also known as ["follow-the-workload"]({% link {{ page.version.version }}/topology-follow-the-workload.md %}). In a deployment across more than 3 availability zones, however, to ensure that all data benefits from "follow-the-workload", you must increase your replication factor to match the total number of availability zones.

- Locality is also a prerequisite for using the [Multi-region SQL abstractions]({% link {{ page.version.version }}/multiregion-overview.md %}), [table partitioning]({% link {{ page.version.version }}/partitioning.md %}), and [**Node Map**]({% link {{ page.version.version }}/enable-node-map.md %}) {{site.data.products.enterprise}} features.

### Locality Example

[Lines 84-145 containing the multi-region locality example with shell commands]

### Load-based lease rebalancing in uneven latency deployments

[Lines 147-159 containing information about lease rebalancing]

## Storage Section Prose

### Storage engine

The `--storage-engine` flag is used to choose the storage engine used by the node. Note that this setting applies to all [stores](#store) on the node, including the [temp store](#flags-temp-dir).

As of v21.1 and later, CockroachDB always uses the [Pebble storage engine]({% link {{ page.version.version }}/architecture/storage-layer.md %}#pebble). As such, `pebble` is the default and only option for the `--storage-engine` flag.

### Store introductory text

The `--store` flag allows you to specify details about a node's storage.

To start a node with multiple disks or SSDs, provide a separate `--store` flag for each disk when starting the `cockroach` process on the node. For more details about stores, see [Start a Node]({% link {{ page.version.version }}/cockroach-start.md %}#store).

{{site.data.alerts.callout_danger}}
If you start a node with multiple `--store` flags, it is not possible to scale back down to only using a single store on the node. Instead, you must decommission the node and start a new node with the updated `--store`.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
In-memory storage is not suitable for production deployments at this time.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/prod-guidance-store-volume.md %}
{{site.data.alerts.end}}

### Write Ahead Log (WAL) failover

[Lines 195-233 containing all WAL failover documentation]

## Logging Section

By [default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), `cockroach start` writes all messages to log files, and prints nothing to `stderr`. This includes events with `INFO` [severity]({% link {{ page.version.version }}/logging.md %}#logging-levels-severities) and higher. However, you can [customize the logging behavior]({% link {{ page.version.version }}/configure-logs.md %}) of this command by using the `--log` flag:

{% include {{ page.version.version }}/misc/logging-flags.md %}

### Defaults

See the [default logging configuration]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration).

## Examples Section (All to be moved)

[Lines 271-657 containing all examples]
- Start a multi-node cluster
- Start a multi-region cluster
- Start a multi-node cluster across private networks
- Add a node to a cluster
- Create a table with node locality information
- Start a cluster with separate RPC and SQL networks