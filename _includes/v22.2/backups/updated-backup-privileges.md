{{site.data.alerts.callout_info}}
From v22.2, CockroachDB supports a backup privilege model that provides finer control over a user's privilege to take backups. We recommend implementing this privilege model for backups. 

There is continued support for the [existing privilege model](#existing-required-privileges) in v22.2. However, this will be removed in a future release.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v22.2" %} You can grant the `BACKUP` privilege to a user or role depending on the type of backup:

Backup | Privilege
-------+-----------
Cluster | Grant a user the system level `BACKUP` privilege.
Database | Grant a user the `BACKUP` privilege on the target database.
Table | Grant a user the `BACKUP` privilege at the table level. This gives the user the privilege to back up the schema and all user-defined types that are associated with the table.

The listed privileges do not cascade to objects lower in the schema tree. For example, if you are granted database-level `BACKUP` privileges, this does not give you the privilege to back up a table. If you need the `BACKUP` privilege on a database to apply to all newly created tables in that database, use [`DEFAULT PRIVILEGES`](security-reference/authorization.html#default-privileges).

Members of the [`admin` role](security-reference/authorization.html#admin-role) can run all levels of `BACKUP` without the need to grant a specific `BACKUP` privilege. However, we recommend using the `BACKUP` privilege model, which provides stronger access control.

See [`GRANT`](grant.html) for detail on granting privileges to a role or user.