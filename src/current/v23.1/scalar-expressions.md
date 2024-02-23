---
title: Scalar Expressions
summary: Scalar expressions allow the computation of new values from basic parts.
toc: true
key: sql-expressions.html
docs_area: reference.sql
---

Most SQL statements can contain scalar expressions that compute new
values from data. For example, in the query `SELECT ceil(price) FROM items`,
the expression `ceil(price)` computes the rounded-up value of
the values from the `price` column.

_Scalar expressions_ produce values suitable to store in a single table
cell (one column of one row). They can be contrasted with
[_table expressions_]({% link {{ page.version.version }}/table-expressions.md %}) and [_selection queries_]({% link {{ page.version.version }}/selection-queries.md %}),
which produce results structured as a table.

The following sections describe how to construct scalar expressions.

## Constants

Constant expressions represent a simple value that doesn't change.
They are described further in section [SQL Constants]({% link {{ page.version.version }}/sql-constants.md %}).

## Column references

An expression in a query can refer to columns in the current data source in two ways:

- The name of the column, e.g., `price` in `SELECT price FROM
  items`.

  - If the name of a column is also a [SQL keyword]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#keywords), the name
  must be appropriately quoted. For example: `SELECT "Default" FROM configuration`.

  - If the name is ambiguous (e.g., when joining across multiple tables), it is possible to disambiguate by prefixing the column
  name by the table name. For example, `SELECT items.price FROM items`.

- The ordinal position of the column. For example, `SELECT @1 FROM items` selects the first column in `items`.

    {{site.data.alerts.callout_info}}This is a CockroachDB SQL extension.{{site.data.alerts.end}}

    {{site.data.alerts.callout_danger}}
    Use ordinal references with care in production code. During schema updates, column ordinal
    positions can change and invalidate existing queries that use ordinal positions based on a
    previous version of the schema.
    {{site.data.alerts.end}}

## Unary and binary operations

An expression prefixed by a unary operator, or two expressions
separated by a binary operator, form a new expression.

For a full list of CockroachDB operators, with details about their order of precedence and which
data types are valid operands for each operator, see [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %}#operators).

### Value comparisons

The standard operators `<` (less than), `>` (greater than), `<=` (less than or equal to),
`>=` (greater than or equal to), `=` (equals), `<>` and `!=` (not equal to),
`IS` (identical to), and `IS NOT` (not identical to) can be applied to any pair of values from a
single data type, as well as some pairs of values from different data
types.

