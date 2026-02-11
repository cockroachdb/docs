---
title: Cursors
summary: Paginate results from queries against your cluster using SQL cursors
toc: true
---

A cursor is a placeholder into a selection query that allows you to iterate over subsets of the rows returned by that query.

{{site.data.alerts.callout_success}}
This document describes cursor usage within SQL transactions. For information about using cursors in PL/pgSQL functions and procedures, see [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}#declare-cursor-variables).
{{site.data.alerts.end}}

Cursors differ from [keyset pagination]({% link {{ page.version.version }}/pagination.md %}) and [`LIMIT`/`OFFSET`]({% link {{ page.version.version }}/limit-offset.md %}) in that:

- Each cursor is a stateful SQL object that is referred to by a unique name.
- Each cursor requires holding open its own dedicated (read-only) [transaction]({% link {{ page.version.version }}/transactions.md %}).
- Each cursor operates on a snapshot of the database at the moment that cursor is opened.

## Synopsis

Cursors are declared and used with the following keywords:

- [`DECLARE`]({% link {{ page.version.version }}/sql-grammar.md %}#declare_cursor_stmt)
- [`WITH HOLD`](#use-a-holdable-cursor)
- [`FETCH`]({% link {{ page.version.version }}/sql-grammar.md %}#fetch_cursor_stmt)
- [`CLOSE`]({% link {{ page.version.version }}/sql-grammar.md %}#close_cursor_stmt)

<div>
  {% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/declare_cursor.html %}
</div>

<div>
  {% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/fetch_cursor.html %}
</div>

<div>
  {% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/close_cursor.html %}
</div>

## Examples

These examples assume the presence of the [MovR data set]({% link {{ page.version.version }}/movr.md %}).

### Use a cursor

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
DECLARE rides_cursor CURSOR FOR SELECT * FROM movr.rides;
~~~


{% include_cached copy-clipboard.html %}
~~~ sql
FETCH FORWARD 5 FROM rides_cursor;
~~~

~~~
                   id                  |     city      | vehicle_city  |               rider_id               |              vehicle_id              |        start_address        |        end_address         |     start_time      |      end_time       | revenue
---------------------------------------+---------------+---------------+--------------------------------------+--------------------------------------+-----------------------------+----------------------------+---------------------+---------------------+----------
  8ccccccc-cccc-4000-8000-000000000113 | san francisco | san francisco | 80000000-0000-4000-8000-000000000019 | 77777777-7777-4800-8000-000000000007 | 69313 Jody Tunnel Apt. 17   | 5210 Kim Canyon Suite 84   | 2018-12-22 03:04:05 | 2018-12-22 07:04:05 |   36.00
  8d4fdf3b-645a-4000-8000-000000000114 | san francisco | san francisco | 80000000-0000-4000-8000-000000000019 | 88888888-8888-4800-8000-000000000008 | 54797 Lauren Cliffs Apt. 37 | 7425 Matthews Harbors      | 2018-12-18 03:04:05 | 2018-12-20 04:04:05 |   45.00
  8dd2f1a9-fbe7-4000-8000-000000000115 | san francisco | san francisco | 75c28f5c-28f5-4400-8000-000000000017 | 77777777-7777-4800-8000-000000000007 | 23053 Brown Creek           | 15838 Preston Unions       | 2018-12-26 03:04:05 | 2018-12-27 15:04:05 |   34.00
  55810624-dd2f-4c00-8000-0000000000a7 | seattle       | seattle       | 570a3d70-a3d7-4c00-8000-000000000011 | 55555555-5555-4400-8000-000000000005 | 78340 Ashley Common Apt. 4  | 19798 Riggs Spring         | 2018-12-08 03:04:05 | 2018-12-10 06:04:05 |   13.00
  56041893-74bc-4c00-8000-0000000000a8 | seattle       | seattle       | 570a3d70-a3d7-4c00-8000-000000000011 | 66666666-6666-4800-8000-000000000006 | 6431 Robert Forest          | 83655 Michael Cape Apt. 94 | 2018-12-09 03:04:05 | 2018-12-09 14:04:05 |   48.00
(5 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CLOSE rides_cursor;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

### Use a holdable cursor

By default, a cursor closes when the transaction ends. The `WITH HOLD` clause defines a *holdable cursor*, which behaves as follows:

- A holdable cursor writes its results into a buffer, and stays open after a transaction commits. 
- If a transaction aborts, all cursors opened within that transaction are also rolled back. However, holdable cursors from previously committed transactions remain open.
- A holdable cursor can be opened in both explicit and implicit transactions.
- If a holdable cursor results in an error as it is being persisted, it will cause the current transaction (implicit or explicit) to be rolled back.

Use `WITH HOLD` to access data across multiple transactions without redefining the cursor.

{{site.data.alerts.callout_info}}
The `WITHOUT HOLD` clause specifies the default non-holdable cursor behavior.
{{site.data.alerts.end}}

The following example uses a holdable cursor to return vehicles that are available for rides.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="explicit">Explicit</button>
    <button class="filter-button" data-scope="implicit">Implicit</button>
</div>

<section class="filter-content" markdown="1" data-scope="explicit">
Start a transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
~~~
</section>

Declare a cursor using `WITH HOLD` to keep it open after the transaction commits:

{% include_cached copy-clipboard.html %}
~~~ sql
DECLARE available_vehicles_cursor CURSOR WITH HOLD FOR
  SELECT id, type, city, status FROM vehicles WHERE status = 'available';
~~~

Fetch the first two rows from the cursor:

{% include_cached copy-clipboard.html %}
~~~ sql
FETCH 2 FROM available_vehicles_cursor;
~~~

~~~
                   id                  |  type   |   city    |  status
---------------------------------------+---------+-----------+------------
  bbbbbbbb-bbbb-4800-8000-00000000000b | scooter | amsterdam | available
  22222222-2222-4200-8000-000000000002 | scooter | boston    | available
~~~

<section class="filter-content" markdown="1" data-scope="explicit">
Commit the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~
</section>

Continue fetching rows from the cursor:

{% include_cached copy-clipboard.html %}
~~~ sql
FETCH 2 FROM available_vehicles_cursor;
~~~

~~~
                   id                  |    type    |  city   |  status
---------------------------------------+------------+---------+------------
  33333333-3333-4400-8000-000000000003 | bike       | boston  | available
  55555555-5555-4400-8000-000000000005 | skateboard | seattle | available
~~~

Close the cursor:

{% include_cached copy-clipboard.html %}
~~~ sql
CLOSE available_vehicles_cursor;
~~~

### View all open cursors

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM pg_cursors;
~~~

~~~
            name            |                               statement                                | is_holdable | is_binary | is_scrollable |         creation_time
----------------------------+------------------------------------------------------------------------+-------------+-----------+---------------+--------------------------------
  rides_cursor              | SELECT * FROM movr.rides                                               |      f      |     f     |       f       | 2025-05-07 21:12:53.32978+00
  available_vehicles_cursor | SELECT id, type, city, status FROM vehicles WHERE status = 'available' |      t      |     f     |       f       | 2025-05-07 21:12:59.605647+00
(2 rows)
~~~

## Known limitations

{% include {{page.version.version}}/known-limitations/sql-cursors.md %}

## Differences between cursors and keyset pagination

{% include {{page.version.version}}/sql/cursors-vs-keyset-pagination.md %}

## See also

- [Keyset pagination]({% link {{ page.version.version }}/pagination.md %})
- [`LIMIT`/`OFFSET`]({% link {{ page.version.version }}/limit-offset.md %})
