- Run [`cockroach demo movr`](cockroach-demo.html) to open an interactive SQL shell to a temporary, in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo movr
    ~~~

- Use [`cockroach workload`](cockroach-workload.html):

  1. Start an [insecure](start-a-local-cluster.html) local cluster.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --insecure <flags>
    ~~~

    Or start a [secure](secure-a-cluster.html) cluster.

  2. Run `cockroach workload init movr` with the appropriate flags and [connection string](connection-parameters.html) to initialize and populate the `movr` database on your running cluster.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init movr <flags>
    ~~~

  3. Open an interactive SQL shell to the cluster with the [`cockroach sql`](use-the-built-in-sql-client.html) command.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql <flags>
    ~~~

  4. Set `movr` as the [current database](sql-name-resolution.html#current-database) for the session.

    {% include copy-clipboard.html %}
    ~~~ sql
    > USE movr;
    ~~~
