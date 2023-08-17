Privilege | Levels | Description
----------|--------|------------
`ALL` | System, Database, Schema, Table, Sequence, Type | Grants all privileges at the system, database, schema, table, sequence, or type level.
`BACKUP` | System, Database, Table | Grants the ability to create [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) at the system, database, or table level.
`CANCELQUERY` | System | Grants the ability to cancel queries.
`CHANGEFEED` | Table | Grants the ability to create [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) on a table.
`CONNECT` | Database | Grants the ability to connect to the database.
`CREATE` | Database, Schema, Table, Sequence | Grants the ability to create objects at the database, schema, table, or sequence level.
`DELETE` | Table, Sequence | Grants the ability to delete objects at the table or sequence level.
`DROP` | Database, Table, Sequence | Grants the ability to drop objects at the database, table, or sequence level.
`EXECUTE` | Function | Grants the ability to execute [functions]({% link {{ page.version.version }}/functions-and-operators.md %}).
`EXTERNALCONNECTION` | System | Grants the ability to connect to external systems such as object stores, key management systems, Kafka feeds, or external file systems. Often used in conjunction with the `BACKUP`, `RESTORE`, and `CHANGEFEED` privilege.
`EXTERNALIOIMPLICITACCESS` | System | Grants the ability to interact with external resources that require implicit access.
`INSERT` | Table, Sequence | Grants the ability to insert objects at the table or sequence level.
`MODIFYCLUSTERSETTING` | System | Grants the ability to modify [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}).
`MODIFYSQLCLUSTERSETTING` | System | Grants the ability to modify SQL [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) (cluster settings prefixed with `sql.`).
`NOSQLLOGIN` | System | Prevents roles from connecting to the SQL interface of a cluster.
`RESTORE` | System, Database, Table | Grants the ability to restore [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) at the system, database, or table level.
`SELECT` | Table, Sequence | Grants the ability to run [selection queries]({% link {{ page.version.version }}/query-data.md %}) at the table or sequence level.
`UPDATE` | Table, Sequence | Grants the ability to run [update statements]({% link {{ page.version.version }}/update-data.md %}) at the table or sequence level.
`USAGE`  | Function, Schema, Sequence, Type | Grants the ability to use [functions]({% link {{ page.version.version }}/functions-and-operators.md %}), [schemas]({% link {{ page.version.version }}/schema-design-overview.md %}), [sequences]({% link {{ page.version.version }}/create-sequence.md %}), or [user-defined types]({% link {{ page.version.version }}/create-type.md %}).
`VIEWACTIVITY` | System | Grants the ability to view other user's activity statistics of a cluster.
`VIEWACTIVITYREDACTED` | System | Grants the ability to view other user's activity statistics, but prevents the role from accessing the statement diagnostics bundle and viewing some introspection queries that contain data about the cluster.
`VIEWCLUSTERMETADATA` | System | Grants the ability to view range information, data distribution, store information, and Raft information.
`VIEWCLUSTERSETTING` | System | Grants the ability to view [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}).
`VIEWDEBUG` | System | Grants the ability to view the [Advanced Debug Page]({% link {{ page.version.version }}/ui-debug-pages.md %}) of the DB Console and work with the debugging and profiling endpoints.
`VIEWJOB` | System | Grants the ability to view [jobs]({% link {{ page.version.version }}/show-jobs.md %}) on the cluster.
`ZONECONFIG` | Database, Table, Sequence | Grants the ability to configure [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}) at the database, table, and sequence level.
