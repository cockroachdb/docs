---
title: DROP FUNCTION
summary: The DROP FUNCTION statement drops a user-defined function from a database.
toc: true
keywords:
docs_area: reference.sql
---

The `DROP FUNCTION` [statement](sql-statements.html) removes one or more [user-defined functions](user-defined-functions.html) from a database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

To drop a function, a user must have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the function.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_func.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`func_name` | The name of one of more functions to drop.
`func_args_list` | A list of the function arguments.

## See also

- [User-Defined Functions](user-defined-functions.html)
- [`CREATE FUNCTION`](create-function.html)
- [`ALTER FUNCTION`](alter-function.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
