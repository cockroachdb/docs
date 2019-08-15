---
title: SHOW LOCALITY
summary: The SHOW LOCALITY statement returns the locality of the current node.
toc: true
---

<span class="version-tag">New in v19.2:</span> The `SHOW LOCALITY` [statement](sql-statements.html) returns the [locality](start-a-node.html#locality) of the current node.

If you are running a single-node cluster with no locality specified, the statement returns an empty row.

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to list the locality of the current node.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_locality.html %}
</div>

## Example

### Setup

The following example uses MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).

To follow along, run [`cockroach demo movr`](cockroach-demo.html) with the `--nodes` and `--demo-locality` tags. This command opens an interactive SQL shell to a temporary, multi-node in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo movr --nodes=3 --demo-locality=region=us-east1,region=us-central1,region=us-west1
~~~

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
- [Locality](start-a-node.html#locality)
- [Orchestrated Deployment](orchestration.html)
- [Manual Deployment](manual-deployment.html)
