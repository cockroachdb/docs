---
title: User-Defined Functions
summary: A user-defined function is a named function defined at the database level that can be called in queries and other contexts.
toc: true
key: sql-expressions.html
docs_area: reference.sql
---

A user-defined function (UDF) is a named function defined at the database level that can be called in queries and other contexts. CockroachDB supports invoking UDFs in `SELECT`, `FROM`, and `WHERE` clauses of [DML statements](sql-statements.html#data-manipulation-statements).

## Overview

The basic components of a user-defined function are a name, list of arguments, return type, volatility, language, and function body.

- An argument has a _mode_ and a _type_. CockroachDB supports the `IN` argument mode. The type can be a built-in type, [user-defined enum](enum.html), or implicit record type. CockroachDB **does not** support default values for arguments.
- The return type can be a built-in type, user-defined enum, implicit record type, or `VOID`. `VOID` indicates that there is no return type and `NULL` will always be returned. If the return type of the function is not `VOID`, the last statement of a UDF must be a `SELECT`.
- The [volatility](functions-and-operators.html#function-volatility) indicates whether the function has side effects. `VOLATILE` and `NOT LEAKPROOF` are the default.
  - Annotate a function with side effects with `VOLATILE`. This also prevents the [cost-based optimizer](cost-based-optimizer.html) from pre-evaluating the function.
  - A `STABLE` or `IMMUTABLE` function does not mutate data.
  - `LEAKPROOF` indicates that a function has no side effects and that it communicates nothing that depends on its arguments besides the return value (i.e., it cannot throw an error that depends on the value of its arguments). You must precede `LEAKPROOF` with `IMMUTABLE`, and only `IMMUTABLE` can be set to `LEAKPROOF`. `NOT LEAKPROOF` is allowed with any other volatility.
- The language specifies the language of the function body. CockroachDB supports the language `SQL`.
- The function body:
  - Can reference arguments by name or by their ordinal in the function definition with the syntax `$1`.
  - Can be enclosed in a single line with single quotes `''` or multiple lines with `$$`.
  - Can reference tables.
  - Can reference only the `SELECT` statement.

## Examples

The following examples show how to create and invoke a simple UDF and view the definition of the UDF.

### Create a UDF

The following is a UDF that returns the sum of two integers:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION add(a INT, b INT) RETURNS INT IMMUTABLE LEAKPROOF LANGUAGE SQL AS 'SELECT a + b';
~~~

Where:

- name: `add`
- arguments: `a` of type `INT`, `b` of type `INT`
- return type: `INT`
- volatility: `IMMUTABLE LEAKPROOF`
- language: `SQL`
- function body: `'SELECT a + b'`

Alternatively, you could define this function as:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION add(a INT, b INT) RETURNS INT IMMUTABLE LEAKPROOF LANGUAGE SQL AS 'SELECT $1 + $2';
~~~

Or as:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION add(a INT, b INT) RETURNS INT LANGUAGE SQL AS $$
  SELECT a + b;
$$;
~~~

### Invoke a UDF

You invoke the UDF like a [built-in function](functions-and-operators.html):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT add(3,5) as sum;
~~~

~~~
  sum
-------
    8
(1 row)
~~~

### View a UDF definition

To view the `add` function definition, run:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE FUNCTION add;
~~~

If you do not specify a schema for the function `add` when you create it, the default schema is `public`:

~~~
  function_name |                 create_statement
----------------+---------------------------------------------------
 add            | CREATE FUNCTION public.add(IN a INT8, IN b INT8)
                |     RETURNS INT8
                |     IMMUTABLE
                |     LEAKPROOF
                |     CALLED ON NULL INPUT
                |     LANGUAGE SQL
                |     AS $$
                |     SELECT a + b;
                | $$
(1 row)
~~~

## Known limitations

### Limitations on use of UDFs

User-defined functions are not currently supported in:

- Expressions (column, index, constraint) in tables.

    [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/87699)

- Views.

    [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/87699)

- Other user-defined functions.

    [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/93049)

- [CDC transformations](cdc-transformations.html).

### Limitations on expressions allowed within UDFs

The following are not currently allowed within the body of a UDF:

- Subqueries in statements.

    [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/87291)

- Mutation statements such as `INSERT`, `UPDATE`, `DELETE`, and `UPSERT`.

    [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/87289)

- Expressions with `*` such as `SELECT *`.

    [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/90080)

- CTEs (common table expressions).

    [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/92961)

- References to other user-defined functions.

    [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/93049)

## See also

- [`CREATE FUNCTION`](create-function.html)
- [`ALTER FUNCTION`](alter-function.html)
- [`DROP FUNCTION`](drop-function.html)
- [`SHOW CREATE`](show-create.html)
- [SQL Statements](sql-statements.html)
- [Functions and Operators](functions-and-operators.html)
