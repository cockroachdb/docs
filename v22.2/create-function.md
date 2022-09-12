---
title: CREATE FUNCTION
summary: The CREATE FUNCTION statement creates a user-defined function for a database.
toc: true
keywords:
docs_area: reference.sql
---

The `CREATE FUNCTION` [statement](sql-statements.html) creates a [user-defined function](user-defined-functions.html) for a database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

- To define a function, a user must have [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on a database.
- To define a function with a [user-defined type](create-type.html), a user must have `USAGE` privilege on a user-defined type.
- To resolve functions, a user must have at least the `USAGE` privilege on a schema.
- To call a function, a user must have `EXECUTE` privilege on the function.
- A user must have privileges on all the objects referenced in the function body at execution time. Privileges on referenced objects can be revoked and later function calls can fail due to lack of permission.

If you grant `EXECUTE` privilege as a default privilege at the database level, newly created functions inherit that privilege from the database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_func.html %}
</div>

## Parameters

Parameter | Description
----------|------------


## Example

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION sq(a INT) RETURNS INT AS 'SELECT a*a' LANGUAGE SQL;
SELECT sq(2);
~~~

~~~
  sq
-----
  4
(1 row)
~~~

## See also

- [User-Defined Functions](user-defined-functions.html)
- [`ALTER FUNCTION`](alter-function.html)
- [`DROP FUNCTION`](drop-function.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
