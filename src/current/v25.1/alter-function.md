---
title: ALTER FUNCTION
summary: The ALTER FUNCTION statement alters a user-defined function.
toc: true
keywords:
docs_area: reference.sql
---

The `ALTER FUNCTION` [statement]({{ page.version.version }}/sql-statements.md) applies a [schema change]({{ page.version.version }}/online-schema-changes.md) to a [user-defined function]({{ page.version.version }}/user-defined-functions.md).

## Required privileges

Refer to the respective [subcommands](#subcommands).

## Synopsis

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`function_with_argtypes` | The name of the function, with optional function arguments to alter.

For more information about the statement syntax, see [User-Defined Functions]({{ page.version.version }}/user-defined-functions.md#overview).

Additional parameters are documented for the respective [subcommands](#subcommands).

## Subcommands

Subcommand | Description
-----------|------------
[`OWNER TO`](#owner-to) | Change the owner of a function.
[`RENAME TO`](#rename-to) | Change the name of a function.
[`SET SCHEMA`](#set-schema) | Change the [schema]({{ page.version.version }}/sql-name-resolution.md) of a function.

### `OWNER TO`

`ALTER FUNCTION ... OWNER TO` is used to change the owner of a function.

#### Required privileges

- To alter the owner of a function, the new owner must have `CREATE` privilege on the schema of the function.
- To alter a function, a user must [own]({{ page.version.version }}/security-reference/authorization.md#object-ownership) the function.
- To alter a function, a user must have `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the schema of the function.

#### Parameters

Parameter | Description |
----------|-------------|
`role_spec` | The role to set as the owner of the function.

For usage, see [Synopsis](#synopsis).

### `RENAME TO`

`ALTER FUNCTION ... RENAME TO` changes the name of a function.

#### Required privileges

- To alter a function, a user must [own]({{ page.version.version }}/security-reference/authorization.md#object-ownership) the function.
- To alter a function, a user must have `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the schema of the function.

#### Parameters

Parameter | Description |
----------|-------------|
`function_new_name` | The new name of the function.

For usage, see [Synopsis](#synopsis).

### `SET SCHEMA`

`ALTER FUNCTION ... SET SCHEMA` changes the [schema]({{ page.version.version }}/sql-name-resolution.md) of a function.

{{site.data.alerts.callout_info}}
CockroachDB supports `SET SCHEMA` as an [alias for setting the `search_path` session variable]({{ page.version.version }}/set-vars.md#supported-variables).
{{site.data.alerts.end}}

#### Required privileges

- To change the schema of a function, a user must have `CREATE` privilege on the new schema.
- To alter a function, a user must [own]({{ page.version.version }}/security-reference/authorization.md#object-ownership) the function.
- To alter a function, a user must have `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the schema of the function.

#### Parameters

Parameter | Description |
----------|-------------|
`schema_name` | The name of the new schema for the function.

For usage, see [Synopsis](#synopsis).

## Examples

### Change the owner of a function

Suppose that the current owner of a `sq` function is `root` and you want to change the owner to a new user named `max`.

~~~ sql
ALTER FUNCTION sq OWNER TO max;
~~~

To verify that the owner is now `max`, run a join query against the `pg_catalog.pg_proc` and `pg_catalog.pg_roles` tables:

~~~ sql
SELECT rolname FROM pg_catalog.pg_proc f
JOIN pg_catalog.pg_roles r ON f.proowner = r.oid
WHERE proname = 'sq';
~~~

~~~
  rolname
-----------
  max
(1 row)
~~~

### Rename a function

The following statement defines a function that computes the sum of two arguments:

~~~ sql
CREATE FUNCTION add(a INT, b INT) RETURNS INT IMMUTABLE LEAKPROOF LANGUAGE SQL AS 'SELECT $1 + $2';
~~~

The following statement renames the `add` function to `sum`:

~~~ sql
ALTER FUNCTION add(a INT, b INT) RENAME TO sum;
~~~

~~~ sql
SHOW CREATE FUNCTION sum;
~~~

The default schema for the function `sum` is `public`:

~~~
  function_name |                 create_statement
----------------+---------------------------------------------------
  sum           | CREATE FUNCTION public.sum(IN a INT8, IN b INT8)
                |     RETURNS INT8
                |     IMMUTABLE
                |     LEAKPROOF
                |     CALLED ON NULL INPUT
                |     LANGUAGE SQL
                |     AS $$
                |     SELECT $1 + $2;
                | $$
(1 row)
~~~

Since there is also a [built-in function]({{ page.version.version }}/functions-and-operators.md#aggregate-functions) named `sum`, you must specify the `public` schema to invoke your user-defined `sum` function:

~~~ sql
SELECT public.sum(1,2);
~~~

~~~
  sum
-------
    3
~~~

If you do not specify `public` when invoking a user-defined function, you will get an error when invoking a built-in function with the same name:

~~~ sql
SELECT sum(1,2);
~~~

~~~
ERROR: ambiguous function class on sum
SQLSTATE: 42725
~~~

### Change the schema of a function

Suppose you want to add the user-defined `sum` function from the [preceding example](#rename-a-function) to a new schema called `cockroach_labs`.

By default, [unqualified functions]({{ page.version.version }}/sql-name-resolution.md#lookup-with-unqualified-names) created in the database belong to the `public` schema:

~~~ sql
SHOW CREATE FUNCTION public.sum;
~~~

~~~
  function_name |                 create_statement
----------------+---------------------------------------------------
  sum           | CREATE FUNCTION public.sum(IN a INT8, IN b INT8)
                |     RETURNS INT8
                |     IMMUTABLE
                |     LEAKPROOF
                |     CALLED ON NULL INPUT
                |     LANGUAGE SQL
                |     AS $$
                |     SELECT $1 + $2;
                | $$
(1 row)
~~~

If the new schema does not already exist, [create it]({{ page.version.version }}/create-schema.md):

~~~ sql
CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

Then, change the function's schema:

~~~ sql
ALTER FUNCTION public.sum SET SCHEMA cockroach_labs;
~~~

~~~ sql
SHOW CREATE FUNCTION cockroach_labs.sum;
~~~

~~~
  function_name |                     create_statement
----------------+-----------------------------------------------------------
  sum           | CREATE FUNCTION cockroach_labs.sum(IN a INT8, IN b INT8)
                |     RETURNS INT8
                |     IMMUTABLE
                |     LEAKPROOF
                |     CALLED ON NULL INPUT
                |     LANGUAGE SQL
                |     AS $$
                |     SELECT $1 + $2;
                | $$
(1 row)
~~~

## See also

- [User-Defined Functions]({{ page.version.version }}/user-defined-functions.md)
- [`CREATE FUNCTION`]({{ page.version.version }}/create-function.md)
- [`DROP FUNCTION`]({{ page.version.version }}/drop-function.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)