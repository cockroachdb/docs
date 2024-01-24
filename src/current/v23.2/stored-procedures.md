---
title: Stored Procedures
summary: A stored procedure consists of PL/pgSQL or SQL statements that can be issued with a single call.
toc: true
key: sql-expressions.html
docs_area: reference.sql
---

{% include_cached new-in.html version="v23.2" %} A *stored procedure* is a database object consisting of [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}) or [SQL]({% link {{ page.version.version }}/sql-statements.md %}) statements that can be issued with a single [`CALL`]({% link {{ page.version.version }}/call.md %}) statement. This allows complex logic to be executed repeatedly within the database, which can improve performance and mitigate security risks.

{% include {{ page.version.version }}/sql/udfs-vs-stored-procs.md %}

## Structure

A stored procedure consists of a name, optional parameters, language, and procedure body.

~~~ sql
CREATE PROCEDURE procedure_name(parameters)
  LANGUAGE procedure_language
  AS procedure_body
~~~

- Each parameter can be a supported [SQL data type]({% link {{ page.version.version }}/data-types.md %}), [user-defined type]({% link {{ page.version.version }}/create-type.md %}), or the PL/pgSQL `REFCURSOR` type, when [declaring PL/pgSQL cursor variables]({% link {{ page.version.version }}/plpgsql.md %}#declare-cursor-variables).
- `LANGUAGE` specifies the language of the function body. CockroachDB supports the languages [`SQL`]({% link {{ page.version.version }}/sql-statements.md %}) and [`PLpgSQL`]({% link {{ page.version.version }}/plpgsql.md %}).
- The procedure body: 
	- Can be enclosed in single or dollar (`$$`) quotes. Dollar quotes are easier to use than single quotes, which require that you escape other single quotes that are within the procedure body.
	- Must conform to a [block structure]({% link {{ page.version.version }}/plpgsql.md %}#structure) if written in PL/pgSQL.

For details, see [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %}).

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

For more examples of stored procedure creation, see [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %}#examples).

### Create a stored procedure using PL/pgSQL

{% include {{ page.version.version }}/sql/stored-proc-example.md %}

### Alter a stored procedure

The following statement renames the [`delete_earliest_histories` example procedure]({% link {{ page.version.version }}/stored-procedures.md %}#create-a-stored-procedure-using-pl-pgsql) to `delete_histories`:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER PROCEDURE delete_earliest_histories RENAME TO delete_histories;
~~~

## Known limitations

- Stored procedures cannot call other stored procedures or [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}).
- Stored procedures do not support `OUT` and `INOUT` argument modes.
- [DDL statements]({% link {{ page.version.version }}/sql-statements.md %}#data-definition-statements) (e.g., `CREATE TABLE`, `CREATE INDEX`) cannot be used within a stored procedure body. 
- [Transactions]({% link {{ page.version.version }}/transactions.md %}) cannot be run within stored procedures.

Also refer to the [PL/pgSQL known limitations]({% link {{ page.version.version }}/plpgsql.md %}#known-limitations).

## See also

- [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %})
- [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %})
- [`CALL`]({% link {{ page.version.version }}/call.md %})
- [`ALTER PROCEDURE`]({% link {{ page.version.version }}/alter-procedure.md %})
- [`DROP PROCEDURE`]({% link {{ page.version.version }}/drop-procedure.md %})