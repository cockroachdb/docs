---
title: SHOW LOCALITY
summary: The SHOW LOCALITY statement returns the locality of the current node.
toc: true
---

The `SHOW LOCALITY` [statement](sql-statements.html) returns the [locality](cockroach-start.html#locality) of the current node.

If locality was not specified on node startup, the statement returns an empty row.

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
$ cockroach demo movr --nodes=3 --demo-locality=region=us-east,az=a:region=us-central,az=b:region=us-west1,az=c
~~~

### Show locality

{% include copy-clipboard.html %}
~~~ sql
> SHOW LOCALITY;
~~~

~~~
       locality
+---------------------+
  region=us-east,az=a
(1 row)
~~~

### Show locality with a built-in function

If you know the locality key, you can use the [`crdb_internal.locality_value`](functions-and-operators.html#system-info-functions) built-in function to return the locality value for the current node:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.locality_value('region');
~~~

~~~
  crdb_internal.locality_value
+------------------------------+
  us-east
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.locality_value('az');
~~~

~~~
  crdb_internal.locality_value
+------------------------------+
  a
(1 row)
~~~

For a more extensive example, see [Create a table with node locality information](cockroach-start.html#create-a-table-with-node-locality-information).


## See also

- [Geo-Partitioning](demo-low-latency-multi-region-deployment.html)
- [Locality](cockroach-start.html#locality)
- [Orchestrated Deployment](orchestration.html)
- [Manual Deployment](manual-deployment.html)
