---
title: SHOW VIRTUAL CLUSTER
summary: The SHOW VIRTUAL CLUSTER statement provides details on virtual clusters and physical replication streams.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} The `SHOW VIRTUAL CLUSTER` statement lists the virtual clusters running in a CockroachDB cluster. `SHOW VIRTUAL CLUSTER` only supports inspecting virtual cluster status as part of the [physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) workflow.

## Required privileges

`SHOW VIRTUAL CLUSTER` requires the `admin` role or the `MANAGEVIRTUALCLUSTER` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges).

Use the [`GRANT SYSTEM`]({% link {{ page.version.version }}/grant.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SYSTEM MANAGEVIRTUALCLUSTER TO user;
~~~

{% include enterprise-feature.md %}

## Synopsis

<div>
{% include {{ page.version.version }}/physical-replication/show-virtual-cluster-diagram.html %}
</div>

## Parameters

Parameter | Description
----------+------------
`virtual_cluster_spec` | The name of the virtual cluster.
`REPLICATION STATUS` | Display the details of a replication stream.
`CAPABILITIES` | Display the [capabilities]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) of a virtual cluster.


{% comment %}Responses and Data state are a copy from the monitoring page, these should be in an include once the first PR has merged.{% endcomment %}
## Responses

The following table is a list of all the responses returned with the different `SHOW VIRTUAL CLUSTER` statements:

Field    | Response
---------+----------
`id` | The ID of the virtual cluster.
`name` | The name of the standby (destination) virtual cluster.
`data_state` | The state of the data on the virtual cluster. This can show one of the following: `initializing replication`, `ready`, `replicating`, `replication paused`, `replication pending cutover`, `replication cutting over`, `replication error`. Refer to [Data state](#data-state) for more detail on each response.
`service_mode` | The service mode shows whether the virtual cluster is ready to accept SQL requests. This can show one of the following: <br>`none`<br>`shared`: The virtual cluster's SQL connections will be served by the same nodes that are serving the system interface.
`source_tenant_name` | The name of the primary (source) virtual cluster.
`source_cluster_uri` | The URI of the primary (source) cluster. This is the URI that connects to the primary cluster to [start a replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication).
`replication_job_id` | The ID of the replication job.
`replicated_time` | The latest timestamp at which the standby cluser has consistent data — that is, the latest time you can cut over to. This time advances while the replication proceeds without error. `replicated_time` is updated periodically (every `30s`).
`retained_time` | The earliest timestamp at which the standby cluster has consistent data — that is, the earliest time you can cut over to.
`cutover_time` | The time at which the cutover will begin.
`capability_name` | The [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) name.
`capability_value` | Whether the [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) is enabled for the virtual cluster.

{% comment %}Add responses to include for SQL statement page{% endcomment %}

### Data state

State      | Description
-----------+----------------
`initializing replication` | The replication job is completing the initial scan of data from the primary cluster before it starts replicating data in real time.
`ready` | The virtual cluster's data is ready for use.
`replicating` | The replication job has started and is replicating data.
`replication paused` | The replication job is paused due to an error or a manual request with `ALTER VIRTUAL CLUSTER ... PAUSE REPLICATION`.
`replication pending cutover` | The replication job is running and a cutover time has been set. Once the the replication reaches the cutover time, the will begin automatically.
`replication cutting over` | The job has started cutting over. The cutover time can no longer be changed. Once complete, the virtual cluster will be available for use with `ALTER VIRTUAL CLUSTER ... START SHARED SERVICE`.
`replication error` | An error has occurred. You can find more detail in the error message and the logs.

## Examples

### Show all virtual clusters
{% comment %}this code block and output could be in an include. This is in several place e.g., cutover page, monitoring{% endcomment %}

List all of the virtual clusters:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS;
~~~

### Show a virtual cluster

{% comment %}this code block and output could be in an include. This is in several place e.g., cutover page{% endcomment %}

To list a particular virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER {standbyapplication};
~~~

{% include_cached copy-clipboard.html %}
~~~
  id |     name           | data_state  | service_mode | source_tenant_name |                                                  source_cluster_uri                                                   | replication_job_id |       replicated_time        |         retained_time         | cutover_time
-----+--------------------+-------------+--------------+--------------------+-----------------------------------------------------------------------------------------------------------------------+--------------------+------------------------------+-------------------------------+---------------
   5 | standbyapplication | replicating | none         | application        | postgresql://user:redacted@host/?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted | 911803003607220225 | 2023-10-26 17:36:52.27978+00 | 2023-10-26 14:36:52.279781+00 |         NULL
~~~

### Show replication status
{% comment %}this code block and output could be in an include. This is in several place e.g., cutover page, monitoring{% endcomment %}

To show the replication status of all virtual clusters:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS WITH REPLICATION STATUS;
~~~

To show the replication status of a particular virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER {standbyapplication} WITH REPLICATION STATUS;
~~~

## See also

- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %})
- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %})