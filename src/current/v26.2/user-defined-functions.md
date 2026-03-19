---
title: User-Defined Functions
summary: A user-defined function is a named function defined at the database level that can be called in queries and other contexts.
toc: true
docs_area: reference.sql
---

A user-defined function (UDF) is a named function defined at the database level that can be called in queries and other contexts. CockroachDB supports invoking UDFs in `SELECT`, `FROM`, and `WHERE` clauses of [DML statements]({% link {{ page.version.version }}/sql-statements.md %}#data-manipulation-statements).

{% include {{ page.version.version }}/sql/udfs-vs-stored-procs.md %}

## Overview

The basic components of a user-defined function are a name, list of arguments, return type, volatility, language, and function body.

- An argument has a _mode_ and a _type_.
  - CockroachDB supports the `IN` (default), `OUT`, and `INOUT` argument modes. For an example, see [Create a function that uses `OUT` and `INOUT` parameters]({% link {{ page.version.version }}/create-function.md %}#create-a-function-that-uses-out-and-inout-parameters).
  - The type can be a built-in type, [user-defined `ENUM`]({% link {{ page.version.version }}/enum.md %}) or [composite]({% link {{ page.version.version }}/create-type.md %}#create-a-composite-data-type) type, or implicit record type. A type can have a `DEFAULT` value.
- The return type can be a built-in [SQL type]({% link {{ page.version.version }}/data-types.md %}), user-defined [`ENUM`]({% link {{ page.version.version }}/enum.md %}) or [composite]({% link {{ page.version.version }}/create-type.md %}#create-a-composite-data-type) type, [`RECORD`]({% link {{ page.version.version }}/create-function.md %}#create-a-function-that-returns-a-record-type), [`TABLE`]({% link {{ page.version.version }}/create-function.md %}#create-a-function-that-returns-a-table), PL/pgSQL [`REFCURSOR`]({% link {{ page.version.version }}/plpgsql.md %}#declare-cursor-variables) type, implicit record type, [`TRIGGER`]({% link {{ page.version.version }}/triggers.md %}#trigger-function), or `VOID`.
    - Preceding a type with `SETOF` indicates that a set, or multiple rows, may be returned. For an example, see [Create a function that returns a set of results]({% link {{ page.version.version }}/create-function.md %}#create-a-function-that-returns-a-set-of-results).
    - `VOID` indicates that there is no return type and `NULL` will always be returned. {% comment %}If the return type of the function is not `VOID`, the last statement of a UDF must be a `SELECT`.{% endcomment %}
- The [volatility]({% link {{ page.version.version }}/functions-and-operators.md %}#function-volatility) indicates whether the function has side effects. `VOLATILE` and `NOT LEAKPROOF` are the default.
  - Annotate a function with side effects with `VOLATILE`. This also prevents the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) from pre-evaluating the function.
  - A `STABLE` or `IMMUTABLE` function does not mutate data. You cannot create a `STABLE` or `IMMUTABLE` function that executes a mutation (`INSERT`, `UPSERT`, `UPDATE`, `DELETE`) statement.
  - `LEAKPROOF` indicates that a function has no side effects and that it communicates nothing that depends on its arguments besides the return value (i.e., it cannot throw an error that depends on the value of its arguments). You must precede `LEAKPROOF` with `IMMUTABLE`, and only `IMMUTABLE` can be set to `LEAKPROOF`. `NOT LEAKPROOF` is allowed with any other volatility.
  - Non-`VOLATILE` functions can be optimized through inlining. For more information, see [Create an inlined UDF](#create-an-inlined-udf).
- `LANGUAGE` specifies the language of the function body. CockroachDB supports the languages `SQL` and [`PLpgSQL` (PL/pgSQL)]({% link {{ page.version.version }}/plpgsql.md %}).
- The function body:
  - Can reference arguments by name or by their ordinal in the function definition with the syntax `$1`.
  - Can be enclosed in a single line with single quotes `''` or multiple lines with `$$`.
  - Can reference tables.
  - Can reference only the `SELECT` statement.

## Statement statistics

SQL statements executed within user-defined functions are tracked in the SQL statistics subsystem and will appear in the [**SQL Activity** > **Statements**]({% link {{ page.version.version }}/ui-statements-page.md %}) page and the [**Insights**]({% link {{ page.version.version }}/ui-insights-page.md %}) page in the DB Console. This allows you to monitor the performance and execution statistics of individual statements within your functions.

When the UDF is invoked as part of a transaction, the statements executed within the function also appear in the [**Transaction details**]({% link {{ page.version.version }}/ui-transactions-page.md %}#transaction-details-page) in the **Statement Fingerprints** table.

{{site.data.alerts.callout_info}}
[Statement diagnostics]({% link {{ page.version.version }}/explain-analyze.md %}#debug-option) cannot be collected for statements executed inside user-defined functions. You can request statement diagnostics for the top-level invocation of the function, and the resulting trace includes spans for each statement executed. However, there is no way to target statements executed inside the function with a statement diagnostics request. For details, refer to [Known limitations](#known-limitations).
{{site.data.alerts.end}}

## Examples

### Create a UDF

The following is a UDF that returns the sum of two integers:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION add(a INT, b INT) RETURNS INT IMMUTABLE LEAKPROOF LANGUAGE SQL AS 'SELECT a + b';
~~~

Where:

- name: `add`
- arguments: `a` of type `INT`, `b` of type `INT`
- return type: `INT`
- volatility: `IMMUTABLE LEAKPROOF`
- language: `SQL`
- function body: `'SELECT a + b'`

Alternatively, you could define this function as:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION add(a INT, b INT) RETURNS INT IMMUTABLE LEAKPROOF LANGUAGE SQL AS 'SELECT $1 + $2';
~~~

Or as:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION add(a INT, b INT) RETURNS INT LANGUAGE SQL AS $$
  SELECT a + b;
$$;
~~~

For more examples of UDF creation, see [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %}).

### View a UDF definition

To view the definition for the `add()` function:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE FUNCTION add;
~~~

If you do not specify a schema for the function `add` when you create it, the default schema is `public`:

~~~
  function_name |                 create_statement
----------------+---------------------------------------------------
 add            | CREATE FUNCTION public.add(IN a INT8, IN b INT8)
                |     RETURNS INT8
                |     IMMUTABLE
                |     LEAKPROOF
                |     CALLED ON NULL INPUT
                |     LANGUAGE SQL
                |     AS $$
                |     SELECT a + b;
                | $$
(1 row)
~~~

### Invoke a UDF

You invoke a UDF like a [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}).

To invoke the `add()` function:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT add(3,5) as sum;
~~~

~~~
  sum
-------
    8
(1 row)
~~~

### Call a UDF from a view

You can include UDF calls in a [view]({% link {{ page.version.version }}/views.md %}) definition. The function is invoked each time the view is queried. A [materialized view]({% link {{ page.version.version }}/views.md %}#materialized-views) will invoke the function only when the view is created or refreshed.

Refer to [Create a view that references routines]({% link {{ page.version.version }}/create-view.md %}#create-a-view-that-references-routines).

### Create a UDF using PL/pgSQL

{% include {{ page.version.version }}/sql/udf-plpgsql-example.md %}

### Create an inlined UDF

When possible, the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) will improve a function's performance by inlining the UDF within the query plan. The UDF must have the following attributes:

- It is labeled as `IMMUTABLE`, `STABLE`, or `LEAKPROOF` (i.e., non-`VOLATILE`).
- It has a single statement.
- It is not a [set-returning function]({% link {{ page.version.version }}/create-function.md %}#create-a-function-that-returns-a-set-of-results).
- Its arguments are only variable or constant expressions.
- It is not a [record-returning function]({% link {{ page.version.version }}/create-function.md %}#create-a-function-that-returns-a-record-type).

The following example demonstrates how inlining improves a UDF's performance.

1. Create tables `a` and `b`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE a (
      a INT
    );

    CREATE TABLE b (
      b INT PRIMARY KEY
    );
    ~~~

1. Insert a value (`10`) into 1000 rows in `a` and 1 row in `b`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO a SELECT 10 FROM generate_series(1, 1000);
    INSERT INTO b VALUES (10);
    ~~~

1. Create a `VOLATILE` function `foo_v()` and a `STABLE` function `foo_s()`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE FUNCTION foo_v(x INT) RETURNS INT VOLATILE LANGUAGE SQL AS $$
      SELECT b FROM b WHERE b = x
    $$;

    CREATE FUNCTION foo_s(x INT) RETURNS INT STABLE LANGUAGE SQL AS $$
      SELECT b FROM b WHERE b = x
    $$;
    ~~~

    Each function returns a specified value from table `b`.

1. View the query plan when `foo_v()` (the `VOLATILE` function) is used in a selection query to retrieve equal values from table `a`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN ANALYZE SELECT foo_v(a) FROM a WHERE a = 10;
    ~~~

    ~~~
                                                info
    --------------------------------------------------------------------------------------------
      planning time: 2ms
      execution time: 77ms
      distribution: local
      vectorized: true
      rows read from KV: 1,000 (39 KiB, 1 gRPC calls)
      cumulative time spent in KV: 330µs
      maximum memory usage: 80 KiB
      network usage: 0 B (0 messages)
      sql cpu time: 75ms
      estimated RUs consumed: 0

      • render
      │
      └── • filter
          │ nodes: n1
          │ actual row count: 1,000
          │ sql cpu time: 75ms
          │ estimated row count: 1,000
          │ filter: a = 10
          │
          └── • scan
                nodes: n1
                actual row count: 1,000
                KV time: 330µs
                KV contention time: 0µs
                KV rows read: 1,000
                KV bytes read: 39 KiB
                KV gRPC calls: 1
                estimated max memory allocated: 60 KiB
                sql cpu time: 87µs
                estimated row count: 1,000 (100% of the table; stats collected 19 seconds ago)
                table: a@a_pkey
                spans: FULL SCAN
    (33 rows)
    ~~~

    The query takes `77ms` to execute because the function is invoked for each row scanned in table `a`.

1. View the query plan when using `foo_s()` (the `STABLE` function) instead:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN ANALYZE SELECT foo_s(a) FROM a WHERE a = 10;
    ~~~

    ~~~
                                                  info
    ------------------------------------------------------------------------------------------------
      planning time: 5ms
      execution time: 4ms
      distribution: local
      vectorized: true
      rows read from KV: 1,001 (39 KiB, 2 gRPC calls)
      cumulative time spent in KV: 832µs
      maximum memory usage: 420 KiB
      network usage: 0 B (0 messages)
      sql cpu time: 3ms
      estimated RUs consumed: 0

      • render
      │
      └── • merge join (left outer)
          │ nodes: n1
          │ actual row count: 1,000
          │ estimated max memory allocated: 340 KiB
          │ estimated max sql temp disk usage: 0 B
          │ sql cpu time: 3ms
          │ estimated row count: 1,000
          │ equality: (a) = (b)
          │ right cols are key
          │
          ├── • filter
          │   │ nodes: n1
          │   │ actual row count: 1,000
          │   │ sql cpu time: 5µs
          │   │ estimated row count: 1,000
          │   │ filter: a = 10
          │   │
          │   └── • scan
          │         nodes: n1
          │         actual row count: 1,000
          │         KV time: 722µs
          │         KV contention time: 0µs
          │         KV rows read: 1,000
          │         KV bytes read: 39 KiB
          │         KV gRPC calls: 1
          │         estimated max memory allocated: 60 KiB
          │         sql cpu time: 202µs
          │         estimated row count: 1,000 (100% of the table; stats collected 42 seconds ago)
          │         table: a@a_pkey
          │         spans: FULL SCAN
          │
          └── • scan
                nodes: n1
                actual row count: 1
                KV time: 110µs
                KV contention time: 0µs
                KV rows read: 1
                KV bytes read: 30 B
                KV gRPC calls: 1
                estimated max memory allocated: 20 KiB
                sql cpu time: 11µs
                estimated row count: 1 (100% of the table; stats collected 42 seconds ago)
                table: b@b_pkey
                spans: FULL SCAN
    (57 rows)
    ~~~

    The query takes only `4ms` to execute because the function is inlined and transformed to a [join]({% link {{ page.version.version }}/joins.md %}) with an equality comparison `(a) = (b)`, which has much less overhead than invoking a function for each row scanned in table `a`.

### Video Demo

For a deep-dive demo on UDFs, watch the following video:

{% include_cached youtube.html video_id="glveuxrzZB4" %}

## Known limitations

User-defined functions have the following limitations:

{% include {{ page.version.version }}/known-limitations/udf-limitations.md %}
{% include {{ page.version.version }}/known-limitations/routine-limitations.md %}

Also refer to the [PL/pgSQL known limitations]({% link {{ page.version.version }}/plpgsql.md %}#known-limitations).

## See also

- [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %})
- [`ALTER FUNCTION`]({% link {{ page.version.version }}/alter-function.md %})
- [`DROP FUNCTION`]({% link {{ page.version.version }}/drop-function.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %})
