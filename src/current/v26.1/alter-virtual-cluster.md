---
title: ALTER VIRTUAL CLUSTER
summary: The ALTER VIRTUAL CLUSTER statement manages a virtual cluster, including any related physical replication stream.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The `ALTER VIRTUAL CLUSTER` statement initiates a [_failover_](#start-the-failover-process) or [_failback_](#start-the-failback-process) in a [**physical cluster replication (PCR)** job]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}) and manages a virtual cluster.

{% include {{ page.version.version }}/physical-replication/phys-rep-sql-pages.md %}

## Required privileges

To run the `ALTER VIRTUAL CLUSTER` statement from the standby cluster, users require the `REPLICATIONDEST` system [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}) **and** the `MANAGEVIRTUALCLUSTER` privilege. 

Use the [`GRANT SYSTEM`]({% link {{ page.version.version }}/grant.md %}) statement to grant the necessary privileges, for example:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SYSTEM MANAGEVIRTUALCLUSTER TO user;
~~~

## Synopsis

<div>
{% include {{ page.version.version }}/physical-replication/alter-virtual-cluster-diagram.html %}
</div>

## Parameters

Parameter | Description
----------+------------
`virtual_cluster_spec` | The virtual cluster's name.
`PAUSE REPLICATION` | Pause the replication stream.
`RESUME REPLICATION` | Resume the replication stream.
`COMPLETE REPLICATION TO` | Set the time to complete the replication. Use: <br><ul><li>`SYSTEM TIME` to specify a [timestamp]({% link {{ page.version.version }}/as-of-system-time.md %}). Refer to [Fail over to a point in time]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-a-point-in-time) for an example.</li><li>`LATEST` to specify the most recent replicated timestamp. Refer to [Fail over to a point in time]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-the-most-recent-replicated-time) for an example.</li></ul>
`START REPLICATION OF virtual_cluster_spec ON physical_cluster` | Reset a virtual cluster to the time when the virtual cluster on the promoted standby diverged from it. To reuse as much of the existing data on the original primary cluster as possible, you can run this statement as part of the [failback]({% link {{ page.version.version }}/failover-replication.md %}#failback) process. This command fails if the virtual cluster was not originally replicated from the original primary cluster. Refer to [Options](#options) for details on how you can configure a PCR stream initiated as a failback.
`START SERVICE SHARED` | Start a virtual cluster so it is ready to accept SQL connections after failover.
`RENAME TO virtual_cluster_spec` | Rename a virtual cluster.
`STOP SERVICE` | Stop the `shared` service for a virtual cluster. The virtual cluster's `data_state` will still be `ready` so that the service can be restarted.
`GRANT ALL CAPABILITIES` | Grant a virtual cluster all [capabilities]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities).
`REVOKE ALL CAPABILITIES` | Revoke all [capabilities]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) from a virtual cluster.
`GRANT CAPABILITY virtual_cluster_capability_list` | Specify a [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) to grant to a virtual cluster.
`REVOKE CAPABILITY virtual_cluster_capability_list` | Revoke a [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) from a virtual cluster.

## Options

You can use the following options with `ALTER VIRTUAL CLUSTER {vc} START REPLICATION OF virtual_cluster_spec ON physical_cluster` to initiate the [failback process]({% link {{ page.version.version }}/failover-replication.md %}#failback).

Option | Value | Description
-------+-------+------------
`READ VIRTUAL CLUSTER` | N/A | ([**Preview**]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}#features-in-preview)) Configure the PCR stream to allow reads from the standby cluster. <br>**Note:** This only allows for reads on the standby's virtual cluster. You cannot perform writes or schema changes to user tables while connected to the standby virtual cluster. For more details, refer to [Start the failback process](#start-the-failback-process).

## Examples

### Start the failover process

To start the [failover]({% link {{ page.version.version }}/failover-replication.md %}#failover) process from the standby cluster, use `COMPLETE REPLICATION` and provide the timestamp to restore as of:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main COMPLETE REPLICATION TO {failover time specification};
~~~

You can use either:

- `SYSTEM TIME` to specify a [timestamp]({% link {{ page.version.version }}/as-of-system-time.md %}).
- `LATEST` to specify the most recent replicated timestamp.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/physical-replication/failover-read-virtual-cluster.md %}
{{site.data.alerts.end}}

When a virtual cluster is [`ready`]({% link {{ page.version.version }}/show-virtual-cluster.md %}#responses) after initiating the failover process, you must start the service so that the virtual cluster is ready to accept SQL connections. On the standby cluster, run:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main START SERVICE SHARED;
~~~

To stop the `shared` service for a virtual cluster and prevent it from accepting SQL connections:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main STOP SERVICE;
~~~

### Start the failback process

To [fail back]({% link {{ page.version.version }}/failover-replication.md %}#failback) to a cluster that was previously the primary cluster, use the `ALTER VIRTUAL CLUSTER` syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER {original_primary_vc} START REPLICATION OF {promoted_standby_vc} ON {connection_string_standby};
~~~

The original primary virtual cluster may be almost up to date with the promoted standby's virtual cluster. The difference in data between the two virtual clusters will include only the writes that have been applied to the promoted standby after failover from the primary cluster.

([**Preview**]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}#features-in-preview)) Use the `READ VIRTUAL CLUSTER` option with the `ALTER VIRTUAL CLUSTER` failback syntax to start a PCR stream that also creates a read-only virtual cluster on the standby cluster.

{{site.data.alerts.callout_info}}
If you started the original PCR stream on an existing cluster without virtualization enabled, refer to the [Fail back after PCR from an existing cluster]({% link {{ page.version.version }}/failover-replication.md %}) section for instructions.
{{site.data.alerts.end}}

## See also

- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %})
- [`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %})
- [`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %})
