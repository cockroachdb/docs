1. If you haven't already, [download the latest version of CockroachDB](../{{site.versions["stable"]}}/install-cockroachdb.html).

1. Run the [`cockroach demo`](../{{site.versions["stable"]}}/cockroach-demo.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --no-example-database
    ~~~

    This starts a temporary, in-memory cluster and opens an interactive SQL shell to the cluster. Any changes to the database will not persist after the cluster is stopped.

    {{site.data.alerts.callout_info}}
    If `cockroach demo` fails due to SSL authentication, make sure you have cleared any previously downloaded CA certificates from the directory `~/.postgresql`.
    {{site.data.alerts.end}}