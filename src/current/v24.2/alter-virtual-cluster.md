---
title: ALTER VIRTUAL CLUSTER
summary: The ALTER VIRTUAL CLUSTER statement manages a virtual cluster, including any related physical replication stream.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include enterprise-feature.md %}

The `ALTER VIRTUAL CLUSTER` statement initiates a cutover in a [**physical cluster replication (PCR)** job]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}) and manages a virtual cluster.

{% include {{ page.version.version }}/physical-replication/phys-rep-sql-pages.md %}

## Required privileges

`ALTER VIRTUAL CLUSTER` requires one of the following privileges:

- The `admin` role.
- The `MANAGEVIRTUALCLUSTER` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) allows the user to run all the related `VIRTUAL CLUSTER` SQL statements for PCR.

Use the [`GRANT SYSTEM`]({% link {{ page.version.version }}/grant.md %}) statement:

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
`COMPLETE REPLICATION TO` | Set the time to complete the replication. Use: <br><ul><li>`SYSTEM TIME` to specify a [timestamp]({% link {{ page.version.version }}/as-of-system-time.md %}). Refer to [Cut over to a point in time]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-a-point-in-time) for an example.</li><li>`LATEST` to specify the most recent replicated timestamp. Refer to [Cut over to a point in time]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-the-most-recent-replicated-time) for an example.</li></ul>
`SET REPLICATION RETENTION = duration` | Change the [duration]({% link {{ page.version.version }}/interval.md %}) of the retention window that will control how far in the past you can [cut over]({% link {{ page.version.version }}/cutover-replication.md %}) to.<br><br>{% include {{ page.version.version }}/physical-replication/retention.md %}
`SET REPLICATION EXPIRATION WINDOW = duration` | Override the default producer job's expiration window of 24 hours. The producer job expiration window determines how long the producer job will continue to run without a heartbeat from the consumer job. Refer to the [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) for more details.
`START REPLICATION OF virtual_cluster_spec ON physical_cluster` | Reset a virtual cluster to the time when the virtual cluster on the promoted standby diverged from it. To reuse as much of the existing data on the original primary cluster as possible, you can run this statement as part of the [cutback]({% link {{ page.version.version }}/cutover-replication.md %}#cut-back-to-the-primary-cluster) process. This command fails if the virtual cluster was not originally replicated from the original primary cluster.
`START SERVICE SHARED` | Start a virtual cluster so it is ready to accept SQL connections after cutover.
`RENAME TO virtual_cluster_spec` | Rename a virtual cluster.
`STOP SERVICE` | Stop the `shared` service for a virtual cluster. The virtual cluster's `data_state` will still be `ready` so that the service can be restarted.
`GRANT ALL CAPABILITIES` | Grant a virtual cluster all [capabilities]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities).
`REVOKE ALL CAPABILITIES` | Revoke all [capabilities]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) from a virtual cluster.
`GRANT CAPABILITY virtual_cluster_capability_list` | Specify a [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) to grant to a virtual cluster.
`REVOKE CAPABILITY virtual_cluster_capability_list` | Revoke a [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) from a virtual cluster.

## Examples

### Start the cutover process

To start the [cutover]({% link {{ page.version.version }}/cutover-replication.md %}) process, use `COMPLETE REPLICATION` and provide the timestamp to restore as of:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main COMPLETE REPLICATION TO {cutover time specification};
~~~

You can use either:

- `SYSTEM TIME` to specify a [timestamp]({% link {{ page.version.version }}/as-of-system-time.md %}).
- `LATEST` to specify the most recent replicated timestamp.

### Start the cutback process

{% include {{ page.version.version }}/physical-replication/fast-cutback-syntax.md %}

### Set a retention window

You can change the retention window to protect data from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection). The retention window controls how far in the past you can [cut over]({% link {{ page.version.version }}/cutover-replication.md %}) to:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main SET REPLICATION RETENTION = '24h';
~~~

{% include {{ page.version.version }}/physical-replication/retention.md %}

### Start a virtual cluster

When a virtual cluster is [`ready`]({% link {{ page.version.version }}/show-virtual-cluster.md %}#responses) after initiating the cutover process, you must start the service so that the virtual cluster is ready to accept SQL connections:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main START SERVICE SHARED;
~~~

To stop the `shared` service for a virtual cluster and prevent it from accepting SQL connections:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main STOP SERVICE;
~~~

## See also

- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %})
- [`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %})
- [`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %})
