---
title: DROP VIRTUAL CLUSTER
summary: The DROP VIRTUAL CLUSTER statement deletes a virtual cluster.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The `DROP VIRTUAL CLUSTER` statement removes virtual clusters in order to restart a **physical cluster replication (PCR)** stream. Virtual clusters are used only as part of the [PCR]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) workflow.

{% include {{ page.version.version }}/physical-replication/phys-rep-sql-pages.md %}

{{site.data.alerts.callout_danger}}
The `DROP VIRTUAL CLUSTER` statement will delete all data related to the specified virtual cluster.
{{site.data.alerts.end}}

## Required privileges

`DROP VIRTUAL CLUSTER` requires one of the following privileges:

- The `admin` role.
- The `MANAGEVIRTUALCLUSTER` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges).

Use the [`GRANT SYSTEM`]({% link {{ page.version.version }}/grant.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SYSTEM MANAGEVIRTUALCLUSTER TO user;
~~~

## Synopsis

<div>
{% include {{ page.version.version }}/physical-replication/drop-virtual-cluster-diagram.html %}
</div>

## Parameters

Parameter | Description
----------+------------
`IF EXISTS` | Drop a virtual cluster if it exists. If it does not exist, do not return an error.
`virtual_cluster_spec` | The name of the virtual cluster.
`IMMEDIATE` | Drop a virtual cluster immediately instead of waiting for garbage collection ([GC TTL]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds)).

## Examples

### Restart a PCR stream

To restart a PCR stream, drop the virtual cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP VIRTUAL CLUSTER IF EXISTS main;
~~~

Next, restart the PCR stream with the [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %}) syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIRTUAL CLUSTER main FROM REPLICATION OF main ON 'postgresql://{connection string to primary}';
~~~

### Remove a virtual cluster without waiting for garbage collection

Use `IMMEDIATE` to drop a virtual cluster instead of waiting for data to be garbage collected:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP VIRTUAL CLUSTER IF EXISTS main IMMEDIATE;
~~~

## See also

- [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %})
- [`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %})
- [`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %})
