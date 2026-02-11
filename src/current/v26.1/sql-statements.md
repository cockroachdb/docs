---
title: SQL Statements
summary: Overview of SQL statements supported by CockroachDB.
toc: true
docs_area: reference.sql
---

CockroachDB supports the following SQL statements.

In the [`cockroach` SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}#help), use `\h [statement]` to get inline help about a statement.

## Data definition statements

Statement | Usage
----------|------------
[`ALTER DATABASE`]({% link {{ page.version.version }}/alter-database.md %}) | Apply a schema change to a database.
[`ALTER DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/alter-default-privileges.md %}) | Change the default [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) for objects created by specific roles/users in the current database.
[`ALTER EXTERNAL CONNECTION`]({% link {{ page.version.version }}/alter-external-connection.md %}) | Update an external connection's URI.
[`ALTER FUNCTION`]({% link {{ page.version.version }}/alter-function.md %}) | Modify a [user-defined function]({% link {{ page.version.version }}/user-defined-functions.md %}).
[`ALTER INDEX`]({% link {{ page.version.version }}/alter-index.md %}) | Apply a schema change to an index.
[`ALTER PARTITION`]({% link {{ page.version.version }}/alter-partition.md %}) | Configure the replication zone for a partition.
[`ALTER PROCEDURE`]({% link {{ page.version.version }}/alter-procedure.md %}) | Modify a [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}).
[`ALTER RANGE`]({% link {{ page.version.version }}/alter-range.md %}) | Configure the replication zone for a system range.
[`ALTER SCHEMA`]({% link {{ page.version.version }}/alter-schema.md %}) | Alter a user-defined schema.
[`ALTER SEQUENCE`]({% link {{ page.version.version }}/alter-sequence.md %}) | Apply a schema change to a sequence.
[`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}) | Apply a schema change to a table.
[`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %}) | Modify a user-defined, [enumerated data type]({% link {{ page.version.version }}/enum.md %}).
[`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}) | Add, change, or remove a user's password and to change the login privileges for a role.
[`ALTER ROLE`]({% link {{ page.version.version }}/alter-role.md %}) | Add, change, or remove a [role's]({% link {{ page.version.version }}/create-role.md %}) password and to change the login privileges for a role.
[`ALTER VIEW`]({% link {{ page.version.version }}/alter-view.md %}) | Apply a schema change to a view.
[`COMMENT ON`]({% link {{ page.version.version }}/comment-on.md %}) | Associate a comment to a database, table, or column.
[`CREATE DATABASE`]({% link {{ page.version.version }}/create-database.md %}) | Create a new database.
[`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %}) | Create a [user-defined function]({% link {{ page.version.version }}/user-defined-functions.md %}).
[`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %}) | Create an index for a table.
[`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %}) | Create a [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}).
[`CREATE SCHEMA`]({% link {{ page.version.version }}/create-schema.md %}) | Create a user-defined schema.
[`CREATE SEQUENCE`]({% link {{ page.version.version }}/create-sequence.md %}) | Create a new sequence.
[`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) | Create a new table in a database.
[`CREATE TABLE AS`]({% link {{ page.version.version }}/create-table-as.md %}) | Create a new table in a database using the results from a [selection query]({% link {{ page.version.version }}/selection-queries.md %}).
[`CREATE TRIGGER`]({% link {{ page.version.version }}/create-trigger.md %}) | Create a new [trigger]({% link {{ page.version.version }}/triggers.md %}) on a specified table.
[`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %}) | Create a user-defined, [enumerated data type]({% link {{ page.version.version }}/enum.md %}).
[`CREATE VIEW`]({% link {{ page.version.version }}/create-view.md %}) | Create a new [view]({% link {{ page.version.version }}/views.md %}) in a database.
[`DROP DATABASE`]({% link {{ page.version.version }}/drop-database.md %}) | Remove a database and all its objects.
[`DROP FUNCTION`]({% link {{ page.version.version }}/drop-function.md %}) | Remove a [user-defined function]({% link {{ page.version.version }}/user-defined-functions.md %}) from a database.
[`DROP INDEX`]({% link {{ page.version.version }}/drop-index.md %}) | Remove an index for a table.
[`DROP OWNED BY`]({% link {{ page.version.version }}/drop-owned-by.md %}) | Drop all objects owned by and any [grants]({% link {{ page.version.version }}/grant.md %}) on objects not owned by a [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles).
[`DROP PROCEDURE`]({% link {{ page.version.version }}/drop-procedure.md %}) | Remove a [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}).
[`DROP SCHEMA`]({% link {{ page.version.version }}/drop-schema.md %}) | Drop a user-defined schema.
[`DROP SEQUENCE`]({% link {{ page.version.version }}/drop-sequence.md %}) | Remove a sequence.
[`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %}) | Remove a table.
[`DROP TRIGGER`]({% link {{ page.version.version }}/drop-trigger.md %}) | Remove a [trigger]({% link {{ page.version.version }}/triggers.md %}).
[`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %}) | Remove a user-defined, [enumerated data type]({% link {{ page.version.version }}/enum.md %}).
[`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %})| Remove a view.
[`REFRESH`]({% link {{ page.version.version }}/refresh.md %}) | Refresh the stored query results of a [materialized view]({% link {{ page.version.version }}/views.md %}#materialized-views).
[`SHOW COLUMNS`]({% link {{ page.version.version }}/show-columns.md %}) | View details about columns in a table.
[`SHOW CONSTRAINTS`]({% link {{ page.version.version }}/show-constraints.md %}) | List constraints on a table.
[`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %}) | View the `CREATE` statement for a database, function, sequence, table, or view.
[`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %}) | List databases in the cluster.
[`SHOW DEFAULT SESSION VARIABLES FOR ROLE`]({% link {{ page.version.version }}/show-default-session-variables-for-role.md %}) | List the values for updated [session variables]({% link {{ page.version.version }}/set-vars.md %}) that are applied to a given [user or role]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles).
[`SHOW ENUMS`]({% link {{ page.version.version }}/show-enums.md %}) | List user-defined, [enumerated data types]({% link {{ page.version.version }}/enum.md %}) in a database.
[`SHOW FULL TABLE SCANS`]({% link {{ page.version.version }}/show-full-table-scans.md %}) | List recent queries that used a full table scan.
[`SHOW INDEX`]({% link {{ page.version.version }}/show-index.md %}) | View index information for a table or database.
[`SHOW LOCALITY`]({% link {{ page.version.version }}/show-locality.md %}) | View the locality of the current node.
[`SHOW PARTITIONS`]({% link {{ page.version.version }}/show-partitions.md %}) | List partitions in a database.
[`SHOW REGIONS`]({% link {{ page.version.version }}/show-regions.md %}) | List the [cluster regions]({% link {{ page.version.version }}/multiregion-overview.md %}#cluster-regions) or [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions) in a [multi-region cluster]({% link {{ page.version.version }}/multiregion-overview.md %}).
[`SHOW SUPER REGIONS`]({% link {{ page.version.version }}/show-super-regions.md %}) | List the [super regions]({% link {{ page.version.version }}/multiregion-overview.md %}#super-regions) associated with a database in a [multi-region cluster]({% link {{ page.version.version }}/multiregion-overview.md %}).
[`SHOW SCHEMAS`]({% link {{ page.version.version }}/show-schemas.md %}) | List the schemas in a database.
[`SHOW SEQUENCES`]({% link {{ page.version.version }}/show-sequences.md %}) | List the sequences in a database.
[`SHOW TABLES`]({% link {{ page.version.version }}/show-tables.md %}) | List tables or views in a database or virtual schema.
[`SHOW TYPES`]({% link {{ page.version.version }}/show-types.md %}) | List user-defined [data types]({% link {{ page.version.version }}/data-types.md %}) in a database.
[`SHOW RANGES`]({% link {{ page.version.version }}/show-ranges.md %}) | Show range information for all data in a table or index.
[`SHOW RANGE FOR ROW`]({% link {{ page.version.version }}/show-range-for-row.md %}) | Show range information for a single row in a table or index.
[`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}) | List details about existing [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}).

## Data manipulation statements

Statement | Usage
----------|------------
[`CREATE TABLE AS`]({% link {{ page.version.version }}/create-table-as.md %}) | Create a new table in a database using the results from a [selection query]({% link {{ page.version.version }}/selection-queries.md %}).
[`COPY FROM`]({% link {{ page.version.version }}/copy.md %}) | Copy data from a third-party client to a CockroachDB cluster.<br>For compatibility with PostgreSQL drivers and ORMs, CockroachDB supports `COPY FROM` statements issued from third-party clients. To import data from files, use an [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) statement instead.
[`DELETE`]({% link {{ page.version.version }}/delete.md %}) | Delete specific rows from a table.
[`DO`]({% link {{ page.version.version }}/do.md %}) | Execute a [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}) code block.
[`EXPORT`]({% link {{ page.version.version }}/export.md %}) | Export an entire table's data, or the results of a `SELECT` statement, to CSV files.
[`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) | Bulk-insert CSV data into an existing table.
[`INSERT`]({% link {{ page.version.version }}/insert.md %}) | Insert rows into a table.
[`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) | Select specific rows and columns from a table and optionally compute derived values.
[`SELECT FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) | Order transactions by controlling concurrent access to one or more rows of a table.
[`TABLE`]({% link {{ page.version.version }}/selection-queries.md %}#table-clause) | Select all rows and columns from a table.
[`TRUNCATE`]({% link {{ page.version.version }}/truncate.md %}) | Delete all rows from specified tables.
[`UPDATE`]({% link {{ page.version.version }}/update.md %}) | Update rows in a table.
[`UPSERT`]({% link {{ page.version.version }}/upsert.md %}) | Insert rows that do not violate uniqueness constraints; update rows that do.
[`VALUES`]({% link {{ page.version.version }}/selection-queries.md %}#values-clause) | Return rows containing specific values.

<a id="access-management-statements"></a>

## Data control statements

Statement | Usage
----------|------------
[`ALTER POLICY`]({% link {{ page.version.version }}/alter-policy.md %}) | Alter a [row-level security (RLS)]({% link {{ page.version.version }}/row-level-security.md %}) policy.
[`CREATE POLICY`]({% link {{ page.version.version }}/create-policy.md %}) | Create a [row-level security (RLS)]({% link {{ page.version.version }}/row-level-security.md %}) policy.
[`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}) | Create SQL [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles), which are groups containing any number of roles and users as members.
[`CREATE USER`]({% link {{ page.version.version }}/create-user.md %}) | Create SQL users, which lets you control [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on your databases and tables.
[`DROP POLICY`]({% link {{ page.version.version }}/drop-policy.md %}) | Drop a [row-level security (RLS)]({% link {{ page.version.version }}/row-level-security.md %}) policy.
[`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %}) | Remove one or more SQL [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles).
[`DROP USER`]({% link {{ page.version.version }}/drop-user.md %}) | Remove one or more SQL users.
[`GRANT`]({% link {{ page.version.version }}/grant.md %}) | Grant privileges to [users and roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles), or add a [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles) or [user]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users) as a member to a role.
[`REASSIGN OWNED`]({% link {{ page.version.version }}/reassign-owned.md %}) | Change the [ownership]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) of all database objects in the current database that are currently owned by a specific [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) or [user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users).
[`REVOKE`]({% link {{ page.version.version }}/revoke.md %}) | Revoke privileges from [users]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users) or [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles), or revoke a [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles) or [user's]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users) membership to a role.
[`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %}) | View privileges granted to users.
[`SHOW POLICIES`]({% link {{ page.version.version }}/show-policies.md %}) | Show the [row-level security (RLS)]({% link {{ page.version.version }}/row-level-security.md %}) policies for a table.
[`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %}) | Lists the roles for all databases.
[`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %}) | Lists the users for all databases.
[`SHOW DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/show-default-privileges.md %}) | Show the default privileges for objects created by specific roles/users in the current database.

