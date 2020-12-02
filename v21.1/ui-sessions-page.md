---
title: Sessions Page
toc: true
redirect_from: admin-ui-sessions-page.html
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the DB Console can only be accessed by a SQL user with the [`VIEWACTIVITY`](authorization.html#create-and-manage-users) role option. Note that non-`admin` users will see only their own sessions, while `admin` users see sessions for all users.
{{site.data.alerts.end}}

 The **Sessions** page of the DB Console provides details of all open sessions in the cluster.

To view this page, [access the DB Console](ui-overview.html#db-console-access) and click **Sessions** in the left-hand navigation.

## Sessions list

Use the **Sessions** list to see the open sessions in the cluster. This includes active and idle sessions. 

{{site.data.alerts.callout_info}}
A session is *active* if it has an open transaction (including implicit transactions, which are individual SQL statements), and *idle* if it has no open transaction. Active sessions consume [hardware resources](recommended-production-settings.html#hardware).
{{site.data.alerts.end}}

- If an active session also has an open transaction, the most recent SQL statement will be displayed in the **Statement** column.
- To view [details of a session](#session-details), click on the **Session Age**.

<img src="{{ 'images/v21.1/ui-sessions-page.png' | relative_url }}" alt="DB Console Database Tables View" style="border:1px solid #eee;max-width:100%" />

The following are displayed for each active session:

Parameter | Description
--------- | -----------
Session Age | Amount of time the session has been open.
Txn Duration | Amount of time the transaction has been active, if there is an open transaction.
Statement Age | Amount of time the SQL statement has been active, if there is an active statement.
Memory Usage | Amount of memory currently allocated to this session / maximum amount of memory this session has ever been allocated.
Statement | Active SQL statement. If more than one statement is active, the most recent statement is shown.
Actions | Options to terminate the active query and/or terminate the session. These require the [`CANCELQUERY` role option](authorization.html#create-and-manage-users).<br><br>**Terminate Statement:** Ends the SQL statement. The session running this statement will receive an error.<br><br>**Terminate Session:** Ends the session. The client that holds this session will receive a "connection terminated" event.

{{site.data.alerts.callout_success}}
Sort by **Txn Duration** to display all active sessions at the top.
{{site.data.alerts.end}}

## Session details

Click the **Session Age** of any session to display details and possible actions for that session.

<img src="{{ 'images/v21.1/ui-sessions-details-page.png' | relative_url }}" alt="DB Console Database Tables View" style="border:1px solid #eee;max-width:100%" />

- **Session** shows the ID of the connected session.
	- **Session Start Time** shows the timestamp at which the session started.
	- **Gateway Node** shows the node ID and IP address/port of the [gateway](architecture/life-of-a-distributed-transaction.html#gateway) node handling the client connection.
	- **Client Address** shows the IP address/port of the client that opened the session.
	- **Memory Usage** shows the amount of memory currently allocated to this session / maximum amount of memory this session has ever allocated.
	- The **Terminate Session** button ends the session. The client that holds this session will receive a "conenction terminated" event.
	- The **Terminate Statement** button ends the SQL statement. The session running this statement will receive an error.
- **Transaction** will display the following information for an open transaction.
	- **Transaction Start Time** shows the timestamp at which the transaction started.
	- **Number of Statements Executed** shows the total number of SQL statements executed by the transaction.
	- **Number of Retries** shows the total number of [retries](transactions.html#transaction-retries) for the transaction.
	- **Number of Automatic Retries** shows the total number of [automatic retries](transactions.html#automatic-retries) run by CockroachDB for the transaction.
	- **Priority** shows the [priority](transactions.html#transaction-priorities) for the transaction.
	- **Read Only?** shows whether the transaction is read-only.
	- **AS OF SYSTEM TIME?** shows whether the transaction uses [`AS OF SYSTEM TIME`](performance-best-practices-overview.html#use-as-of-system-time-to-decrease-conflicts-with-long-running-queries) to return historical data.
	- **Memory Usage** shows the amount of memory currently allocated to this transaction / maximum amount of memory this transaction has ever allocated.
- **Statement** will display the following information for an active statement.
	- The SQL statement is shown.
	- **Execution Start Time** shows the timestamp at which the statement was run.
	- **Distributed Execution?** shows whether the statement uses [Distributed SQL (DistSQL)](architecture/sql-layer.html#distsql) optimization.
	- **View Statement Details** opens the [Statement Details](ui-statements-page.html#statement-details-page) page for the statement.

## See also

- [`SHOW SESSIONS`](show-sessions.html)
- [Statements page](ui-statements-page.html)
- [SQL Statements](sql-statements.html)
- [Transactions](transactions.html)
- [Transaction Error Retry Reference](transaction-retry-error-reference.html)
- [Production Checklist](recommended-production-settings.html#hardware)