This tutorial walks you through some of the most essential CockroachDB SQL statements using an interactive SQL shell connected to a temporary, single-node CockroachDB cluster.

For a complete list of supported SQL statements and related details, see [SQL Statements](../stable/sql-statements.html).

Your CockroachB cluster is pre-loaded with a database called `movr`.

To see all table in this database, use the [`SHOW TABLES`](https://www.cockroachlabs.com/docs/stable/show-tables.html) statement or the `\dt` [shell command](https://www.cockroachlabs.com/docs/stable/cockroach-sql.html#commands) shell command:

```sql
SHOW TABLES;
```{{execute}}

```
\dt
```{{execute}}
