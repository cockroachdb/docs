#### Setup

Only a [cluster region]({% link {{ page.version.version }}/multiregion-overview.md %}#cluster-regions) specified [at node startup]({% link {{ page.version.version }}/cockroach-start.md %}#locality) can be used as a [database region]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions).

To follow along with the examples in this section, start a [demo cluster]({% link {{ page.version.version }}/cockroach-demo.md %}) with the [`--global` flag]({% link {{ page.version.version }}/cockroach-demo.md %}#general) to simulate a multi-region cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --global --nodes 9
~~~

To see the regions available to the databases in the cluster, use a [`SHOW REGIONS FROM CLUSTER`]({% link {{ page.version.version }}/show-regions.md %}#view-the-regions-in-a-cluster) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM CLUSTER;
~~~

~~~
     region    |  zones
---------------+----------
  europe-west1 | {b,c,d}
  us-east1     | {b,c,d}
  us-west1     | {a,b,c}
(3 rows)
~~~