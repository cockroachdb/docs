---
title: SQL Statements
summary: Overview of SQL statements supported by CockroachDB.
toc: true
---

CockroachDB supports the following SQL statements. Click a statement for more details.

{{site.data.alerts.callout_success}}
In the [built-in SQL shell](cockroach-sql.html#help), use `\h [statement]` to get inline help about a specific statement.
{{site.data.alerts.end}}

## Data manipulation statements

Statement | Usage
----------|------------
[`CREATE TABLE AS`](create-table-as.html) | Create a new table in a database using the results from a [selection query](selection-queries.html).
[`DELETE`](delete.html) | Delete specific rows from a table.
[`EXPORT`](export.html) | Export an entire table's data, or the results of a `SELECT` statement, to CSV files. Note that this statement requires an [enterprise license](enterprise-licensing.html).
[`IMPORT`](import.html) | Bulk-insert CSV data into a new table.
[`IMPORT INTO`](import-into.html) | Bulk-insert CSV data into an existing table.
[`INSERT`](insert.html) | Insert rows into a table.
[`SELECT`](select-clause.html) | Select specific rows and columns from a table and optionally compute derived values.
[`SELECT FOR UPDATE`](select-for-update.html) | <span class="version-tag">New in v20.1:</span> Order transactions by controlling concurrent access to one or more rows of a table.
[`TABLE`](selection-queries.html#table-clause) | Select all rows and columns from a table.
[`TRUNCATE`](truncate.html) | Delete all rows from specified tables.
[`UPDATE`](update.html) | Update rows in a table.
[`UPSERT`](upsert.html) | Insert rows that do not violate uniqueness constraints; update rows that do.
[`VALUES`](selection-queries.html#values-clause) | Return rows containing specific values.

## Data definition statements

Statement | Usage
----------|------------
[`ADD COLUMN`](add-column.html) | Add columns to a table.
[`ADD CONSTRAINT`](add-constraint.html) | Add a constraint to a column.
[`ALTER COLUMN`](alter-column.html) | Change a column's [Default constraint](default-value.html) or [`NOT NULL` constraint](not-null.html).
[`ALTER DATABASE`](alter-database.html) | Apply a schema change to a database.
[`ALTER INDEX`](alter-index.html) | Apply a schema change to an index.
[`ALTER PARTITION`](alter-partition.html) | Configure the replication zone for a partition. Note that [partitioning](partitioning.html) requires an [enterprise license](enterprise-licensing.html).
[`ALTER PRIMARY KEY`](alter-primary-key.html) | <span class="version-tag">New in v20.1:</span> Change the [primary key](primary-key.html) of a table.
[`ALTER RANGE`](alter-range.html) | Configure the replication zone for a system range.
[`ALTER SEQUENCE`](alter-sequence.html) | Apply a schema change to a sequence.
[`ALTER TABLE`](alter-table.html) | Apply a schema change to a table.
[`ALTER USER`](alter-user.html) | add, change, or remove a user's password and to change the login privileges for a role.
[`ALTER ROLE`](alter-role.html) | Add, change, or remove a [role's](create-role.html) password and to change the login privileges for a role.
[`ALTER VIEW`](alter-view.html) | Rename a view.
[`COMMENT ON`](comment-on.html) | Associate a comment to a database, table, or column.
[`CONFIGURE ZONE`](configure-zone.html) | Add, modify, reset, or remove a [replication zone](configure-replication-zones.html) for a database, table, index, partition, or system range.
[`CREATE DATABASE`](create-database.html) | Create a new database.
[`CREATE INDEX`](create-index.html) | Create an index for a table.
[`CREATE SEQUENCE`](create-sequence.html) | Create a new sequence.
[`CREATE TABLE`](create-table.html) | Create a new table in a database.
[`CREATE TABLE AS`](create-table-as.html) | Create a new table in a database using the results from a [selection query](selection-queries.html).
[`CREATE VIEW`](create-view.html) | Create a new [view](views.html) in a database.
[`DROP COLUMN`](drop-column.html) | Remove columns from a table.
[`DROP CONSTRAINT`](drop-constraint.html) | Remove constraints from a column.
[`DROP DATABASE`](drop-database.html) | Remove a database and all its objects.
[`DROP INDEX`](drop-index.html) | Remove an index for a table.
[`DROP SEQUENCE`](drop-sequence.html) | Remove a sequence.
[`DROP TABLE`](drop-table.html) | Remove a table.
[`DROP VIEW`](drop-view.html)| Remove a view.
[`EXPERIMENTAL_AUDIT`](experimental-audit.html) | Turn SQL audit logging on or off for a table.
[`PARTITION BY`](partition-by.html) | Partition, re-partition, or un-partition a table or secondary index. Note that [partitioning](partitioning.html) requires an [enterprise license](enterprise-licensing.html).
[`RENAME COLUMN`](rename-column.html) | Rename a column in a table.
[`RENAME CONSTRAINT`](rename-constraint.html) | Rename a constraint on a column.
[`RENAME DATABASE`](rename-database.html) | Rename a database.
[`RENAME INDEX`](rename-index.html) | Rename an index for a table.
[`RENAME SEQUENCE`](rename-sequence.html) | Rename a sequence.
[`RENAME TABLE`](rename-table.html) | Rename a table or move a table between databases.
[`SHOW COLUMNS`](show-columns.html) | View details about columns in a table.
[`SHOW CONSTRAINTS`](show-constraints.html) | List constraints on a table.
[`SHOW CREATE`](show-create.html) | View the `CREATE` statement for a table, view, or sequence.
[`SHOW DATABASES`](show-databases.html) | List databases in the cluster.
[`SHOW INDEX`](show-index.html) | View index information for a table or database.
[`SHOW LOCALITY`](show-locality.html) | View the locality of the current node.
[`SHOW PARTITIONS`](show-partitions.html) | List partitions in a database. Note that [partitioning](partitioning.html) requires an [enterprise license](enterprise-licensing.html).
[`SHOW SCHEMAS`](show-schemas.html) | List the schemas in a database.
[`SHOW SEQUENCES`](show-sequences.html) | List the sequences in a database.
[`SHOW TABLES`](show-tables.html) | List tables or views in a database or virtual schema.
[`SHOW RANGES`](show-ranges.html) | Show range information about a specific table or index.
[`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html) | List details about existing [replication zones](configure-replication-zones.html).
[`SPLIT AT`](split-at.html) | Force a range split at the specified row in the table or index.
[`UNSPLIT AT`](unsplit-at.html) | Remove a range split enforcement at a specified row in the table or index.
[`VALIDATE CONSTRAINT`](validate-constraint.html) | Check whether values in a column match a [constraint](constraints.html) on the column.

## Transaction management statements

Statement | Usage
----------|------------
[`BEGIN`](begin-transaction.html)| Initiate a [transaction](transactions.html).
[`COMMIT`](commit-transaction.html) | Commit the current [transaction](transactions.html).
[`SAVEPOINT`](savepoint.html) | <span class="version-tag">New in v20.1:</span> Start a [nested transaction](transactions.html#nested-transactions).
[`RELEASE SAVEPOINT`](release-savepoint.html) | Commit a [nested transaction](transactions.html#nested-transactions).
[`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#rollback-a-nested-transaction) | Roll back and restart the [nested transaction](transactions.html#nested-transactions) started at the corresponding `SAVEPOINT` statement.
[`ROLLBACK`](rollback-transaction.html) | Roll back the current [transaction](transactions.html) and all of its [nested transaction](transactions.html#nested-transactions), discarding all transactional updates made by statements inside the transaction.
[`SET TRANSACTION`](set-transaction.html) | Set the priority for the session or for an individual [transaction](transactions.html).
[`SHOW`](show-vars.html) | View the current [transaction settings](transactions.html).

## Access management statements

Statement | Usage
----------|------------
[`CREATE ROLE`](create-role.html) | Create SQL [roles](authorization.html#create-and-manage-roles), which are groups containing any number of roles and users as members.
[`CREATE USER`](create-user.html) | Create SQL users, which lets you control [privileges](authorization.html#assign-privileges) on your databases and tables.
[`DROP ROLE`](drop-role.html) | Remove one or more SQL [roles](authorization.html#create-and-manage-roles).
[`DROP USER`](drop-user.html) | Remove one or more SQL users.
[`GRANT <privileges>`](grant.html) | Grant privileges to [users](authorization.html#create-and-manage-users) or [roles](authorization.html#create-and-manage-roles).
[`GRANT <roles>`](grant-roles.html) | Add a [role](authorization.html#create-and-manage-roles) or [user](authorization.html#create-and-manage-users) as a member to a role.
[`REVOKE <privileges>`](revoke.html) | Revoke privileges from [users](authorization.html#create-and-manage-users) or [roles](authorization.html#create-and-manage-roles).
[`REVOKE <roles>`](revoke-roles.html) | Revoke a [role](authorization.html#create-and-manage-roles) or [user's](authorization.html#create-and-manage-users) membership to a role.
[`SHOW GRANTS`](show-grants.html) | View privileges granted to users.
[`SHOW ROLES`](show-roles.html) | Lists the roles for all databases.
[`SHOW USERS`](show-users.html) | Lists the users for all databases.

## Session management statements

Statement | Usage
----------|------------
[`RESET`](reset-vars.html) | Reset a session variable to its default value.
[`SET`](set-vars.html) | Set a current session variable.
[`SET TRANSACTION`](set-transaction.html) | Set the priority for an individual [transaction](transactions.html).
[`SHOW TRACE FOR SESSION`](show-trace.html) | Return details about how CockroachDB executed a statement or series of statements recorded during a session.
[`SHOW`](show-vars.html) | List the current session or transaction settings.

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
[`SHOW QUERIES`](show-queries.html) | List details about current active SQL queries.

## Query planning statements

Statement | Usage
----------|------------
[`CREATE STATISTICS`](create-statistics.html) | Create table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.
[`EXPLAIN`](explain.html) | View debugging and analysis details for a statement that operates over tabular data.
[`EXPLAIN ANALYZE`](explain-analyze.html) | Execute the query and generate a physical query plan with execution statistics.
[`SHOW STATISTICS`](show-statistics.html) | List table statistics used by the [cost-based optimizer](cost-based-optimizer.html).


## Job management statements

Jobs in CockroachDB represent tasks that might not complete immediately, such as schema changes or enterprise backups or restores.

Statement | Usage
----------|------------
[`CANCEL JOB`](cancel-job.html) | Cancel a `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`PAUSE JOB`](pause-job.html) | Pause a `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`RESUME JOB`](resume-job.html) | Resume a paused `BACKUP`, `RESTORE`, `IMPORT`, or `CHANGEFEED` job.
[`SHOW JOBS`](show-jobs.html) | View information on jobs.

## Backup and restore statements (Enterprise)

The following statements require an [enterprise license](enterprise-licensing.html).

{{site.data.alerts.callout_info}}
For non-enterprise users, see [Back up Data](backup.html) and [Restore Data](restore.html).
{{site.data.alerts.end}}

Statement | Usage
----------|------------
[`BACKUP`](backup.html) | Create disaster recovery backups of databases and tables.
[`RESTORE`](restore.html) | Restore databases and tables using your backups.
[`SHOW BACKUP`](show-backup.html) | List the contents of a backup.

## Changefeed statements (Enterprise)

[Change data capture](change-data-capture.html) (CDC) provides an enterprise and core version of row-level change subscriptions for downstream processing.

Statement | Usage
----------|------------
[`CREATE CHANGEFEED`](create-changefeed.html) | _(Enterprise)_ Create a new changefeed to stream row-level changes in a configurable format to a configurable sink (Kafka or a cloud storage sink).
[`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html) | _(Core)_ Create a new changefeed to stream row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.
