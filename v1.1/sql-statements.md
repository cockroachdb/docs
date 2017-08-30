---
title: SQL Statements
summary: SQL statements supported by CockroachDB.
toc: false
---

CockroachDB supports the following SQL statements. Click a statement for more details.

<div id="toc"></div>

## Data Manipulation Statements

Statement | Usage
----------|------------
[`CREATE TABLE AS`](create-table-as.html) | Create a new table in a database using the results from a `SELECT` statement.
[`DELETE`](delete.html) | Delete specific rows from a table.
[`EXPLAIN`](explain.html) | View debugging and analysis details for a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement.
[`INSERT`](insert.html) | Insert rows into a table.
[`SELECT`](select.html) | Select rows from a table.
[`TRUNCATE`](truncate.html) | Deletes all rows from specified tables.
[`UPDATE`](update.html) | Update rows in a table.
[`UPSERT`](upsert.html) | Insert rows that do not violate uniqueness constraints; update rows that do.

## Data Definition Statements

Statement | Usage
----------|------------
[`ADD COLUMN`](add-column.html) | Add columns to a table.
[`ADD CONSTRAINT`](add-constraint.html) | Add a constraint to a column.
[`ALTER COLUMN`](alter-column.html) | Change a column's [Default constraint](default-value.html) or drop the [Not Null constraint](not-null.html).
[`ALTER DATABASE`](alter-database.html) | Apply a schema change to a database.
[`ALTER INDEX`](alter-index.html) | Apply a schema change to an index.
[`ALTER TABLE`](alter-table.html) | Apply a schema change to a table.
[`ALTER VIEW`](alter-view.html) | Rename a view.
[`CREATE DATABASE`](create-database.html) | Create a new database.
[`CREATE INDEX`](create-index.html) | Create an index for a table.
[`CREATE TABLE`](create-table.html) | Create a new table in a database.
[`CREATE TABLE AS`](create-table-as.html) | Create a new table in a database using the results from a `SELECT` statement.
[`CREATE VIEW`](create-view.html) | Create a new [view](views.html) in a database.
[`DROP COLUMN`](drop-column.html) | Remove columns from a table.
[`DROP CONSTRAINT`](drop-constraint.html) | Remove constraints from a column.
[`DROP DATABASE`](drop-database.html) | Remove a database and all its objects.
[`DROP INDEX`](drop-index.html) | Remove an index for a table.
[`DROP TABLE`](drop-table.html) | Remove a table.
[`DROP VIEW`](drop-view.html)| Remove a view.
[`RENAME COLUMN`](rename-column.html) | Rename a column in a table.
[`RENAME DATABASE`](rename-database.html) | Rename a database.
[`RENAME INDEX`](rename-index.html) | Rename an index for a table.
[`RENAME TABLE`](rename-table.html) | Rename a table or move a table between databases.
[`SHOW COLUMNS`](show-columns.html) | View details about columns in a table.
[`SHOW CONSTRAINTS`](show-constraints.html) | List constraints on a table.
[`SHOW CREATE TABLE`](show-create-table.html) | View the `CREATE TABLE` statement that would create a carbon copy of the specified table.
[`SHOW CREATE VIEW`](show-create-view.html) | View the `CREATE VIEW` statement that would create a carbon copy of the specified view.
[`SHOW DATABASES`](show-databases.html) | List databases in the cluster.
[`SHOW INDEX`](show-index.html) | View index information for a table.
[`SHOW TABLES`](show-tables.html) | List tables in a database.

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

## Privilege Management Statements

Statement | Usage
----------|------------
[`CREATE USER`](create-user.html) | Creates a SQL user, which lets you control [privileges](privileges.html) on your databases and tables.
[`GRANT`](grant.html) | Grant privileges to users.
[`REVOKE`](revoke.html) | Revoke privileges from users.
[`SHOW GRANTS`](show-grants.html) | View privileges granted to users.
[`SHOW USERS`](show-users.html) | Lists the users for all databases.

## Session Management Statements

Statement | Usage
----------|------------
[`SET`](set-vars.html) | Set the current session parameters.
[`SET TRANSACTION`](set-transaction.html) | Set the isolation level or priority for an individual [transaction](transactions.html).
[`SHOW`](show-vars.html) | List the current session or transaction settings.

## Cluster Management Statements

Statement | Usage
----------|------------
[`CANCEL QUERY`](cancel-query.html) | Cancel a running SQL query.
[`SET CLUSTER SETTING`](cluster-settings.html#change-a-cluster-setting) | Set a cluster-wide setting.
[`SHOW ALL CLUSTER SETTINGS`](cluster-settings.html#view-current-cluster-settings) | List the current cluster-wide settings.
[`SHOW SESSIONS`](show-sessions.html) | List details about currently active sessions.
[`SHOW QUERIES`](show-queries.html) | List details about current active SQL queries.

## Jobs Management Statements

Jobs in CockroachDB represent tasks that might not complete immediately, such as schema changes or enterprise license backups or restores.

Statement | Usage
----------|------------
[`CANCEL JOB`](pause-jobs.html) | _(Enterprise)_ Cancel a `BACKUP` or `RESTORE` job.
[`PAUSE JOB`](pause-jobs.html) | _(Enterprise)_ Pause a `BACKUP` or `RESTORE` job.
[`RESUME JOB`](resume-jobs.html) | _(Enterprise)_ Resume paused `BACKUP` or `RESTORE` jobs.
[`SHOW JOBS`](show-jobs.html) | View information on jobs.

## Backup & Restore Statements (Enterprise)

The following statements are availably only to [enterprise license](https://www.cockroachlabs.com/pricing/) users.

{{site.data.alerts.callout_info}}For non-enterprise users, see <a href="back-up-data.html">Back up Data</a> and <a href="restore-data.html">Restore Data</a>.{{site.data.alerts.end}}

Statement | Usage
----------|------------
[`BACKUP`](backup.html) | Create disaster recovery backups of databases and tables.
[`RESTORE`](restore.html) | Restore databases and tables using your backups.
[`SHOW BACKUP`](show-backup.html) | List the contents of a backup.
