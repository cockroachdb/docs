Privilege | Levels | Description
----------|--------|------------
`ALL` | System, Database, Schema, Table, Sequence, Type | For the object to which `ALL` is applied, grants all privileges at the system, database, schema, table, sequence, or type level.
`BACKUP` | System, Database, Table | Grants the ability to create [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) at the system, database, or table level.
`CANCELQUERY` | System | Grants the ability to cancel queries.
`CHANGEFEED` | Table | Grants the ability to create [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) on a table.
`CONNECT` | Database | Grants the ability to view a database's metadata, which consists of objects in a database's `information_schema` and `pg_catalog` system catalogs. This allows the role to view the database's table, schemas, user-defined types, and list the database when running `SHOW DATABASES`. The `CONNECT` privilege is also required to run backups of the database.
`CONTROLJOB` | System | Grants the ability to [pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), and [cancel]({% link {{ page.version.version }}/cancel-job.md %}) jobs. Non-admin roles cannot control jobs created by admin roles.
`CREATE` | Database, Schema, Table, Sequence | Grants the ability to create objects at the database, schema, table, or sequence level. When applied at the database level, grants the ability to configure [multi-region zone configs]({% link {{ page.version.version }}/zone-config-extensions.md %}).
`CREATEDB` | System | Grants the ability to [create]({% link {{ page.version.version }}/create-database.md %}) or [rename]({% link {{ page.version.version }}/alter-database.md %}#rename-to) a database.
`CREATELOGIN` | System | Grants the ability to manage authentication using the `WITH PASSWORD`, `VALID UNTIL`, and `LOGIN`/`NOLOGIN` role options.
`CREATEROLE` | System | Grants the ability to [create]({% link {{ page.version.version }}/create-role.md %}), modify, or [delete]({% link {{ page.version.version }}/drop-role.md %}) non-admin roles.
`DELETE` | Table, Sequence | Grants the ability to delete objects at the table or sequence level.
`DROP` | Database, Table, Sequence | Grants the ability to drop objects at the database, table, or sequence level.
`EXECUTE` | Function | Grants the ability to execute [functions]({% link {{ page.version.version }}/functions-and-operators.md %}).
`EXTERNALCONNECTION` | System | Grants the ability to connect to external systems such as object stores, key management systems, Kafka feeds, or external file systems. Often used in conjunction with the `BACKUP`, `RESTORE`, and `CHANGEFEED` privilege.
`EXTERNALIOIMPLICITACCESS` | System | Grants the ability to interact with external resources that require implicit access.
`INSERT` | Table, Sequence | Grants the ability to insert objects at the table or sequence level.
<a id="modifyclustersetting"></a>`MODIFYCLUSTERSETTING` | System | Grants the ability to modify [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}).
`MODIFYSQLCLUSTERSETTING` | System | Grants the ability to modify SQL [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) (cluster settings prefixed with `sql.`).
`NOSQLLOGIN` | System | Prevents roles from connecting to the SQL interface of a cluster.
`RESTORE` | System, Database | Grants the ability to restore [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) at the system or database level. Refer to `RESTORE` [Required privileges]({% link {{ page.version.version }}/restore.md %}#required-privileges) for more details.
`SELECT` | Table, Sequence | Grants the ability to run [selection queries]({% link {{ page.version.version }}/query-data.md %}) at the table or sequence level.
`UPDATE` | Table, Sequence | Grants the ability to run [update statements]({% link {{ page.version.version }}/update-data.md %}) at the table or sequence level.
`USAGE` | Schema, Sequence, Type | Grants the ability to use [schemas]({% link {{ page.version.version }}/schema-design-overview.md %}), [sequences]({% link {{ page.version.version }}/create-sequence.md %}), or [user-defined types]({% link {{ page.version.version }}/create-type.md %}).
<a id="viewactivity"></a>`VIEWACTIVITY` | System | Grants the ability to view other user's activity statistics of a cluster.
<a id="viewactivityredacted"></a>`VIEWACTIVITYREDACTED` | System | Grants the ability to view other user's activity statistics, but prevents the role from accessing the statement diagnostics bundle in the DB Console, and viewing some columns in introspection queries that contain data about the cluster.
<a id="viewclustermetadata"></a>`VIEWCLUSTERMETADATA` | System | Grants the ability to view range information, data distribution, store information, and Raft information.
<a id="viewclustersetting"></a>`VIEWCLUSTERSETTING` | System | Grants the ability to view [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) and their values.
<a id="viewdebug"></a>`VIEWDEBUG` | System | Grants the ability to view the [Advanced Debug Page]({% link {{ page.version.version }}/ui-debug-pages.md %}) of the DB Console and work with the debugging and profiling endpoints.
<a id="viewjob"></a>`VIEWJOB` | System | Grants the ability to view [jobs]({% link {{ page.version.version }}/show-jobs.md %}) on the cluster.
`VIEWSYSTEMTABLE` | System | Grants read-only access (`SELECT`) on all tables in the `system` database, without granting the ability to modify the cluster. This privilege was introduced in v23.1.11.
`ZONECONFIG` | Database, Table, Sequence | Grants the ability to configure [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}) at the database, table, and sequence level.