<a id="data-consistency-statements"></a>

## Data consistency statements

Statement | Usage
----------|------------
[`INSPECT`]({% link {{ page.version.version }}/inspect.md %}) | Run data consistency validation checks against tables or databases.
[`SHOW INSPECT ERRORS`]({% link {{ page.version.version }}/show-inspect-errors.md %}) | View issues detected by [`INSPECT`]({% link {{ page.version.version }}/inspect.md %}) data consistency validation jobs.

<a id="transaction-management-statements"></a>

## Transaction control statements

Statement | Usage
----------|------------
[`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %})| Initiate a [transaction]({% link {{ page.version.version }}/transactions.md %}).
[`CALL`]({% link {{ page.version.version }}/call.md %}) | Call a [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}).
[`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}) | Commit the current [transaction]({% link {{ page.version.version }}/transactions.md %}).
[`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %}) | Start a [nested transaction]({% link {{ page.version.version }}/transactions.md %}#nested-transactions).
[`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %}) | Commit a [nested transaction]({% link {{ page.version.version }}/transactions.md %}#nested-transactions).
[`ROLLBACK TO SAVEPOINT`]({% link {{ page.version.version }}/rollback-transaction.md %}#rollback-a-nested-transaction) | Roll back and restart the [nested transaction]({% link {{ page.version.version }}/transactions.md %}#nested-transactions) started at the corresponding `SAVEPOINT` statement.
[`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %}) | Roll back the current [transaction]({% link {{ page.version.version }}/transactions.md %}) and all of its [nested transaction]({% link {{ page.version.version }}/transactions.md %}#nested-transactions), discarding all transactional updates made by statements inside the transaction.
[`SET TRANSACTION`]({% link {{ page.version.version }}/set-transaction.md %}) | Set the priority for the session or for an individual [transaction]({% link {{ page.version.version }}/transactions.md %}).
[`SHOW`]({% link {{ page.version.version }}/show-vars.md %}) | View the current [transaction settings]({% link {{ page.version.version }}/transactions.md %}).
[`SHOW TRANSACTIONS`]({% link {{ page.version.version }}/show-transactions.md %}) | View all currently active transactions across the cluster or on the local node.

## Session management statements

Statement | Usage
----------|------------
[`RESET {session variable}`]({% link {{ page.version.version }}/reset-vars.md %}) | Reset a session variable to its default value.
[`SET {session variable}`]({% link {{ page.version.version }}/set-vars.md %}) | Set a current session variable.
[`SET TRANSACTION`]({% link {{ page.version.version }}/set-transaction.md %}) | Set the priority for an individual [transaction]({% link {{ page.version.version }}/transactions.md %}).
[`SHOW TRACE FOR SESSION`]({% link {{ page.version.version }}/show-trace.md %}) | Return details about how CockroachDB executed a statement or series of statements recorded during a session.
[`SHOW {session variable}`]({% link {{ page.version.version }}/show-vars.md %}) | List the current session or transaction settings.

## Cluster management statements

Statement | Usage
----------|------------
[`RESET CLUSTER SETTING`]({% link {{ page.version.version }}/reset-cluster-setting.md %}) | Reset a cluster setting to its default value.
[`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) | Set a cluster-wide setting.
[`SHOW ALL CLUSTER SETTINGS`]({% link {{ page.version.version }}/show-cluster-setting.md %}) | List the current cluster-wide settings.
[`SHOW SESSIONS`]({% link {{ page.version.version }}/show-sessions.md %}) | List details about currently active sessions.
[`CANCEL SESSION`]({% link {{ page.version.version }}/cancel-session.md %}) | Cancel a long-running session.

## Query management statements

Statement | Usage
----------|------------
[`CANCEL QUERY`]({% link {{ page.version.version }}/cancel-query.md %}) | Cancel a running SQL query.
[`SHOW STATEMENTS`/`SHOW QUERIES`]({% link {{ page.version.version }}/show-statements.md %}) | List details about current active SQL queries.

## Query planning statements

Statement | Usage
----------|------------
[`CREATE STATISTICS`]({% link {{ page.version.version }}/create-statistics.md %}) | Create table statistics for the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) to use.
[`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}) | View debugging and analysis details for a statement that operates over tabular data.
[`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain-analyze.md %}) | Execute the query and generate a physical query plan with execution statistics.
[`SHOW STATEMENT HINTS`]({% link {{ page.version.version }}/show-statement-hints.md %}) | <span class="version-tag">New in v26.1:</span> List [injected hints]({% link {{ page.version.version }}/cost-based-optimizer.md %}#hint-injection) for a SQL statement fingerprint.
[`SHOW STATISTICS`]({% link {{ page.version.version }}/show-statistics.md %}) | List table statistics used by the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}).

