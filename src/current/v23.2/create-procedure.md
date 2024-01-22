---
title: CREATE PROCEDURE
summary: The CREATE PROCEDURE statement creates a stored procedure.
toc: true
keywords:
docs_area: reference.sql
---

{% include_cached new-in.html version="v23.2" %} The `CREATE PROCEDURE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) defines a [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}).

## Required privileges

- To define a procedure, a user must have [`CREATE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the schema of the procedure.
- To define a procedure with a [user-defined type]({% link {{ page.version.version }}/create-type.md %}), a user must have [`USAGE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the user-defined type.
- To resolve a procedure, a user must have at least the [`USAGE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the schema of the procedure.
- To [call a procedure]({% link {{ page.version.version }}/call.md %}), a user must have [`EXECUTE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the procedure.
- At procedure definition and execution time, a user must have privileges on all the objects referenced in the procedure body. Privileges on referenced objects can be revoked and later procedure calls can fail due to lack of permission.

If you grant `EXECUTE` privilege as a default privilege at the database level, newly created procedures inherit that privilege from the database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_proc.html %}
</div>

## Parameters

|       Parameter       |                                                                   Description                                                                   |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `routine_create_name` | The name of the procedure.                                                                                                                      |
| `routine_param`       | A comma-separated list of procedure parameters.                                                                                                                          |
| `routine_body_str`   | The body of the procedure. For allowed contents, see [Stored Procedures]({% link {{ page.version.version }}/stored-procedures.md %}#structure). |

## Examples

The following are examples of basic stored procedures. For a more detailed example of a stored procedure, see [Create a stored procedure using PL/pgSQL]({% link {{ page.version.version }}/stored-procedures.md %}#create-a-stored-procedure-using-pl-pgsql).

### Create a stored procedure that uses a composite-type variable

Create a [composite variable]({% link {{ page.version.version }}/create-type.md %}#create-a-composite-data-type):

{% include_cached copy-clipboard.html %}
~~~
CREATE TYPE comp AS (x INT, y STRING);
~~~

Create the procedure, declaring the `comp` variable you created:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE proc() LANGUAGE PLpgSQL AS $$
  DECLARE
    v comp := ROW(1, 'foo');
  BEGIN
    RAISE NOTICE '%', v;
  END
  $$;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CALL proc();
~~~

~~~
NOTICE: (1,foo)
CALL
~~~

### Create a stored procedure that uses conditional logic

The following example uses [PL/pgSQL conditional statements]({% link {{ page.version.version }}/plpgsql.md %}#write-conditional-statements):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE proc(a INT, b INT) AS 
  $$
  DECLARE
    result INT;
  BEGIN
    IF a > b THEN
      RAISE NOTICE 'Condition met: a is greater than b';
    ELSE
      RAISE NOTICE 'Condition not met: a is not greater than b';
    END IF;
  END;
  $$ LANGUAGE PLpgSQL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CALL proc(1, 2);
~~~

~~~
NOTICE: Condition not met: a is not greater than b
CALL
~~~

### Create a stored procedure that uses a `WHILE` loop

The following example uses [PL/pgSQL loop statements]({% link {{ page.version.version }}/plpgsql.md %}#write-loops):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE arr_var() AS 
  $$
  DECLARE
    x INT[] := ARRAY[1, 2, 3, 4, 5];
    n INT;
    i INT := 1;
  BEGIN
    n := array_length(x, 1);
    WHILE i <= n LOOP
      RAISE NOTICE '%: %', i, x[i];
      i := i + 1;
    END LOOP;
  END
  $$ LANGUAGE PLpgSQL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CALL arr_var();
~~~

~~~
NOTICE: 1: 1
NOTICE: 2: 2
NOTICE: 3: 3
NOTICE: 4: 4
NOTICE: 5: 5
~~~

## See also

- [Stored Procedures]({% link {{ page.version.version }}/stored-procedures.md %})
- [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %})
- [`CALL`]({% link {{ page.version.version }}/call.md %})
- [`ALTER PROCEDURE`]({% link {{ page.version.version }}/alter-procedure.md %})
- [`DROP PROCEDURE`]({% link {{ page.version.version }}/drop-procedure.md %})