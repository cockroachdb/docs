---
title: Functions and Operators
summary: CockroachDB supports many built-in functions, aggregate functions, and operators.
toc: true
---

## Built-in Functions

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-1.0/docs/generated/sql/functions.md %}

## Aggregate Functions

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-1.0/docs/generated/sql/aggregates.md %}

## Operators

The following table lists all CockroachDB operators from highest to lowest precedence, i.e., the order in which they will be evaluated within a statement. Operators with the same precedence are left associative. This means that those operators are grouped together starting from the left and moving right.

| Order of Precedence | Operator | Name | Operator Arity |
| ------------------- | -------- | ---- | -------------- |
| 1 | `.` | Member field access operator | binary |
| 2 | `::` | Type cast | binary |
| 3 | `-` | Unary minus | unary |
|  | `~` | Bitwise not | unary |
| 4 | `^` | Exponentiation | binary |
| 5 | `*` | Multiplication | binary |
|  | `/` | Division | binary |
|  | `//` | Floor division | binary |
|  | `%` | Modulo | binary |
| 6 | `+` | Addition | binary |
|  | `-` | Subtraction | binary |
| 7 | `<<` | Bitwise left-shift | binary |
|  | `>>` | Bitwise right-shift | binary |
| 8 | `&` | Bitwise and | binary |
| 9 | `#` | Bitwise xor | binary |
| 10 | <code>&#124;</code> | Bitwise or | binary |
| 11 | <code>&#124;&#124;</code> | Concatenation | binary |
| 12 | `[NOT] BETWEEN` | Value is [not] within the range specified | binary |
|  | `[NOT] IN` | Value is [not] in the set of values specified | binary |
|  | `[NOT] LIKE` | Matches [or not] LIKE expression, case sensitive  | binary |
|  | `[NOT] ILIKE` | Matches [or not] LIKE expression, case insensitive | binary |
|  | `[NOT] SIMILAR` | Matches [or not] SIMILAR TO regular expression | binary |
|  | `~` | Matches regular expression, case sensitive | binary |
|  | `!~` | Does not match regular expression, case sensitive | binary |
|  | `~*` | Matches regular expression, case insensitive | binary |
|  | `!~*` | Does not match regular expression, case insensitive | binary |
| 13 | `=` | Equal | binary |
|  | `<` | Less than | binary |
|  | `>` | Greater than | binary |
|  | `<=` | Less than or equal to | binary |
|  | `>=` | Greater than or equal to | binary |
|  | `!=`, `<>` | Not equal | binary |
| 14 | `IS` | Value identity | binary |
| 15 | `NOT` | Logical NOT | unary |
| 16 | `AND` | Logical AND | binary |
| 17 | `OR` | Logical OR | binary |

### Supported Operations

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-1.0/docs/generated/sql/operators.md %}

<!--
## `CAST()`

there are three syntaxes for dates: `'2016-01-01'::date`, `CAST('2016-01-01' AS DATE)`, and `DATE '2016-01-01'`. the docs should probably prefer the latter form

the `CAST()` function should get its own documentation somewhere; I’m not sure if it needs to be mentioned again in the date section. The `::` form should probably only be mentioned as an alternative to `CAST()`
-->
