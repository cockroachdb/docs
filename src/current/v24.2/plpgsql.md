---
title: PL/pgSQL
summary: PL/pgSQL is a procedural language that you can use within user-defined functions and stored procedures.
toc: true
docs_area: reference.sql
---

{% include enterprise-feature.md %}

[PL/pgSQL](https://www.postgresql.org/docs/16/plpgsql-overview.html) is a procedural language that you can use within [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) and [stored procedures]({% link {{ page.version.version }}/stored-procedures.md %}) in CockroachDB. 

In contrast to [SQL statements]({% link {{ page.version.version }}/sql-statements.md %}), which are issued one-by-one from the client to the database, PL/pgSQL statements are encapsulated in a [block structure](#structure) and executed on the database side, thus reducing network latency. PL/pgSQL enables more complex functionality than standard SQL, including [conditional statements](#write-conditional-statements), [loops](#write-loops), and [exception handling](#report-messages-and-handle-exceptions).

This page describes PL/pgSQL [structure](#structure) and [syntax](#syntax), and includes [examples](#examples) of functions and procedures that use PL/pgSQL.

## Structure

A function or procedure that uses PL/pgSQL must specify the `PLpgSQL` language within the [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %}) or [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %}) statement:

~~~ sql
CREATE [ PROCEDURE | FUNCTION ] ...
  LANGUAGE PLpgSQL
  ...
~~~

PL/pgSQL is block-structured. A block contains the following:

- An optional `DECLARE` section that contains [variable declarations](#declare-a-variable) for all variables that are used within the block and are not defined as [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %}) or [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %}) parameters.
- A [function]({% link {{ page.version.version }}/user-defined-functions.md %}) or [procedure]({% link {{ page.version.version }}/stored-procedures.md %}) body, consisting of statements enclosed by `BEGIN` and `END`.
- An optional `EXCEPTION` section for [catching and handling `SQLSTATE` errors](#write-exception-logic).

At the highest level, a PL/pgSQL block looks like the following:

~~~ sql
[ DECLARE 
	declarations ]
  BEGIN
	statements
  END
~~~

PL/pgSQL blocks can be nested. An optional label can be placed above each block. Block labels can be targeted by [`EXIT` statements](#exit).

~~~ sql
[ <<outer_block>> ]
  [ DECLARE 
    declarations ]
  BEGIN
    statements
    [ <<inner_block>> ]
    [ DECLARE 
      declarations ]
    BEGIN
      statements
    END;
  END
~~~

When you create a function or procedure, you can enclose the entire PL/pgSQL block in dollar quotes (`$$`). Dollar quotes are not required, but are easier to use than single quotes, which require that you escape other single quotes that are within the function or procedure body.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PROCEDURE name(parameters)
  LANGUAGE PLpgSQL
  AS $$
  [ DECLARE
	declarations ]
  BEGIN
	statements
  END
  $$;
~~~

For complete examples, see [Create a user-defined function using PL/pgSQL](#create-a-user-defined-function-using-pl-pgsql) and [Create a stored procedure using PL/pgSQL](#create-a-stored-procedure-using-pl-pgsql).

## Syntax

### Declare a variable

`DECLARE` specifies all variable definitions that are used in a block.
~~~ sql
DECLARE
	variable_name [ CONSTANT ] data_type [ := expression ];
~~~

- `variable_name` is an arbitrary variable name.
- `data_type` can be a supported [SQL data type]({% link {{ page.version.version }}/data-types.md %}), [user-defined type]({% link {{ page.version.version }}/create-type.md %}), or the PL/pgSQL `REFCURSOR` type, when declaring [cursor](#declare-cursor-variables) variables.
- `CONSTANT` specifies that the variable cannot be [reassigned](#assign-a-result-to-a-variable), ensuring that its value remains constant within the block.
- `expression` is an [expression](https://www.postgresql.org/docs/16/plpgsql-expressions.html) that provides an optional default value for the variable. Default values are evaluated every time a block is entered in a function or procedure.

For example:

~~~ sql
DECLARE
	a VARCHAR;
	b INT := 0;
~~~

#### Declare cursor variables

A *cursor* encapsulates a selection query and is used to fetch the query results for a subset of rows.

You can declare *forward-only* cursors as variables to be used within [PL/pgSQL blocks](#structure). These must have the PL/pgSQL `REFCURSOR` data type. For example:

~~~ sql
DECLARE
	c REFCURSOR;
~~~

You can bind a cursor to a selection query within the declaration. Use the `CURSOR FOR` syntax and specify the query:

~~~ sql
DECLARE
	c CURSOR FOR query;
~~~

Note that the preceding cursor still has the `REFCURSOR` data type.

For information about opening and using cursors, see [Open and use cursors](#open-and-use-cursors).

### Assign a result to a variable

Use the PL/pgSQL `INTO` clause to assign a result of a [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) or mutation ([`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`UPDATE`]({% link {{ page.version.version }}/update.md %}), [`DELETE`]({% link {{ page.version.version }}/delete.md %})) statement to a specified variable. The optional `STRICT` clause specifies that the statement must return exactly one row; otherwise, the function or procedure will error. This behavior can be enabled by default using the [`plpgsql_use_strict_into`]({% link {{ page.version.version }}/session-variables.md %}#plpgsql-use-strict-into) session setting.

~~~ sql
SELECT expression INTO [ STRICT ] target FROM ...;
~~~

~~~ sql
[ INSERT | UPDATE | DELETE ] ... RETURNING expression INTO [ STRICT ] target;
~~~

- `expression` is an [expression](https://www.postgresql.org/docs/16/plpgsql-expressions.html) that defines the result to be assigned to the variable.
- `target` is an arbitrary variable name. This can be a list of comma-separated variables, or a single [composite variable]({% link {{ page.version.version }}/create-type.md %}#create-a-composite-data-type).

For example, given a table `t` with `INT` column `col`:

The following [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}) inserts a specified value `x` into the table, and the `INTO` clause assigns the [returned value]({% link {{ page.version.version }}/insert.md %}#insert-and-return-values) to `i`.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE p(x INT) AS $$
	DECLARE
	    i INT;
	BEGIN
	    INSERT INTO t (col) VALUES (x) RETURNING col INTO i;
	    RAISE NOTICE 'New Row: %', i;
	END 
$$ LANGUAGE PLpgSQL;
~~~

When the procedure is called, it inserts the specified integer into a new row in the table, and prints a [`NOTICE`](#report-messages-and-handle-exceptions) message that contains the inserted value:

{% include_cached copy-clipboard.html %}
~~~ sql
CALL p(2);
~~~

~~~
NOTICE: New Row: 2
CALL
~~~

The following [user-defined function]({% link {{ page.version.version }}/user-defined-functions.md %}) uses the `max` [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#aggregate-functions) to find the maximum `col` value in table `t`, and assigns the result to `i`.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION f() RETURNS INT AS $$
	DECLARE
		i INT;
	BEGIN
		SELECT max(col) INTO i FROM t;
		RETURN i;
	END
$$ LANGUAGE PLpgSQL;
~~~

When the function is invoked, it displays the maximum value that was inserted into the table:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT f();
~~~

~~~
  f
-----
  2
~~~

For a more extensive example of variable assignment, see [Create a stored procedure using PL/pgSQL](#create-a-stored-procedure-using-pl-pgsql).

### Write conditional statements

Use `IF` syntax to execute statements conditionally. PL/pgSQL understands several forms of `IF` statements.

`IF ... THEN` executes statements only if a boolean condition is true.

~~~ sql
IF condition THEN 
		statements;
  END IF;
~~~

For an example, see [Create a stored procedure that uses conditional logic]({% link {{ page.version.version }}/create-procedure.md %}#create-a-stored-procedure-that-uses-conditional-logic).

`IF ... THEN ... ELSE` executes statements if a boolean condition is true. If the condition is false, the `ELSE` statements are executed.

~~~ sql
IF condition THEN
	statements;
  ELSE
	else_statements;
  END IF;
~~~

`IF ... THEN ... ELSIF` executes statements if a boolean condition is true. If the condition is false, each `ELSIF` condition is evaluated until one is true. The corresponding `ELSIF` statements are executed. If no `ELSIF` conditions are true, no statements are executed unless an `ELSE` clause is included, in which case the `ELSE` statements are executed.

~~~ sql
IF condition THEN
	statements;
  ELSIF elsif_condition THEN
	elsif_statements;
  [ ELSIF elsif_condition_n THEN
	elsif_statements_n; ]
  [ ELSE
	else_statements; ]
  END IF;
~~~

`IF`, `ELSE`, and `ELSIF` conditions are not required to execute statements. You can exclude any statements or add a placeholder `NULL` statement.

~~~ sql
IF condition THEN
	NULL;
  END IF;
~~~

For usage examples of conditional statements, see [Examples](#examples).

### Write loops

Write a loop to repeatedly execute statements.

On its own, `LOOP` executes statements infinitely.

~~~ sql
LOOP
	statements;
  END LOOP;
~~~

On its own, `WHILE` executes statements infinitely if a boolean condition is true. The statements repeat until the condition is false.

~~~ sql
WHILE condition LOOP
	statements;
  END LOOP;
~~~

For an example, see [Create a stored procedure that uses a `WHILE` loop]({% link {{ page.version.version }}/create-procedure.md %}#create-a-stored-procedure-that-uses-a-while-loop).

### Control execution flow

#### `EXIT`

Add an `EXIT` statement to end a [loop](#write-loops). An `EXIT` statement can be combined with an optional `WHEN` boolean condition. 

~~~ sql
LOOP
	statements;
	EXIT [ WHEN condition ];
  END LOOP;
~~~

Add a label to an `EXIT` statement to target a block that has a matching label. An `EXIT` statement with a label can target either a loop or a [block](#structure). An `EXIT` statement inside a block must have a label.

The following `EXIT` statement will end the `label` block before the statements are executed.

~~~ sql
BEGIN
	<<label>>
	BEGIN
	  EXIT label;
	  statements;
	END;
  END
~~~

{{site.data.alerts.callout_info}}
If more than one PL/pgSQL block has a matching label, the innermost block is chosen.
{{site.data.alerts.end}}

In the following example, `EXIT` statement in the inner block is used to exit the stored procedure.

~~~ sql
CREATE PROCEDURE p() AS $$
  <<outer_block>>
  BEGIN
  	RAISE NOTICE '%', 'this is printed';
  	<<inner_block>>
  	BEGIN
	  	EXIT outer_block;
	  	RAISE NOTICE '%', 'this is not printed';
	  END;
  END
  $$ LANGUAGE PLpgSQL;
~~~

#### `RETURN`

Add a `RETURN` statement to a routine with an `OUT` parameter or `VOID` return type to exit the routine immediately.

~~~ sql
BEGIN
	...
	RETURN;
~~~

#### `CONTINUE`

Add a `CONTINUE` statement to end the current iteration of a [loop](#write-loops), skipping any statements below `CONTINUE` and beginning the next iteration of the loop. 

A `CONTINUE` statement can be combined with an optional `WHEN` boolean condition. In the following example, if a `WHEN` condition is defined and met, then `CONTINUE` causes the loop to skip the second group of statements and begin again.

~~~ sql
LOOP
	statements;
	CONTINUE [ WHEN condition ];
	statements;
  END LOOP;
~~~

### Open and use cursors

PL/pgSQL cursors can be used in the following scenarios:

- When [declared as variables](#declare-cursor-variables), cursors can be used within [PL/pgSQL blocks](#structure).
- When specified as a parameter in a [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %}) statement, cursors can be accessed externally from the stored procedure.

The cursor must first be opened within a PL/pgSQL block. If the cursor was declared without being bound to a query, you must specify a query using the `FOR` clause.

~~~ sql
BEGIN
	OPEN cursor_name [ FOR query ];
~~~

After opening the cursor, you can issue a PL/pgSQL `FETCH` statement to assign the result to one or more variables. 

~~~ sql
BEGIN
	...
	FETCH cursor_name INTO target;
~~~

{{site.data.alerts.callout_info}}
In PL/pgSQL, `FETCH` returns a single row. For example, `FETCH 10` returns the 10th row.
{{site.data.alerts.end}}

You can free up a cursor variable by closing the cursor:

~~~ sql
BEGIN
	...
	CLOSE cursor_name;
~~~

Cursors that are specified as parameters, rather than declared as variables, can be passed externally to and from PL/pgSQL blocks. 

For example, using the [`movr` dataset]({% link {{ page.version.version }}/movr.md %}) loaded by [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE get_rides(rides_cursor REFCURSOR) AS $$
  BEGIN
    OPEN rides_cursor FOR SELECT * FROM movr.rides;
  END
  $$ LANGUAGE PLpgSQL;
~~~

Within the same transaction that opened the cursor, use the SQL `FETCH` statement to retrieve query results for a specified number of rows:

~~~ sql
FETCH rows FROM cursor_name;
~~~

The [`CALL`]({% link {{ page.version.version }}/call.md %}) and `FETCH` statements have to be issued within the same transaction, or the cursor will not be found:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
  CALL get_rides('rides');
  FETCH 2 FROM rides;
  COMMIT;
~~~

~~~
                   id                  |   city    | vehicle_city |               rider_id               |              vehicle_id              |         start_address         |         end_address         |     start_time      |      end_time       | revenue
---------------------------------------+-----------+--------------+--------------------------------------+--------------------------------------+-------------------------------+-----------------------------+---------------------+---------------------+----------
  ab020c49-ba5e-4800-8000-00000000014e | amsterdam | amsterdam    | b3333333-3333-4000-8000-000000000023 | bbbbbbbb-bbbb-4800-8000-00000000000b | 58875 Bell Ports              | 50164 William Glens         | 2018-12-16 03:04:05 | 2018-12-17 20:04:05 |   13.00
  ab851eb8-51eb-4800-8000-00000000014f | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | bbbbbbbb-bbbb-4800-8000-00000000000b | 62025 Welch Alley             | 4092 Timothy Creek Apt. 39  | 2018-12-31 03:04:05 | 2019-01-02 03:04:05 |   32.00
~~~

### Report messages and handle exceptions

Use the `RAISE` statement to print messages for status or error reporting.

~~~ sql
RAISE level 'message' [, expressions ]
  [ USING option = 'expression' [, ... ] ];
~~~

{{site.data.alerts.callout_info}}
`RAISE` messages the client directly, and does not currently produce log output.
{{site.data.alerts.end}}

- `level` is the message severity. Possible values are `DEBUG`, `LOG`, `NOTICE`, `INFO`, `WARNING`, and `EXCEPTION`. Specify `EXCEPTION` to raise an error that aborts the current transaction.
- `message` is a message string to display.
- `expressions` is an optional, comma-separated list of [expressions](https://www.postgresql.org/docs/16/plpgsql-expressions.html) that provide values to replace any `%` placed within the message string. The number of expressions must match the number of `%` placeholders.
- `option` is a type of additional information to include. Possible values are `MESSAGE`, `DETAIL`, `HINT`, or `ERRCODE`. To specify `MESSAGE`, use the following alternate syntax: 

	~~~ sql
	RAISE level USING MESSAGE = 'message';
	~~~

- `expression` is an expression to display that corresponds to the specified `option`. If `ERRCODE` is the specified option, this must be a valid [`SQLSTATE` error code or name](https://www.postgresql.org/docs/16/errcodes-appendix.html).

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE raise_time() AS $$
  BEGIN
    RAISE NOTICE 'current timestamp: %', now()
	USING HINT = 'Call this procedure again for a different result';
  END
  $$ LANGUAGE PLpgSQL;
~~~

{% include_cached copy-clipboard.html %}
~~~
CALL raise_time();
~~~

~~~
NOTICE: current timestamp: 2024-01-05 23:09:08.0601+00
HINT: Call this procedure again for a different result
CALL
~~~

#### Write exception logic

Use an `EXCEPTION` statement to catch and handle specified errors. 

Any valid [`SQLSTATE` error code or name](https://www.postgresql.org/docs/16/errcodes-appendix.html) can be specified, except for Class 40 (transaction rollback) errors. Arbitrary user-defined `SQLSTATE` codes can also be specified.

If a specified error is caught, the exception handling statements are executed. Any unspecified errors are caught by `WHEN OTHERS`, except for `query_canceled` and `assert_failure`.

~~~ sql
EXCEPTION
	WHEN error THEN
		handle_exception;
	[ WHEN error_n THEN
		handle_exception_n; ]
	[ WHEN OTHERS THEN
		handle_other_exceptions; ]
~~~

`EXCEPTION` logic is included after the main body of a PL/pgSQL block. For example:

~~~ sql
BEGIN
	...
  EXCEPTION
    WHEN not_null_violation THEN
      RETURN 'not_null_violation';
    WHEN OTHERS THEN
      RETURN others;
  END
~~~

`WHEN` conditions are not required to execute statements. You can exclude any statements or add a placeholder `NULL` statement.

~~~ sql
EXCEPTION
	WHEN error THEN
		NULL;
~~~

### Control transactions

Use a `COMMIT` or `ROLLBACK` statement within a PL/pgSQL [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}) to finish the current transaction and automatically start a new one. 

- Any updates made within the previous transaction are either committed or rolled back, while [PL/pgSQL variables](#declare-a-variable) keep their values. 
- Execution of the stored procedure resumes in a new transaction with the statements immediately following the `COMMIT` or `ROLLBACK` statement.

~~~ sql
BEGIN
	statements
	[ COMMIT | ROLLBACK ]
~~~

`COMMIT` and `ROLLBACK` statements within PL/pgSQL blocks have the following requirements:

- They must be used inside a PL/pgSQL [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}).
{% comment %}- The procedure must be called directly in a `CALL` statement, or all of its ancestors must be stored procedures or `DO` blocks.{% endcomment %}
- They cannot be inside a [block](#structure) with an [`EXCEPTION`](#write-exception-logic) clause.
- The procedure must be called directly in a [`CALL`]({% link {{ page.version.version }}/call.md %}) SQL statement. It cannot be [called by another stored procedure](#call-a-procedure).
- The procedure must be called from an [implicit transaction]({% link {{ page.version.version }}/transactions.md %}#individual-statements); i.e., the call cannot be enclosed by [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %}) and [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}) SQL statements.

Statements that follow a `COMMIT` or `ROLLBACK` automatically start another PL/pgSQL transaction. If a transaction is running when the procedure ends, it is implicitly committed without having to be followed by a `COMMIT`.

~~~ sql
BEGIN
	...
	[ COMMIT | ROLLBACK ]
	statements
  END
~~~

Use one or more optional `SET TRANSACTION` statements to set the [priority, isolation level, timestamp, or read-only status]({% link {{ page.version.version }}/set-transaction.md %}#parameters) of a PL/pgSQL transaction. In PL/pgSQL, `SET TRANSACTION` statements **must** directly follow `COMMIT` or `ROLLBACK`, or another `SET TRANSACTION` statement; and must precede the other statements in the transaction.

~~~ sql
BEGIN
	...
	[ COMMIT | ROLLBACK ]
	[ SET TRANSACTION mode ]
	statements
~~~

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PROCEDURE p() LANGUAGE PLpgSQL AS
  $$
  BEGIN
    COMMIT;
    SET TRANSACTION PRIORITY HIGH;
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    RAISE NOTICE '%', current_setting('transaction_isolation');
    RAISE NOTICE '%', current_setting('transaction_priority');
  END
  $$;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CALL p();
~~~

~~~
NOTICE: read committed
NOTICE: high
CALL
~~~

Any PL/pgSQL transaction not preceded by a `SET TRANSACTION` statement uses the default settings.

### Call a procedure

Use a `CALL` statement to call a procedure from within a PL/pgSQL [function]({% link {{ page.version.version }}/user-defined-functions.md %}) or [procedure]({% link {{ page.version.version }}/stored-procedures.md %}).

~~~ sql
BEGIN
	CALL procedure(parameters);
~~~

A PL/pgSQL routine that calls a procedure should [declare a variable](#declare-a-variable) that will store the result of each of that procedure's `OUT` parameters. For example, given the procedure:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE output_one(OUT value INT) AS
  $$
  BEGIN
    value := 1;
  END
  $$ LANGUAGE PLpgSQL;
~~~

To call `output_one` within another procedure:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE output() AS
  $$
  DECLARE
    output_value INT;
  BEGIN
    CALL output_one(output_value);
    RAISE NOTICE 'Output value: %', output_value;
  END
  $$ LANGUAGE PLpgSQL;
~~~

A procedure with `OUT` parameters can only be called from a PL/pgSQL routine. For another example, see [Create a stored procedure that calls a procedure]({% link {{ page.version.version }}/create-procedure.md %}#create-a-stored-procedure-that-calls-a-procedure).

## Examples

### Create a user-defined function using PL/pgSQL

{% include {{ page.version.version }}/sql/udf-plpgsql-example.md %}

### Create a stored procedure using PL/pgSQL

{% include {{page.version.version}}/sql/movr-statements.md %}

{% include {{ page.version.version }}/sql/stored-proc-example.md %}

## Known limitations

{% include {{ page.version.version }}/known-limitations/plpgsql-limitations.md %}

## See also

- [Stored procedures]({% link {{ page.version.version }}/stored-procedures.md %})
- [User-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %})
- [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %})