---
title: DROP PROCEDURE
summary: The DROP PROCEDURE statement drops a stored procedure.
toc: true
keywords:
docs_area: reference.sql
---

The `DROP PROCEDURE` [statement]({{ page.version.version }}/sql-statements.md) drops a [stored procedure]({{ page.version.version }}/stored-procedures.md).

## Required privileges

To drop a procedure, a user must have the `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the procedure.

## Synopsis

<div>
</div>

## Parameters

|    Parameter    |                  Description                  |
|-----------------|-----------------------------------------------|
| `proc_name`     | The name of one of more procedures to drop.   |
| `routine_param` | An optional list of the procedure parameters. |

## Examples

### Drop a stored procedure

The following statement drops the [`delete_earliest_histories` example procedure]({{ page.version.version }}/stored-procedures.md#create-a-stored-procedure-using-pl-pgsql):

~~~ sql
DROP PROCEDURE delete_earliest_histories;
~~~

## See also

- [Stored Procedures]({{ page.version.version }}/stored-procedures.md)
- [PL/pgSQL]({{ page.version.version }}/plpgsql.md)
- [`CREATE PROCEDURE`]({{ page.version.version }}/create-procedure.md)
- [`CALL`]({{ page.version.version }}/call.md)
- [`ALTER PROCEDURE`]({{ page.version.version }}/alter-procedure.md)