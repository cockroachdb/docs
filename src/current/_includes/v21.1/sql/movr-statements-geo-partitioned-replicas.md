### Setup

The following examples use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).

To follow along, run [`cockroach demo`](cockroach-demo.html) with the `--geo-partitioned-replicas` flag. This command opens an interactive SQL shell to a temporary, 9-node in-memory cluster with the `movr` database.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --geo-partitioned-replicas
~~~
