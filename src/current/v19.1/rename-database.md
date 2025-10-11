---
title: RENAME DATABASE
summary: The RENAME DATABASE statement changes the name of a database.
toc: true
---

The `RENAME DATABASE` [statement](sql-statements.html) changes the name of a database.

{{site.data.alerts.callout_info}}It is not possible to rename a database referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
Database renames **are not transactional**. For more information, see [Database renaming considerations](#database-renaming-considerations).
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/rename_database.html %}
</div>

## Required privileges

Only members of the `admin` role can rename databases. By default, the `root` user belongs to the `admin` role.

## Parameters

Parameter | Description
----------|------------
`name` | The first instance of `name` is the current name of the database. The second instance is the new name for the database. The new name [must be unique](#rename-fails-new-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers). You cannot rename a database if it is set as the [current database](sql-name-resolution.html#current-database) or if [`sql_safe_updates = true`](set-vars.html).

## Database renaming considerations

Database renames are not transactional. There are two phases during a rename:

1. The `system.namespace` table is updated. This phase is transactional, and will be rolled back if the transaction aborts.
2. The database descriptor (an internal data structure) is updated, and announced to every other node. This phase is **not** transactional. The rename will be announced to other nodes only if the transaction commits, but there is no guarantee on how much time this operation will take.
3. Once the new name has propagated to every node in the cluster, another internal transaction is run that declares the old name ready for reuse in another context.

This yields a surprising and undesirable behavior: when run inside a [`BEGIN`](begin-transaction.html) ... [`COMMIT`](commit-transaction.html) block, it’s possible for a rename to be half-done - not persisted in storage, but visible to other nodes or other transactions. This violates A, C, and I in [ACID](https://en.wikipedia.org/wiki/ACID_(computer_science)). Only D is guaranteed: If the transaction commits successfully, the new name will persist after that.

This is a [known limitation](known-limitations.html#database-and-table-renames-are-not-transactional). For an issue tracking this limitation, see [cockroach#12123](https://github.com/cockroachdb/cockroach/issues/12123).

## Examples

### Rename a Database

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
+---------------+
| database_name |
+---------------+
| db1           |
| db2           |
| defaultdb     |
| postgres      |
| system        |
+---------------+
(5 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE db1 RENAME TO db3;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
+---------------+
| database_name |
+---------------+
| db2           |
| db3           |
| defaultdb     |
| postgres      |
| system        |
+---------------+
(5 rows)
~~~

### Rename fails (new name already in use)

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE db2 RENAME TO db3;
~~~

~~~
pq: the new database name "db3" already exists
~~~

## See also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SET DATABASE`](set-vars.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
