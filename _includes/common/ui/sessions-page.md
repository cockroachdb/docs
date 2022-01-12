{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

## Sessions list

Use the **Sessions** list to see the open sessions in the cluster. This includes active and idle sessions.

{{site.data.alerts.callout_info}}
A session is *active* if it has an open transaction (including implicit transactions, which are individual SQL statements), and *idle* if it has no open transaction. Active sessions consume hardware resources.
{{site.data.alerts.end}}

- If a session is active, the most recent SQL statement is displayed in the **Statement** column.
- If a session is idle, the **Transaction Duration**, **Statement Duration**, and **Statement** columns will display `N/A`.
- To view [details of a session](#session-details), click **Session Duration**.

{{site.data.alerts.callout_info}}
An active session can have an open transaction that is not currently running SQL. In this case, the **Statement** and **Statement Duration** columns will display `N/A` and **Transaction Duration** will display a value. Transactions that are held open can cause [contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).
{{site.data.alerts.end}}

{% if page.cloud != true %}
<img src="{{ 'images/v21.2/ui-sessions-page.png' | relative_url }}" alt="Sessions Page" style="border:1px solid #eee;max-width:100%" />
{% endif %}

The following are displayed for each active session:

Parameter | Description
--------- | -----------
Session Duration | Amount of time the session has been open.
Transaction Duration | Amount of time the transaction has been active, if there is an open transaction.
Statement Duration | Amount of time the SQL statement has been active, if there is an active statement.
Memory Usage | Amount of memory currently allocated to this session, followed by the maximum amount of memory this session has ever been allocated.
Statement | Active SQL statement. If more than one statement is active, the most recent statement is shown.
Actions | Options to terminate the active query and/or terminate the session. These require the [`CANCELQUERY` role option]({{ link_prefix }}authorization.html#create-and-manage-users).<br><br>**Terminate Statement:** Ends the SQL statement. The session running this statement will receive an error.<br><br>**Terminate Session:** Ends the session. The client that holds this session will receive a "connection terminated" event.

{{site.data.alerts.callout_success}}
Sort by **Transaction Duration** to display all active sessions at the top.
{{site.data.alerts.end}}

## Session details

Click the **Session Duration** of any session to display details and possible actions for that session.

{% if page.cloud != true %}
<img src="{{ 'images/v21.2/ui-sessions-details-page.png' | relative_url }}" alt="Sessions Details Page" style="border:1px solid #eee;max-width:100%" />
{% endif %}

- **Session** shows the ID of the connected session.
	- **Session Start Time** shows the timestamp at which the session started.
	- **Gateway Node** <a name="session-details-gateway-node"></a> shows the node ID and IP address/port of the [gateway]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#gateway) node handling the client connection.
	- **Client Address** shows the IP address/port of the client that opened the session.
	- **Memory Usage** shows the amount of memory currently allocated to this session, followed by the maximum amount of memory this session has ever allocated.
	- The **Terminate Session** button ends the session. The client that holds this session will receive a "connection terminated" event.
	- The **Terminate Statement** button ends the SQL statement. The session running this statement will receive an error.
- **Transaction** displays the following information for an open transaction.
	- **Transaction Start Time** shows the timestamp at which the transaction started.
	- **Number of Statements Executed** shows the total number of SQL statements executed by the transaction.
	- **Number of Retries** shows the total number of [retries]({{ link_prefix }}transactions.html#transaction-retries) for the transaction.
	- **Number of Automatic Retries** shows the total number of [automatic retries]({{ link_prefix }}transactions.html#automatic-retries) run by CockroachDB for the transaction.
	- **Priority** shows the [priority]({{ link_prefix }}transactions.html#transaction-priorities) for the transaction.
	- **Read Only?** shows whether the transaction is read-only.
	- **AS OF SYSTEM TIME?** shows whether the transaction uses [`AS OF SYSTEM TIME`]({{ link_prefix }}performance-best-practices-overview.html#use-as-of-system-time-to-decrease-conflicts-with-long-running-queries) to return historical data.
	- **Memory Usage** shows the amount of memory currently allocated to this transaction, followed by the maximum amount of memory this transaction has ever allocated.
- **Statement** displays the following information for an active statement.
	- The SQL statement.
	- **Execution Start Time** the timestamp at which the statement was run.
	- **Distributed Execution?** whether the statement uses [Distributed SQL (DistSQL)]({{ link_prefix }}architecture/sql-layer.html#distsql) optimization.

## See also

- [`SHOW SESSIONS`]({{ link_prefix }}show-sessions.html)
- [Statements page]({{ page_prefix }}statements-page.html)
- [SQL Statements]({{ link_prefix }}sql-statements.html)
- [Transactions]({{ link_prefix }}transactions.html)
- [Transaction Error Retry Reference]({{ link_prefix }}transaction-retry-error-reference.html)
{% if page.cloud != true %}
- [Production Checklist](recommended-production-settings.html#hardware)
{% endif %}
