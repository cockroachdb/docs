
## Active Executions table

Click **Columns** to select the columns to display in the table.

Column | Description
-----|------------
Statement Execution ID | The execution ID of the statement execution.
Statement Execution | The SQL statement that was executed.
Status | The status of the execution: `Preparing`, `Waiting`, or `Executing`.
Start Time (UTC) | The timestamp when the execution started.
Time Spent Waiting | The time the execution spent waiting and experiencing [lock contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).
Isolation Level | The [isolation level]({{ link_prefix }}transactions.html#isolation-levels) used for the statement execution.
Application | The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.

To view details of an active statement execution, click an execution ID in the **Statement Execution ID** column to open the [**Statement Execution** details page](#statement-execution-details-page).

## Statement execution details page

The statement execution details page provides the following details on the statement execution.

- **Start Time (UTC)**: The timestamp when the execution started.
- **Elapsed Time**: The time elapsed since the execution started.
- **Status**: The status of the execution: `Preparing`, `Waiting`, or `Executing`.
- **Full Scan**: Whether the execution performed a full scan of the table.
- **Application Name**: The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.
- **User Name**: The name of the user running the statement.
- **Client Address**: The IP address and port of the client that opened the session in which the statement is running.
- **Session ID**: Link to the [session]({{ link_prefix }}ui-sessions-page.html) in which the transaction is running.
- **Transaction Execution ID**: Link to the ID of the [transaction]({{ link_prefix }}ui-transactions-page.html#active-executions-table) in which the statement is executing.

If a statement execution is waiting, the statement execution details are followed by Contention Insights and details of the statement execution on which the blocked statement execution is waiting. For more information about contention, see [Understanding and avoiding transaction contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

<img src="/docs/images/{{ page.version.version }}/waiting-statement.png" alt="Movr rides transactions" style="border:1px solid #eee;max-width:100%" />

## See also

- [Troubleshoot Query Behavior]({{ link_prefix }}query-behavior-troubleshooting.html)
- [Transaction retries]({{ link_prefix }}transactions.html#transaction-retries)
- [Optimize Statement Performance]({{ link_prefix }}make-queries-fast.html)
- [Support Resources]({{ link_prefix }}support-resources.html)
- [Raw Status Endpoints]({{ link_prefix }}monitoring-and-alerting.html#raw-status-endpoints)
- [Transactions Page]({{ page_prefix }}transactions-page.html)
