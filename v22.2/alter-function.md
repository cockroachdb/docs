---
title: ALTER FUNCTION
summary: The ALTER FUNCTION statement alters a user-defined function.
toc: true
keywords:
docs_area: reference.sql
---

The `ALTER FUNCTION` [statement](sql-statements.html) alters a [user-defined function](user-defined-functions.html).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Subcommands

Subcommand | Description
-----------|------------
`OWNER TO` | Change the [owner](owner-to.html) of a function.
`RENAME TO` | Change the name of a function.
`SET SCHEMA` | [Set schema](set-schema.html) for a function.

## Required privileges

To alter a function, a user must have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on a schema.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_func.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`function_with_argtypes` | The name of the function with optional function arguments to alter.
`name` | The new name of the function.
`role_spec` | The role to set as the owner of the function.
`schema_name` | The name of the new schema.

## See also

- [User-Defined Functions](user-defined-functions.html)
- [`CREATE FUNCTION`](create-function.html)
- [`DROP FUNCTION`](drop-function.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
