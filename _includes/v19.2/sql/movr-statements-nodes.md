### Setup

The following examples use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).

To follow along, run [`cockroach demo movr`](cockroach-demo.html) with the `--nodes` and `--demo-locality` tags. This command opens an interactive SQL shell to a temporary, multi-node in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo movr --nodes=3 --demo-locality=region=us-east1:region=us-central1:region=us-west1
~~~
