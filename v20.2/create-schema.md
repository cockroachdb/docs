---
title: CREATE SCHEMA
summary: The CREATE SCHEMA statement creates a new user-defined schema.
toc: true
---

<span class="version-tag">New in v20.2</span>: The `CREATE SCHEMA` [statement](sql-statements.html) creates a user-defined [schema](sql-name-resolution.html#logical-schemas-and-namespaces).

## Required privileges

Only members of the `admin` role can create new schemas. By default, the `root` user belongs to the `admin` role.

## Syntax

~~~
CREATE SCHEMA [IF NOT EXISTS] { <schemaname> | [<schemaname>] AUTHORIZATION {user_name | CURRENT_USER | SESSION_USER} }
~~~

### Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Create a new schema only if a schema of the same name does not already exist. If one does exist, do not return an error.
`schemaname` | The name of the schema to create, which must be unique and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
`AUTHORIZATION ...` | Optionally identify a user to be the owner of the schema. You can specify the owner with a string literal, or the [`CURRENT_USER` or `SESSION_USER` keywords](functions-and-operators.html#special-syntax-forms).<br><br>If a `CREATE SCHEMA` statement has an `AUTHORIZATION` clause, but no `schemaname`, the schema will be named after the specified owner of the schema. If a `CREATE SCHEMA` statement does not have an `AUTHORIZATION` clause, the user executing the statement will be named the owner.

## Example

### Create a schema

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  org_one
  pg_catalog
  pg_extension
  public
(6 rows)
~~~

By default, the user executing the `CREATE SCHEMA` statement is the owner of the schema. For example, suppose you created the schema as `root`. `root` would be the owner of the schema:

{% include copy-clipboard.html %}
~~~ sql
> SELECT
  nspname, usename
FROM
  pg_catalog.pg_namespace
  LEFT JOIN pg_catalog.pg_user ON pg_namespace.nspowner = pg_user.usesysid
WHERE
  nspname LIKE 'org_one';
~~~

~~~
  nspname | usename
----------+----------
  org_one | root
(1 row)
~~~

### Create a schema if one does not exist

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

~~~
ERROR: schema "org_one" already exists
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS org_one;
~~~

SQL does not generate an error, even though a new schema wasn't created.

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  org_one
  pg_catalog
  pg_extension
  public
(6 rows)
~~~

### Create two tables of the same name, in the same database

You can create tables of the same name in the same database if they are in separate schemas.

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS org_one;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS org_two;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  org_one
  org_two
  pg_catalog
  pg_extension
  public
(7 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE org_one.employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING,
        desk_no INT UNIQUE
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE org_two.employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING,
        desk_no INT UNIQUE
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name | table_name | type  | estimated_row_count
--------------+------------+-------+----------------------
  org_one     | employees  | table |                   0
  org_two     | employees  | table |                   0
(2 rows)
~~~

### Create a schema with authorization

To specify the owner of a schema, add an `AUTHORIZATION` clause to the `CREATE SCHEMA` statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER max WITH PASSWORD 'roach';
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_two AUTHORIZATION max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT
  nspname, usename
FROM
  pg_catalog.pg_namespace
  LEFT JOIN pg_catalog.pg_user ON pg_namespace.nspowner = pg_user.usesysid
WHERE
  nspname LIKE 'org_two';
~~~

~~~
  nspname | usename
----------+----------
  org_two | max
(1 row)
~~~

If no schema name is specified in a `CREATE SCHEMA` statement with an `AUTHORIZATION` clause, the schema will be named after the user specified:

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA AUTHORIZATION max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT
  nspname, usename
FROM
  pg_catalog.pg_namespace
  LEFT JOIN pg_catalog.pg_user ON pg_namespace.nspowner = pg_user.usesysid
WHERE
  nspname LIKE 'max';
~~~

~~~
  nspname | usename
----------+----------
  max     | max
(1 row)
~~~

When you [use a table without specifying a schema](sql-name-resolution.html#search-path), CockroachDB looks for the table in the `$user` schema (i.e., a schema named after the current user). If no schema exists with the name of the current user, the `public` schema is used.

For example, suppose that you [grant the `admin` role](grant-roles.html) to the `max` user:

{% include copy-clipboard.html %}
~~~ sql
> GRANT admin TO max;
~~~

Then, `max` [accesses the cluster](cockroach-sql.html) and creates two tables of the same name, in the same database, one in the `max` schema, and one in the `public` schema:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --url 'postgres://max:roach@host:port/db?sslmode=require'
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE max.accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING,
        balance DECIMAL
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE public.accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING,
        balance DECIMAL
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name | table_name | type  | estimated_row_count
--------------+------------+-------+----------------------
  max         | accounts   | table |                   0
  public      | accounts   | table |                   0
(2 rows)
~~~

`max` then inserts some values into the `accounts` table, without specifying a schema.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (name, balance) VALUES ('checking', 1000), ('savings', 15000);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
                   id                  |   name   | balance
---------------------------------------+----------+----------
  7610607e-4928-44fb-9f4e-7ae6d6520666 | savings  |   15000
  860b7891-cde4-4aff-a318-f928d47374bc | checking |    1000
(2 rows)
~~~

Because `max` is the current user, all unqualified `accounts` table names resolve as `max.accounts`, and not `public.accounts`.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM public.accounts;
~~~

~~~
  id | name | balance
-----+------+----------
(0 rows)
~~~

## See also

- [`SHOW SCHEMAS`](show-schemas.html)
- [`SET SCHEMA`](set-vars.html)
- [`DROP SCHEMA`](drop-schema.html)
- [`ALTER SCHEMA`](alter-schema.html)
- [Other SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
