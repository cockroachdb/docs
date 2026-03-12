---
title: Stored Procedures
summary: A stored procedure consists of PL/pgSQL or SQL statements that can be issued with a single call.
toc: true
docs_area: reference.sql
---

A *stored procedure* is a database object consisting of [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}) or [SQL]({% link {{ page.version.version }}/sql-statements.md %}) statements that can be issued with a single [`CALL`]({% link {{ page.version.version }}/call.md %}) statement. This allows complex logic to be executed repeatedly within the database, which can improve performance and mitigate security risks.

{% include {{ page.version.version }}/sql/udfs-vs-stored-procs.md %}

## Structure

A stored procedure consists of a name, optional parameters, language, and procedure body.

~~~ sql
CREATE PROCEDURE procedure_name(parameters)
  LANGUAGE procedure_language
  AS procedure_body
~~~

- Each parameter can be a supported [SQL data type]({% link {{ page.version.version }}/data-types.md %}), [user-defined type]({% link {{ page.version.version }}/create-type.md %}), or the PL/pgSQL `REFCURSOR` type, when [declaring PL/pgSQL cursor variables]({% link {{ page.version.version }}/plpgsql.md %}#declare-cursor-variables).
- CockroachDB supports the `IN` (default), `OUT`, and `INOUT` modes for parameters. For an example, see [Create a procedure that uses `OUT` and `INOUT` parameters]({% link {{ page.version.version }}/create-procedure.md %}#create-a-stored-procedure-that-uses-out-and-inout-parameters).
- `LANGUAGE` specifies the language of the function body. CockroachDB supports the languages [`SQL`]({% link {{ page.version.version }}/sql-statements.md %}) and [`PLpgSQL`]({% link {{ page.version.version }}/plpgsql.md %}).
- The procedure body: 
	- Can be enclosed in single or dollar (`$$`) quotes. Dollar quotes are easier to use than single quotes, which require that you escape other single quotes that are within the procedure body.
	- Must conform to a [block structure]({% link {{ page.version.version }}/plpgsql.md %}#structure) if written in PL/pgSQL.

For details, see [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %}).

## Statement statistics

SQL statements executed within stored procedures are tracked in the SQL statistics subsystem and will appear in the [**SQL Activity** > **Statements**]({% link {{ page.version.version }}/ui-statements-page.md %}) page and the [**Insights**]({% link {{ page.version.version }}/ui-insights-page.md %}) page in the DB Console. This allows you to monitor the performance and execution statistics of individual statements within your procedures.

When the stored procedure is invoked as part of a transaction, the statements executed within the procedure will also appear in the [**Transaction details**]({% link {{ page.version.version }}/ui-transactions-page.md %}#transaction-details-page) in the **Statement Fingerprints** table.

{{site.data.alerts.callout_info}}
[Statement diagnostics]({% link {{ page.version.version }}/explain-analyze.md %}#debug-option) cannot be collected for statements executed inside stored procedures. You can request statement diagnostics for the top-level invocation of the procedure, and the resulting trace includes spans for each statement executed. However, there is no way to target statements executed inside the procedure with a statement diagnostics request. For details, refer to [Known limitations](#known-limitations).
{{site.data.alerts.end}}

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

Stored procedures have the following limitations:

{% include {{ page.version.version }}/known-limitations/stored-proc-limitations.md %}
{% include {{ page.version.version }}/known-limitations/routine-limitations.md %}

Also refer to the [PL/pgSQL known limitations]({% link {{ page.version.version }}/plpgsql.md %}#known-limitations).

## See also

- [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %})
- [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %})
- [`CALL`]({% link {{ page.version.version }}/call.md %})
- [`ALTER PROCEDURE`]({% link {{ page.version.version }}/alter-procedure.md %})
- [`DROP PROCEDURE`]({% link {{ page.version.version }}/drop-procedure.md %})