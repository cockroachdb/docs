The following examples use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).

To follow along with the examples below, open a new terminal and run [`cockroach demo`](cockroach-demo.html) with the [`--nodes`](cockroach-demo.html#flags) and [`--demo-locality`](cockroach-demo.html#flags) flags. This command opens an interactive SQL shell to a temporary, multi-node in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo \
--nodes=9 \
--demo-locality=region=us-east1:region=us-east1:region=us-east1:region=us-central1:region=us-central1:region=us-central1:region=us-west1:region=us-west1:region=us-west1
~~~
