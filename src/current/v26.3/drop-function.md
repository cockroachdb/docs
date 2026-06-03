---
title: DROP FUNCTION
summary: The DROP FUNCTION statement drops a user-defined function from a database.
toc: true
keywords:
docs_area: reference.sql
---

The `DROP FUNCTION` [statement]({% link {{ page.version.version }}/sql-statements.md %}) removes one or more [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) from a database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

To drop a function, the user must be the owner of the function.

## Synopsis

<div>
{% capture diagram_include %}cockroach-generated/release-26.3/sql-diagrams/drop_func.html{% endcapture %}{% include {{ diagram_include }} %}
</div>

## Parameters

Parameter | Description
----------|------------
`func_name` | The name of one of more functions to drop.
`func_params_list` | An optional list of the function parameters.

## See also

- [User-Defined Functions]({% link {{ page.version.version }}/user-defined-functions.md %})
- [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %})
- [`ALTER FUNCTION`]({% link {{ page.version.version }}/alter-function.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