## Job management statements

Jobs in CockroachDB represent tasks that might not complete immediately, such as schema changes or {{ site.data.products.enterprise }} backups or restores.

Statement | Usage
----------|------------
[`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}) | Cancel a `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}) | Pause a `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}) | Resume a paused `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) | View information on jobs.

## Backup and restore statements

Statement | Usage
----------|------------
[`BACKUP`]({% link {{ page.version.version }}/backup.md %}) | Create disaster recovery backups of clusters, databases, and tables.
[`RESTORE`]({% link {{ page.version.version }}/restore.md %}) | Restore clusters, databases, and tables using your backups.
[`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %}) | List the contents of a backup.
[`CREATE SCHEDULE FOR BACKUP`]({% link {{ page.version.version }}/create-schedule-for-backup.md %}) | Create a schedule for periodic backups.
[`ALTER BACKUP SCHEDULE`]({% link {{ page.version.version }}/alter-backup-schedule.md %}) | Modify an existing backup schedule.
[`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %}) | View information on backup schedules.
[`PAUSE SCHEDULES`]({% link {{ page.version.version }}/pause-schedules.md %}) | Pause backup schedules.
[`RESUME SCHEDULES`]({% link {{ page.version.version }}/resume-schedules.md %}) | Resume paused backup schedules.
[`DROP SCHEDULES`]({% link {{ page.version.version }}/drop-schedules.md %}) | Drop backup schedules.
[`ALTER BACKUP`]({% link {{ page.version.version }}/alter-backup.md %}) | Add a new [KMS encryption key]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}#use-key-management-service) to an encrypted backup.

