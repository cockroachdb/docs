---
title: ALTER FUNCTION
summary: The ALTER FUNCTION statement alters a user-defined function.
toc: true
keywords:
docs_area: reference.sql
---

The `ALTER FUNCTION` [statement](sql-statements.html) alters a [user-defined function](user-defined-functions.html).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Subcommands

Subcommand | Description
-----------|------------
`OWNER TO` | Change the [owner](owner-to.html) of a function.
`RENAME TO` | Change the name of a function.
`SET SCHEMA` | [Set schema](set-schema.html) of a function.

## Required privileges

To alter a function, a user must have:

- To alter a function, a user must [own](security-reference/authorization.html#object-ownership) the function.
- To alter a function, a user must have `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the schema of the function.
- To alter the owner of a function, the new owner must have `CREATE` privilege on the schema of the function.
- To change the schema of a function, a user must have `CREATE` privilege on the new schema.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_func.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`function_with_argtypes` | The name of the function, with optional function arguments to alter.
`name` | The new name of the function.
`role_spec` | The role to set as the owner of the function.
`schema_name` | The name of the new schema.

## Examples

### Rename a function


{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE FUNCTION add(a INT, b INT) RETURNS INT IMMUTABLE LEAKPROOF LANGUAGE SQL AS 'SELECT $1 + $2';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER FUNCTION add(a INT, b INT) RENAME TO sum;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE FUNCTION sum;
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

Since `sum` is a [built-in function](functions-and-operators.html#aggregate-functions), you must specify the `public` schema to invoke your user-defined `sum` function:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT public.sum(1,2);
~~~

~~~
  sum
-------
    3
~~~

If you do not specify `public`, you will get an error when invoking a built-in function:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT sum(1,2);
~~~

~~~
ERROR: ambiguous function class on sum
SQLSTATE: 42725
~~~

## See also

- [User-Defined Functions](user-defined-functions.html)
- [`CREATE FUNCTION`](create-function.html)
- [`DROP FUNCTION`](drop-function.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
