---
title: CANCEL SESSION
summary: The CANCEL SESSION statement stops long-running sessions.
toc: true
---

The `CANCEL SESSION` [statement](sql-statements.html) lets you stop long-running sessions. `CANCEL SESSION` will attempt to cancel the currently active query and end the session.


## Required privileges

To view and cancel a session, the user must be a member of the `admin` role or must have the [`VIEWACTIVITY`](create-user.html#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) and [`CANCELQUERY`](create-user.html#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) parameters set. Non-admin users can't cancel admin users' sessions.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/cancel_session.html %}</section>

## Parameters

Parameter | Description
----------|------------
`session_id` | The ID of the session you want to cancel, which can be found with [`SHOW SESSIONS`](show-sessions.html).<br><br>`CANCEL SESSION` accepts a single session ID. If a subquery is used and returns multiple IDs, the `CANCEL SESSION` statement will fail. To cancel multiple sessions, use `CANCEL SESSIONS`.
`select_stmt` | A [selection query](selection-queries.html) that returns `session_id`(s) to cancel.

## Example

### Cancel a single session

In this example, we use the [`SHOW SESSIONS`](show-sessions.html) statement to get the ID of a session and then pass the ID into the `CANCEL SESSION` statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW SESSIONS;
~~~
~~~
+---------+----------------------------------+-----------+...
| node_id |            session_id            | user_name |...
+---------+----------------------------------+-----------+...
|       1 | 1530c309b1d8d5f00000000000000001 | root      |...
+---------+----------------------------------+-----------+...
|       1 | 1530fe0e46d2692e0000000000000001 | maxroach  |...
+---------+----------------------------------+-----------+...
~~~

{% include copy-clipboard.html %}
~~~ sql
> CANCEL SESSION '1530fe0e46d2692e0000000000000001';
~~~

You can also cancel a session using a subquery that returns a single session ID:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL SESSIONS (SELECT session_id FROM [SHOW SESSIONS]
      WHERE username = 'root');
~~~

### Cancel multiple sessions

Use the [`SHOW SESSIONS`](show-sessions.html) statement to view all active sessions:

{% include copy-clipboard.html %}
~~~ sql
> SHOW SESSIONS;
~~~
~~~
+---------+----------------------------------+-----------+...
| node_id |            session_id            | user_name |...
+---------+----------------------------------+-----------+...
|       1 | 1530c309b1d8d5f00000000000000001 | root      |...
+---------+----------------------------------+-----------+...
|       1 | 1530fe0e46d2692e0000000000000001 | maxroach  |...
+---------+----------------------------------+-----------+...
|       1 | 15310cc79671fc6a0000000000000001 | maxroach  |...
+---------+----------------------------------+-----------+...
~~~

To cancel multiple sessions, nest a [`SELECT` clause](select-clause.html) that retrieves `session_id`(s) inside the `CANCEL SESSIONS` statement:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL SESSIONS (SELECT session_id FROM [SHOW SESSIONS]
      WHERE user_name = 'maxroach');
~~~

All sessions created by `maxroach` will be cancelled.

## See also

- [`SHOW SESSIONS`](show-sessions.html)
- [`SET` (session variable)](set-vars.html)
- [`SHOW` (session variable)](show-vars.html)
- [SQL Statements](sql-statements.html)