## Changefeed statements

[Change data capture]({% link {{ page.version.version }}/change-data-capture-overview.md %}) (CDC) provides an {{ site.data.products.enterprise }} and core version of row-level change subscriptions for downstream processing.

Statement | Usage
----------|------------
[`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) | Create a new changefeed to stream row-level changes in a configurable format to a configurable sink (e.g, [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [cloud storage]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink)).
[`CREATE SCHEDULE FOR CHANGEFEED`]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %}) | Create a scheduled changefeed to export data out of CockroachDB using an initial scan. to a configurable sink (e.g, [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [cloud storage]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink)).
[`EXPERIMENTAL CHANGEFEED FOR`]({% link {{ page.version.version }}/changefeed-for.md %}) | (Core) Create a new changefeed to stream row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.
[`ALTER CHANGEFEED`]({% link {{ page.version.version }}/alter-changefeed.md %}) | Modify an existing changefeed.

## External resource statements

Statement | Usage
----------+----------
[`CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/create-external-connection.md %}) | Create an external connection, which represents a provider-specific URI, to interact with resources that are external from CockroachDB.
[`SHOW CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/show-create-external-connection.md %}) | Display the connection name and the creation statements for active external connections.
[`DROP EXTERNAL CONNECTION`]({% link {{ page.version.version }}/drop-external-connection.md %}) | Drop an external connection.
