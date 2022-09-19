{% if page.cloud != true %}
<img src="{{ 'images/v22.2/ui-sessions-page.png' | relative_url }}" alt="Sessions Page" style="border:1px solid #eee;max-width:100%" />
{% endif %}

To filter the sessions, click the **Filters** field.

<img src="{{ 'images/v22.2/ui-session-filter.png' | relative_url }}" alt="Session filter" />

- To filter by [application]({{ link_prefix }}connection-parameters.html#additional-connection-parameters), select **Application Name** and choose one or more applications.

    - Queries from the SQL shell are displayed under the `$ cockroach` app.
    - If you have not set `application_name` in a client connection string, it appears as `unset`.

- To filter by username or session status, select **User Name** or **Session Status** and check one or more checkboxes.
- To filter by session duration, specify the session time and unit.

Click <img src="{{ 'images/common/ui-columns-button.png' | relative_url }}" alt="Column selector" /> to select the columns to display in the table.

The following properties are displayed for each session:

Column | Description
--------- | -----------
Session Start Time (UTC) | The timestamp at which the session started.
Session Duration | The amount of time the session has been open.
Session Active Duration | The amount of time transactions were executing while the session was open.
Status  | The status of the session: `Active`, `Closed`, or `Idle`. A session is `Active` if it has an open explicit or implicit transaction (individual SQL statement) with a statement that is actively running or waiting to acquire a lock. A session is `Closed` if it has closed the connection to CockroachDB. A session is `Idle` if it is not executing a statement.
Most Recent Statement | If more than one statement is executing, the most recent statement. If the session is Idle, the last statement.
Statement Start Time (UTC) | The timestamp at which the statement started.
Transaction Count | The number of transactions completed in the session.
Memory Usage | Amount of memory currently allocated to the session followed by the maximum amount of memory the session has ever been allocated.
Client IP Address | The IP address and port of the client that opened the session.
User Name | The user that opened the session.
Application Name | The application that ran the session.
Actions | Options to cancel the active statement and cancel the session. These require the `CANCELQUERY` [role option]({{ link_prefix }}alter-role.html#role-options).<ul><li>**Cancel Statement:** Ends the SQL statement. The session running this statement will receive an error. </li> <li>**Cancel Session:** Ends the session. The client that holds this session will receive a "connection terminated" event.</li></ul>

To view details of a session, click a **Session Start Time (UTC)** to display session details.

## Session details

If a session is idle, the **Transaction** and **Most Recent Statement** panels will display **No Active [Transaction | Statement]**.

{% if page.cloud != true %}
<img src="{{ 'images/v22.2/ui-sessions-details-page.png' | relative_url }}" alt="Sessions Details Page" style="border:1px solid #eee;max-width:100%" />
{% endif %}

The **Cancel statement** button ends the SQL statement. The session running this statement will receive an error.
The **Cancel session** button ends the session. The client that holds this session will receive a "connection terminated" event.

- **Session Details**
  - **Session Start Time** shows the timestamp at which the session started.
  - **Gateway Node** <a name="session-details-gateway-node"></a> shows the node ID and IP address/port of the [gateway]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#gateway) node handling the client connection.
  - **Application Name** shows the name of the application connected to the session.
  - **Client IP Address** shows the IP address/port of the client that opened the session.
  - **Memory Usage** shows the amount of memory currently allocated to this session, followed by the maximum amount of memory this session has ever allocated.
  - **User Name** displays the name of the user that started the session.

- **Transaction** displays the following information for an open transaction.
  - **Transaction Start Time** shows the timestamp at which the transaction started.
  - **Number of Statements Executed** shows the total number of SQL statements executed by the transaction.
  - **Number of Retries** shows the total number of [retries]({{ link_prefix }}transactions.html#transaction-retries) for the transaction.
  - **Number of Automatic Retries** shows the total number of [automatic retries]({{ link_prefix }}transactions.html#automatic-retries) run by CockroachDB for the transaction.
  - **Read Only?** shows whether the transaction is read-only.
  - **AS OF SYSTEM TIME?** shows whether the transaction uses [`AS OF SYSTEM TIME`]({{ link_prefix }}performance-best-practices-overview.html#use-as-of-system-time-to-decrease-conflicts-with-long-running-queries) to return historical data.
  - **Priority** shows the [priority]({{ link_prefix }}transactions.html#transaction-priorities) for the transaction.
  - **Memory Usage** shows the amount of memory currently allocated to this transaction, followed by the maximum amount of memory this transaction has ever allocated.

- **Most Recent Statement** displays the following information for an active statement.
  - The SQL statement.
  - **Execution Start Time** is the timestamp at which the statement was run.
  - **Distributed Execution?** shows whether the statement uses [Distributed SQL (DistSQL)]({{ link_prefix }}architecture/sql-layer.html#distsql) optimization.

## See also

- [`SHOW SESSIONS`]({{ link_prefix }}show-sessions.html)
- [Statements page]({{ page_prefix }}statements-page.html)
- [SQL Statements]({{ link_prefix }}sql-statements.html)
- [Transactions]({{ link_prefix }}transactions.html)
- [Transaction Error Retry Reference]({{ link_prefix }}transaction-retry-error-reference.html)
{% if page.cloud != true %}
- [Production Checklist](recommended-production-settings.html#hardware)
{% endif %}
