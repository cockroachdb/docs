### Setup

The following examples use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App]({{ page.version.version }}/movr.md).

To follow along, run [`cockroach demo`]({{ page.version.version }}/cockroach-demo.md) with the [`--nodes`]({{ page.version.version }}/cockroach-demo.md#flags) and [`--demo-locality`]({{ page.version.version }}/cockroach-demo.md#flags) flags. This command opens an interactive SQL shell to a temporary, multi-node in-memory cluster with the `movr` database preloaded and set as the [current database]({{ page.version.version }}/sql-name-resolution.md#current-database).

{% include "_includes/copy-clipboard.html" %}
~~~ shell
$ cockroach demo --nodes=6 --demo-locality=region=us-east,zone=us-east-a:region=us-east,zone=us-east-b:region=us-central,zone=us-central-a:region=us-central,zone=us-central-b:region=us-west,zone=us-west-a:region=us-west,zone=us-west-b
~~~
