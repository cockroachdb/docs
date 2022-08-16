---
title: CREATE SCHEMA
summary: The CREATE SCHEMA statement creates a new user-defined schema.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

The `CREATE SCHEMA` [statement](sql-statements.html) creates a user-defined [schema](sql-name-resolution.html#naming-hierarchy).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

- Only members of the `admin` role can create new schemas. By default, the `root` user belongs to the `admin` role.
- To [grant privileges](grant.html) on a user-defined schema, a user must have the `GRANT` privilege on the schema and the privilege that they want to grant.
- To create or interact with objects that depend on a user-defined schema, a user must have the `USAGE` privilege on the schema.

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ remote_include_version }}/grammar_svg/create_schema.html %}
</div>

### Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Create a new schema only if a schema of the same name does not already exist within the database. If one does exist, do not return an error.
`name`<br>`name.name` | The name of the schema to create, or the name of the database in which to create the schema and the schema name, separated by a "`.`". The schema name must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
`AUTHORIZATION role_spec` | Optionally identify a user (`role_spec`) to be the owner of the schema.<br><br>If a `CREATE SCHEMA` statement has an `AUTHORIZATION` clause, but no schema name is specified, the schema will be named after the specified owner of the schema. If a `CREATE SCHEMA` statement does not have an `AUTHORIZATION` clause, the user executing the statement will be named the owner.

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Create a schema

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

{% include_cached copy-clipboard.html %}
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

By default, the user executing the `CREATE SCHEMA` statement is the owner of the schema. For example, suppose you created the schema as user `root`. `root` would be the owner of the schema.

### Create a schema if one does not exist

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

~~~
ERROR: schema "org_one" already exists
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS org_one;
~~~

SQL does not generate an error, even though a new schema wasn't created.

{% include_cached copy-clipboard.html %}
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

### Create two tables of the same name in different schemas

You can create tables of the same name in the same database if they are in separate schemas.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS org_one;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS org_two;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE org_one.employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING,
        desk_no INT UNIQUE
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE org_two.employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING,
        desk_no INT UNIQUE
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x as (SHOW TABLES) SELECT * x WHERE table_name='employees';
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER max WITH PASSWORD 'roach';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_two AUTHORIZATION max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  org_two
  pg_catalog
  pg_extension
  public
(6 rows)
~~~

If no schema name is specified in a `CREATE SCHEMA` statement with an `AUTHORIZATION` clause, the schema will be named after the user specified:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA AUTHORIZATION max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  max
  org_two
  pg_catalog
  pg_extension
  public
(7 rows)
~~~

When you [use a table without specifying a schema](sql-name-resolution.html#search-path), CockroachDB looks for the table in the `$user` schema (i.e., a schema named after the current user). If no schema exists with the name of the current user, the `public` schema is used.

For example, suppose that you [grant the `root` role](grant.html) (i.e., the role of the current user `root`) to the `max` user:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT root TO max;
~~~

Then, `max` [accesses the cluster](cockroach-sql.html) and creates two tables of the same name, in the same database, one in the `max` schema, and one in the `public` schema:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --url 'postgres://max:roach@host:port/db?sslmode=require'
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE max.accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING,
        balance DECIMAL
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE public.accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING,
        balance DECIMAL
);
~~~

{% include_cached copy-clipboard.html %}
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

`max` then inserts some values into the `accounts` table, without specifying a schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (name, balance) VALUES ('checking', 1000), ('savings', 15000);
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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
- [`SET SCHEMA`](set-schema.html)
- [`DROP SCHEMA`](drop-schema.html)
- [`ALTER SCHEMA`](alter-schema.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
