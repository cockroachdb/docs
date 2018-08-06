{{site.data.alerts.callout_info}}
New clusters and existing clusters [upgraded](upgrade-cockroach-version.html) to v2.1 will include the following databases:

- The empty `defaultdb` database is used if the [client](use-the-built-in-sql-client.html) does not specify a database in the [connection parameters](connection-parameters.html).

- The empty `postgres` database is provided for compatibility with Postgres client applications that require it.

- The `system` database contains CockroachDB metadata and is read-only

The `postgres` and `defaultdb` databases can be [deleted](drop-database.html) if they are not needed.
{{site.data.alerts.end}}
