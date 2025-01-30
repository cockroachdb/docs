---
title: ALTER VIRTUAL CLUSTER
summary: The ALTER VIRTUAL CLUSTER statement manages a virtual cluster, including any related physical replication stream.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{{site.data.alerts.end}}

The `ALTER VIRTUAL CLUSTER` statement initiates a failover in a [**physical cluster replication (PCR)** job]({{ page.version.version }}/set-up-physical-cluster-replication.md) and manages a virtual cluster.


## Required privileges

`ALTER VIRTUAL CLUSTER` requires one of the following privileges:

- The `admin` role.
- The `MANAGEVIRTUALCLUSTER` [system privilege]({{ page.version.version }}/security-reference/authorization.md#privileges) allows the user to run all the related `VIRTUAL CLUSTER` SQL statements for PCR.

Use the [`GRANT SYSTEM`]({{ page.version.version }}/grant.md) statement:

~~~ sql
GRANT SYSTEM MANAGEVIRTUALCLUSTER TO user;
~~~

## Synopsis

<div>
</div>

## Parameters

Parameter | Description
----------+------------
`virtual_cluster_spec` | The virtual cluster's name.
`PAUSE REPLICATION` | Pause the replication stream.
`RESUME REPLICATION` | Resume the replication stream.
`COMPLETE REPLICATION TO` | Set the time to complete the replication. Use: <br><ul><li>`SYSTEM TIME` to specify a [timestamp]({{ page.version.version }}/as-of-system-time.md). Refer to [Fail over to a point in time]({{ page.version.version }}/failover-replication.md#fail-over-to-a-point-in-time) for an example.</li><li>`LATEST` to specify the most recent replicated timestamp. Refer to [Fail over to a point in time]({{ page.version.version }}/failover-replication.md#fail-over-to-the-most-recent-replicated-time) for an example.</li></ul>
`SET REPLICATION EXPIRATION WINDOW = duration` | Override the default producer job's expiration window of 24 hours. The producer job expiration window determines how long the producer job will continue to run without a heartbeat from the consumer job. For more details, refer to the [Technical Overview]({{ page.version.version }}/physical-cluster-replication-technical-overview.md).
`START REPLICATION OF virtual_cluster_spec ON physical_cluster` | Reset a virtual cluster to the time when the virtual cluster on the promoted standby diverged from it. To reuse as much of the existing data on the original primary cluster as possible, you can run this statement as part of the [failback]({{ page.version.version }}/failover-replication.md#fail-back-to-the-primary-cluster) process. This command fails if the virtual cluster was not originally replicated from the original primary cluster. Refer to [Options](#options) for details on how you can configure a PCR stream initiated as a failback.
`START SERVICE SHARED` | Start a virtual cluster so it is ready to accept SQL connections after failover.
`RENAME TO virtual_cluster_spec` | Rename a virtual cluster.
`STOP SERVICE` | Stop the `shared` service for a virtual cluster. The virtual cluster's `data_state` will still be `ready` so that the service can be restarted.
`GRANT ALL CAPABILITIES` | Grant a virtual cluster all [capabilities]({{ page.version.version }}/create-virtual-cluster.md#capabilities).
`REVOKE ALL CAPABILITIES` | Revoke all [capabilities]({{ page.version.version }}/create-virtual-cluster.md#capabilities) from a virtual cluster.
`GRANT CAPABILITY virtual_cluster_capability_list` | Specify a [capability]({{ page.version.version }}/create-virtual-cluster.md#capabilities) to grant to a virtual cluster.
`REVOKE CAPABILITY virtual_cluster_capability_list` | Revoke a [capability]({{ page.version.version }}/create-virtual-cluster.md#capabilities) from a virtual cluster.

## Options

You can use the following options with `ALTER VIRTUAL CLUSTER {vc} START REPLICATION OF virtual_cluster_spec ON physical_cluster` to initiate the [failback process]({{ page.version.version }}/failover-replication.md#fail-back-to-the-primary-cluster).

Option | Value | Description
-------+-------+------------
`EXPIRATION WINDOW` | Duration | Override the default producer job's expiration window of 24 hours. The producer job expiration window determines how long the producer job will continue to run without a heartbeat from the consumer job. For more details, refer to the [Technical Overview]({{ page.version.version }}/physical-cluster-replication-technical-overview.md).
`READ VIRTUAL CLUSTER` | N/A | ([**Preview**]({{ page.version.version }}/cockroachdb-feature-availability.md#features-in-preview)) Configure the PCR stream to allow reads from the standby cluster. <br>**Note:** This only allows for reads on the standby's virtual cluster. You cannot perform writes or schema changes to user tables while connected to the standby virtual cluster. For more details, refer to [Start the failback process](#start-the-failback-process).

## Examples

### Start the failover process

To start the [failover]({{ page.version.version }}/failover-replication.md) process, use `COMPLETE REPLICATION` and provide the timestamp to restore as of:

~~~ sql
ALTER VIRTUAL CLUSTER main COMPLETE REPLICATION TO {failover time specification};
~~~

You can use either:

- `SYSTEM TIME` to specify a [timestamp]({{ page.version.version }}/as-of-system-time.md).
- `LATEST` to specify the most recent replicated timestamp.

{{site.data.alerts.callout_info}}
{{site.data.alerts.end}}

### Start the failback process


([**Preview**]({{ page.version.version }}/cockroachdb-feature-availability.md#features-in-preview)) Use the `READ VIRTUAL CLUSTER` option with the `ALTER VIRTUAL CLUSTER` failback syntax to start a PCR stream that also creates a read-only virtual cluster on the standby cluster.

### Set a retention window

You can change the retention window to protect data from [garbage collection]({{ page.version.version }}/architecture/storage-layer.md#garbage-collection). The retention window controls how far in the past you can [fail over]({{ page.version.version }}/failover-replication.md) to:

~~~ sql
ALTER VIRTUAL CLUSTER main SET REPLICATION RETENTION = '24h';
~~~


### Start a virtual cluster

When a virtual cluster is [`ready`]({{ page.version.version }}/show-virtual-cluster.md#responses) after initiating the failover process, you must start the service so that the virtual cluster is ready to accept SQL connections:

~~~ sql
ALTER VIRTUAL CLUSTER main START SERVICE SHARED;
~~~

To stop the `shared` service for a virtual cluster and prevent it from accepting SQL connections:

~~~ sql
ALTER VIRTUAL CLUSTER main STOP SERVICE;
~~~

## See also

- [Physical Cluster Replication Overview]({{ page.version.version }}/physical-cluster-replication-overview.md)
- [`CREATE VIRTUAL CLUSTER`]({{ page.version.version }}/create-virtual-cluster.md)
- [`DROP VIRTUAL CLUSTER`]({{ page.version.version }}/drop-virtual-cluster.md)
- [`SHOW VIRTUAL CLUSTER`]({{ page.version.version }}/show-virtual-cluster.md)