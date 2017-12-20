---
title: Value Expressions
summary: Value expressions allow the computation of new values from basic parts.
toc: false
---

Most SQL statements can contain *value expressions* that compute new
values from data.  For example, in the query `SELECT ceil(price) FROM
items`, the expression `ceil(price)` computes the rounded-up value of
the values from the `price` column.

Value expressions produce values suitable to store in a single table
cell (one column of one row). They can be contrasted with
[table expressions](table-expressions.html), which produce results
structured as a table.

The following sections provide details on each of these options.

<div id="toc"></div>

## Constants

Constant expressions represent a simple value that doesn't change.
They are described further in section [SQL Constants](sql-constants.html).

## Column References

An expression in a query can refer to columns in the current data source in two ways:

- Using the name of the column, e.g., `price` in `SELECT price FROM
  items`.

  - If the name of a column is also a
  [SQL keyword](keywords-and-identifiers.html#keywords), the name
  must be appropriately quoted. For example: `SELECT "Default" FROM
  configuration`.

  - If the name is ambiguous (e.g., when joining across multiple
  tables), it is possible to disambiguate by prefixing the column
  name by the table name. For example, `SELECT items.price FROM
  items`.

- Using the ordinal position of the column. For example, `SELECT @1
  FROM items` selects the first column in `items`.

  *This is a CockroachDB SQL extension.*

  {{site.data.alerts.callout_danger}}
  Ordinal references should be used with care in production
  code! During schema updates, column ordinal positions can change and
  invalidate existing queries that use ordinal positions based on a
  previous version of the schema.
  {{site.data.alerts.end}}

## Unary and Binary Operations

An expression prefixed by a unary operator, or two expressions
separated by a binary operator, form a new expression.

CockroachDB supports the following operators:

| Operator | Description |
|----------|-------------|
| `-` (unary) | numeric negation |
| `+` (unary) | no-op, exists only for symmetry with unary `-` |
| `~` (unary) | 64-bit binary complement |
| `NOT` (unary) | boolean/logical negation |
| `+` | addition |
| `-` | substraction |
| `*` | multiplication |
| `/` | numeric division |
| `//` | division with rounding ("integer division") |
| `%`  | rest of division ("modulo") |
| `&`  | bitwise AND |
| `|`  | bitwise OR |
| `^`, `#`  | bitwise XOR |
| `<<` | binary shift left |
| `>>` | binary shift right |
| `~` `!~`, `~*`, `!~*` | match using regular expression |
| `||` | concatenation for strings or byte arrays |
| `<`, `>`, `<=`, `>=`, `<>`, `!=`, `IS` | comparison |
| `LIKE`, `ILIKE`, `SIMILAR TO` | match using string pattern |
| `IN` | test for value in set |

See also [this section over which data types are valid operands
for each operator](functions-and-operators.html#operators).

### Value Comparisons

The standard operators `<` (smaller than), `>` (greater than), `<=`
(lower than or equal to), `>=` (greater than or equal to), `=`
(equals), `<>` and `!=` (not equal to), `IS` (identical to), and `IS
NOT` (not identical to) can be applied to any pair of values from a
single data type, as well as some pairs of values from different data
types.

See also [this section over which data types are valid operands
for each operator](functions-and-operators.html#operators).

The following special rules apply:

- `NULL` is always ordered smaller than every other value, even itself.
- `NULL` is never equal to anything via `=`, even `NULL`. To check
  whether a value is `NULL`, use the `IS` operator or the conditional
  expression `IFNULL(..)`.

#### Typing rule

All comparisons accept any combination of argument types and result in type `BOOL`.

### Set Membership

Syntax:

~~~
<expr> IN <expr>
<expr> IN ( ... subquery ... )

<expr> NOT IN <expr>
<expr> NOT IN ( ... subquery ... )
~~~

Returns `TRUE` if and only if the value of the left operand is part of
the result of evaluating the right operand. In the subquery form, any
[selection clause](selection-clauses.html) can be used.

For example:

~~~sql
> SELECT a IN (1, 2, 3) FROM sometable;
> SELECT a IN (SELECT * FROM allowedvalues) FROM sometable;
> SELECT ('x', 123) IN (SELECT * FROM rows);
~~~

#### Typing rule

`IN` requires its right operand to be a homogenous tuple type and its left operand
to match the tuple element type. The result has type `BOOL`.

### String Pattern Matching

Syntax:

~~~
<expr> LIKE <expr>
<expr> ILIKE <expr>
<expr> NOT LIKE <expr>
<expr> NOT ILIKE <expr>
~~~

Evaluates both expressions as strings, then tests whether the string   on the left
matches the pattern given on the right. Returns `TRUE` if a match is found
or `FALSE` otherwise, or the inverted value for the `NOT` variants.

Patterns can contain `_` to match any single
character, or `%` to match any sequence of zero or more characters.
`ILIKE` causes the match to be tested case-insentively.

For example:

~~~sql
> SELECT 'monday' LIKE '%day' AS a, 'tuesday' LIKE 'tue_day' AS b, 'wednesday' ILIKE 'W%' AS c;
~~~
~~~
+------+------+------+
|  a   |  b   |  c   |
+------+------+------+
| true | true | true |
+------+------+------+
~~~

#### Typing rule

The operands must be either both `STRING` or both `BYTES`. The result has type `BOOL`.

### String Matching Using POSIX Regular Expressions

Syntax:

~~~
<expr> ~ <expr>
<expr> ~* <expr>
<expr> !~ <expr>
<expr> !~* <expr>
~~~

Evaluates both expressions as strings, then tests whether the string   on the left
matches the pattern given on the right. Returns `TRUE` if a match is found
or `FALSE` otherwise, or the inverted value for the  `!` variants.

The pattern is expressed using
[POSIX regular expression syntax](https://en.wikipedia.org/wiki/Regular_expression). Unlike
`LIKE` patterns, a regular expression is allowed to match anywhere
inside a string, not only at the beginning.

For example:

~~~sql
> SELECT 'monday' ~ 'onday' AS a, 'tuEsday' ~ 't[uU][eE]sday' AS b, 'wednesday' ~* 'W.*y' AS c;
~~~
~~~
+------+------+------+
|  a   |  b   |  c   |
+------+------+------+
| true | true | true |
+------+------+------+
~~~

#### Typing rule

The operands must be either both `STRING` or both `BYTES`. The result has type `BOOL`.

### String Matching Using SQL Regular Expressions

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

~~~sql
> SELECT 'monday' SIMILAR TO '_onday' AS a, 'tuEsday' SIMILAR TO 't[uU][eE]sday' AS b, 'wednesday' SIMILAR TO 'w%y' AS c;
~~~
~~~
+------+------+------+
|  a   |  b   |  c   |
+------+------+------+
| true | true | true |
+------+------+------+
~~~

#### Typing rule

The operands must be either both `STRING` or both `BYTES`. The result has type `BOOL`.

### Operator Precedence

CockroachDB uses the following grouping precedence of
operators in expressions:

| Level | Operators |
|-------|-----------|
| 1 | `~` (unary) |
| 2 | `-` (unary) |
| 3 | `*`, `/`, `//`, `%` |
| 4 | `+`, `-` (binary) |
| 5 | `<<`, `>>` |
| 6 | `&` |
| 7 | `^`, `#` |
| 8 | `|` |
| 9 | `||` |
| 10 | `IN`, `LIKE`, `ILIKE`, `SIMILAR TO`, `!~`, `!~*` `~*`, `~` (binary) |
| 11 | `<` `>` `=` `<=` `>=` `<>` `!=` |
| 12 | `IS` |
| 13 | `NOT` |

## Function Calls and SQL Special Forms

General syntax:

~~~
<name> ( <arguments...> )
~~~

A built-in function name followed by an opening parenthesis, followed
by a comma-separated list of expressions, followed by a closing
parenthesis.

This applies the named function to the arguments between
parentheses. When the function's namespace is not prefixed, the
[name resolution rules](sql-name-resolution.html) determine which
function is called.

See also [the separate section on supported built-in functions](functions-and-operators.html).

In addition, the following SQL special forms are also supported:

| Special form                                               | Equivalent to |
|------------------------------------------------------------|---------------|
| `EXTRACT(<part> FROM <value>)`                             | `extract("<part>", <value>)` |
| `EXTRACT_DURATION(<part> FROM <value>)`                    | `extract_duration("<part>", <value>)` |
| `OVERLAY(<text1> PLACING <text2> FROM <int1> FOR <int2>)`  | `overlay(<text1>, <text2>, <int1>, <int2>)` |
| `OVERLAY(<text1> PLACING <text2> FROM <int>)`              | `overlay(<text1>, <text2>, <int>)` |
| `POSITION(<text1> IN <text2>)`                             | `strpos(<text2>, <text1>)` |
| `SUBSTRING(<text> FROM <int1> FOR <int2>)`                 | `substring(<text>, <int1>, <int2>)` |
| `SUBSTRING(<text> FOR <int1> FROM <int2>)`                 | `substring(<text>, <int2>, <int1>)` |
| `SUBSTRING(<text> FOR <int>)`                              | `substring(<text>, 1, <int>)` |
| `SUBSTRING(<text> FROM <int>)`                             | `substring(<text>, <int>)` |
| `TRIM(<text1> FROM <text2>)`                               | `btrim(<text2>, <text1>)` |
| `TRIM(FROM <text>)`                                        | `btrim(<text>)` |
| `TRIM(<text1>, <text2>)`                                   | `btrim(<text1>, <text2>)` |
| `TRIM(LEADING <text1> FROM <text2>)`                       | `ltrim(<text2>, <text1>)` |
| `TRIM(LEADING FROM <text>)`                                | `ltrim(<text>)` |
| `TRIM(TRAILING <text1> FROM <text2>)`                      | `rtrim(<text2>, <text1>)` |
| `TRIM(TRAILING FROM <text>)`                               | `rtrim(<text>)` |
| `CURRENT_DATE`                                             | `current_date()` |
| `CURRENT_TIMESTAMP`                                        | `current_timestamp()` |

#### Typing rule

In general, a function call requires the arguments to be of the types
accepted by the function, and returns a value of the type determined
by the function.

However, the typing of function calls is complicated by the fact
SQL supports function overloading. [See our blog post for more details](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/).

## Subscripted Expressions

It is possible to access one item in an array value using the `[` ... `]` operator.

For example, if the name `a` refers to an array of 10
values, `a[3]` will retrieve the 3rd value. The first value has index
1.

If the index is smaller or equal to 0, or larger than the size of the array, then
the result of the subscripted expression is `NULL`.

#### Typing rule

The subscripted expression must have an array type; the index expression
must have type `INT`.  The result has the element type of the
subscripted expression.

## Conditional Expressions and Boolean Short-Circuit Operations

Expressions can test a conditional expression and, depending on whether
or which condition is satisfied, evaluate to one or more additional
operands.

These expression formats share the following property: some of their
operands are only evaluated if a condition is true. This matters
especially when an operand would be invalid otherwise. For example,
`IF(a=0, 0, x/a)` returns 0 if `a` is 0, and `x/a` otherwise.

### `IF` Expressions

Syntax:

~~~
IF ( <cond>, <expr1>, <expr2> )
~~~

Evaluates `<cond>`, then evaluates `<expr1>` if the condition is true,
or `<expr2>` otherwise.

#### Typing rule

The condition must have type `BOOL`, and the two remaining expressions
must have the same type. The result has the same type as the
expression that was evaluated.

### Simple `CASE` Expressions

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

#### Typing rule

The condition and the `WHEN` expressions must have the same type.
The `THEN` expressions and the `ELSE` expression, if any, must have the same type.
The result has the same type as the `THEN`/`ELSE` expressions.

### Searched `CASE` Expressions

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

#### Typing rule

All the `WHEN` expressions must have type `BOOL`.
The `THEN` expressions and the `ELSE` expression, if any, must have the same type.
The result has the same type as the `THEN`/`ELSE` expressions.

### `NULLIF` Expressions

Syntax:

~~~
NULLIF ( <expr1>, <expr2> )
~~~

Equivalent to: `IF ( <expr1> = <expr2>, NULL, <expr1> )`

#### Typing rule

Both operands must have the same type, which is also the type of the result.

### `COALESCE` and `IFNULL` Expressions

Syntax:

~~~
IFNULL ( <expr1>, <expr2> )
COALESCE ( <expr1> [, <expr2> [, <expr3> ] ...] )
~~~

`COALESCE` evaluates the first expression first. If its value is not
`NULL`, its value is returned directly. Otherwise, it returns the
result of applying `COALESCE` on the remaining expressions. If all the
expressions are `NULL`, `NULL` is returned.

`IFNULL(a, b)` is equivalent to `COALESCE(a, b)`.

#### Typing rule

The operands must have the same type, which is also the type of the result.

### `AND` and `OR`: Boolean Short-Circuit Comparisons

Syntax:

~~~
<expr1> AND <expr2>
<expr1> OR <expr2>
~~~

These operators compute the boolean AND or OR function of their
operands, using short-circuit evaluation:

- Both operators first evaluate their left operand.
- If the resulting value is `TRUE`, `OR` returns `TRUE` directly and
  does not evaluate its right operand (short circuit), whereas `AND`
  evaluates and returns the value of the right operand.
- If the resulting value of the left operand is `FALSE` or `NULL`, `AND`
  returns `FALSE` directly and does not evaluate its right operand,
  whereas `OR` evaluates and returns the value of the right operand.

#### Typing rule

The operands must have type `BOOL`. The result has type `BOOL`.

## Aggregate Expressions

An aggregate expression has the same syntax as a function call, with a special
case for `COUNT`:

~~~
<name> ( <arguments...> )
COUNT ( * )
~~~

The difference between aggregate expressions and function calls is
that the former use
[aggregate functions](functions-and-operators.html#aggregate-functions)
and can only appear in the list of rendered expressions in a
[`SELECT` clause](select.html).

An aggregate expression computes a combined value, depending on
which aggregate function is used, across all the rows currently
selected.

#### Typing rule

[The operand and return types are determined like for regular function calls](#function-calls-and-sql-special-forms).

## Window Function Calls

A window function call has the syntax of a function call followed by an `OVER` clause:

~~~
<name> ( <arguments...> ) OVER <window>
<name> ( * ) OVER <window>
~~~

It represents the application of a window or aggregate function over a
subset ("window") of the rows selected by a query.

#### Typing rule

[The operand and return types are determined like for regular function calls](#function-calls-and-sql-special-forms).

## Explicit Type Coercions

Syntax:

~~~
<expr> :: <type>
CAST (<expr> AS <type>)
~~~

Evaluates the expression and converts the resulting value to the
specified type. An error is reported if the conversion is invalid.

For example: `CAST(now() AS DATE)`

Note that in many cases a type annotation is preferrable to a type
coercion. See the section on
[type annotations](#explicitly-typed-expressions) below for more
details.

#### Typing rule

The operand can have any type.
The result has the type specified in the `CAST` expression.

As a special case, if the operand is a literal, a constant expression
or a placeholder, the `CAST` type is used to guide the typing of the
operand. [See our blog post for more details](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/).

## Collation Expressions

Syntax:

~~~
<expr> COLLATE <collation>
~~~

Evaluates the expression and converts its result to a collated string
with the specified collation.

For example: `'a' COLLATE de`

#### Typing rule

The operand must have type `STRING`. The result has type `COLLATEDSTRING`.

## Existence Test on the Result of Subqueries

Syntax:

~~~
EXISTS ( ... subquery ... )
NOT EXISTS ( ... subquery ... )
~~~

Evaluates the subquery and then returns `TRUE` or `FALSE` depending on
whether the subquery returned any row (for `EXISTS`) or didn't return
any row (for `NOT EXISTS`). Any [selection clause](selection-clauses.html)
can be used as subquery.

#### Typing rule

The operand can have any table type. The result has type `BOOL`.

## Scalar Subqueries

Syntax:

~~~
( ... subquery ... )
~~~

Evaluates the subquery, asserts that it returns a single row and single column,
and then evaluates to the value of that single cell. Any [selection clause](selection-clauses.html) can be used as subquery.

For example:

~~~sql
> SELECT (SELECT COUNT(*) FROM users) > (SELECT COUNT(*) FROM admins);
~~~

returns `TRUE` if there are more rows in table `users` than in table
`admins`.

#### Typing rule

The operand must have a table type with only one column.
The result has the type of that single column.

## Array Constructors

Syntax:

~~~
ARRAY[ <expr>, <expr>, ... ]
~~~

Evaluates to an array containing the specified values.

For example:

~~~sql
> SELECT ARRAY[1,2,3] AS a;
~~~
~~~
+---------+
|    a    |
+---------+
| {1,2,3} |
+---------+
~~~

The data type of the array is inferred from the values of the provided
expressions. All the positions in the array must have the same data type.

If there are no expressions specified (empty array), or
all the values are `NULL`, then the type of the array must be
specified explicitly using a type annotation. For example:

~~~sql
> SELECT ARRAY[]:::int[];
~~~

#### Typing rule

The operands must all have the same type.
The result has the array type with the operand type as element type.

## Tuple Constructor

Syntax:

~~~
(<expr>, <expr>, ...)
ROW (<expr>, <expr>, ...)
~~~

Evaluates to a tuple containing the values of the provided expressions.

For example:

~~~sql
> SELECT ('x', 123, 12.3) AS a;
~~~
~~~
+----------------+
|       a        |
+----------------+
| ('x',123,12.3) |
+----------------+
~~~

The data type of the resulting tuple is inferred from the values.
Each position in a tuple can have a distinct data type.

#### Typing rule

The operands can have any type.
The result has a tuple type whose item types are the types of the operands.

## Explicitly Typed Expressions

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

~~~sql
> SELECT (1 / 0):::FLOAT; --> +Inf
> SELECT (1 / 0);         --> error "division by zero"
> SELECT (1 / 0)::FLOAT;  --> error "division by zero"
~~~

Type annotations are also different from cast expressions (see above) in
that they do not cause the value to be converted. For example,
`now()::DATE` converts the current timestamp to a date value (and
discards the current time), whereas `now():::DATE` triggers an error
message (that `now()` does not have type `DATE`).

Check our blog for
[more information about context-dependent typing](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/).

#### Typing rule

The operand must be implicitly coercible to the given type.
The result has the given type.

## See Also

- [Constants](sql-constants.html)
- [Selection Clauses](selection-clauses.html)
- [Table Expressions](table-expressions.html)
- [Data Types](data-types.html)
