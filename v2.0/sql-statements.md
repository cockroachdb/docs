---
title: SQL Statements
summary: Overview of SQL statements supported by CockroachDB.
toc: true
---

CockroachDB supports the following SQL statements. Click a statement for more details.

{{site.data.alerts.callout_success}}In the <a href="use-the-built-in-sql-client.html#sql-shell-help">built-in SQL shell</a>, use <code>\h [statement]</code> to get inline help about a specific statement.{{site.data.alerts.end}}


## Data Manipulation Statements

Statement | Usage
----------|------------
[`CREATE TABLE AS`](create-table-as.html) | Create a new table in a database using the results from a [selection query](selection-queries.html).
[`DELETE`](delete.html) | Delete specific rows from a table.
[`EXPLAIN`](explain.html) | View debugging and analysis details for a statement that operates over tabular data.
[`IMPORT`](import.html) | Import an entire table's data via CSV files.
[`INSERT`](insert.html) | Insert rows into a table.
[`SELECT`](select-clause.html) | Select specific rows and columns from a table and optionally compute derived values.
[`SHOW TRACE`](show-trace.html) | Execute a statement and then return a trace of its actions through all of CockroachDB's software layers.
[`TABLE`](selection-queries.html#table-clause) | Select all rows and columns from a table.
[`TRUNCATE`](truncate.html) | Delete all rows from specified tables.
[`UPDATE`](update.html) | Update rows in a table.
[`UPSERT`](upsert.html) | Insert rows that do not violate uniqueness constraints; update rows that do.
[`VALUES`](selection-queries.html#values-clause) | Return rows containing specific values.

## Data Definition Statements

Statement | Usage
----------|------------
[`ADD COLUMN`](add-column.html) | Add columns to a table.
[`ADD CONSTRAINT`](add-constraint.html) | Add a constraint to a column.
[`ALTER COLUMN`](alter-column.html) | Change a column's [Default constraint](default-value.html) or drop the [Not Null constraint](not-null.html).
[`ALTER DATABASE`](alter-database.html) | Apply a schema change to a database.
[`ALTER INDEX`](alter-index.html) | Apply a schema change to an index.
[`ALTER SEQUENCE`](alter-sequence.html) | <span class="version-tag">New in v2.0:</span> Apply a schema change to a sequence.
[`ALTER TABLE`](alter-table.html) | Apply a schema change to a table.
[`ALTER USER`](alter-user.html) | <span class="version-tag">New in v2.0:</span> Add or change a user's password.
[`ALTER VIEW`](alter-view.html) | Rename a view.
[`CREATE DATABASE`](create-database.html) | Create a new database.
[`CREATE INDEX`](create-index.html) | Create an index for a table.
[`CREATE SEQUENCE`](create-sequence.html) | <span class="version-tag">New in v2.0:</span> Create a new sequence.
[`CREATE TABLE`](create-table.html) | Create a new table in a database.
[`CREATE TABLE AS`](create-table-as.html) | Create a new table in a database using the results from a [selection query](selection-queries.html).
[`CREATE VIEW`](create-view.html) | Create a new [view](views.html) in a database.
[`DROP COLUMN`](drop-column.html) | Remove columns from a table.
[`DROP CONSTRAINT`](drop-constraint.html) | Remove constraints from a column.
[`DROP DATABASE`](drop-database.html) | Remove a database and all its objects.
[`DROP INDEX`](drop-index.html) | Remove an index for a table.
[`DROP SEQUENCE`](drop-sequence.html) | <span class="version-tag">New in v2.0:</span> Remove a sequence.
[`DROP TABLE`](drop-table.html) | Remove a table.
[`DROP VIEW`](drop-view.html)| Remove a view.
[`EXPERIMENTAL_AUDIT`](experimental-audit.html) | Turn SQL audit logging on or off for a table.
[`RENAME COLUMN`](rename-column.html) | Rename a column in a table.
[`RENAME DATABASE`](rename-database.html) | Rename a database.
[`RENAME INDEX`](rename-index.html) | Rename an index for a table.
[`RENAME SEQUENCE`](rename-sequence.html) | Rename a sequence.
[`RENAME TABLE`](rename-table.html) | Rename a table or move a table between databases.
[`SHOW COLUMNS`](show-columns.html) | View details about columns in a table.
[`SHOW CONSTRAINTS`](show-constraints.html) | List constraints on a table.
[`SHOW CREATE SEQUENCE`](show-create-sequence.html) | <span class="version-tag">New in v2.0:</span> View the `CREATE SEQUENCE` statement that would create a copy of the specified sequence.
[`SHOW CREATE TABLE`](show-create-table.html) | View the `CREATE TABLE` statement that would create a copy of the specified table.
[`SHOW CREATE VIEW`](show-create-view.html) | View the `CREATE VIEW` statement that would create a copy of the specified view.
[`SHOW DATABASES`](show-databases.html) | List databases in the cluster.
[`SHOW INDEX`](show-index.html) | View index information for a table.
[`SHOW SCHEMAS`](show-schemas.html) | <span class="version-tag">New in v2.0:</span> List the schemas in a database.
[`SHOW TABLES`](show-tables.html) | List tables or views in a database or virtual schema.
[`SHOW EXPERIMENTAL_RANGES`](show-experimental-ranges.html) | Show range information about a specific table or index.
[`SPLIT AT`](split-at.html) | Force a key-value layer range split at the specified row in the table or index.
[`VALIDATE CONSTRAINT`](validate-constraint.html) | Check whether values in a column match a [constraint](constraints.html) on the column.

## Transaction Management Statements

Statement | Usage
----------|------------
[`BEGIN`](begin-transaction.html)| Initiate a [transaction](transactions.html).
[`COMMIT`](commit-transaction.html) | Commit the current [transaction](transactions.html).
[`RELEASE SAVEPOINT`](release-savepoint.html) | When using the CockroachDB-provided function for client-side [transaction retries](transactions.html#transaction-retries), commit the transaction's changes once there are no retryable errors.
[`ROLLBACK`](rollback-transaction.html) | Discard all updates made by the current [transaction](transactions.html) or, when using the CockroachDB-provided function for client-side [transaction retries](transactions.html#transaction-retries), rollback to the `cockroach_restart` savepoint and retry the transaction.
[`SAVEPOINT`](savepoint.html) | When using the CockroachDB-provided function for client-side [transaction retries](transactions.html#transaction-retries), start a retryable transaction.
[`SET TRANSACTION`](set-transaction.html) | Set the isolation level or priority for the session or for an individual [transaction](transactions.html).
[`SHOW`](show-vars.html) | View the current [transaction settings](transactions.html).

## Access Management Statements

Statement | Usage
----------|------------
[`CREATE ROLE`](create-role.html) | <span class="version-tag">New in v2.0:</span> Create SQL [roles](roles.html), which are groups containing any number of roles and users as members.
[`CREATE USER`](create-user.html) | Create SQL users, which lets you control [privileges](privileges.html) on your databases and tables.
[`DROP ROLE`](drop-role.html) | <span class="version-tag">New in v2.0:</span> Remove one or more SQL [roles](roles.html).
[`DROP USER`](drop-user.html) | Remove one or more SQL users.
[`GRANT <privileges>`](grant.html) | Grant privileges to [users](create-and-manage-users.html) or [roles](roles.html).
[`GRANT <roles>`](grant-roles.html) | <span class="version-tag">New in v2.0:</span> Add a [role](roles.html) or [user](create-and-manage-users.html) as a member to a role.
[`REVOKE <privileges>`](revoke.html) | Revoke privileges from [users](create-and-manage-users.html) or [roles](roles.html).
[`REVOKE <roles>`](revoke-roles.html) | <span class="version-tag">New in v2.0:</span> Revoke a [role](roles.html) or [user's](create-and-manage-users.html) membership to a role.
[`SHOW GRANTS`](show-grants.html) | View privileges granted to users.
[`SHOW ROLES`](show-roles.html) | Lists the roles for all databases.
[`SHOW USERS`](show-users.html) | Lists the users for all databases.

## Session Management Statements

Statement | Usage
----------|------------
[`RESET`](reset-vars.html) | Reset a session variable to its default value.
[`SET`](set-vars.html) | Set a current session variable.
[`SET TRANSACTION`](set-transaction.html) | Set the isolation level or priority for an individual [transaction](transactions.html).
[`SHOW`](show-vars.html) | List the current session or transaction settings.

## Cluster Management Statements

Statement | Usage
----------|------------
[`RESET CLUSTER SETTING`](reset-cluster-setting.html) | Reset a cluster setting to its default value.
[`SET CLUSTER SETTING`](set-cluster-setting.html) | Set a cluster-wide setting.
[`SHOW ALL CLUSTER SETTINGS`](show-cluster-setting.html) | List the current cluster-wide settings.
[`SHOW SESSIONS`](show-sessions.html) | List details about currently active sessions.

## Query Management Statements

Statement | Usage
----------|------------
[`CANCEL QUERY`](cancel-query.html) | Cancel a running SQL query.
[`SHOW QUERIES`](show-queries.html) | List details about current active SQL queries.

## Job Management Statements

Jobs in CockroachDB represent tasks that might not complete immediately, such as schema changes or enterprise backups or restores.

Statement | Usage
----------|------------
[`CANCEL JOB`](cancel-job.html) | Cancel a `BACKUP`, `RESTORE`, or `IMPORT` job.
[`PAUSE JOB`](pause-job.html) | Pause a `BACKUP`, `RESTORE`, or `IMPORT` job.
[`RESUME JOB`](resume-job.html) | Resume paused `BACKUP`, `RESTORE`, or `IMPORT` jobs.
[`SHOW JOBS`](show-jobs.html) | View information on jobs.

## Backup & Restore Statements (Enterprise)

The following statements are available only to [enterprise](https://www.cockroachlabs.com/product/cockroachdb/) users.

{{site.data.alerts.callout_info}}For non-enterprise users, see <a href="back-up-data.html">Back up Data</a> and <a href="restore-data.html">Restore Data</a>.{{site.data.alerts.end}}

Statement | Usage
----------|------------
[`BACKUP`](backup.html) | Create disaster recovery backups of databases and tables.
[`RESTORE`](restore.html) | Restore databases and tables using your backups.
[`SHOW BACKUP`](show-backup.html) | List the contents of a backup.
