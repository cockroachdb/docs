{{site.data.alerts.callout_info}}
From v22.2, CockroachDB supports a backup privilege model that provides finer control over a user's privilege to take backups. There is continued support for the [existing privilege model](#existing-required-privileges) in v22.2. However, this will be removed in v23.1.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v22.2" %} You can grant the `BACKUP` privilege to a user or role depending on the type of backup:

Backup | Privilege
-------+-----------
Cluster | Grant a user the `BACKUP` privilege at the system level.
Database | Grant a user the `BACKUP` privilege at the database level.
Table | Grant a user the `BACKUP` privilege at the table level. This includes any schemas and types associated with a table.

There is no inheritance with the listed privileges. For example, if a user is granted database-level backup privileges, this does not give the user the privilege to back up a table. Furthermore, if you run an [`ALTER DEFAULT PRIVILEGES`](alter-default-privileges.html) statement to grant a user the `BACKUP` privilege, this will only apply to newly created tables.

Members of the [`admin` role](security-reference/authorization.html#admin-role) can run all levels of `BACKUP` without the need to grant a specific `BACKUP` privilege.

See [`GRANT`](grant.html) for detail on granting privileges to a role or user.