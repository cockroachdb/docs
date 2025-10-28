---
title: SHOW STATEMENT HINTS
summary: The SHOW STATEMENT HINTS statement lists the injected hints for a SQL statement fingerprint.
toc: true
docs_area: reference.sql
---

The `SHOW STATEMENT HINTS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the [hint injection]({% link {{ page.version.version }}/cost-based-optimizer.md %}#hint-injection) rules that have been created for a specific SQL statement fingerprint using the `crdb_internal.inject_hint()` built-in function.

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
`row_id` | `INT` | A unique hint ID.
`fingerprint` | `STRING` | The SQL statement fingerprint that the hint applies to.
`hint_type` | `STRING` | The type of hint: `rewrite_inline_hints` is supported.
`created_at` | `TIMESTAMPTZ` | The timestamp when the hint was created.
`details` | `JSONB` | When the [`DETAILS`](#options) option is specified, hint-specific information in JSON format. For `rewrite_inline_hints`, this includes the SQL statement with hints that will be applied.

## Examples

### Show hints for a statement

To show all hints for a specific statement fingerprint:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW STATEMENT HINTS FOR 'SELECT * FROM users WHERE city = _';
~~~

~~~
        row_id        |            fingerprint             |      hint_type       |          created_at
----------------------+------------------------------------+----------------------+--------------------------------
  1143470380756697089 | SELECT * FROM users WHERE city = _ | rewrite_inline_hints | 2026-01-21 21:11:06.782818+00
(1 row)
~~~

### Show hints with detailed information

To include the donor SQL and other hint-specific details:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW STATEMENT HINTS FOR 'SELECT * FROM users WHERE city = _' WITH DETAILS;
~~~

~~~
        row_id        |            fingerprint             |      hint_type       |          created_at           |                              details
----------------------+------------------------------------+----------------------+-------------------------------+--------------------------------------------------------------------
  1143470380756697089 | SELECT * FROM users WHERE city = _ | rewrite_inline_hints | 2026-01-21 21:11:06.782818+00 | {"donorSql": "SELECT * FROM users@users_city_idx WHERE city = _"}
(1 row)
~~~

## See also

- [Hint injection]({% link {{ page.version.version }}/cost-based-optimizer.md %}#hint-injection)
- [Index hints]({% link {{ page.version.version }}/table-expressions.md %}#force-index-selection)
- [Join hints]({% link {{ page.version.version }}/cost-based-optimizer.md %}#join-hints)
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
