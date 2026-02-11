1. (Optional) On the EC2 instance running CockroachDB, run the [Movr]({% link {{ page.version.version }}/movr.md %}) application workload to set up some data for your changefeed.

    Create the schema for the workload:

     {% include_cached copy-clipboard.html %}
     ~~~shell
     cockroach workload init movr
     ~~~

     Then run the workload:

     {% include_cached copy-clipboard.html %}
     ~~~shell
     cockroach workload run movr --duration=1m
     ~~~

1. Start a SQL session. For details on the available flags, refer to the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) page.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure
    ~~~

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~