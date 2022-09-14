
## Active Executions table

Click <img src="{{ 'images/common/ui-columns-button.png' | relative_url }}" alt="Column selector" /> to select the columns to display in the table.

Column | Description
-----|------------
Statement Execution ID | The execution ID of the statement execution.
Statement Execution | The SQL statement that was executed.
Status | The status of the execution: `Preparing`, `Waiting`, or `Executing`.
Start Time (UTC) | A timestamp started by the execution.
Time Spent Waiting | The time the execution spent waiting and experiencing lock contention.
Application | The name specified by the [`application_name`](show-vars.html#supported-variables) session setting.

To view details of an active statement execution, click an execution ID in the **Statement Execution ID** column to open the [**Statement Execution** details page](#statement-execution-details-page).

## Statement Execution details page

The Statement Execution details page provides the following details on the statement execution.

- **Start Time (UTC)**: The timestamp the execution started.
- **Elapsed Time**: The time elapsed since the execution started.
- **Status**: The status of the execution: `Preparing`, `Waiting`, or `Executing`.
- **Full Scan**: Whether the execution performed a full scan of the table.
- **Application Name**: The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.
- **User Name**: The name of the user running the statement.
- **Client Address**: The IP address and port of the client that opened the session in which the statement is running.
- **Session ID**: Link to the [session](ui-sessions-page.html) in which the transaction is running.
- **Transaction Execution ID**: Link to the ID of the [transaction](ui-transactions-page.html#active-executions-table) in which the statement is executing.

## See also

- [Troubleshoot Query Behavior]({{ link_prefix }}query-behavior-troubleshooting.html)
- [Transaction retries]({{ link_prefix }}transactions.html#transaction-retries)
- [Optimize Statement Performance]({{ link_prefix }}make-queries-fast.html)
- [Support Resources]({{ link_prefix }}support-resources.html)
- [Raw Status Endpoints]({{ link_prefix }}monitoring-and-alerting.html#raw-status-endpoints)
- [Transactions Page]({{ page_prefix }}transactions-page.html)
