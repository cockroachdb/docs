---
title: DROP PROCEDURE
summary: The DROP PROCEDURE statement drops a stored procedure.
toc: true
keywords:
docs_area: reference.sql
---

{% include_cached new-in.html version="v23.2" %} The `DROP PROCEDURE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) drops a [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}).

## Required privileges

To drop a procedure, a user must have the `DROP` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the procedure.

## Synopsis

<div>
{% capture diagram_include %}cockroach-generated/{{ page.release_info.crdb_branch_name }}/sql-diagrams/drop_proc.html{% endcapture %}{% include {{ diagram_include }} %}
</div>

## Parameters

|    Parameter    |                  Description                  |
|-----------------|-----------------------------------------------|
| `proc_name`     | The name of one of more procedures to drop.   |
| `routine_param` | An optional list of the procedure parameters. |

## Examples

### Drop a stored procedure

The following statement drops the [`delete_earliest_histories` example procedure]({% link {{ page.version.version }}/stored-procedures.md %}#create-a-stored-procedure-using-pl-pgsql):

{% include_cached copy-clipboard.html %}
~~~ sql
DROP PROCEDURE delete_earliest_histories;
~~~

## See also

- [Stored Procedures]({% link {{ page.version.version }}/stored-procedures.md %})
- [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %})
- [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %})
- [`CALL`]({% link {{ page.version.version }}/call.md %})
- [`ALTER PROCEDURE`]({% link {{ page.version.version }}/alter-procedure.md %})