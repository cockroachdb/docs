---
title: ALTER DATABASE ... RENAME TO
summary: The ALTER DATABASE ... RENAME TO statement changes the name of a database.
toc: true
---

The `RENAME TO` [statement](sql-statements.html) is part of [`ALTER DATABASE`](alter-database.html), and changes the name of a database.

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

## Limitations

If an `ALTER DATABASE ... RENAME` statement is issued on a single [gateway node](architecture/sql-layer.html#overview) and a successful result is returned, it is possible to observe the old database names in [transactions](transactions.html) on other gateway nodes for a short amount of time after the rename is executed. This issue is specific to databases, which have their metadata stored in an incoherent cache, unlike tables. Note that this issue is [resolved in v20.2](https://github.com/cockroachdb/cockroach/pull/52975).

Additionally, it is not possible to rename a database if:

- The database is referenced by a [view](views.html). For more details, see [View Dependencies](views.html#view-dependencies).
- The database is explicitly specified in a reference to a [sequence](create-sequence.html). In this case, you can drop the column in the table that references the sequence, or you can modify the reference so that it does not specify the database name.

    For example, suppose you create a database `db`, and in that database, a sequence `seq`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE db;
      USE db;
      CREATE SEQUENCE seq;
    ~~~

    Then you reference the sequence in a table `tab`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE tab (
      id UUID DEFAULT gen_random_uuid(),
      count INT DEFAULT nextval('db.seq')
    );
    ~~~

    Attempting to rename the database will result in an error:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE tab ALTER COLUMN count SET DEFAULT nextval('seq');
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > USE defaultdb;
      ALTER DATABASE db RENAME TO mydb;
    ~~~

## Examples

### Rename a database

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE db1;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE db1 RENAME TO db2;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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
