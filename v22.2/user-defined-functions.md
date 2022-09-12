---
title: User-Defined Functions
summary: A user-defined function is a named function defined at the database layer that can be called in queries and other contexts.
toc: true
key: sql-expressions.html
docs_area: reference.sql
---

{% include_cached new-in.html version="v22.2" %} A user-defined function (UDF) is a named function defined at the database that can be called in queries and other contexts. CockroachDB supports invoking UDFs in `SELECT`, `FROM`, and `WHERE` clauses of DML statements.

The basic components of a user-defined function are a name, list of arguments, return type, volatility, language, and function body.

- An argument has a _mode_ and a _type_. CockroachDB supports the `IN` argument mode. The type can be a built-in type, [user-defined enum](enum.html), or implicit record type. CockroachDB **does not** support default values for arguments.
- The return type can be a built-in type, user-defined enum, implicit record type, `SETOF`, and `VOID`. `SETOF` allows returning multiple rows rather than a single value. `VOID` indicates that there is no return type and `NULL` will always be returned.  If the return type of the function is not `VOID`, the last statement of a UDF must be a `SELECT`.
- The [volatility qualifier](functions-and-operators.html#function-volatility) indicates whether the function has side effects. The default is `VOLATILE`. A function with side-effects must be `VOLATILE` to prevent the optimizer from precomputing the function. A `VOLATILE` function will see mutations to data made by the SQL command calling the function, while a `STABLE` or `IMMUTABLE` function will not.
- `[NOT] LEAKPROOF` is a type of volatility, rather than a volatility qualifier. It indicates that a function has no side effects and that it communicates nothing that is dependent on its arguments besides its return value (e.g., it cannot throw an error). `LEAKPROOF` must be preceded by `IMMUTABLE`. `NOT LEAKPROOF` is allowed with any volatility qualifier and has no effect.
- The language specifies the language of the function body. CockroachDB supports the language `SQL`.
- The function body can reference arguments by name or by their ordinal in the function definition with the syntax `$1`.

## Example

### Create a UDF that returns a sum of integers

The following is a UDF that returns the sum of two integers:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION add(a INT, b INT) RETURNS INT IMMUTABLE LEAKPROOF LANGUAGE SQL AS 'SELECT a + b';
~~~

where:

- name: `add`
- arguments: `a` of type `INT`, `b` of type `INT`
- return type: `INT`
- volatility: `IMMUTABLE LEAKPROOF`
- language: `SQL`
- function body: `'SELECT a + b'`

### Invoke the UDF

You invoke the UDF like any other [built-in function](functions-and-operators.html). For example:

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

### View the UDF definition

To view the `add` function definition, run:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE FUNCTION add;
~~~

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

{% include {{ page.version.version }}/known-limitations/udf-changefeed-expression.md %}

## See also

- [`CREATE FUNCTION`](create-function.html)
- [`ALTER FUNCTION`](alter-function.html)
- [`DROP FUNCTION`](drop-function.html)
- [SQL Statements](sql-statements.html)
- [Functions and Operators](functions-and-operators.html)
