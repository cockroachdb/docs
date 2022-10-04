---
title: SQL Statements
summary: Overview of SQL statements supported by CockroachDB.
toc: true
docs_area: reference.sql
---

CockroachDB supports the following SQL statements.

In the [`cockroach` SQL shell](cockroach-sql.html#help), use `\h [statement]` to get inline help about a statement.

## Data definition statements

Statement | Usage
----------|------------
[`ADD COLUMN`](add-column.html) | Add a column to a table.
[`ADD REGION`](add-region.html) | Add a [region](multiregion-overview.html#database-regions) to a database. [Multi-region features](multiregion-overview.html) require an [{{ site.data.products.enterprise }} license](enterprise-licensing.html).
[`ADD SUPER REGION`](add-super-region.html) | Add a super region made up of a set of regions added with [`ADD REGION`](add-region.html) such that data from [regional tables](regional-tables.html) will be stored in only those regions.
[`ADD CONSTRAINT`](add-constraint.html) | Add a constraint to a column.
[`ALTER COLUMN`](alter-column.html) | Change a column's [default constraint](default-value.html), [`NOT NULL` constraint](not-null.html), or [data type](data-types.html).
[`ALTER DATABASE`](alter-database.html) | Apply a schema change to a database.
[`ALTER DEFAULT PRIVILEGES`](alter-default-privileges.html) | Change the default [privileges](security-reference/authorization.html#privileges) for objects created by specific roles/users in the current database.
[`ALTER FUNCTION`](alter-function.html) | **New in v22.2:** Modify a [user-defined function](user-defined-functions.html).
[`ALTER INDEX`](alter-index.html) | Apply a schema change to an index.
[`ALTER PARTITION`](alter-partition.html) | Configure the replication zone for a partition. [Partitioning](partitioning.html) requires an [{{ site.data.products.enterprise }} license](enterprise-licensing.html).
[`ALTER PRIMARY KEY`](alter-primary-key.html) | Change the [primary key](primary-key.html) of a table.
[`ALTER RANGE`](alter-range.html) | Configure the replication zone for a system range.
[`ALTER SCHEMA`](alter-schema.html) | Alter a user-defined schema.
[`ALTER SEQUENCE`](alter-sequence.html) | Apply a schema change to a sequence.
[`ALTER SUPER REGION`](alter-super-region.html) | Alter an existing [super region](multiregion-overview.html#super-regions) to include a different set of regions. A super region is made up of a set of regions added with [`ADD REGION`](add-region.html) such that data from [regional tables](regional-tables.html) will be stored in only those regions.
[`ALTER TABLE`](alter-table.html) | Apply a schema change to a table.
[`ALTER TYPE`](alter-type.html) | Modify a user-defined, [enumerated data type](enum.html).
[`ALTER USER`](alter-user.html) | Add, change, or remove a user's password and to change the login privileges for a role.
[`ALTER ROLE`](alter-role.html) | Add, change, or remove a [role's](create-role.html) password and to change the login privileges for a role.
[`ALTER VIEW`](alter-view.html) | Apply a schema change to a view.
[`COMMENT ON`](comment-on.html) | Associate a comment to a database, table, or column.
[`CONFIGURE ZONE`](configure-zone.html) | Add, modify, reset, or remove a [replication zone](configure-replication-zones.html) for a database, table, index, partition, or system range.
[`CREATE DATABASE`](create-database.html) | Create a new database.
[`CREATE FUNCTION`](create-function.html) | **New in v22.2:** Create a [user-defined function](user-defined-functions.html).
[`CREATE INDEX`](create-index.html) | Create an index for a table.
[`CREATE SCHEMA`](create-schema.html) | Create a user-defined schema.
[`CREATE SEQUENCE`](create-sequence.html) | Create a new sequence.
[`CREATE TABLE`](create-table.html) | Create a new table in a database.
[`CREATE TABLE AS`](create-table-as.html) | Create a new table in a database using the results from a [selection query](selection-queries.html).
[`CREATE TYPE`](create-type.html) | Create a user-defined, [enumerated data type](enum.html).
[`CREATE VIEW`](create-view.html) | Create a new [view](views.html) in a database.
[`DROP COLUMN`](drop-column.html) | Remove columns from a table.
[`DROP CONSTRAINT`](drop-constraint.html) | Remove constraints from a column.
[`DROP DATABASE`](drop-database.html) | Remove a database and all its objects.
[`DROP FUNCTION`](drop-function.html) | **New in v22.2:** Remove a [user-defined function](user-defined-functions.html) from a database.
[`DROP INDEX`](drop-index.html) | Remove an index for a table.
[`DROP REGION`](drop-region.html) | Drop a [region](multiregion-overview.html#database-regions) from a database. [Multi-region features](multiregion-overview.html) require an [{{ site.data.products.enterprise }} license](enterprise-licensing.html).
[`DROP SUPER REGION`](drop-super-region.html) | Drop a super region made up of a set of [database regions](multiregion-overview.html#super-regions).
[`DROP SCHEMA`](drop-schema.html) | Drop a user-defined schema.
[`DROP SEQUENCE`](drop-sequence.html) | Remove a sequence.
[`DROP TABLE`](drop-table.html) | Remove a table.
[`DROP TYPE`](drop-type.html) | Remove a user-defined, [enumerated data type](enum.html).
[`DROP VIEW`](drop-view.html)| Remove a view.
[`EXPERIMENTAL_AUDIT`](experimental-audit.html) | Turn SQL audit logging on or off for a table.
[`PARTITION BY`](partition-by.html) | Partition, re-partition, or un-partition a table or secondary index. [Partitioning](partitioning.html) requires an [{{ site.data.products.enterprise }} license](enterprise-licensing.html).
[`REFRESH`](refresh.html) | Refresh the stored query results of a [materialized view](views.html#materialized-views).
[`RENAME COLUMN`](rename-column.html) | Rename a column in a table.
[`RENAME CONSTRAINT`](rename-constraint.html) | Rename a constraint on a column.
[`RENAME DATABASE`](rename-database.html) | Rename a database.
[`RENAME INDEX`](rename-index.html) | Rename an index for a table.
[`RENAME TABLE`](rename-table.html) | Rename a table or move a table between databases.
[`SET SCHEMA`](set-schema.html) | Change the schema of a table.
[`SET PRIMARY REGION`](set-primary-region.html) | Assign a [primary region](multiregion-overview.html#database-regions) to a multi-region database, or change an existing primary region. [Multi-region features](multiregion-overview.html) require an [{{ site.data.products.enterprise }} license](enterprise-licensing.html).
[`SHOW COLUMNS`](show-columns.html) | View details about columns in a table.
[`SHOW CONSTRAINTS`](show-constraints.html) | List constraints on a table.
[`SHOW CREATE`](show-create.html) | View the `CREATE` statement for a database, function, sequence, table, or view.
[`SHOW DATABASES`](show-databases.html) | List databases in the cluster.
[`SHOW ENUMS`](show-enums.html) | List user-defined, [enumerated data types](enum.html) in a database.
[`SHOW FULL TABLE SCANS`](show-full-table-scans.html) | List recent queries that used a full table scan.
[`SHOW INDEX`](show-index.html) | View index information for a table or database.
[`SHOW LOCALITY`](show-locality.html) | View the locality of the current node.
[`SHOW PARTITIONS`](show-partitions.html) | List partitions in a database. [Partitioning](partitioning.html) requires an [{{ site.data.products.enterprise }} license](enterprise-licensing.html).
[`SHOW REGIONS`](show-regions.html) | List the [cluster regions](multiregion-overview.html#cluster-regions) or [database regions](multiregion-overview.html#database-regions) in a [multi-region cluster](multiregion-overview.html).
[`SHOW SUPER REGIONS`](show-super-regions.html) | List the [super regions](multiregion-overview.html#super-regions) associated with a database in a [multi-region cluster](multiregion-overview.html).
[`SHOW SCHEMAS`](show-schemas.html) | List the schemas in a database.
[`SHOW SEQUENCES`](show-sequences.html) | List the sequences in a database.
[`SHOW TABLES`](show-tables.html) | List tables or views in a database or virtual schema.
[`SHOW TYPES`](show-types.html) | List user-defined [data types](data-types.html) in a database.
[`SHOW RANGES`](show-ranges.html) | Show range information for all data in a table or index.
[`SHOW RANGE FOR ROW`](show-range-for-row.html) | Show range information for a single row in a table or index.
[`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html) | List details about existing [replication zones](configure-replication-zones.html).
[`SPLIT AT`](split-at.html) | Force a range split at the specified row in the table or index.
[`UNSPLIT AT`](unsplit-at.html) | Remove a range split enforcement at a specified row in the table or index.
[`VALIDATE CONSTRAINT`](validate-constraint.html) | Check whether values in a column match a [constraint](constraints.html) on the column.

## Data manipulation statements

Statement | Usage
----------|------------
[`CREATE TABLE AS`](create-table-as.html) | Create a new table in a database using the results from a [selection query](selection-queries.html).
[`COPY FROM`](copy-from.html) | Copy data from a third-party client to a CockroachDB cluster.<br>For compatibility with PostgreSQL drivers and ORMs, CockroachDB supports `COPY FROM` statements issued only from third-party clients; you cannot issue `COPY FROM` statements from the [`cockroach` SQL shell](cockroach-sql.html). To import data from files, use an [`IMPORT`](import.html) statement instead.
[`DELETE`](delete.html) | Delete specific rows from a table.
[`EXPORT`](export.html) | Export an entire table's data, or the results of a `SELECT` statement, to CSV files.
[`IMPORT`](import.html) | Bulk-insert CSV data into a new table.
[`IMPORT INTO`](import-into.html) | Bulk-insert CSV data into an existing table.
[`INSERT`](insert.html) | Insert rows into a table.
[`SELECT`](select-clause.html) | Select specific rows and columns from a table and optionally compute derived values.
[`SELECT FOR UPDATE`](select-for-update.html) | Order transactions by controlling concurrent access to one or more rows of a table.
[`TABLE`](selection-queries.html#table-clause) | Select all rows and columns from a table.
[`TRUNCATE`](truncate.html) | Delete all rows from specified tables.
[`UPDATE`](update.html) | Update rows in a table.
[`UPSERT`](upsert.html) | Insert rows that do not violate uniqueness constraints; update rows that do.
[`VALUES`](selection-queries.html#values-clause) | Return rows containing specific values.

<a id="access-management-statements"></a>

## Data control statements

Statement | Usage
----------|------------
[`CREATE ROLE`](create-role.html) | Create SQL [roles](security-reference/authorization.html#users-and-roles), which are groups containing any number of roles and users as members.
[`CREATE USER`](create-user.html) | Create SQL users, which lets you control [privileges](security-reference/authorization.html#managing-privileges) on your databases and tables.
[`DROP ROLE`](drop-role.html) | Remove one or more SQL [roles](security-reference/authorization.html#users-and-roles).
[`DROP USER`](drop-user.html) | Remove one or more SQL users.
[`GRANT`](grant.html) | Grant privileges to [users and roles](security-reference/authorization.html#users-and-roles), or add a [role](security-reference/authorization.html#users-and-roles) or [user](security-reference/authorization.html#create-and-manage-users) as a member to a role.
[`REASSIGN OWNED`](reassign-owned.html) | Change the [ownership](security-reference/authorization.html#object-ownership) of all database objects in the current database that are currently owned by a specific [role](security-reference/authorization.html#roles) or [user](security-reference/authorization.html#sql-users).
[`REVOKE`](revoke.html) | Revoke privileges from [users](security-reference/authorization.html#create-and-manage-users) or [roles](security-reference/authorization.html#users-and-roles), or revoke a [role](security-reference/authorization.html#users-and-roles) or [user's](security-reference/authorization.html#create-and-manage-users) membership to a role.
[`SHOW GRANTS`](show-grants.html) | View privileges granted to users.
[`SHOW ROLES`](show-roles.html) | Lists the roles for all databases.
[`SHOW USERS`](show-users.html) | Lists the users for all databases.
[`SHOW DEFAULT PRIVILEGES`](show-default-privileges.html) | Show the default privileges for objects created by specific roles/users in the current database.

<a id="transaction-management-statements"></a>

## Transaction control statements

Statement | Usage
----------|------------
[`BEGIN`](begin-transaction.html)| Initiate a [transaction](transactions.html).
[`COMMIT`](commit-transaction.html) | Commit the current [transaction](transactions.html).
[`SAVEPOINT`](savepoint.html) | Start a [nested transaction](transactions.html#nested-transactions).
[`RELEASE SAVEPOINT`](release-savepoint.html) | Commit a [nested transaction](transactions.html#nested-transactions).
[`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#rollback-a-nested-transaction) | Roll back and restart the [nested transaction](transactions.html#nested-transactions) started at the corresponding `SAVEPOINT` statement.
[`ROLLBACK`](rollback-transaction.html) | Roll back the current [transaction](transactions.html) and all of its [nested transaction](transactions.html#nested-transactions), discarding all transactional updates made by statements inside the transaction.
[`SET TRANSACTION`](set-transaction.html) | Set the priority for the session or for an individual [transaction](transactions.html).
[`SHOW`](show-vars.html) | View the current [transaction settings](transactions.html).
[`SHOW TRANSACTIONS`](show-transactions.html) | View all currently active transactions across the cluster or on the local node.

## Session management statements

Statement | Usage
----------|------------
[`RESET {session variable}`](reset-vars.html) | Reset a session variable to its default value.
[`SET {session variable}`](set-vars.html) | Set a current session variable.
[`SET TRANSACTION`](set-transaction.html) | Set the priority for an individual [transaction](transactions.html).
[`SHOW TRACE FOR SESSION`](show-trace.html) | Return details about how CockroachDB executed a statement or series of statements recorded during a session.
[`SHOW {session variable}`](show-vars.html) | List the current session or transaction settings.

## Cluster management statements

Statement | Usage
----------|------------
[`RESET CLUSTER SETTING`](reset-cluster-setting.html) | Reset a cluster setting to its default value.
[`SET CLUSTER SETTING`](set-cluster-setting.html) | Set a cluster-wide setting.
[`SHOW ALL CLUSTER SETTINGS`](show-cluster-setting.html) | List the current cluster-wide settings.
[`SHOW SESSIONS`](show-sessions.html) | List details about currently active sessions.
[`CANCEL SESSION`](cancel-session.html) | Cancel a long-running session.

## Query management statements

Statement | Usage
----------|------------
[`CANCEL QUERY`](cancel-query.html) | Cancel a running SQL query.
[`SHOW STATEMENTS`/`SHOW QUERIES`](show-statements.html) | List details about current active SQL queries.

## Query planning statements

Statement | Usage
----------|------------
[`CREATE STATISTICS`](create-statistics.html) | Create table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.
[`EXPLAIN`](explain.html) | View debugging and analysis details for a statement that operates over tabular data.
[`EXPLAIN ANALYZE`](explain-analyze.html) | Execute the query and generate a physical query plan with execution statistics.
[`SHOW STATISTICS`](show-statistics.html) | List table statistics used by the [cost-based optimizer](cost-based-optimizer.html).

## Job management statements

Jobs in CockroachDB represent tasks that might not complete immediately, such as schema changes or {{ site.data.products.enterprise }} backups or restores.

Statement | Usage
----------|------------
[`CANCEL JOB`](cancel-job.html) | Cancel a `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`PAUSE JOB`](pause-job.html) | Pause a `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`RESUME JOB`](resume-job.html) | Resume a paused `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`SHOW JOBS`](show-jobs.html) | View information on jobs.

## Backup and restore statements

Statement | Usage
----------|------------
[`BACKUP`](backup.html) | Create disaster recovery backups of clusters, databases, and tables.
[`RESTORE`](restore.html) | Restore clusters, databases, and tables using your backups.
[`SHOW BACKUP`](show-backup.html) | List the contents of a backup.
[`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html) | Create a schedule for periodic backups. Core users can only use backup scheduling for full backups of clusters, databases, or tables. To use the other backup features, you need an [{{ site.data.products.enterprise }} license](enterprise-licensing.html).
[`SHOW SCHEDULES`](show-schedules.html) | View information on backup schedules.
[`PAUSE SCHEDULES`](pause-schedules.html) | Pause backup schedules.
[`RESUME SCHEDULES`](resume-schedules.html) | Resume paused backup schedules.
[`DROP SCHEDULES`](drop-schedules.html) | Drop backup schedules.
[`ALTER BACKUP`](alter-backup.html) | Add a new [KMS encryption key](take-and-restore-encrypted-backups.html#use-key-management-service) to an encrypted backup. Adding new KMS encryption keys requires an [{{ site.data.products.enterprise }} license](enterprise-licensing.html).

## Changefeed statements

[Change data capture](change-data-capture-overview.html) (CDC) provides an {{ site.data.products.enterprise }} and core version of row-level change subscriptions for downstream processing.

Statement | Usage
----------|------------
[`CREATE CHANGEFEED`](create-changefeed.html) | [**({{ site.data.products.enterprise }})**](enterprise-licensing.html) Create a new changefeed to stream row-level changes in a configurable format to a configurable sink ([Kafka](changefeed-sinks.html#kafka) or a [cloud storage sink](changefeed-sinks.html#cloud-storage-sink)).
[`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html) | **(Core)** Create a new changefeed to stream row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.
[`ALTER CHANGEFEED`](alter-changefeed.html) | Modify an existing changefeed. Modifying a changefeed requires an [{{ site.data.products.enterprise }} license](enterprise-licensing.html).
