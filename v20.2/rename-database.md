---
title: RENAME DATABASE
summary: The RENAME DATABASE statement changes the name of a database.
toc: true
---

The `RENAME DATABASE` [statement](sql-statements.html) changes the name of a database.

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

### Database renames are not transactional

Database renames are not transactional. There are two phases during a rename:

1. The `system.namespace` table is updated. This phase is transactional, and will be rolled back if the transaction aborts.
2. The database descriptor (an internal data structure) is updated, and announced to every other node. This phase is **not** transactional. The rename will be announced to other nodes only if the transaction commits, but there is no guarantee on how much time this operation will take.
3. Once the new name has propagated to every node in the cluster, another internal transaction is run that declares the old name ready for reuse in another context.

This yields a surprising and undesirable behavior: when run inside a [`BEGIN`](begin-transaction.html) ... [`COMMIT`](commit-transaction.html) block, it’s possible for a rename to be half-done - not persisted in storage, but visible to other nodes or other transactions. This violates A, C, and I in [ACID](https://en.wikipedia.org/wiki/ACID_(computer_science)). Only D is guaranteed: If the transaction commits successfully, the new name will persist after that.

This is a [known limitation](known-limitations.html#database-and-table-renames-are-not-transactional). For an issue tracking this limitation, see [cockroach#12123](https://github.com/cockroachdb/cockroach/issues/12123).

### Other limitations

It is not possible to rename a database if:

- The database is referenced by a [view](views.html). For more details, see [View Dependencies](views.html#view-dependencies).
- The database is explicitly specified in a reference to a [sequence](create-sequence.html). In this case, you can drop the column in the table that references the sequence, or you can modify the reference so that it does not specify the database name.

    For example, suppose you create a database `db`, and in that database, a sequence `seq`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE db;
      USE db;
      CREATE SEQUENCE seq;
    ~~~

    Then you reference the sequence in a table `tab`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE tab (
      id UUID DEFAULT gen_random_uuid(),
      count INT DEFAULT nextval('db.seq')
    );
    ~~~

    Attempting to rename the database will result in an error:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET sql_safe_updates=false;
      ALTER DATABASE db RENAME TO mydb;
    ~~~

    ~~~
    ERROR: cannot rename database because relation "db.public.tab" depends on relation "db.public.seq"
    SQLSTATE: 2BP01
    HINT: you can drop the column default "count" of "db.public.seq" referencing "db.public.tab" or modify the default to not reference the database name "db"
    ~~~

    In order to rename the database `db`, you need to drop or change the reference in the default value for the `seq` column to not explicitly name the database `db`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE tab ALTER COLUMN count SET DEFAULT nextval('seq');
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > USE defaultdb;
      ALTER DATABASE db RENAME TO mydb;
    ~~~

## Examples

### Rename a database

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE db1;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
-----------------
  db1
  defaultdb
  movr
  postgres
  system
(5 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER DATABASE db1 RENAME TO db2;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
-----------------
  db2
  defaultdb
  movr
  postgres
  system
(5 rows)
~~~

### Rename fails (new name already in use)

{% include copy-clipboard.html %}
~~~ sql
> ALTER DATABASE db2 RENAME TO movr;
~~~

~~~
ERROR: the new database name "movr" already exists
SQLSTATE: 42P04
~~~

## See also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SET DATABASE`](set-vars.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
