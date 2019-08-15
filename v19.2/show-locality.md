---
title: SHOW LOCALITY
summary: The SHOW LOCALITY statement returns the locality of the current node.
toc: true
---

The `SHOW LOCALITY` [statement](sql-statements.html) returns the locality of the current node.

If you are running a single-node cluster with no locality specified, the statement returns an empty row.

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to list the locality of the current node.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_locality.html %}
</div>

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Show locality

{% include copy-clipboard.html %}
~~~ sql
> SHOW LOCALITY;
~~~

~~~
     locality
+-----------------+
  region=us-west1
(1 row)
~~~


## See also

- [Geo-Partitioning](demo-geo-partitioning.html)
- [Orchestrated Deployment](orchestration.html)
- [Manual Deployment](manual-deployment.html)
