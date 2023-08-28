---
title: SHOW LOCALITY
summary: The SHOW LOCALITY statement returns the locality of the current node.
toc: true
docs_area: reference.sql
---

The `SHOW LOCALITY` [statement]({% link {{ page.version.version }}/sql-statements.md %}) returns the [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) of the current node.

If locality was not specified on node startup, the statement returns an empty row.

## Required privileges

No [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) are required to list the locality of the current node.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_locality.html %}
</div>

## Example

### Setup

The following example uses MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App]({% link {{ page.version.version }}/movr.md %}).

To follow along, run [`cockroach demo movr`]({% link {{ page.version.version }}/cockroach-demo.md %}) with the `--nodes` and `--demo-locality` tags. This command opens an interactive SQL shell to a temporary, multi-node in-memory cluster with the `movr` database preloaded and set as the [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database).

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo movr --nodes=3 --demo-locality=region=us-east,az=a:region=us-central,az=b:region=us-west1,az=c
~~~

### Show locality

{% include_cached copy-clipboard.html %}
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

If you know the locality key, you can use the [`crdb_internal.locality_value`]({% link {{ page.version.version }}/functions-and-operators.md %}#system-info-functions) built-in function to return the locality value for the current node:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.locality_value('region');
~~~

~~~
  crdb_internal.locality_value
+------------------------------+
  us-east
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.locality_value('az');
~~~

~~~
  crdb_internal.locality_value
+------------------------------+
  a
(1 row)
~~~

For a more extensive example, see [Create a table with node locality information]({% link {{ page.version.version }}/cockroach-start.md %}#create-a-table-with-node-locality-information).


## See also

- [Low Latency Reads and Writes in a Multi-Region Cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %})
- [Locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality)
- [Orchestrated Deployment]({% link {{ page.version.version }}/kubernetes-overview.md %})
- [Manual Deployment]({% link {{ page.version.version }}/manual-deployment.md %})
