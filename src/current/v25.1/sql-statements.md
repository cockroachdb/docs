---
title: SQL Statements
summary: Overview of SQL statements supported by CockroachDB.
toc: true
docs_area: reference.sql
---

CockroachDB supports the following SQL statements.

In the [`cockroach` SQL shell]({{ page.version.version }}/cockroach-sql.md#help), use `\h [statement]` to get inline help about a statement.

## Data definition statements

Statement | Usage
----------|------------
[`ALTER DATABASE`]({{ page.version.version }}/alter-database.md) | Apply a schema change to a database.
[`ALTER DEFAULT PRIVILEGES`]({{ page.version.version }}/alter-default-privileges.md) | Change the default [privileges]({{ page.version.version }}/security-reference/authorization.md#privileges) for objects created by specific roles/users in the current database.
[`ALTER FUNCTION`]({{ page.version.version }}/alter-function.md) | Modify a [user-defined function]({{ page.version.version }}/user-defined-functions.md).
[`ALTER INDEX`]({{ page.version.version }}/alter-index.md) | Apply a schema change to an index.
[`ALTER PARTITION`]({{ page.version.version }}/alter-partition.md) | Configure the replication zone for a partition.
[`ALTER PROCEDURE`]({{ page.version.version }}/alter-procedure.md) | Modify a [stored procedure]({{ page.version.version }}/stored-procedures.md).
[`ALTER RANGE`]({{ page.version.version }}/alter-range.md) | Configure the replication zone for a system range.
[`ALTER SCHEMA`]({{ page.version.version }}/alter-schema.md) | Alter a user-defined schema.
[`ALTER SEQUENCE`]({{ page.version.version }}/alter-sequence.md) | Apply a schema change to a sequence.
[`ALTER TABLE`]({{ page.version.version }}/alter-table.md) | Apply a schema change to a table.
[`ALTER TYPE`]({{ page.version.version }}/alter-type.md) | Modify a user-defined, [enumerated data type]({{ page.version.version }}/enum.md).
[`ALTER USER`]({{ page.version.version }}/alter-user.md) | Add, change, or remove a user's password and to change the login privileges for a role.
[`ALTER ROLE`]({{ page.version.version }}/alter-role.md) | Add, change, or remove a [role's]({{ page.version.version }}/create-role.md) password and to change the login privileges for a role.
[`ALTER VIEW`]({{ page.version.version }}/alter-view.md) | Apply a schema change to a view.
[`COMMENT ON`]({{ page.version.version }}/comment-on.md) | Associate a comment to a database, table, or column.
[`CREATE DATABASE`]({{ page.version.version }}/create-database.md) | Create a new database.
[`CREATE FUNCTION`]({{ page.version.version }}/create-function.md) | Create a [user-defined function]({{ page.version.version }}/user-defined-functions.md).
[`CREATE INDEX`]({{ page.version.version }}/create-index.md) | Create an index for a table.
[`CREATE PROCEDURE`]({{ page.version.version }}/create-procedure.md) | Create a [stored procedure]({{ page.version.version }}/stored-procedures.md).
[`CREATE SCHEMA`]({{ page.version.version }}/create-schema.md) | Create a user-defined schema.
[`CREATE SEQUENCE`]({{ page.version.version }}/create-sequence.md) | Create a new sequence.
[`CREATE TABLE`]({{ page.version.version }}/create-table.md) | Create a new table in a database.
[`CREATE TABLE AS`]({{ page.version.version }}/create-table-as.md) | Create a new table in a database using the results from a [selection query]({{ page.version.version }}/selection-queries.md).
[`CREATE TRIGGER`]({{ page.version.version }}/create-trigger.md) | Create a new [trigger]({{ page.version.version }}/triggers.md) on a specified table.
[`CREATE TYPE`]({{ page.version.version }}/create-type.md) | Create a user-defined, [enumerated data type]({{ page.version.version }}/enum.md).
[`CREATE VIEW`]({{ page.version.version }}/create-view.md) | Create a new [view]({{ page.version.version }}/views.md) in a database.
[`DROP DATABASE`]({{ page.version.version }}/drop-database.md) | Remove a database and all its objects.
[`DROP FUNCTION`]({{ page.version.version }}/drop-function.md) | Remove a [user-defined function]({{ page.version.version }}/user-defined-functions.md) from a database.
[`DROP INDEX`]({{ page.version.version }}/drop-index.md) | Remove an index for a table.
[`DROP OWNED BY`]({{ page.version.version }}/drop-owned-by.md) | Drop all objects owned by and any [grants]({{ page.version.version }}/grant.md) on objects not owned by a [role]({{ page.version.version }}/security-reference/authorization.md#roles).
[`DROP PROCEDURE`]({{ page.version.version }}/drop-procedure.md) | Remove a [stored procedure]({{ page.version.version }}/stored-procedures.md).
[`DROP SCHEMA`]({{ page.version.version }}/drop-schema.md) | Drop a user-defined schema.
[`DROP SEQUENCE`]({{ page.version.version }}/drop-sequence.md) | Remove a sequence.
[`DROP TABLE`]({{ page.version.version }}/drop-table.md) | Remove a table.
[`DROP TRIGGER`]({{ page.version.version }}/drop-trigger.md) | Remove a [trigger]({{ page.version.version }}/triggers.md).
[`DROP TYPE`]({{ page.version.version }}/drop-type.md) | Remove a user-defined, [enumerated data type]({{ page.version.version }}/enum.md).
[`DROP VIEW`]({{ page.version.version }}/drop-view.md)| Remove a view.
[`REFRESH`]({{ page.version.version }}/refresh.md) | Refresh the stored query results of a [materialized view]({{ page.version.version }}/views.md#materialized-views).
[`SHOW COLUMNS`]({{ page.version.version }}/show-columns.md) | View details about columns in a table.
[`SHOW CONSTRAINTS`]({{ page.version.version }}/show-constraints.md) | List constraints on a table.
[`SHOW CREATE`]({{ page.version.version }}/show-create.md) | View the `CREATE` statement for a database, function, sequence, table, or view.
[`SHOW DATABASES`]({{ page.version.version }}/show-databases.md) | List databases in the cluster.
[`SHOW DEFAULT SESSION VARIABLES FOR ROLE`]({{ page.version.version }}/show-default-session-variables-for-role.md) | List the values for updated [session variables]({{ page.version.version }}/set-vars.md) that are applied to a given [user or role]({{ page.version.version }}/security-reference/authorization.md#roles).
[`SHOW ENUMS`]({{ page.version.version }}/show-enums.md) | List user-defined, [enumerated data types]({{ page.version.version }}/enum.md) in a database.
[`SHOW FULL TABLE SCANS`]({{ page.version.version }}/show-full-table-scans.md) | List recent queries that used a full table scan.
[`SHOW INDEX`]({{ page.version.version }}/show-index.md) | View index information for a table or database.
[`SHOW LOCALITY`]({{ page.version.version }}/show-locality.md) | View the locality of the current node.
[`SHOW PARTITIONS`]({{ page.version.version }}/show-partitions.md) | List partitions in a database.
[`SHOW REGIONS`]({{ page.version.version }}/show-regions.md) | List the [cluster regions]({{ page.version.version }}/multiregion-overview.md#cluster-regions) or [database regions]({{ page.version.version }}/multiregion-overview.md#database-regions) in a [multi-region cluster]({{ page.version.version }}/multiregion-overview.md).
[`SHOW SUPER REGIONS`]({{ page.version.version }}/show-super-regions.md) | List the [super regions]({{ page.version.version }}/multiregion-overview.md#super-regions) associated with a database in a [multi-region cluster]({{ page.version.version }}/multiregion-overview.md).
[`SHOW SCHEMAS`]({{ page.version.version }}/show-schemas.md) | List the schemas in a database.
[`SHOW SEQUENCES`]({{ page.version.version }}/show-sequences.md) | List the sequences in a database.
[`SHOW TABLES`]({{ page.version.version }}/show-tables.md) | List tables or views in a database or virtual schema.
[`SHOW TYPES`]({{ page.version.version }}/show-types.md) | List user-defined [data types]({{ page.version.version }}/data-types.md) in a database.
[`SHOW RANGES`]({{ page.version.version }}/show-ranges.md) | Show range information for all data in a table or index.
[`SHOW RANGE FOR ROW`]({{ page.version.version }}/show-range-for-row.md) | Show range information for a single row in a table or index.
[`SHOW ZONE CONFIGURATIONS`]({{ page.version.version }}/show-zone-configurations.md) | List details about existing [replication zones]({{ page.version.version }}/configure-replication-zones.md).

## Data manipulation statements

Statement | Usage
----------|------------
[`CALL`]({{ page.version.version }}/call.md) | Call a [stored procedure]({{ page.version.version }}/stored-procedures.md).
[`CREATE TABLE AS`]({{ page.version.version }}/create-table-as.md) | Create a new table in a database using the results from a [selection query]({{ page.version.version }}/selection-queries.md).
[`COPY FROM`]({{ page.version.version }}/copy-from.md) | Copy data from a third-party client to a CockroachDB cluster.<br>For compatibility with PostgreSQL drivers and ORMs, CockroachDB supports `COPY FROM` statements issued only from third-party clients; you cannot issue `COPY FROM` statements from the [`cockroach` SQL shell]({{ page.version.version }}/cockroach-sql.md). To import data from files, use an [`IMPORT INTO`]({{ page.version.version }}/import-into.md) statement instead.
[`DELETE`]({{ page.version.version }}/delete.md) | Delete specific rows from a table.
[`EXPORT`]({{ page.version.version }}/export.md) | Export an entire table's data, or the results of a `SELECT` statement, to CSV files.
[`IMPORT INTO`]({{ page.version.version }}/import-into.md) | Bulk-insert CSV data into an existing table.
[`INSERT`]({{ page.version.version }}/insert.md) | Insert rows into a table.
[`SELECT`]({{ page.version.version }}/select-clause.md) | Select specific rows and columns from a table and optionally compute derived values.
[`SELECT FOR UPDATE`]({{ page.version.version }}/select-for-update.md) | Order transactions by controlling concurrent access to one or more rows of a table.
[`TABLE`]({{ page.version.version }}/selection-queries.md#table-clause) | Select all rows and columns from a table.
[`TRUNCATE`]({{ page.version.version }}/truncate.md) | Delete all rows from specified tables.
[`UPDATE`]({{ page.version.version }}/update.md) | Update rows in a table.
[`UPSERT`]({{ page.version.version }}/upsert.md) | Insert rows that do not violate uniqueness constraints; update rows that do.
[`VALUES`]({{ page.version.version }}/selection-queries.md#values-clause) | Return rows containing specific values.

<a id="access-management-statements"></a>

## Data control statements

Statement | Usage
----------|------------
[`CREATE ROLE`]({{ page.version.version }}/create-role.md) | Create SQL [roles]({{ page.version.version }}/security-reference/authorization.md#users-and-roles), which are groups containing any number of roles and users as members.
[`CREATE USER`]({{ page.version.version }}/create-user.md) | Create SQL users, which lets you control [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on your databases and tables.
[`DROP ROLE`]({{ page.version.version }}/drop-role.md) | Remove one or more SQL [roles]({{ page.version.version }}/security-reference/authorization.md#users-and-roles).
[`DROP USER`]({{ page.version.version }}/drop-user.md) | Remove one or more SQL users.
[`GRANT`]({{ page.version.version }}/grant.md) | Grant privileges to [users and roles]({{ page.version.version }}/security-reference/authorization.md#users-and-roles), or add a [role]({{ page.version.version }}/security-reference/authorization.md#users-and-roles) or [user]({{ page.version.version }}/security-reference/authorization.md#create-and-manage-users) as a member to a role.
[`REASSIGN OWNED`]({{ page.version.version }}/reassign-owned.md) | Change the [ownership]({{ page.version.version }}/security-reference/authorization.md#object-ownership) of all database objects in the current database that are currently owned by a specific [role]({{ page.version.version }}/security-reference/authorization.md#roles) or [user]({{ page.version.version }}/security-reference/authorization.md#sql-users).
[`REVOKE`]({{ page.version.version }}/revoke.md) | Revoke privileges from [users]({{ page.version.version }}/security-reference/authorization.md#create-and-manage-users) or [roles]({{ page.version.version }}/security-reference/authorization.md#users-and-roles), or revoke a [role]({{ page.version.version }}/security-reference/authorization.md#users-and-roles) or [user's]({{ page.version.version }}/security-reference/authorization.md#create-and-manage-users) membership to a role.
[`SHOW GRANTS`]({{ page.version.version }}/show-grants.md) | View privileges granted to users.
[`SHOW ROLES`]({{ page.version.version }}/show-roles.md) | Lists the roles for all databases.
[`SHOW USERS`]({{ page.version.version }}/show-users.md) | Lists the users for all databases.
[`SHOW DEFAULT PRIVILEGES`]({{ page.version.version }}/show-default-privileges.md) | Show the default privileges for objects created by specific roles/users in the current database.

<a id="transaction-management-statements"></a>

## Transaction control statements

Statement | Usage
----------|------------
[`BEGIN`]({{ page.version.version }}/begin-transaction.md)| Initiate a [transaction]({{ page.version.version }}/transactions.md).
[`COMMIT`]({{ page.version.version }}/commit-transaction.md) | Commit the current [transaction]({{ page.version.version }}/transactions.md).
[`SAVEPOINT`]({{ page.version.version }}/savepoint.md) | Start a [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions).
[`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md) | Commit a [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions).
[`ROLLBACK TO SAVEPOINT`]({{ page.version.version }}/rollback-transaction.md#rollback-a-nested-transaction) | Roll back and restart the [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions) started at the corresponding `SAVEPOINT` statement.
[`ROLLBACK`]({{ page.version.version }}/rollback-transaction.md) | Roll back the current [transaction]({{ page.version.version }}/transactions.md) and all of its [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions), discarding all transactional updates made by statements inside the transaction.
[`SET TRANSACTION`]({{ page.version.version }}/set-transaction.md) | Set the priority for the session or for an individual [transaction]({{ page.version.version }}/transactions.md).
[`SHOW`]({{ page.version.version }}/show-vars.md) | View the current [transaction settings]({{ page.version.version }}/transactions.md).
[`SHOW TRANSACTIONS`]({{ page.version.version }}/show-transactions.md) | View all currently active transactions across the cluster or on the local node.

## Session management statements

Statement | Usage
----------|------------
[`RESET {session variable}`]({{ page.version.version }}/reset-vars.md) | Reset a session variable to its default value.
[`SET {session variable}`]({{ page.version.version }}/set-vars.md) | Set a current session variable.
[`SET TRANSACTION`]({{ page.version.version }}/set-transaction.md) | Set the priority for an individual [transaction]({{ page.version.version }}/transactions.md).
[`SHOW TRACE FOR SESSION`]({{ page.version.version }}/show-trace.md) | Return details about how CockroachDB executed a statement or series of statements recorded during a session.
[`SHOW {session variable}`]({{ page.version.version }}/show-vars.md) | List the current session or transaction settings.

## Cluster management statements

Statement | Usage
----------|------------
[`RESET CLUSTER SETTING`]({{ page.version.version }}/reset-cluster-setting.md) | Reset a cluster setting to its default value.
[`SET CLUSTER SETTING`]({{ page.version.version }}/set-cluster-setting.md) | Set a cluster-wide setting.
[`SHOW ALL CLUSTER SETTINGS`]({{ page.version.version }}/show-cluster-setting.md) | List the current cluster-wide settings.
[`SHOW SESSIONS`]({{ page.version.version }}/show-sessions.md) | List details about currently active sessions.
[`CANCEL SESSION`]({{ page.version.version }}/cancel-session.md) | Cancel a long-running session.

## Query management statements

Statement | Usage
----------|------------
[`CANCEL QUERY`]({{ page.version.version }}/cancel-query.md) | Cancel a running SQL query.
[`SHOW STATEMENTS`/`SHOW QUERIES`]({{ page.version.version }}/show-statements.md) | List details about current active SQL queries.

## Query planning statements

Statement | Usage
----------|------------
[`CREATE STATISTICS`]({{ page.version.version }}/create-statistics.md) | Create table statistics for the [cost-based optimizer]({{ page.version.version }}/cost-based-optimizer.md) to use.
[`EXPLAIN`]({{ page.version.version }}/explain.md) | View debugging and analysis details for a statement that operates over tabular data.
[`EXPLAIN ANALYZE`]({{ page.version.version }}/explain-analyze.md) | Execute the query and generate a physical query plan with execution statistics.
[`SHOW STATISTICS`]({{ page.version.version }}/show-statistics.md) | List table statistics used by the [cost-based optimizer]({{ page.version.version }}/cost-based-optimizer.md).

## Job management statements

Jobs in CockroachDB represent tasks that might not complete immediately, such as schema changes or {{ site.data.products.enterprise }} backups or restores.

Statement | Usage
----------|------------
[`CANCEL JOB`]({{ page.version.version }}/cancel-job.md) | Cancel a `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`PAUSE JOB`]({{ page.version.version }}/pause-job.md) | Pause a `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`RESUME JOB`]({{ page.version.version }}/resume-job.md) | Resume a paused `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`SHOW JOBS`]({{ page.version.version }}/show-jobs.md) | View information on jobs.

## Backup and restore statements

Statement | Usage
----------|------------
[`BACKUP`]({{ page.version.version }}/backup.md) | Create disaster recovery backups of clusters, databases, and tables.
[`RESTORE`]({{ page.version.version }}/restore.md) | Restore clusters, databases, and tables using your backups.
[`SHOW BACKUP`]({{ page.version.version }}/show-backup.md) | List the contents of a backup.
[`CREATE SCHEDULE FOR BACKUP`]({{ page.version.version }}/create-schedule-for-backup.md) | Create a schedule for periodic backups.
[`ALTER BACKUP SCHEDULE`]({{ page.version.version }}/alter-backup-schedule.md) | Modify an existing backup schedule.
[`SHOW SCHEDULES`]({{ page.version.version }}/show-schedules.md) | View information on backup schedules.
[`PAUSE SCHEDULES`]({{ page.version.version }}/pause-schedules.md) | Pause backup schedules.
[`RESUME SCHEDULES`]({{ page.version.version }}/resume-schedules.md) | Resume paused backup schedules.
[`DROP SCHEDULES`]({{ page.version.version }}/drop-schedules.md) | Drop backup schedules.
[`ALTER BACKUP`]({{ page.version.version }}/alter-backup.md) | Add a new [KMS encryption key]({{ page.version.version }}/take-and-restore-encrypted-backups.md#use-key-management-service) to an encrypted backup.

## Changefeed statements

[Change data capture]({{ page.version.version }}/change-data-capture-overview.md) (CDC) provides an {{ site.data.products.enterprise }} and core version of row-level change subscriptions for downstream processing.

Statement | Usage
----------|------------
[`CREATE CHANGEFEED`]({{ page.version.version }}/create-changefeed.md) | Create a new changefeed to stream row-level changes in a configurable format to a configurable sink (e.g, [Kafka]({{ page.version.version }}/changefeed-sinks.md#kafka), [cloud storage]({{ page.version.version }}/changefeed-sinks.md#cloud-storage-sink)).
[`CREATE SCHEDULE FOR CHANGEFEED`]({{ page.version.version }}/create-schedule-for-changefeed.md) | Create a scheduled changefeed to export data out of CockroachDB using an initial scan. to a configurable sink (e.g, [Kafka]({{ page.version.version }}/changefeed-sinks.md#kafka), [cloud storage]({{ page.version.version }}/changefeed-sinks.md#cloud-storage-sink)).
[`EXPERIMENTAL CHANGEFEED FOR`]({{ page.version.version }}/changefeed-for.md) | (Core) Create a new changefeed to stream row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.
[`ALTER CHANGEFEED`]({{ page.version.version }}/alter-changefeed.md) | Modify an existing changefeed.

## External resource statements

Statement | Usage
----------+----------
[`CREATE EXTERNAL CONNECTION`]({{ page.version.version }}/create-external-connection.md) | Create an external connection, which represents a provider-specific URI, to interact with resources that are external from CockroachDB.
[`SHOW CREATE EXTERNAL CONNECTION`]({{ page.version.version }}/show-create-external-connection.md) | Display the connection name and the creation statements for active external connections.
[`DROP EXTERNAL CONNECTION`]({{ page.version.version }}/drop-external-connection.md) | Drop an external connection.