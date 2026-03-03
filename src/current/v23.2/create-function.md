---
title: CREATE FUNCTION
summary: The CREATE FUNCTION statement creates a user-defined function.
toc: true
keywords:
docs_area: reference.sql
---

The `CREATE FUNCTION` [statement]({% link {{ page.version.version }}/sql-statements.md %}) creates a [user-defined function]({% link {{ page.version.version }}/user-defined-functions.md %}).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

- To define a function, a user must have [`CREATE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the schema of the function.
- To define a function with a [user-defined type]({% link {{ page.version.version }}/create-type.md %}), a user must have `USAGE` privilege on the user-defined type.
- To resolve a function, a user must have at least the `USAGE` privilege on the schema of the function.
- To call a function, a user must have `EXECUTE` privilege on the function.
- At function definition and execution time, a user must have privileges on all the objects referenced in the function body. Privileges on referenced objects can be revoked and later function calls can fail due to lack of permission.

If you grant `EXECUTE` privilege as a default privilege at the database level, newly created functions inherit that privilege from the database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_func.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`routine_create_name` | The name of the function.
`routine_param` | A comma-separated list of function parameters.
`routine_return_type` | The type returned by the function. 
`routine_body_str` | The body of the function. For allowed contents, see [User-Defined Functions]({% link {{ page.version.version }}/user-defined-functions.md %}#overview).

## Example of a simple function

The following statement creates a function to compute the square of integers:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION sq(a INT) RETURNS INT AS 'SELECT a*a' LANGUAGE SQL;
~~~

The following statement invokes the `sq` function:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT sq(2);
~~~

~~~
  sq
-----
  4
(1 row)
~~~

## Examples of functions that reference tables

{% include {{page.version.version}}/sql/movr-statements.md %}

### Create a function that references a table

The following statement defines a function that returns the total number of MovR application users.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION num_users() RETURNS INT AS 'SELECT count(*) FROM users' LANGUAGE SQL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT num_users();
~~~

~~~
  num_users
-------------
         50
(1 row)
~~~

### Create a function that modifies a table

The following statement defines a function that updates the `rules` value for a specified row in `promo_codes`.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION update_code(
  code_name VARCHAR,
  new_rules JSONB
  ) 
  RETURNS promo_codes AS $$
    UPDATE promo_codes SET rules = new_rules
    WHERE code = code_name
    RETURNING *;
  $$ LANGUAGE SQL;
~~~

Given the `promo_codes` row:

~~~
            code           |                          description                           |    creation_time    |   expiration_time   |                    rules
---------------------------+----------------------------------------------------------------+---------------------+---------------------+-----------------------------------------------
  0_building_it_remember   | Door let Mrs manager buy model. Course rock training together. | 2019-01-09 03:04:05 | 2019-01-14 03:04:05 | {"type": "percent_discount", "value": "10%"}
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT update_code('0_building_it_remember', '{"type": "percent_discount", "value": "50%"}');
~~~

~~~
                                                                                          update_code
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  (0_building_it_remember,"Door let Mrs manager buy model. Course rock training together.","2019-01-09 03:04:05","2019-01-14 03:04:05","{""type"": ""percent_discount"", ""value"": ""50%""}")
~~~

### Create a function that uses a `WHERE` clause

The following statement defines a function that returns the total revenue for rides taken in European cities.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION total_euro_revenue() RETURNS DECIMAL LANGUAGE SQL AS $$
  SELECT SUM(revenue) FROM rides WHERE city IN ('paris', 'rome', 'amsterdam')
$$;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT total_euro_revenue();
~~~
~~~
  total_euro_revenue
----------------------
             8468.00
~~~

### Create a function that returns a set of results

The following statement defines a function that returns information for all vehicles not in use. The `SETOF` clause specifies that the function should return each row as the query executes to completion.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION available_vehicles() RETURNS SETOF vehicles LANGUAGE SQL AS $$
  SELECT * FROM vehicles WHERE status = 'available'
$$;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT city,current_location,type FROM available_vehicles();
~~~

~~~
      city      |      current_location       |    type
----------------+-----------------------------+-------------
  amsterdam     | 4102 Stout Flat Apt. 11     | skateboard
  boston        | 30226 Logan Branch Suite 76 | skateboard
  los angeles   | 25730 Crystal Terrace       | scooter
  paris         | 9429 Joseph Neck Suite 52   | skateboard
  san francisco | 43325 Jeffrey Wall Suite 26 | scooter
(5 rows)
~~~

### Create a function that returns a `RECORD` type

The following statement defines a function that returns the information for the user that most recently completed a ride. The information is returned as a record, which takes the structure of the row that is retrieved by the selection query.

In the function subquery, the latest `end_time` timestamp is used to determine the most recently completed ride.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION last_rider() RETURNS RECORD LANGUAGE SQL AS $$
  SELECT * FROM users WHERE id = (
    SELECT rider_id FROM rides WHERE end_time = (SELECT max(end_time) FROM rides)
  )
$$;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT last_rider();
~~~

~~~
                                                last_rider
----------------------------------------------------------------------------------------------------------
  (70a3d70a-3d70-4400-8000-000000000016,seattle,"Mary Thomas","43322 Anthony Flats Suite 85",1141093639)
(1 row)
~~~

### Create a function that uses a loop

{% include {{ page.version.version }}/sql/udf-plpgsql-example.md %}

## See also

- [User-Defined Functions]({% link {{ page.version.version }}/user-defined-functions.md %})
- [`ALTER FUNCTION`]({% link {{ page.version.version }}/alter-function.md %})
- [`DROP FUNCTION`]({% link {{ page.version.version }}/drop-function.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
