---
title: ALTER SCHEMA
summary: The ALTER SCHEMA statement modifies a user-defined schema in a database.
toc: true
docs_area: reference.sql 
---

The `ALTER SCHEMA` [statement](sql-statements.html) modifies a user-defined [schema](sql-name-resolution.html#naming-hierarchy). CockroachDB currently supports changing the name of the schema and the owner of the schema.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/alter_schema.html %}
</div>

### Parameters

Parameter | Description
----------|------------
`name`<br>`name.name` | The name of the schema to alter, or the name of the database containing the schema and the schema name, separated by a "`.`".
`RENAME TO schema_name` | Rename the schema to `schema_name`. The new schema name must be unique within the database and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
`OWNER TO role_spec` | Change the owner of the schema to `role_spec`.

## Required privileges

- To rename a schema, the user must be the owner of the schema.
- To change the owner of a schema, the user must be the current owner of the schema and a member of the new owner [role](security-reference/authorization.html#roles). The new owner role must also have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the database to which the schema belongs.

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Rename a schema

Suppose that you access the [SQL shell](cockroach-sql.html) as user `root`, and [create a new user](create-user.html) `max` and [a schema](create-schema.html) `org_one` with `max` as the owner:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one AUTHORIZATION max;
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

Now, suppose you want to rename the schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER SCHEMA org_one RENAME TO org_two;
~~~

~~~
ERROR: must be owner of schema "org_one"
SQLSTATE: 42501
~~~

Because you are executing the `ALTER SCHEMA` command as a non-owner of the schema (i.e., `root`), CockroachDB returns an error.

[Drop the schema](drop-schema.html) and create it again, this time with `root` as the owner.

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP SCHEMA org_one;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

To verify that the owner is now `root`, query the `pg_catalog.pg_namespace` and `pg_catalog.pg_users` tables:

{% include_cached copy-clipboard.html %}
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

As its owner, you can rename the schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER SCHEMA org_one RENAME TO org_two;
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

### Change a schema's owner

Suppose that you access the [SQL shell](cockroach-sql.html) as user `root`, and [create a new schema](create-schema.html) named `org_one`:

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

Now, suppose that you want to change the owner of the schema `org_one` to an existing user named `max`. To change the owner of a schema, the current owner must belong to the role of the new owner (in this case, `max`), and the new owner must have `CREATE` privileges on the database.

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT max TO root;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE defaultdb TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER SCHEMA org_one OWNER TO max;
~~~

To verify that the owner is now `max`, query the `pg_catalog.pg_namespace` and `pg_catalog.pg_users` tables:

{% include_cached copy-clipboard.html %}
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
  org_one | max
(1 row)
~~~

## See also

- [`CREATE SCHEMA`](create-schema.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`DROP SCHEMA`](drop-schema.html)
- [Online Schema Changes](online-schema-changes.html)
