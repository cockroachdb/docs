---
title: CALL
summary: The CALL statement calls a stored procedure, executing the statements in the procedure body.
toc: true
keywords:
docs_area: reference.sql
---

The `CALL` [statement]({% link {{ page.version.version }}/sql-statements.md %}) invokes a [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}).

## Required privileges

To call a procedure, a user must have [`EXECUTE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the procedure.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/call.html %}
</div>

## Parameters

|   Parameter    |                 Description                 |
|----------------|---------------------------------------------|
| `proc_name`    | The name of the procedure to call.          |
| `param_values` | A comma-separated list of parameter values. |

## Examples

### Call a stored procedure

The following statement calls the [`delete_earliest_histories` example procedure]({% link {{ page.version.version }}/stored-procedures.md %}#create-a-stored-procedure-using-pl-pgsql), specifying 5 rows to delete and a `rides_left` cursor name:

{% include_cached copy-clipboard.html %}
~~~ sql
CALL delete_earliest_histories (5, 'rides_left');
~~~

~~~
NOTICE: Deleted ride 0a3d70a3-d70a-4d80-8000-000000000014 with timestamp 2019-01-02 03:04:05
NOTICE: Deleted ride 0b439581-0624-4d00-8000-000000000016 with timestamp 2019-01-02 03:04:05.001
NOTICE: Deleted ride 09ba5e35-3f7c-4d80-8000-000000000013 with timestamp 2019-01-02 03:04:05.002
NOTICE: Deleted ride 0fdf3b64-5a1c-4c00-8000-00000000001f with timestamp 2019-01-02 03:04:05.003
NOTICE: Deleted ride 049ba5e3-53f7-4ec0-8000-000000000009 with timestamp 2019-01-02 03:04:05.004
CALL
~~~

## See also

- [Stored Procedures]({% link {{ page.version.version }}/stored-procedures.md %})
- [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %})
- [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %})
- [`ALTER PROCEDURE`]({% link {{ page.version.version }}/alter-procedure.md %})
- [`DROP PROCEDURE`]({% link {{ page.version.version }}/drop-procedure.md %})