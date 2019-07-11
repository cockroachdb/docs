- Run [`cockroach demo movr`](cockroach-demo.html) to open an interactive SQL shell to a temporary, in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).
- Use [`cockroach workload`](cockroach-workload.html):
 1. Start up a [secure](secure-a-cluster.html) or [insecure](start-a-local-cluster.html) local cluster.
 1. Run `cockroach workload init movr` with the appropriate flags and [connection string](connection-parameters.html) to initialize and populate the `movr` database on your running cluster.
 1. Open an interactive SQL shell to the cluster with the [`cockroach sql`](use-the-built-in-sql-client.html) command.
 1. Set `movr` as the [current database](sql-name-resolution.html#current-database) for the session with the [`SET`](set-vars.html) statement.
