New clusters and existing clusters [upgraded]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}) to {{ page.version.version }} or later will include auto-generated databases, with the following purposes:

- The empty `defaultdb` database is used if a client does not specify a database in the [connection parameters]({% link {{ page.version.version }}/connection-parameters.md %}).
- The `movr` database contains data about users, vehicles, and rides for the vehicle-sharing app [MovR]({% link {{ page.version.version }}/movr.md %}) (only when the cluster is started using the [`demo` command]({% link {{ page.version.version }}/cockroach-demo.md %})).
- The empty `postgres` database is provided for compatibility with PostgreSQL client applications that require it.
- The `system` database contains CockroachDB metadata and is read-only.

All databases except for the `system` database can be [deleted]({% link {{ page.version.version }}/drop-database.md %}) if they are not needed.

{{site.data.alerts.callout_danger}}
Do not query the `system` database directly. Instead, use objects within the [system catalogs]({% link {{ page.version.version }}/system-catalogs.md %}).
{{site.data.alerts.end}}
