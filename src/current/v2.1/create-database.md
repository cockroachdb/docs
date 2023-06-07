---
title: CREATE DATABASE
summary: The CREATE DATABASE statement creates a new CockroachDB database.
toc: true
---

The `CREATE DATABASE` [statement](sql-statements.html) creates a new CockroachDB database.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

Only members of the `admin` role can create new databases. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_database.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Create a new database only if a database of the same name does not already exist; if one does exist, do not return an error.
`name` | The name of the database to create, which [must be unique](#create-fails-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
`encoding` | The `CREATE DATABASE` statement accepts an optional `ENCODING` clause for compatibility with PostgreSQL, but `UTF-8` is the only supported encoding. The aliases `UTF8` and `UNICODE` are also accepted. Values should be enclosed in single quotes and are case-insensitive.<br><br>Example: `CREATE DATABASE bank ENCODING = 'UTF-8'`.

## Example

### Create a database

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

{% include copy-clipboard.html %}
~~~
> SHOW DATABASES;
~~~

~~~
+---------------+
| database_name |
+---------------+
| bank          |
| defaultdb     |
| postgres      |
| system        |
+---------------+
(4 rows)
~~~

### Create fails (name already in use)

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

~~~
pq: database "bank" already exists
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS bank;
~~~

SQL does not generate an error, but instead responds `CREATE DATABASE` even though a new database wasn't created.

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
+---------------+
| database_name |
+---------------+
| bank          |
| defaultdb     |
| postgres      |
| system        |
+---------------+
(4 rows)
~~~

## See also

- [`SHOW DATABASES`](show-databases.html)
- [`RENAME DATABASE`](rename-database.html)
- [`SET DATABASE`](set-vars.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
