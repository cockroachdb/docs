---
title: docs: document pg_get_function_sqlbody function from PR #169716
summary: New Built-in Function
toc: true
docs_area: reference.sql
---

## New Built-in Function

### `pg_get_function_sqlbody()`

**Category**: System Info

**Signature**: `pg_get_function_sqlbody(func_oid OID) → STRING`

**Description**: Returns the SQL-standard body of the specified function, or `NULL` if the function was not defined with the SQL-standard inline body syntax. This function provides compatibility with PostgreSQL 14+ tools that probe `pg_catalog`.

CockroachDB does not yet support the SQL-standard inline body syntax (`RETURN expr` or `BEGIN ATOMIC ... END`), so this function currently returns `NULL` for all inputs, matching PostgreSQL's behavior for functions defined with the legacy `AS $$...$$` syntax.

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `func_oid` | `OID` | The object identifier of the function to query |

**Returns**: `STRING` - The SQL body of the function, or `NULL`

**Example**:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Query the SQL body of a user-defined function
SELECT pg_get_function_sqlbody('my_function'::regproc::oid);
~~~

~~~
pg_get_function_sqlbody
-------------------------
NULL
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Query with a built-in function
SELECT pg_get_function_sqlbody('upper'::regproc::oid);
~~~

~~~
pg_get_function_sqlbody
-------------------------
NULL
~~~

**See also**:
- [`pg_get_functiondef()`]({% link {{ page.version.version }}/functions-and-operators.md %}#system-info-functions) - Get the complete definition of a function
- [`pg_proc`]({% link {{ page.version.version }}/pg-catalog.md %}) - PostgreSQL system catalog for functions
- [User-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %})
