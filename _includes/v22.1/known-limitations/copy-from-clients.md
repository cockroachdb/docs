The built-in SQL shell provided with CockroachDB ([`cockroach sql`](cockroach-sql.html) / [`cockroach demo`](cockroach-demo.html)) does not currently support importing data with the `COPY` statement.

To load data into CockroachDB, we recommend that you use an [`IMPORT`](import.html). If you must use a `COPY` statement, you can issue the statement from the [`psql` client](https://www.postgresql.org/docs/current/app-psql.html) command provided with PostgreSQL, or from another third-party client.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/16392)