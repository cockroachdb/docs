---
title: ALTER SCHEMA
summary: The ALTER SCHEMA statement modifies a user-defined schema in a database.
toc: true
docs_area: reference.sql
---

The `ALTER SCHEMA` [statement]({{ page.version.version }}/sql-statements.md) modifies a user-defined [schema]({{ page.version.version }}/sql-name-resolution.md#naming-hierarchy). CockroachDB currently supports changing the name of the schema and the owner of the schema.


## Syntax

<div>
</div>

### Parameters

Parameter | Description
----------|------------
`name`<br>`name.name` | The name of the schema to alter, or the name of the database containing the schema and the schema name, separated by a "`.`".
`schema_new_name` | The name of the new schema. The new schema name must be unique within the database and follow these [identifier rules]({{ page.version.version }}/keywords-and-identifiers.md#identifiers).
`role_spec` |  The role to set as the owner of the schema.

## Required privileges

- To rename a schema, the user must be the owner of the schema.
- To change the owner of a schema, the user must be the current owner of the schema and a member of the new owner [role]({{ page.version.version }}/security-reference/authorization.md#roles). The new owner role must also have the `CREATE` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the database to which the schema belongs.

## Examples


### Rename a schema

{{site.data.alerts.callout_info}}
You cannot rename a schema if a [table]({{ page.version.version }}/create-table.md) in the schema is used by a [view]({{ page.version.version }}/create-view.md) or [user-defined function]({{ page.version.version }}/user-defined-functions.md).
{{site.data.alerts.end}}

Suppose that you access the [SQL shell]({{ page.version.version }}/cockroach-sql.md) as user `root`, and [create a new user]({{ page.version.version }}/create-user.md) `max` and [a schema]({{ page.version.version }}/create-schema.md) `org_one` with `max` as the owner:

~~~ sql
CREATE USER max;
~~~

~~~ sql
CREATE SCHEMA org_one AUTHORIZATION max;
~~~

~~~ sql
SHOW SCHEMAS;
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

~~~ sql
ALTER SCHEMA org_one RENAME TO org_two;
~~~

~~~
ERROR: must be owner of schema "org_one"
SQLSTATE: 42501
~~~

Because you are executing the `ALTER SCHEMA` command as a non-owner of the schema (i.e., `root`), CockroachDB returns an error.

[Drop the schema]({{ page.version.version }}/drop-schema.md) and create it again, this time with `root` as the owner.

~~~ sql
DROP SCHEMA org_one;
~~~

~~~ sql
CREATE SCHEMA org_one;
~~~

To verify that the owner is now `root`, query the `pg_catalog.pg_namespace` and `pg_catalog.pg_users` tables:

~~~ sql
SELECT
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

~~~ sql
ALTER SCHEMA org_one RENAME TO org_two;
~~~

~~~ sql
SHOW SCHEMAS;
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

### Change the owner of a schema

Suppose that you access the [SQL shell]({{ page.version.version }}/cockroach-sql.md) as user `root`, and [create a new schema]({{ page.version.version }}/create-schema.md) named `org_one`:

~~~ sql
CREATE SCHEMA org_one;
~~~

~~~ sql
SHOW SCHEMAS;
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

~~~ sql
GRANT max TO root;
~~~

~~~ sql
GRANT CREATE ON DATABASE defaultdb TO max;
~~~

~~~ sql
ALTER SCHEMA org_one OWNER TO max;
~~~

To verify that the owner is now `max`, query the `pg_catalog.pg_namespace` and `pg_catalog.pg_users` tables:

~~~ sql
SELECT
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

- [`CREATE SCHEMA`]({{ page.version.version }}/create-schema.md)
- [`SHOW SCHEMAS`]({{ page.version.version }}/show-schemas.md)
- [`DROP SCHEMA`]({{ page.version.version }}/drop-schema.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)