---
title: CANCEL SESSION
summary: The CANCEL SESSION statement stops long-running sessions.
toc: false
---

<span class="version-tag">New in v2.1:</span> The `CANCEL SESSION` [statement](sql-statements.html) lets you stop long-running sessions.

<div id="toc"></div>

## Required Privileges

Only the `root` user and the user that the session belongs to can cancel a session.

## Synopsis

<section>{% include sql/{{ page.version.version }}/diagrams/cancel_session.html %}</section>

## Parameters

Parameter | Description
----------|------------
`session_id` | The ID of the session you want to cancel, which can be found with [`SHOW SESSIONS`](show-sessions.html).<br><br>`CANCEL SESSION` accepts a single session ID. If a subquery is used and returns multiple IDs, the `CANCEL SESSION` statement will fail. To cancel multiple sessions, use `CANCEL SESSIONS`.
`select_stmt` | A [selection query](selection-queries.html) whose result you want to cancel.

## Example

### Cancel a Query via the Session ID

In this example, we use the [`SHOW SESSIONS`](show-sessions.html) statement to get the ID of a session and then pass the ID into the `CANCEL SESSION` statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW SESSIONS;
~~~
~~~
+---------+----------------------------------+----------+...
| node_id |            session_id            | username |...
+---------+----------------------------------+----------+...
|       1 | 1530c309b1d8d5f00000000000000001 | root     |...
+---------+----------------------------------+----------+...
|       1 | 1530fe0e46d2692e0000000000000001 | maxroach |...
+---------+----------------------------------+----------+...
~~~

{% include copy-clipboard.html %}
~~~ sql
> CANCEL SESSION '1530fe0e46d2692e0000000000000001';
~~~

### Cancel a Session via a Subquery

In this example, we nest a [`SELECT` clause](select-clause.html) that retrieves the ID of a session inside the `CANCEL SESSION` statement:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL SESSIONS (SELECT session_id FROM [SHOW SESSIONS]
      WHERE username = 'maxroach');
~~~

{{site.data.alerts.callout_info}}<code>CANCEL SESSION</code> accepts a single session ID. If a subquery is used and returns multiple IDs, the <code>CANCEL SESSION</code> statement will fail. To cancel multiple sessions, use <code>CANCEL SESSIONS</code>.{{site.data.alerts.end}}

## See Also

- [`SHOW SESSIONS`](show-sessions.html)
- [`SET` (session variable)](set-vars.html)
- [`SHOW` (session variable)](show-vars.html)
- [SQL Statements](sql-statements.html)
