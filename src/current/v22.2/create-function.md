---
title: CREATE FUNCTION
summary: The CREATE FUNCTION statement creates a user-defined function.
toc: true
keywords:
docs_area: reference.sql
---

The `CREATE FUNCTION` [statement](sql-statements.html) creates a [user-defined function](user-defined-functions.html).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

- To define a function, a user must have [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on the schema of the function.
- To define a function with a [user-defined type](create-type.html), a user must have `USAGE` privilege on the user-defined type.
- To resolve a function, a user must have at least the `USAGE` privilege on the schema of the function.
- To call a function, a user must have `EXECUTE` privilege on the function.
- At function definition and execution time, a user must have privileges on all the objects referenced in the function body. Privileges on referenced objects can be revoked and later function calls can fail due to lack of permission.

If you grant `EXECUTE` privilege as a default privilege at the database level, newly created functions inherit that privilege from the database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_func.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`func_create_name` | The name of the function.
`func_arg` | A function argument.
`func_arg_type` | The type returned by the function.
`opt_routine_body` | The body of the function. For allowed contents, see [User-Defined Functions: Overview](user-defined-functions.html#overview).

## Example of a simple function

The following statement creates a function to compute the square of integers:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE OR REPLACE FUNCTION sq(a INT) RETURNS INT AS 'SELECT a*a' LANGUAGE SQL;
~~~

The following statement invokes the `sq` function:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT sq(2);
~~~

~~~
  sq
-----
  4
(1 row)
~~~

## Examples of functions that reference tables

{% include {{page.version.version}}/sql/movr-statements.md %}

### Create a function that references a table

The following statement defines a function that returns the total number of MovR application users.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE OR REPLACE FUNCTION num_users() RETURNS INT AS 'SELECT count(*) from users' LANGUAGE SQL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT num_users();
~~~

~~~
  num_users
-------------
         50
(1 row)
~~~

### Create a function that uses a `WHERE` clause

The following statement defines a function that returns the total revenue for rides taken in European cities.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE OR REPLACE FUNCTION total_euro_revenue() RETURNS DECIMAL LANGUAGE SQL AS $$
  SELECT SUM(revenue) FROM rides WHERE city IN ('paris', 'rome', 'amsterdam')
  $$;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT total_euro_revenue();
~~~
~~~
  total_euro_revenue
----------------------
             8468.00
~~~

## See also

- [User-Defined Functions](user-defined-functions.html)
- [`ALTER FUNCTION`](alter-function.html)
- [`DROP FUNCTION`](drop-function.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
