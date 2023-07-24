### Setup

Only a [cluster region](multiregion-overview.html#cluster-regions) specified [at node startup](cockroach-start.html#locality) can be used as a [database region](multiregion-overview.html#database-regions).

To follow along with the examples below, start a [demo cluster](cockroach-demo.html) with the [`--global` flag](cockroach-demo.html#general) to simulate a multi-region cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --global --nodes 9
~~~

To see the regions available to the databases in the cluster, use a `SHOW REGIONS FROM CLUSTER` statement:

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
