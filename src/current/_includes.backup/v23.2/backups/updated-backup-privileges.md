{{site.data.alerts.callout_info}}
Starting in v22.2, CockroachDB introduces a new [system-level privilege model]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) that provides finer control over a user's privilege to work with the database, including taking backups. 

There is continued support for the [legacy privilege model](#required-privileges-using-the-legacy-privilege-model) for backups in v22.2, however it **will be removed** in a future release of CockroachDB. We recommend implementing the new privilege model that follows in this section for all new and existing backups.
{{site.data.alerts.end}}

You can [grant]({% link {{ page.version.version }}/grant.md %}#grant-privileges-on-specific-tables-in-a-database) the `BACKUP` privilege to a user or role depending on the type of backup:

Backup | Privilege
-------+-----------
Cluster | Grant a user the `BACKUP` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges). For example, `GRANT SYSTEM BACKUP TO user;`.
Database | Grant a user the `BACKUP` privilege on the target database. For example, `GRANT BACKUP ON DATABASE test_db TO user;`.
Table | Grant a user the `BACKUP` privilege at the table level. This gives the user the privilege to back up the schema and all user-defined types that are associated with the table. For example, `GRANT BACKUP ON TABLE test_db.table TO user;`.

The listed privileges do not cascade to objects lower in the schema tree. For example, if you are granted database-level `BACKUP` privileges, this does not give you the privilege to back up a table. If you need the `BACKUP` privilege on a database to apply to all newly created tables in that database, use [`DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/security-reference/authorization.md %}#default-privileges). You can add `BACKUP` to the user or role's default privileges with [`ALTER DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/alter-default-privileges.md %}#grant-default-privileges-to-a-specific-role).

{{site.data.alerts.callout_info}}
You can grant the `BACKUP` privilege to a user or role **without** the `SELECT` privilege on a table. As a result, these users will be able to take backups, but they will not be able to run a `SELECT` query on that data directly. However, these users could still read this data indirectly, by restoring it from any backups they produce.
{{site.data.alerts.end}}

Members of the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) can run all three types of backups (cluster, database, and table) without the need to grant a specific `BACKUP` privilege. However, we recommend using the `BACKUP` privilege model to create users or roles and grant them `BACKUP` privileges as necessary for stronger access control.

### Privileges for managing a backup job

To manage a backup job with [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}), [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}), or [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}), users must have at least one of the following:

- Be a member of the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).
- The [`CONTROLJOB` role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options).

To view a backup job with [`SHOW JOB`]({% link {{ page.version.version }}/show-jobs.md %}), users must have at least one of the following:

- The [`VIEWJOB` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges), which allows you to view all jobs (including `admin`-owned jobs).
- Be a member of the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).
- The [`CONTROLJOB` role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options).

See [`GRANT`]({% link {{ page.version.version }}/grant.md %}) for detail on granting privileges to a role or user.