See also [this section over which data types are valid operands
for each operator]({% link {{ page.version.version }}/functions-and-operators.md %}#operators).

The following special rules apply:

- `NULL` is always ordered smaller than every other value, even itself.
- `NULL` is never equal to anything via `=`, even `NULL`. To check
  whether a value is `NULL`, use the `IS` operator or the conditional
  expression `IFNULL(...)`.

See also [NULLs and Ternary Logic]({% link {{ page.version.version }}/null-handling.md %}#nulls-and-ternary-logic).

#### Typing rule

All comparisons accept any combination of argument types and result in type `BOOL`.

#### Comparison with `NaN`

CockroachDB recognizes the special value `NaN` ([Not-a-Number](https://wikipedia.org/wiki/NaN)) for scalars of
type [`FLOAT`]({% link {{ page.version.version }}/float.md %}) or [`DECIMAL`]({% link {{ page.version.version }}/decimal.md %}).

As per the [IEEE 754](https://wikipedia.org/wiki/IEEE_754)
standard, `NaN` is considered to be different from every other numeric
value in comparisons.

There are two exceptions however, made for compatibility with PostgreSQL:

- `NaN` is considered to be equal with itself in comparisons. IEEE 754
  specifies that `NaN` is different from itself.
- `NaN` is considered to be less than every other value, including
  `-INFINITY`. IEEE 754 specifies that `NaN` does not order with any
  other value, i.e., `x <= NaN` and `x >= NaN` are both false for every
  value of `x` including infinities.

These exceptions exist so that the value `NaN` can be used in `WHERE`
clauses and indexes.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT FLOAT 'NaN' < 1, 1 < FLOAT 'NaN', FLOAT 'NaN' < FLOAT 'NaN';
~~~

~~~
  ?column? | ?column? | ?column?
-----------+----------+-----------
    true   |  false   |  false
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT FLOAT 'NaN' = FLOAT 'NaN' AS result;
~~~

~~~
  result
----------
   true
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT FLOAT 'NaN' < FLOAT '-INFINITY' AS result;
~~~

~~~
  result
----------
   true
(1 row)
~~~

### Multi-valued comparisons

Syntax:

~~~
<expr> <comparison> ANY <expr>
<expr> <comparison> SOME <expr>
<expr> <comparison> ALL <expr>
~~~

The value comparison operators `<`, `>`, `=`, `<=`, `>=`, `<>` and
`!=`, as well as the pattern matching operators `[NOT] LIKE` and
`[NOT] ILIKE`, can be applied to compare a single value on the left to
multiple values on the right.

This is done by combining the operator using the keywords `ANY`/`SOME` or `ALL`.

The right operand can be either an array, a tuple or [subquery]({% link {{ page.version.version }}/subqueries.md %}).

The result of the comparison is true if and only if:

- For `ANY`/`SOME`, the comparison of the left value is true for any
  element on the right.
- For `ALL`, the comparison of the left value is true for every
  element on the right.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT 12 = ANY (10, 12, 13);
~~~

~~~
  ?column?
------------
    true
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT 12 = ALL (10, 12, 13);
~~~

~~~
  ?column?
------------
   false
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT 1 = ANY ARRAY[2, 3, 1];
~~~

~~~
  ?column?
------------
    true
(1 row)
~~~


#### Typing rule

The comparison between the type on the left and the element type of
the right operand must be possible.

### Set membership

Syntax:

~~~
<expr> IN <expr>
<expr> IN ( ... subquery ... )

<expr> NOT IN <expr>
<expr> NOT IN ( ... subquery ... )
~~~

Returns `TRUE` if and only if the value of the left operand is part of
the result of evaluating the right operand. In the subquery form, any
[selection query]({% link {{ page.version.version }}/selection-queries.md %}) can be used.

For example:

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT a IN (1, 2, 3) FROM sometable;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT a IN (SELECT * FROM allowedvalues) FROM sometable;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT ('x', 123) IN (SELECT * FROM rows);
~~~

{{site.data.alerts.callout_info}}See <a href="{% link {{ page.version.version }}/subqueries.md %}">Subqueries</a> for more details and performance best practices.{{site.data.alerts.end}}

#### Typing rule

`IN` requires its right operand to be a homogeneous tuple type and its left operand
to match the tuple element type. The result has type `BOOL`.

### String pattern matching

Syntax:

~~~
<expr> LIKE <expr>
<expr> ILIKE <expr>
<expr> NOT LIKE <expr>
<expr> NOT ILIKE <expr>
~~~

Evaluates both expressions as strings, then tests whether the string on the left
matches the pattern given on the right. Returns `TRUE` if a match is found
or `FALSE` otherwise, or the inverted value for the `NOT` variants.

Patterns can contain `_` to match any single
character, or `%` to match any sequence of zero or more characters.
`ILIKE` causes the match to be tested case-insensitively.

For example:

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT 'monday' LIKE '%day' AS a, 'tuesday' LIKE 'tue_day' AS b, 'wednesday' ILIKE 'W%' AS c;
~~~

~~~
   a   |  b   |  c
-------+------+-------
  true | true | true
(1 row)
~~~

#### Typing rule

The operands must be either both `STRING` or both `BYTES`. The result has type `BOOL`.

### String matching using POSIX regular expressions

Syntax:

~~~
<expr> ~ <expr>
<expr> ~* <expr>
<expr> !~ <expr>
<expr> !~* <expr>
~~~

Evaluates both expressions as strings, then tests whether the string
on the left matches the pattern given on the right. Returns `TRUE` if
a match is found or `FALSE` otherwise, or the inverted value for the
`!` variants.

The variants with an asterisk `*` use case-insensitive matching;
otherwise the matching is case-sensitive.

The pattern is expressed using [POSIX regular expression syntax](https://wikipedia.org/wiki/Regular_expression). Unlike
`LIKE` patterns, a regular expression is allowed to match anywhere inside a string, not only at the beginning.

For example:

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT 'monday' ~ 'onday' AS a, 'tuEsday' ~ 't[uU][eE]sday' AS b, 'wednesday' ~* 'W.*y' AS c;
~~~

~~~
   a   |  b   |  c
-------+------+-------
  true | true | true
(1 row)
~~~

#### Typing rule

The operands must be either both `STRING` or both `BYTES`. The result has type `BOOL`.

### String matching using SQL regular expressions

Syntax:

~~~
<expr> SIMILAR TO <expr>
<expr> NOT SIMILAR TO <expr>
~~~

Evaluates both expressions as strings, then tests whether the string   on the left
matches the pattern given on the right. Returns `TRUE` if a match is found
or `FALSE` otherwise, or the inverted value for the `NOT`  variant.

The pattern is expressed using the SQL standard's definition of a regular expression.
This is a mix of SQL `LIKE` patterns and POSIX regular expressions:

- `_` and `%` denote any character or any string, respectively.
- `.` matches specifically the period character, unlike in POSIX where it is a wildcard.
- Most of the other POSIX syntax applies as usual.
- The pattern matches the entire string (as in `LIKE`, unlike POSIX regular expressions).

For example:

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT 'monday' SIMILAR TO '_onday' AS a, 'tuEsday' SIMILAR TO 't[uU][eE]sday' AS b, 'wednesday' SIMILAR TO 'w%y' AS c;
~~~

~~~
   a   |  b   |  c
-------+------+-------
  true | true | true
(1 row)
~~~

#### Typing rule

The operands must be either both `STRING` or both `BYTES`. The result has type `BOOL`.

## Function calls and SQL special forms

General syntax:

~~~
<name> ( <arguments...> )
~~~

A built-in function name followed by an opening parenthesis, followed
by a comma-separated list of expressions, followed by a closing
parenthesis.

This applies the named function to the arguments between
parentheses. When the function's namespace is not prefixed, the
[name resolution rules]({% link {{ page.version.version }}/sql-name-resolution.md %}) determine which
function is called.

See also [supported built-in functions]({% link {{ page.version.version }}/functions-and-operators.md %}).

In addition, the following SQL special forms are also supported:

{% include {{ page.version.version }}/sql/function-special-forms.md %}

#### Typing rule

In general, a function call requires the arguments to be of the types
accepted by the function, and returns a value of the type determined
by the function.

However, the typing of function calls is complicated by the fact
SQL supports function overloading. See [Revisiting SQL Typing in CockroachDB](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/) for more details.

## Subscripted expressions

You can use the `[` ... `]` operator to access one item in an [`ARRAY`]({% link {{ page.version.version }}/array.md %}) or [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) value. For example:

- If the name `a` refers to an `ARRAY` of 10 values, `a[3]` will retrieve the third value. `ARRAY` values use 1-based indexing, so the first value has index `1`.
- If the name `j` refers to a `JSONB` array of 10 values, `j[3]` will retrieve the fourth value. `JSONB` arrays use zero-based indexing, so the first value has index `0`.
- If the name `j` refers to a JSON object `{"a": {"b":1}}`, then `j['a']` will access key `a` and retrieve `{"b":1}`. `j['a']['b']` will access key `b` and retrieve `1`.

The result of the subscripted expression is `NULL` if:

- The index is smaller than or equal to `0`, or larger than the size of the array.
- The key or key path does not exist in the JSON object.

#### Typing rule

The subscripted expression must have an array type; the index expression
must have type `INT`.  The result has the element type of the
subscripted expression.

## Conditional expressions

Expressions can test a conditional expression and, depending on whether
or which condition is satisfied, evaluate to one or more additional
operands.

These expression formats share the following property: some of their
operands are only evaluated if a condition is true. This matters
especially when an operand would be invalid otherwise. For example,
`IF(a=0, 0, x/a)` returns 0 if `a` is 0, and `x/a` otherwise.

### `IF` expressions

Syntax:

~~~
IF ( <cond>, <expr1>, <expr2> )
~~~

Evaluates `<cond>`, then evaluates `<expr1>` if the condition is true,
or `<expr2>` otherwise.

In most cases, the expression corresponding to the case when the condition is
false is not evaluated. The exception is when the expression is a subquery, which
is eagerly evaluated when execution of the query begins.

#### Typing rule

The condition must have type `BOOL`, and the two remaining expressions
must have the same type. The result has the same type as the
expression that was evaluated.

### Simple `CASE` expressions

Syntax:

~~~
CASE <cond>
  WHEN <condval1> THEN <expr1>
  [ WHEN <condvalx> THEN <exprx> ] ...
  [ ELSE <expr2> ]
END
~~~

Evaluates `<cond>`, then picks the `WHEN` branch where `<condval>` is
equal to `<cond>`, then evaluates and returns the corresponding `THEN`
expression. If no `WHEN` branch matches, the `ELSE` expression is
evaluated and returned, if any. Otherwise, `NULL` is returned.

In most cases, conditions and result expressions after the first match are not
evaluated. The exception is subqueries, which are eagerly evaluated when
execution of the query begins.

#### Typing rule

The condition and the `WHEN` expressions must have the same type.
The `THEN` expressions and the `ELSE` expression, if any, must have the same type.
The result has the same type as the `THEN`/`ELSE` expressions.

### Searched `CASE` expressions

Syntax:

~~~
CASE WHEN <cond1> THEN <expr1>
   [ WHEN <cond2> THEN <expr2> ] ...
   [ ELSE <expr> ]
END
~~~

In order, evaluates each `<cond>` expression; at the first `<cond>`
expression that evaluates to `TRUE`, returns the result of evaluating the
corresponding `THEN` expression.  If none of the `<cond>` expressions
evaluates to true, then evaluates and returns the value of the `ELSE`
expression, if any, or `NULL` otherwise.

In most cases, conditions and result expressions after the first match are not
evaluated. The exception is subqueries, which are eagerly evaluated when
execution of the query begins.

#### Typing rule

All the `WHEN` expressions must have type `BOOL`.
The `THEN` expressions and the `ELSE` expression, if any, must have the same type.
The result has the same type as the `THEN`/`ELSE` expressions.

### `NULLIF` expressions

Syntax:

~~~
NULLIF ( <expr1>, <expr2> )
~~~

Equivalent to: `IF ( <expr1> = <expr2>, NULL, <expr1> )`

#### Typing rule

Both operands must have the same type, which is also the type of the result.

### `COALESCE` and `IFNULL` expressions

Syntax:

~~~
IFNULL ( <expr1>, <expr2> )
COALESCE ( <expr1> [, <expr2> [, <expr3> ] ...] )
~~~

`COALESCE` evaluates the first expression first. If its value is not
`NULL`, its value is returned directly. Otherwise, it returns the
result of applying `COALESCE` on the remaining expressions. If all the
expressions are `NULL`, `NULL` is returned.

In most cases, arguments to the right of the first non-null argument are not
evaluated. The exception is subqueries, which are eagerly evaluated when
execution of the query begins.

`IFNULL(a, b)` is equivalent to `COALESCE(a, b)`.

#### Typing rule

The operands must have the same type, which is also the type of the result.

## Logical operators

The Boolean operators `AND`, `OR` and `NOT` are available.

Syntax:

~~~
NOT <expr>
<expr1> AND <expr2>
<expr1> OR <expr2>
~~~

`AND` and `OR` are commutative. Moreover, the input to `AND`
and `OR` is not evaluated in any particular order. Some operand may
not even be evaluated at all if the result can be fully ascertained using
only the other operand.

{{site.data.alerts.callout_info}}This is different from the left-to-right "short-circuit logic" found in other programming languages. When it is essential to force evaluation order, use <a href="#conditional-expressions">a conditional expression</a>.{{site.data.alerts.end}}

See also [NULLs and Ternary Logic]({% link {{ page.version.version }}/null-handling.md %}#nulls-and-ternary-logic).

#### Typing rule

The operands must have type `BOOL`. The result has type `BOOL`.

## Aggregate expressions

An aggregate expression has the same syntax as a function call, with a special
case for `COUNT`:

~~~
<name> ( <arguments...> )
COUNT ( * )
~~~

The difference between aggregate expressions and function calls is
that the former use [aggregate functions]({% link {{ page.version.version }}/functions-and-operators.md %}#aggregate-functions)
and can only appear in the list of rendered expressions in a
[`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}).

An aggregate expression computes a combined value, depending on
which aggregate function is used, across all the rows currently
selected.

#### Typing rule

The operand and return types are determined like for regular [function calls](#function-calls-and-sql-special-forms).

## Window function calls

A window function call has the syntax of a function call followed by an `OVER` clause:

~~~
<name> ( <arguments...> ) OVER <window>
<name> ( * ) OVER <window>
~~~

It represents the application of a window or aggregate function over a
subset ("window") of the rows selected by a query.

#### Typing rule

The operand and return types are determined like for regular [function calls](#function-calls-and-sql-special-forms).

## Explicit type coercions

Syntax:

~~~
<expr> :: <type>
CAST (<expr> AS <type>)
~~~

Evaluates the expression and converts the resulting value to the
specified type. An error is reported if the conversion is invalid.

For example: `CAST(now() AS DATE)`

Note that in many cases a type annotation is preferable to a type
coercion. See [type annotations](#explicitly-typed-expressions) for more
details.

#### Typing rule

The operand can have any type.
The result has the type specified in the `CAST` expression.

As a special case, if the operand is a literal, a constant expression
or a placeholder, the `CAST` type is used to guide the typing of the
operand. See [Revisiting SQL Typing in CockroachDB](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/) for more details.

## Collation expressions

Syntax:

~~~
<expr> COLLATE <collation>
~~~

Evaluates the expression and converts its result to a collated string
with the specified collation.

For example: `'a' COLLATE de`

#### Typing rule

The operand must have type `STRING`. The result has type `COLLATEDSTRING`.

## Array constructors

Syntax:

~~~
ARRAY[ <expr>, <expr>, ... ]
~~~

Evaluates to an array containing the specified values.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT ARRAY[1,2,3] AS a;
~~~

~~~
     a
-----------
  {1,2,3}
(1 row)
~~~

The data type of the array is inferred from the values of the provided
expressions. All the positions in the array must have the same data type.

If there are no expressions specified (empty array), or
all the values are `NULL`, then the type of the array must be
specified explicitly using a type annotation. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT ARRAY[]:::int[];
~~~

To convert the results of a subquery to an array, use [`ARRAY(...)`](#conversion-of-subquery-results-to-an-array) instead.

{{site.data.alerts.callout_success}}
- CockroachDB also recognizes the syntax `ARRAY(a, b, c)` as an alias for `ARRAY[a, b, c]`. This is an experimental, CockroachDB-specific SQL extension and may be removed in a later version of CockroachDB.
{{site.data.alerts.end}}

#### Typing rule

The operands must all have the same type.
The result has the array type with the operand type as element type.

## Tuple constructors

Syntax:

~~~
(<expr>, <expr>, ...)
ROW (<expr>, <expr>, ...)
~~~

Evaluates to a tuple containing the values of the provided expressions.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT ('x', 123, 12.3) AS a;
~~~

~~~
       a
----------------
  (x,123,12.3)
(1 row)
~~~

The data type of the resulting tuple is inferred from the values.
Each position in a tuple can have a distinct data type.

CockroachDB supports accessing the `Nth` element in a tuple as a single table cell using the syntax `(...).@N`. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT (t).@2 FROM (SELECT (1,'b',2.3) AS t);
~~~

~~~
  ?column?
------------
  b
(1 row)
~~~

CockroachDB also supports expanding all elements of a tuple as a single row in a table with the `(<tuple>).*` notation. This notation works as the inverse of the tuple-creating notation `(<table>.*)`. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH tuples AS (SELECT (t.*) AS tuple FROM (SELECT 1,'b',2.3) AS t(x,y,z))  -- Build the tuples, with labels
   SELECT (tuple).* FROM tuples;  -- Expands the tuples and restore the column labels
~~~

~~~
  x | y |  z
----+---+------
  1 | b | 2.3
(1 row)
~~~


#### Typing rule

The operands can have any type.
The result has a tuple type whose item types are the types of the operands.

## Explicitly typed expressions

Syntax:

~~~
<expr>:::<type>
ANNOTATE_TYPE(<expr>, <type>)
~~~

Evaluates to the given expression, requiring the expression to have
the given type. If the expression doesn't have the given type, an
error is returned.

Type annotations are specially useful to guide the arithmetic on
numeric values. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT (1 / 5):::INT;
~~~

~~~
ERROR: unsupported binary operator: <int> / <int> (desired <int>)
SQLSTATE: 22023
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT (1 / 5);
~~~

~~~
         ?column?
--------------------------
  0.20000000000000000000
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT (1 / 5)::INT;
  int8
--------
     0
(1 row)
~~~

Type annotations are also different from [cast expressions](#explicit-type-coercions) in
that they do not cause the value to be converted. For example,
`now()::DATE` converts the current timestamp to a date value (and
discards the current time), whereas `now():::DATE` triggers an error
message (that `now()` does not have type `DATE`).

See [Revisiting SQL Typing in CockroachDB](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/) for
more information about context-dependent typing.

#### Typing rule

The operand must be implicitly coercible to the given type.
The result has the given type.

## Subquery expressions

See [Subqueries]({% link {{ page.version.version }}/subqueries.md %}) for more details and performance best practices.

You can use any [selection query]({% link {{ page.version.version }}/selection-queries.md %}) as subquery.

### Scalar subqueries

Syntax:

~~~
( ... subquery ... )
~~~

Evaluates the subquery, asserts that it returns a single row and single column,
and then evaluates to the value of that single cell.

For example, the following query returns `TRUE` if there are more rows in table `users` than in table
`admins`:

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT (SELECT COUNT(*) FROM users) > (SELECT COUNT(*) FROM admins);
~~~

#### Typing rule

The operand must have a table type with only one column.
The result has the type of that single column.

### Existence test on the result of subqueries

Syntax:

~~~
EXISTS ( ... subquery ... )
NOT EXISTS ( ... subquery ... )
~~~

Evaluates the subquery and then returns `TRUE` or `FALSE` depending on
whether the subquery returned any row (for `EXISTS`) or didn't return
any row (for `NOT EXISTS`).

#### Typing rule

The operand can have any table type. The result has type `BOOL`.

### Conversion of subquery results to an array

Syntax:

~~~
ARRAY( ... subquery ... )
~~~

Evaluates the subquery and converts its results to an array.

To convert a list of scalar expressions to an array, use [`ARRAY[...]`](#array-constructors) instead.

## See also

- [Constants]({% link {{ page.version.version }}/sql-constants.md %})
- [Selection Queries]({% link {{ page.version.version }}/selection-queries.md %})
- [Table Expressions]({% link {{ page.version.version }}/table-expressions.md %})
- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %})
- [Subqueries]({% link {{ page.version.version }}/subqueries.md %})
