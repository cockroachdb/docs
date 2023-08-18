---
title: CANCEL SESSION
summary: The CANCEL SESSION statement stops long-running sessions.
toc: true
docs_area: reference.sql
---

The `CANCEL SESSION` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lets you stop long-running sessions. `CANCEL SESSION` will attempt to cancel the currently active query and end the session.

## Required privileges

To view and cancel a session, the user must be a member of the `admin` role or must have the `VIEWACTIVITY` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (or the legacy [`VIEWACTIVITY`]({% link {{ page.version.version }}/create-user.md %}#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options)) and the `CANCELQUERY` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (or the legacy [`CANCELQUERY`]({% link {{ page.version.version }}/create-user.md %}#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options)) defined. Non-admin users cannot cancel admin users' sessions.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/cancel_session.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`session_id` | The ID of the session you want to cancel, which can be found with [`SHOW SESSIONS`]({% link {{ page.version.version }}/show-sessions.md %}).<br><br>`CANCEL SESSION` accepts a single session ID. If a subquery is used and returns multiple IDs, the `CANCEL SESSION` statement will fail. To cancel multiple sessions, use `CANCEL SESSIONS`.
`select_stmt` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) that returns `session_id`(s) to cancel.

## Example

### Cancel a single session

In this example, we use the [`SHOW SESSIONS`]({% link {{ page.version.version }}/show-sessions.md %}) statement to get the ID of a session and then pass the ID into the `CANCEL SESSION` statement:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL SESSION '1530fe0e46d2692e0000000000000001';
~~~

You can also cancel a session using a subquery that returns a single session ID:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL SESSIONS (WITH x AS (SHOW SESSIONS) SELECT session_id FROM x
      WHERE user_name = 'root');
~~~

### Cancel multiple sessions

Use the [`SHOW SESSIONS`]({% link {{ page.version.version }}/show-sessions.md %}) statement to view all active sessions:

{% include_cached copy-clipboard.html %}
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

To cancel multiple sessions, nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `session_id`(s) inside the `CANCEL SESSIONS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL SESSIONS (WITH x AS (SHOW SESSIONS) SELECT session_id FROM x
      WHERE user_name = 'maxroach');
~~~

All sessions created by `maxroach` will be cancelled.

## See also

- [`SHOW SESSIONS`]({% link {{ page.version.version }}/show-sessions.md %})
- [`SET {session variable}`]({% link {{ page.version.version }}/set-vars.md %})
- [`SHOW {session variable}`]({% link {{ page.version.version }}/show-vars.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
