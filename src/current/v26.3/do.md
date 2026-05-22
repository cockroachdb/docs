---
title: DO
summary: The DO SQL statement executes a PL/pgSQL code block.
toc: true
keywords:
docs_area: reference.sql
---

The `DO` [statement]({% link {{ page.version.version }}/sql-statements.md %}) defines a code block that executes [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}) syntax.

## Required privileges

- To define a `DO` block with a [user-defined type]({% link {{ page.version.version }}/create-type.md %}), a user must have `USAGE` privilege on the user-defined type.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/do.html %}
</div>

## Parameters

|     Parameter      |         Description         |
|--------------------|-----------------------------|
| `routine_body_str` | The body of the code block. |

## Examples

### Declare a variable in a `DO` block

The following example uses the [PL/pgSQL `DECLARE` syntax]({% link {{ page.version.version }}/plpgsql.md %}#declare-a-variable) to declare variables to use in the code block.

{% include_cached copy-clipboard.html %}
~~~ sql
DO $$
DECLARE
    x INT := 10;
    y INT := 5;
    result INT;
BEGIN
    result := x + y;
    RAISE NOTICE 'The sum of % and % is %', x, y, result;
END $$;
~~~

~~~
NOTICE: The sum of 10 and 5 is 15
DO
~~~

### Use a loop in a `DO` block

The following example uses the [PL/pgSQL `WHILE` syntax]({% link {{ page.version.version }}/plpgsql.md %}#write-loops) to loop through several statements.

{% include_cached copy-clipboard.html %}
~~~ sql
DO $$
DECLARE
   counter INT := 1;
BEGIN
   WHILE counter <= 5 LOOP
       RAISE NOTICE 'Counter: %', counter;
       counter := counter + 1;
   END LOOP;
END $$;
~~~

~~~
NOTICE: Counter: 1
NOTICE: Counter: 2
NOTICE: Counter: 3
NOTICE: Counter: 4
NOTICE: Counter: 5
DO
~~~

### Use a common table expression in a `DO` block

The following example uses a [common table expression]({% link {{ page.version.version }}/common-table-expressions.md %}) in the body of the code block.

{% include_cached copy-clipboard.html %}
~~~ sql
DO $$
DECLARE
    sum_result INT;
BEGIN
    WITH numbers AS (
        SELECT generate_series(1, 5) AS num
    )
    SELECT sum(num) INTO sum_result
    FROM numbers;
    
    RAISE NOTICE 'Sum of numbers 1-5: %', sum_result;
END $$;
~~~

~~~
NOTICE: Sum of numbers 1-5: 15
DO
~~~

## See also

- [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %})
- [Stored Procedures]({% link {{ page.version.version }}/stored-procedures.md %})
- [User-Defined Functions]({% link {{ page.version.version }}/user-defined-functions.md %})