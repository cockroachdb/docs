{{site.data.alerts.callout_info}}
Starting in v22.2, CockroachDB introduces a new backup privilege model that provides finer control over a user's privilege to take backups. 

There is continued support for the [legacy privilege model](#required-privileges-using-the-legacy-privilege-model) in v22.2, however it **will be removed** in a future release. We recommend implementing the new privilege model that follows in this section for all new and existing backups.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v22.2" %} You can grant the `BACKUP` privilege to a user or role depending on the type of backup:

Backup | Privilege
-------+-----------
Cluster | Grant a user the system level `BACKUP` privilege. For example, `GRANT SYSTEM BACKUP TO user;`.
Database | Grant a user the `BACKUP` privilege on the target database. For example, `GRANT BACKUP ON DATABASE test_db TO user;`.
Table | Grant a user the `BACKUP` privilege at the table level. This gives the user the privilege to back up the schema and all user-defined types that are associated with the table. For example, `GRANT BACKUP ON TABLE test_db.table TO user;`.

The listed privileges do not cascade to objects lower in the schema tree. For example, if you are granted database-level `BACKUP` privileges, this does not give you the privilege to back up a table. If you need the `BACKUP` privilege on a database to apply to all newly created tables in that database, use [`DEFAULT PRIVILEGES`](security-reference/authorization.html#default-privileges). You can add `BACKUP` to the user or role's default privileges with [`ALTER DEFAULT PRIVILEGES`](alter-default-privileges.html#grant-default-privileges-to-a-specific-role).

{{site.data.alerts.callout_info}}
You can grant the `BACKUP` privilege to a user or role **without** the `SELECT` privilege on a table. As a result, these users will be able to take backups, but they will not be able to run a `SELECT` query on that data directly. However, these users could still read this data indirectly, by restoring it from any backups they produce.
{{site.data.alerts.end}}

Members of the [`admin` role](security-reference/authorization.html#admin-role) can run all three types of backups (cluster, database, and table) without the need to grant a specific `BACKUP` privilege. However, we recommend using the `BACKUP` privilege model to create users or roles and grant them `BACKUP` privileges as necessary for stronger access control.

See [`GRANT`](grant.html) for detail on granting privileges to a role or user.