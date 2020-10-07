---
title: ALTER SCHEMA
summary: The ALTER SCHEMA statement modifies a user-defined schema in a database.
toc: true
---

<span class="version-tag">New in v20.2:</span> The `ALTER SCHEMA` [statement](sql-statements.html) modifies a user-defined [schema](sql-name-resolution.html#logical-schemas-and-namespaces) in the current database. CockroachDB currently supports changing the name of the schema and the owner of the schema.

## Syntax

~~~
ALTER SCHEMA ... RENAME TO <newschemaname>
ALTER SCHEMA ... OWNER TO {<newowner> | CURRENT_USER | SESSION_USER }
~~~

### Parameters

Parameter | Description
----------|------------
`RENAME TO ...` | Rename the schema. The new schema name must be unique within the current database and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
`OWNER TO ...` | Change the owner of the schema. You can specify the new owner by name or with the [`CURRENT_USER` or `SESSION_USER` keywords](functions-and-operators.html#special-syntax-forms).

## Required privileges

- To rename a schema, the user must be the owner of the schema.
- To change the owner of a schema, the user must be the current owner of the schema and a member of the new owner [role](authorization.html#roles). The new owner role must also have the `CREATE` [privilege](authorization.html#assign-privileges) on the database to which the schema belongs.

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Rename a schema

Suppose that you access the [SQL shell](cockroach-sql.html) as user `demo`, and [create a new user](create-user.html) `max` and [a schema](create-schema.html) `org_one` with `max` as the owner:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one AUTHORIZATION max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name     | owner
---------------------+--------
  crdb_internal      | NULL
  information_schema | NULL
  org_one            | max
  pg_catalog         | NULL
  pg_extension       | NULL
  public             | admin
(6 rows)
~~~

Now, suppose you want to rename the schema:

{% include copy-clipboard.html %}
~~~ sql
> ALTER SCHEMA org_one RENAME TO org_two;
~~~

~~~
ERROR: must be owner of schema "org_one"
SQLSTATE: 42501
~~~

Because you are executing the `ALTER SCHEMA` command as a non-owner of the schema (i.e., `demo`), CockroachDB returns an error.

[Drop the schema](drop-schema.html) and create it again, this time with with `demo` as the owner.

{% include copy-clipboard.html %}
~~~ sql
> DROP SCHEMA org_one;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name     | owner
---------------------+--------
  crdb_internal      | NULL
  information_schema | NULL
  org_one            | demo
  pg_catalog         | NULL
  pg_extension       | NULL
  public             | admin
(6 rows)
~~~

As its owner, you can rename the schema:

{% include copy-clipboard.html %}
~~~ sql
> ALTER SCHEMA org_one RENAME TO org_two;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name     | owner
---------------------+--------
  crdb_internal      | NULL
  information_schema | NULL
  org_two            | demo
  pg_catalog         | NULL
  pg_extension       | NULL
  public             | admin
(6 rows)
~~~

### Change a schema's owner

Suppose that you access the [SQL shell](cockroach-sql.html) as user `demo`, and [create a new schema](create-schema.html) named `org_one`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name     | owner
---------------------+--------
  crdb_internal      | NULL
  information_schema | NULL
  org_one            | demo
  pg_catalog         | NULL
  pg_extension       | NULL
  public             | admin
(6 rows)
~~~

Now, suppose that you want to change the owner of the schema `org_one` to an existing user named `max`. To change the owner of a schema, the current owner must belong to the role of the new owner (in this case, `max`), and the new owner must have `CREATE` privileges on the database.

{% include copy-clipboard.html %}
~~~ sql
> GRANT max TO demo;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE defaultdb TO max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER SCHEMA org_one OWNER TO max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name     | owner
---------------------+--------
  crdb_internal      | NULL
  information_schema | NULL
  org_one            | max
  pg_catalog         | NULL
  pg_extension       | NULL
  public             | admin
(6 rows)
~~~

## See also

- [`CREATE SCHEMA`](create-schema.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`DROP SCHEMA`](drop-schema.html)
