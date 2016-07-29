---
title: SQL Statements
summary: SQL statements supported by CockroachDB.
toc: false
---

CockroachDB supports the following SQL statements. Click a statement for more details.

Statement | Usage 
----------|------------
[`ALTER TABLE`](alter-table.html) | Apply a schema change to a table.
[`BEGIN`](begin-transaction.html)| Initiate a [transaction](transactions.html).
[`COMMIT`](commit-transaction.html) | Commit the current [transaction](transactions.html).
[`CREATE DATABASE`](create-database.html) | Create a new database.
[`CREATE INDEX`](create-index.html) | Create an index for a table.
[`CREATE TABLE`](create-table.html) | Create a new table in a database. 
[`DELETE`](delete.html) | Delete specific rows from a table.
[`DROP DATABASE`](drop-database.html) | Remove a database and all its objects.
[`DROP INDEX`](drop-index.html) | Remove an index for a table.
[`DROP TABLE`](drop-table.html) | Remove a table.
[`EXPLAIN`](explain.html) | View debugging and analysis details for a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement.
[`GRANT`](grant.html) | Grant privileges to users. 
[`INSERT`](insert.html) | Insert rows into a table.
[`RENAME COLUMN`](rename-column.html) | Rename a column in a table.
[`RENAME DATABASE`](rename-database.html) | Rename a database.
[`RENAME INDEX`](rename-index.html) | Rename an index for a table.
[`RENAME TABLE`](rename-table.html) | Rename a table or move a table between databases.
[`RELEASE SAVEPOINT`](release-savepoint.html) | When using the CockroachDB-provided function for client-side [transaction retries](transactions.html#transaction-retries), commit the transaction's changes once there are no retryable errors.  
[`REVOKE`](revoke.html) | Revoke privileges from users. 
[`ROLLBACK`](rollback-transaction.html) | Discard all updates made by the current [transaction](transactions.html) or, when using the CockroachDB-provided function for client-side [transaction retries](transactions.html#transaction-retries), rollback to the `cockroach_restart` savepoint and retry the transaction.  
[`SELECT`](select.html) | Select rows from a table.
[`SET DATABASE`](set-database.html) | Set the default database for the session.
[`SET TIME ZONE`](set-time-zone.html) | Set the default time zone for the session.
[`SET TRANSACTION`](set-transaction.html) | Set the isolation level or priority for the session or for an individual [transaction](transactions.html).
[`SHOW COLUMNS`](show-columns.html) | View details about columns in a table.
[`SHOW CONSTRAINTS`](show-constraints.html) | List constraints on a table.
[`SHOW DATABASES`](show-databases.html) | List databases in the cluster.
[`SHOW GRANTS`](show-grants.html) | View privileges granted to users.
[`SHOW INDEX`](show-index.html) | View index information for a table. 
[`SHOW TABLES`](show-tables.html) | List tables in a database.
[`SHOW TIME ZONE`](show-time-zone.html) | View the default time zone for the session.
[`SHOW TRANSACTION`](show-transaction.html) | View the isolation level or priority for the session or for an individual [transaction](transactions.html).
[`TRUNCATE`](truncate.html) | Delete all rows from a table.
[`UPDATE`](update.html) | Update rows in a table.
[`UPSERT`](upsert.html) | Insert rows that do not violate uniquenesss constraints; update rows that do.
[`VALUES`](values.html) | Compute a row value or set of row values.


