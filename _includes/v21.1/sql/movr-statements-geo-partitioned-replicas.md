### Setup

The following examples use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).

To follow along, run [`cockroach demo`](cockroach-demo.html) with the [`--geo-partitioned-replicas` flag](cockroach-demo.html#start-a-multi-region-demo-cluster-with-automatic-geo-partitioning). This command opens an interactive SQL shell to a temporary, 9-node in-memory cluster with the [Geo-Partitioned Replicas Topology](topology-geo-partitioned-replicas.html) applied to the `movr` database.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --geo-partitioned-replicas
~~~
