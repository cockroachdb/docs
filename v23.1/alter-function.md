---
title: ALTER FUNCTION
summary: The ALTER FUNCTION statement alters a user-defined function.
toc: true
keywords:
docs_area: reference.sql
sidebar: sql_statements
---

The `ALTER FUNCTION` [statement](sql-statements.html) applies a [schema change](online-schema-changes.html) to a [user-defined function](user-defined-functions.html).

## Required privileges

Refer to the respective [subcommands](#subcommands).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_func.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`function_with_argtypes` | The name of the function, with optional function arguments to alter.

For more information about the statement syntax, see [User-Defined Functions](user-defined-functions.html#overview).

Additional parameters are documented for the respective [subcommands](#subcommands).

## Subcommands

Subcommand | Description
-----------|------------
[`OWNER TO`](#owner-to) | Change the owner of a function.
[`RENAME TO`](#rename-to) | Change the name of a function.
[`SET SCHEMA`](#set-schema) | Change the [schema](sql-name-resolution.html) of a function.

### `OWNER TO`

`ALTER FUNCTION ... OWNER TO` is used to change the owner of a function.

#### Required privileges

- To alter the owner of a function, the new owner must have `CREATE` privilege on the schema of the function.
- To alter a function, a user must [own](security-reference/authorization.html#object-ownership) the function.
- To alter a function, a user must have `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the schema of the function.

#### Parameters

Parameter | Description |
----------|-------------|
`role_spec` | The role to set as the owner of the function.

For usage, see [Synopsis](#synopsis).

### `RENAME TO`

`ALTER FUNCTION ... RENAME TO` changes the name of a function.

#### Required privileges

- To alter a function, a user must [own](security-reference/authorization.html#object-ownership) the function.
- To alter a function, a user must have `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the schema of the function.

#### Parameters

Parameter | Description |
----------|-------------|
`function_new_name` | The new name of the function.

For usage, see [Synopsis](#synopsis).

### `SET SCHEMA`

`ALTER FUNCTION ... SET SCHEMA` changes the [schema](sql-name-resolution.html) of a function.

{{site.data.alerts.callout_info}}
CockroachDB supports `SET SCHEMA` as an [alias for setting the `search_path` session variable](set-vars.html#supported-variables).
{{site.data.alerts.end}}

#### Required privileges

- To change the schema of a function, a user must have `CREATE` privilege on the new schema.
- To alter a function, a user must [own](security-reference/authorization.html#object-ownership) the function.
- To alter a function, a user must have `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the schema of the function.

#### Parameters

Parameter | Description |
----------|-------------|
`schema_name` | The name of the new schema for the function.

For usage, see [Synopsis](#synopsis).

## Examples

### Change the owner of a function

Suppose that the current owner of a `sq` function is `root` and you want to change the owner to a new user named `max`.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER FUNCTION sq OWNER TO max;
~~~

To verify that the owner is now `max`, run a join query against the `pg_catalog.pg_proc` and `pg_catalog.pg_roles` tables:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION add(a INT, b INT) RETURNS INT IMMUTABLE LEAKPROOF LANGUAGE SQL AS 'SELECT $1 + $2';
~~~

The following statement renames the `add` function to `sum`:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER FUNCTION add(a INT, b INT) RENAME TO sum;
~~~

{% include_cached copy-clipboard.html %}
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

Since there is also a [built-in function](functions-and-operators.html#aggregate-functions) named `sum`, you must specify the `public` schema to invoke your user-defined `sum` function:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT public.sum(1,2);
~~~

~~~
  sum
-------
    3
~~~

If you do not specify `public` when invoking a user-defined function, you will get an error when invoking a built-in function with the same name:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT sum(1,2);
~~~

~~~
ERROR: ambiguous function class on sum
SQLSTATE: 42725
~~~

### Change the schema of a function

Suppose you want to add the user-defined `sum` function from the [preceding example](#rename-a-function) to a new schema called `cockroach_labs`.

By default, [unqualified functions](sql-name-resolution.html#lookup-with-unqualified-names) created in the database belong to the `public` schema:

{% include_cached copy-clipboard.html %}
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

If the new schema does not already exist, [create it](create-schema.html):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

Then, change the function's schema:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER FUNCTION public.sum SET SCHEMA cockroach_labs;
~~~

{% include_cached copy-clipboard.html %}
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

- [User-Defined Functions](user-defined-functions.html)
- [`CREATE FUNCTION`](create-function.html)
- [`DROP FUNCTION`](drop-function.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
