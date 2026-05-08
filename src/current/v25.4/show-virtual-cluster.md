---
title: SHOW VIRTUAL CLUSTER
summary: The SHOW VIRTUAL CLUSTER statement provides details about virtual clusters and physical replication streams.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The `SHOW VIRTUAL CLUSTER` statement lists all virtual clusters running in a CockroachDB cluster. `SHOW VIRTUAL CLUSTER` supports inspecting virtual cluster status only as part of the [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) workflow.

{% include {{ page.version.version }}/physical-replication/phys-rep-sql-pages.md %}

## Required privileges

`SHOW VIRTUAL CLUSTER` requires either:

- The `admin` role.
- The `MANAGEVIRTUALCLUSTER` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges).

Use the [`GRANT SYSTEM`]({% link {{ page.version.version }}/grant.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SYSTEM MANAGEVIRTUALCLUSTER TO user;
~~~

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

## Responses

This table lists all possible responses from the different `SHOW VIRTUAL CLUSTER` statements:

{% include {{ page.version.version }}/physical-replication/show-virtual-cluster-responses.md %}

{{site.data.alerts.callout_success}}
To find the job ID for the replication stream, use the [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) statement. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM [SHOW JOBS] WHERE job_type = 'REPLICATION STREAM INGESTION';
~~~
{{site.data.alerts.end}}

### Data state

The `data_state` and `status` fields show the current state of a virtual cluster's data and progress of the replication stream job.

{% include {{ page.version.version }}/physical-replication/show-virtual-cluster-data-state.md %}

## Examples

### Show all virtual clusters

List all virtual clusters:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS;
~~~

### Show a virtual cluster

To show more details about the `main` virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER main;
~~~

{% include_cached copy-clipboard.html %}
~~~
  id | name | data_state  | service_mode
-----+------+-------------+---------------
   3 | main | replicating | none
(1 row)
~~~

### Show replication status

To show the replication status of all virtual clusters:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS WITH REPLICATION STATUS;
~~~

To show the replication status of the `main` virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER main WITH REPLICATION STATUS;
~~~
~~~
  id | name | source_tenant_name |              source_cluster_uri               |         retained_time         |    replicated_time     | replication_lag | failover_time |   status
-----+------+--------------------+-----------------------------------------------+-------------------------------+------------------------+-----------------+--------------+--------------
   3 | main | main               | postgresql://user@hostname or IP:26257?redacted | 2024-04-18 10:07:45.000001+00 | 2024-04-18 14:07:45+00 | 00:00:19.602682 |         NULL | replicating
(1 row)
~~~

## See also

- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %})
- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %})
