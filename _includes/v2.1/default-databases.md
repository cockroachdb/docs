{{site.data.alerts.callout_info}}
New clusters and existing clusters [upgraded](upgrade-cockroach-version.html) to v2.1 will include three auto-generated databases, with the following purposes:

- The empty `defaultdb` database is used if a client does not specify a database in the [connection parameters](connection-parameters.html).

- An empty database called `postgres` is provided for compatibility with Postgres client applications that require it.

- The `system` database contains CockroachDB metadata and is read-only.

The `postgres` and `defaultdb` databases can be [deleted](drop-database.html) if they are not needed.
{{site.data.alerts.end}}
