#### Setup

The following examples use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App]({% link {{ page.version.version }}/movr.md %}).

To follow along, run [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) to start a temporary, in-memory cluster with the `movr` dataset preloaded:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo
~~~
