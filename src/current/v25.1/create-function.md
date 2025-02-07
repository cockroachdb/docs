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

- To create a function, a user must have [`CREATE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the schema of the function. The user must also have privileges on all the objects referenced in the function body.
- To define a function with a [user-defined type]({% link {{ page.version.version }}/create-type.md %}), a user must have `USAGE` privilege on the user-defined type.
- To resolve a function, a user must have at least the `USAGE` privilege on the schema of the function.
- To call a function, a user must have `EXECUTE` privilege on the function. By default, the user must also have privileges on all the objects referenced in the function body. However, a [`SECURITY DEFINER` function](#create-a-security-definer-function) executes with the privileges of the user that owns the function, not the user that calls it. A `SECURITY INVOKER` function executes with the privileges of the user that calls the function, thus matching the default behavior.

If you grant `EXECUTE` privilege as a default privilege at the database level, newly created functions inherit that privilege from the database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_func.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`routine_create_name` | The name of the function.
`routine_param` | A comma-separated list of function parameters, specifying the mode, name, and type.
`routine_return_type` | The type returned by the function: any built-in [SQL type]({% link {{ page.version.version }}/data-types.md %}), user-defined [`ENUM`]({% link {{ page.version.version }}/enum.md %}) or [composite]({% link {{ page.version.version }}/create-type.md %}#create-a-composite-data-type) type, [`RECORD`](#create-a-function-that-returns-a-record-type), [`TABLE`](#create-a-function-that-returns-a-table), PL/pgSQL [`REFCURSOR`]({% link {{ page.version.version }}/plpgsql.md %}#declare-cursor-variables) type, [`TRIGGER`]({% link {{ page.version.version }}/triggers.md %}#trigger-function), or `VOID`.
`routine_body_str` | The body of the function. For allowed contents, refer to [User-Defined Functions]({% link {{ page.version.version }}/user-defined-functions.md %}#overview).

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

{{site.data.alerts.callout_success}}
[`RETURNS TABLE`](#create-a-function-that-returns-a-table) also returns a set of results, each formatted as a [`RECORD`](#create-a-function-that-returns-a-record-type) type.
{{site.data.alerts.end}}

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

The following function returns the information for the user that most recently completed a ride. The information is returned as a record, which takes the structure of the row that is retrieved by the selection query.

In the function subquery, the latest `end_time` timestamp is used to determine the most recently completed ride:

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
-------------------------------------------------------------------------------------------------------------------
  (147ae147-ae14-4b00-8000-000000000004,"new york","Isabel Clark DVM","98891 Timothy Cliffs Suite 39",4302568047)
(1 row)
~~~

### Create a function that returns a table

The following function returns information for the last `x` users that recently completed a ride. The information is returned as a table, which is equivalent to a set of [`RECORD` values](#create-a-function-that-returns-a-record-type). The rows are sorted in order of most recent ride.

The `RETURNS TABLE` clause specifies the column names to output: `id`, `name`, `city`, and `end_time`. A [common table expression]({% link {{ page.version.version }}/common-table-expressions.md %}) reads the most recent rides from the `rides` table.

{{site.data.alerts.callout_info}}
[`OUT` and `INOUT` parameters](#create-a-function-that-uses-out-and-inout-parameters) cannot be used with `RETURNS TABLE`.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION last_x_riders(x INT) RETURNS TABLE(id UUID, name VARCHAR, city VARCHAR, end_time TIMESTAMP) LANGUAGE SQL AS $$
  WITH recent_rides AS (
    SELECT rider_id, end_time FROM rides
    ORDER BY end_time DESC
  )
  SELECT u.id, u.name, u.city, r.end_time FROM users u, recent_rides r
  WHERE u.id = r.rider_id
  ORDER BY r.end_time DESC
  LIMIT x
$$;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM last_x_riders(5);
~~~

~~~
                   id                  |       name       |     city      |      end_time
---------------------------------------+------------------+---------------+----------------------
  147ae147-ae14-4b00-8000-000000000004 | Isabel Clark DVM | new york      | 2019-01-04 14:04:05
  8f5c28f5-c28f-4000-8000-00000000001c | Patricia Sexton  | los angeles   | 2019-01-04 08:04:05
  75c28f5c-28f5-4400-8000-000000000017 | Andre Wilson     | san francisco | 2019-01-04 07:04:05
  00000000-0000-4000-8000-000000000000 | William Martin   | new york      | 2019-01-04 04:04:05
  d1eb851e-b851-4800-8000-000000000029 | Terry Reyes      | paris         | 2019-01-03 21:04:05
(5 rows)
~~~

### Create a function that uses `OUT` and `INOUT` parameters

The following statement uses a combination of `OUT` and `INOUT` parameters to modify a provided value and output the result. An `OUT` parameter returns a value, while an `INOUT` parameter passes an input value and returns a value.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION double_triple(INOUT double INT, OUT triple INT) AS 
  $$
  BEGIN
    double := double * 2;
    triple := double * 3;
  END;
  $$ LANGUAGE PLpgSQL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT double_triple(1);
~~~

~~~
  double_triple
-----------------
  (2,6)
~~~

The `CREATE FUNCTION` statement does not need a `RETURN` statement because this is added implicitly for a function with `OUT` parameters:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE FUNCTION double_triple;
~~~

~~~
  function_name |                             create_statement
----------------+---------------------------------------------------------------------------
  double_triple | CREATE FUNCTION public.double_triple(INOUT double INT8, OUT triple INT8)
                |     RETURNS RECORD
                |     VOLATILE
                |     NOT LEAKPROOF
                |     CALLED ON NULL INPUT
                |     LANGUAGE plpgsql
                |     AS $$
                |     BEGIN
                |     double := double * 2;
                |     triple := double * 3;
                |     END;
                | $$
~~~

### Create a function that invokes a function

The following statement defines a function that invokes the [`double_triple` example function](#create-a-function-that-uses-out-and-inout-parameters). 

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION f(input_value INT)
  RETURNS RECORD 
  AS $$
  BEGIN
      RETURN double_triple(input_value);
  END;
  $$ LANGUAGE PLpgSQL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT f(1);
~~~

~~~
    f
---------
  (2,6)
~~~

### Create a function that uses a loop

{% include {{ page.version.version }}/sql/udf-plpgsql-example.md %}

### Create a trigger function

A trigger function is a [function that is executed by a trigger]({% link {{ page.version.version }}/triggers.md %}#trigger-function). A trigger function must return type `TRIGGER` and is written in [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}).

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION change_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name = 'Dear ' || (NEW).name;
  RETURN NEW;
END;
$$ LANGUAGE PLpgSQL;
~~~

The preceding example modifies a given `name` value and returns the `NEW` [trigger variable]({% link {{ page.version.version }}/triggers.md %}#trigger-variables) because it is meant to be executed by a `BEFORE` trigger. For details, refer to [Triggers]({% link {{ page.version.version }}/triggers.md %}).

### Create a `SECURITY DEFINER` function

The following example defines a function using the `SECURITY DEFINER` clause. This causes the function to execute with the privileges of the function owner.

1. Create two roles:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE ROLE owner;
    CREATE ROLE invoker;
    ~~~

1. Grant a [`SELECT` privilege]({% link {{ page.version.version }}/grant.md %}#supported-privileges) on the `user_promo_codes` table to the `owner` role.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    GRANT SELECT ON TABLE user_promo_codes TO owner;
    ~~~

1. Set your role to `owner`.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET ROLE owner;
    ~~~

1. Create a simple `SECURITY DEFINER` function that reads the contents of `user_promo_codes`.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE OR REPLACE FUNCTION get_codes() 
      RETURNS SETOF RECORD 
      LANGUAGE SQL 
      SECURITY DEFINER
      AS $$
        SELECT * FROM user_promo_codes;
      $$;
    ~~~

1. Grant the [`EXECUTE` privilege]({% link {{ page.version.version }}/grant.md %}#supported-privileges) on the `get_codes` function to the `invoker` role.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    GRANT EXECUTE ON FUNCTION get_codes() TO invoker;
    ~~~

    {{site.data.alerts.callout_info}}
    This step is not necessary if the function is defined on the `public` schema, for which roles automatically have the `EXECUTE` privilege.
    {{site.data.alerts.end}}

1. Set your role to `invoker`.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET ROLE invoker;
    ~~~

1. `invoker` does not have the privileges to read the `user_promo_codes` table directly:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM user_promo_codes;
    ~~~

    ~~~
    ERROR: user invoker does not have SELECT privilege on relation user_promo_codes
    SQLSTATE: 42501
    ~~~

1. As `invoker`, call the `get_codes` function to read `user_promo_codes`, since `SECURITY DEFINER` is executed with the privileges of the `owner` role (i.e., `SELECT` on `user_promo_codes`).

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT get_codes();
    ~~~

    ~~~
                                                     get_codes
    ------------------------------------------------------------------------------------------------------------
      ("new york",00000000-0000-4000-8000-000000000000,0_audience_thought_seven,"2019-01-02 03:04:05",10)
      ("new york",051eb851-eb85-4ec0-8000-000000000001,1_assume_its_leg,"2019-01-02 03:04:05.001",0)
      ("new york",0a3d70a3-d70a-4d80-8000-000000000002,2_popular_if_describe,"2019-01-02 03:04:05.002",16)
      ("new york",0f5c28f5-c28f-4c00-8000-000000000003,3_environmental_myself_add,"2019-01-02 03:04:05.003",4)
      ("new york",147ae147-ae14-4b00-8000-000000000004,4_rule_edge_career,"2019-01-02 03:04:05.004",13)
    (5 rows)
    ~~~

## See also

- [User-Defined Functions]({% link {{ page.version.version }}/user-defined-functions.md %})
- [`ALTER FUNCTION`]({% link {{ page.version.version }}/alter-function.md %})
- [`DROP FUNCTION`]({% link {{ page.version.version }}/drop-function.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
