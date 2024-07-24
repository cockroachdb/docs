---
title: SHOW VIRTUAL CLUSTER
summary: The SHOW VIRTUAL CLUSTER statement provides details about virtual clusters and physical replication streams.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include enterprise-feature.md %}

{% include_cached new-in.html version="v23.2" %} The `SHOW VIRTUAL CLUSTER` statement lists all virtual clusters running in a CockroachDB cluster. `SHOW VIRTUAL CLUSTER` supports inspecting virtual cluster status only as part of the [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) workflow.

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

### Data state

{% include {{ page.version.version }}/physical-replication/show-virtual-cluster-data-state.md %}

## Examples

### Show all virtual clusters

List all virtual clusters:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS;
~~~

### Show a virtual cluster

To show more details about the `application` virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER application;
~~~

{% include_cached copy-clipboard.html %}
~~~
  id |     name           | data_state  | service_mode | source_tenant_name |                                                  source_cluster_uri                                                   | replication_job_id |       replicated_time        |         retained_time         | cutover_time
-----+--------------------+-------------+--------------+--------------------+-----------------------------------------------------------------------------------------------------------------------+--------------------+------------------------------+-------------------------------+---------------
   5 | application        | replicating | none         | application        | postgresql://user:redacted@host?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted | 911803003607220225 | 2023-10-26 17:36:52.27978+00 | 2023-10-26 14:36:52.279781+00 |         NULL
~~~

### Show replication status
{% comment %}this code block and output could be in an include. This is in several place e.g., cutover page, monitoring{% endcomment %}

To show the replication status of all virtual clusters:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS WITH REPLICATION STATUS;
~~~

To show the replication status of the `application` virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER application WITH REPLICATION STATUS;
~~~

## See also

- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %})
- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %})
