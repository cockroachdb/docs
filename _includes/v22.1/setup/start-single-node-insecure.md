1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Run the [`cockroach start-single-node`](cockroach-start-single-node.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --advertise-addr 'localhost' --insecure
    ~~~

    This starts an insecure, single-node cluster.
1. Take note of the following connection information in the SQL shell welcome text:

    ~~~
    CockroachDB node starting at 2021-08-30 17:25:30.06524 +0000 UTC (took 4.3s)
    build:               CCL v21.1.6 @ 2021/07/20 15:33:43 (go1.15.11)
    webui:               http://localhost:8080
    sql:                 postgresql://root@localhost:26257?sslmode=disable
    ~~~

    You'll use the `sql` connection string to connect to the cluster later in this tutorial.


{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}