---
title: Functions and Operators
summary: CockroachDB supports many built-in functions, aggregate functions, and operators.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

CockroachDB supports the following SQL functions and operators for use in [scalar expressions](scalar-expressions.html).

{{site.data.alerts.callout_success}}In the <a href="cockroach-sql.html#help">built-in SQL shell</a>, use <code>\hf [function]</code> to get inline help about a specific function.{{site.data.alerts.end}}

## Special syntax forms

The following syntax forms are recognized for compatibility with the
SQL standard and PostgreSQL, but are equivalent to regular built-in
functions:

{% include {{ page.version.version }}/sql/function-special-forms.md %}

## Function volatility

A function's _volatility_ is a promise to the [optimizer](cost-based-optimizer.html) about the behavior of the function.

Type   | Description | Examples
-------|-------------|----------
Volatile | The function can modify the state of the database and is not guaranteed to return the same results given the same arguments in any context. | `random`, `crdb_internal.force_error`, `nextval`, `now`
Stable | The function is guaranteed to return the same results given the same arguments whenever it is evaluated within the same statement. The optimizer can optimize multiple calls of the function to a single call. | `current_timestamp`, `current_date`
Immutable | The function does not depend on configuration settings and is guaranteed to return the same results given the same arguments in any context.  The optimizer can pre-evaluate the function when a query calls it with constant arguments. | `log`, `from_json`
Leakproof | The function does not depend on configuration settings and is guaranteed to return the same results given the same arguments in any context. In addition, no information about the arguments is conveyed except via the return value. Any function that might throw an error depending on the values of its arguments is not leakproof. Leakproof is strictly stronger than Immutable. | Integer [comparison](#comparison-functions)

## Conditional and function-like operators

The following table lists the operators that look like built-in
functions but have special evaluation rules:

 Operator | Description
----------|-------------
 `ANNOTATE_TYPE(...)` | [Explicitly Typed Expression](scalar-expressions.html#explicitly-typed-expressions)
 `ARRAY(...)` | [Conversion of Subquery Results to An Array](scalar-expressions.html#conversion-of-subquery-results-to-an-array)
 `ARRAY[...]` | [Conversion of Scalar Expressions to An Array](scalar-expressions.html#array-constructors)
 `CAST(...)` | [Type Cast](scalar-expressions.html#explicit-type-coercions)
 `COALESCE(...)` | [First non-NULL expression with Short Circuit](scalar-expressions.html#coalesce-and-ifnull-expressions)
 `EXISTS(...)` | [Existence Test on the Result of Subqueries](scalar-expressions.html#existence-test-on-the-result-of-subqueries)
 `IF(...)` | [Conditional Evaluation](scalar-expressions.html#if-expressions)
 `IFNULL(...)` | Alias for `COALESCE` restricted to two operands
 `NULLIF(...)` | [Return `NULL` conditionally](scalar-expressions.html#nullif-expressions)
 `ROW(...)` | [Tuple Constructor](scalar-expressions.html#tuple-constructors)

## Built-in functions

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-22.1/docs/generated/sql/functions.md %}

## Aggregate functions

For examples showing how to use aggregate functions, see [the `SELECT` clause documentation](select-clause.html#aggregate-functions).

{{site.data.alerts.callout_info}}
Non-commutative aggregate functions are sensitive to the order in which the rows are processed in the surrounding [`SELECT` clause](select-clause.html#aggregate-functions). To specify the order in which input rows are processed, you can add an [`ORDER BY`](order-by.html) clause within the function argument list. For examples, see the [`SELECT` clause](select-clause.html#order-aggregate-function-input-rows-by-column) documentation.
{{site.data.alerts.end}}

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-22.1/docs/generated/sql/aggregates.md %}

## Window functions

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-22.1/docs/generated/sql/window_functions.md %}

## Operators

The following table lists all CockroachDB operators from highest to lowest precedence, i.e., the order in which they will be evaluated within a statement. Operators with the same precedence are left associative. This means that those operators are grouped together starting from the left and moving right.

| Order of Precedence | Operator | Name | Operator Arity |
| ------------------- | -------- | ---- | -------------- |
| 1 | `.` | Member field access operator | binary |
| 2 | `::` | [Type cast](scalar-expressions.html#explicit-type-coercions) | binary |
| 3 | `-` | Unary minus | unary (prefix) |
|   | `~` | Bitwise not | unary (prefix) |
| 4 | `^` | Exponentiation | binary |
| 5 | `*` | Multiplication | binary |
|   | `/` | Division | binary |
|   | `//` | Floor division | binary |
|   | `%` | Modulo | binary |
| 6 | `+` | Addition | binary |
|   | `-` | Subtraction | binary |
| 7 | `<<` | Bitwise left-shift | binary |
|   | `>>` | Bitwise right-shift | binary |
| 8 | `&` | Bitwise AND | binary |
| 9 | `#` | Bitwise XOR | binary |
| 10 | <code>&#124;</code> | Bitwise OR | binary |
| 11 | <code>&#124;&#124;</code> | Concatenation | binary |
|    | `< ANY`, ` SOME`, ` ALL` | [Multi-valued] "less than" comparison | binary |
|    | `> ANY`, ` SOME`, ` ALL` | [Multi-valued] "greater than" comparison | binary |
|    | `= ANY`, ` SOME`, ` ALL` | [Multi-valued] "equal" comparison | binary |
|    | `<= ANY`, ` SOME`, ` ALL` | [Multi-valued] "less than or equal" comparison | binary |
|    | `>= ANY`, ` SOME`, ` ALL` | [Multi-valued] "greater than or equal" comparison | binary |
|    | `<> ANY` / `!= ANY`, `<> SOME` / `!= SOME`, `<> ALL` / `!= ALL` | [Multi-valued] "not equal" comparison | binary |
|    | `[NOT] LIKE ANY`, `[NOT] LIKE SOME`, `[NOT] LIKE ALL` | [Multi-valued] `LIKE` comparison | binary |
|    | `[NOT] ILIKE ANY`, `[NOT] ILIKE SOME`, `[NOT] ILIKE ALL` | [Multi-valued] `ILIKE` comparison | binary |
|    |  `->` | Access a JSONB field, returning a JSONB value. | binary |
|    |  `->>` | Access a JSONB field, returning a string. | binary |
|    |  `@>` | Tests whether the left JSONB field contains the right JSONB field. | binary |
|    |  `>@` | Tests whether the left JSONB field is contained by the right JSONB field. | binary |
|    |  `#>` | Access a JSONB field at the specified path, returning a JSONB value. | binary |
|    |  `#>>` | Access a JSONB field at the specified path, returning a string. | binary |
|    |  `?` | Does the key or element string exist within the JSONB value? | binary |
|    |  `?&` | Do all the key or element strings exist within the JSONB value? | binary |
|    |  <code>?&#124;</code> | Do any of the key or element strings exist within the JSONB value?  | binary |
| 12 | `[NOT] BETWEEN` | Value is [not] within the range specified | binary |
|    | `[NOT] BETWEEN SYMMETRIC` | Like `[NOT] BETWEEN`, but in non-sorted order. For example, whereas `a BETWEEN b AND c` means `b <= a <= c`, `a BETWEEN SYMMETRIC b AND c` means `(b <= a <= c) OR (c <= a <= b)`. | binary |
|    | `[NOT] IN` | Value is [not] in the set of values specified | binary |
|    | `[NOT] LIKE` | Matches [or not] LIKE expression, case sensitive  | binary |
|    | `[NOT] ILIKE` | Matches [or not] LIKE expression, case insensitive | binary |
|    | `[NOT] SIMILAR` | Matches [or not] SIMILAR TO regular expression | binary |
|    | `~` | Matches regular expression, case sensitive | binary |
|    | `!~` | Does not match regular expression, case sensitive | binary |
|    | `~*` | Matches regular expression, case insensitive | binary |
|    | `!~*` | Does not match regular expression, case insensitive | binary |
| 13 | `=` | Equal | binary |
|    | `<` | Less than | binary |
|    | `>` | Greater than | binary |
|    | `<=` | Less than or equal to | binary |
|    | `>=` | Greater than or equal to | binary |
|    | `!=`, `<>` | Not equal | binary |
| 14 | `IS [DISTINCT FROM]` | Equal, considering `NULL` as value | binary |
|    | `IS NOT [DISTINCT FROM]` | `a IS NOT b` equivalent to `NOT (a IS b)` | binary |
|    | `ISNULL`, `IS UNKNOWN` , `NOTNULL`, `IS NOT UNKNOWN` | Equivalent to `IS NULL` / `IS NOT NULL` | unary (postfix) |
|    | `IS NAN`, `IS NOT NAN` | [Comparison with the floating-point NaN value](scalar-expressions.html#comparison-with-nan) | unary (postfix) |
|    | `IS OF(...)` | Type predicate | unary (postfix)
| 15 | `NOT` | [Logical NOT](scalar-expressions.html#logical-operators) | unary |
| 16 | `AND` | [Logical AND](scalar-expressions.html#logical-operators) | binary |
| 17 | `OR` | [Logical OR](scalar-expressions.html#logical-operators) | binary |

[Multi-valued]: scalar-expressions.html#multi-valued-comparisons

### Supported operations

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-22.1/docs/generated/sql/operators.md %}

<!--
## `CAST()`

there are three syntaxes for dates: `'2016-01-01'::date`, `CAST('2016-01-01' AS DATE)`, and `DATE '2016-01-01'`. the docs should probably prefer the latter form

the `CAST()` function should get its own documentation somewhere; I’m not sure if it needs to be mentioned again in the date section. The `::` form should probably only be mentioned as an alternative to `CAST()`
-->
