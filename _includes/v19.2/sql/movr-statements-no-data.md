The following examples use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application, see [MovR: A Global Vehicle-sharing App](movr.html).

To follow along, do the following:

1. Start up a [secure](secure-a-cluster.html) or [insecure](start-a-local-cluster.html) local cluster.
1. Open an interactive SQL shell to the cluster with the [`cockroach sql`](use-the-built-in-sql-client.html) command.
1. Create the `movr` database with the [`CREATE DATABASE`](create-table.html) statement.
1. Set `movr` as the [current database](sql-name-resolution.html#current-database) for the session with the [`SET`](set-vars.html) statement.

You can alternatively run `cockroach demo` to open an interactive SQL shell to a temporary, in-memory cluster, and then complete steps 3 and 4.
