New clusters and existing clusters [upgraded](upgrade-cockroach-version.html) to v2.1 or later will include auto-generated databases, with the following purposes:

- The empty `defaultdb` database is used if a client does not specify a database in the [connection parameters](connection-parameters.html).
- The `movr` database contains data about users, vehicles, and rides for the vehicle-sharing app [MovR](movr.html).
- An empty database called `postgres` is provided for compatibility with PostgreSQL client applications that require it.
- The `startrek` database contains quotes from episodes.
- The `system` database contains CockroachDB metadata and is read-only.

All databases except for the `system` database can be [deleted](drop-database.html) if they are not needed.

{{site.data.alerts.callout_danger}}
Do not query the `system` database directly. Instead, use objects within the [system catalogs](system-catalogs.html).
{{site.data.alerts.end}}
