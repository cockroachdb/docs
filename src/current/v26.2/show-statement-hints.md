---
title: SHOW STATEMENT HINTS
summary: The SHOW STATEMENT HINTS statement lists the statement hints for a SQL statement fingerprint.
toc: true
docs_area: reference.sql
---

The `SHOW STATEMENT HINTS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the [statement-level hints]({% link {{ page.version.version }}/cost-based-optimizer.md %}#statement-hints) that have been created for a specific SQL statement fingerprint using the `information_schema.crdb_rewrite_inline_hints()` and `information_schema.crdb_set_session_variable_hint()` [built-in functions]({% link {{ page.version.version }}/functions-and-operators.md %}#system-repair-functions).

## Required privileges

Users must have the [`VIEWCLUSTERMETADATA`]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) privilege to run `SHOW STATEMENT HINTS`.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_statement_hints.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`string_or_placeholder` | The SQL statement fingerprint to show hints for. This can be a string literal (such as `'SELECT * FROM users WHERE city = _'`) or a SQL parameter placeholder (such as `$1`) for use in prepared statements.

### Options

Option | Value | Description
-------|-------|------------
`DETAILS` | N/A | Include hint-specific information in JSON format.

## Response

The following fields are returned:

Column | Type | Description
-------|------|------------
`row_id` | `INT` | A unique ID.
`fingerprint` | `STRING` | The SQL statement fingerprint that the hint applies to.
`hint_type` | `STRING` | Hint type. `REWRITE INLINE HINTS` indicates a rewritten inline hint. `SET VARIABLE` indicates a session variable override.
`database` | `STRING` | The database the hint applies to. `NULL` if the hint applies to all databases.
`enabled` | `BOOL` | Whether the hint is enabled.
`created_at` | `TIMESTAMPTZ` | The timestamp when the hint was created.
`details` | `JSONB` | When the [`DETAILS`](#options) option is specified, hint-specific information in JSON format. For `REWRITE INLINE HINTS`, this includes the donor SQL fingerprint with hints that will be applied. For `SET VARIABLE`, this includes the session variable name and value.

## Examples

### Show hints for a statement

To show all hints for a specific statement fingerprint:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW STATEMENT HINTS FOR $$ SELECT * FROM users WHERE city = _ $$;
~~~

~~~
        row_id        |            fingerprint             |      hint_type       | database | enabled |          created_at
----------------------+------------------------------------+----------------------+----------+---------+--------------------------------
  1143470380756697089 | SELECT * FROM users WHERE city = _ | REWRITE INLINE HINTS | NULL     | t       | 2026-01-21 21:11:06.782818+00
(1 row)
~~~

### Show hints with detailed information

To include hint-specific details in the output:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW STATEMENT HINTS FOR $$ SELECT * FROM users WHERE city = _ $$ WITH DETAILS;
~~~

~~~
        row_id        |            fingerprint             |      hint_type       | database | enabled |          created_at           |                              details
----------------------+------------------------------------+----------------------+----------+---------+-------------------------------+--------------------------------------------------------------------
  1143470380756697089 | SELECT * FROM users WHERE city = _ | REWRITE INLINE HINTS | NULL     | t       | 2026-01-21 21:11:06.782818+00 | {"donorSql": "SELECT * FROM users@users_city_idx WHERE city = _"}
(1 row)
~~~

This example shows a `REWRITE INLINE HINTS` type hint. For a `SET VARIABLE` hint, the details would include the session variable name and value:

~~~
        row_id        |            fingerprint             | hint_type    | database | enabled |          created_at           |                       details
----------------------+------------------------------------+--------------+----------+---------+-------------------------------+------------------------------------------------------
  1167741942826958849 | SELECT * FROM users WHERE city = _ | SET VARIABLE | NULL     | t       | 2026-04-17 14:42:39.7001+00   | {"variableName": "vectorize", "variableValue": "on"}
(1 row)
~~~

## See also

- [Statement hints]({% link {{ page.version.version }}/cost-based-optimizer.md %}#statement-hints)
- [Index hints]({% link {{ page.version.version }}/table-expressions.md %}#force-index-selection)
- [Join hints]({% link {{ page.version.version }}/cost-based-optimizer.md %}#join-hints)
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
