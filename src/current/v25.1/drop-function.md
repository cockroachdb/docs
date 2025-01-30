---
title: DROP FUNCTION
summary: The DROP FUNCTION statement drops a user-defined function from a database.
toc: true
keywords:
docs_area: reference.sql
---

The `DROP FUNCTION` [statement]({{ page.version.version }}/sql-statements.md) removes one or more [user-defined functions]({{ page.version.version }}/user-defined-functions.md) from a database.


## Required privileges

To drop a function, a user must have the `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the function.

## Synopsis

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`func_name` | The name of one of more functions to drop.
`func_params_list` | An optional list of the function parameters.

## See also

- [User-Defined Functions]({{ page.version.version }}/user-defined-functions.md)
- [`CREATE FUNCTION`]({{ page.version.version }}/create-function.md)
- [`ALTER FUNCTION`]({{ page.version.version }}/alter-function.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)