## Active Executions table

Click <img src="{{ 'images/common/ui-columns-button.png' | relative_url }}" alt="Column selector" /> to select the columns to display in the table.

The Active Executions table gives details for each transaction fingerprint in the transaction:

Column | Description
-----|------------
Transaction Execution ID | The execution ID of the statement transaction.
Most Recent Statement | The [statement fingerprint](ui-statements-page.html#statements-table) of the most recently executed statement in the transaction.
Status | The status of the execution: Preparing or Executing.
Start Time (UTC) | The time the execution started.
Elapsed Time | The time elapsed since the transaction started.
Time Spent Waiting | The time the execution spent waiting for access to resources.
Statements | The number of statements in the transaction.
Retries | The number of times statements are retried.
Application | The name specified by the [`application_name`](show-vars.html#supported-variables) session setting.

To view details of an active transaction execution, click an execution ID in the **Transaction Execution ID** column to open the **Transaction Execution** details page.

## Transaction Execution details page

The details page provides the following details on the transaction execution.

- **Start Time (UTC)**: the time the execution started.
- **Elapsed Time**: the time elapsed since the transaction started.
- **Status**: the status of the execution: Preparing or Executing.
- **Priority**: the [priority](transactions.html#transaction-priorities) of the transaction.
- **Full Scan**: whether the execution performed a full scan of the table.
- **Internal Retries**: the number of retries of statements in the transaction.
- **Last Retry Reason**: the reason for the last statement retry.
- **Number of Statements**: the number of statements in the transaction.
- **Application Name**: the name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.
- **Most Recent Statement Execution ID**: Link to the ID of the most recently [executed statement](ui-statements-page.html#active-executions-table) in the transaction.
- **Session ID**: Link to the [session](ui-sessions-page.html) in which the transaction is running.

## See also

- [Transactions]({{ link_prefix }}transactions.html)
- [Transaction Layer]({{ link_prefix }}architecture/transaction-layer.html)
- [Run Multi-Statement Transactions]({{ link_prefix }}run-multi-statement-transactions.html)
{% if page.cloud != true %}
- [Transaction latency graphs](ui-sql-dashboard.html#transactions)
{% endif %}
- [Transaction retries]({{ link_prefix }}transactions.html#transaction-retries)
- [Statements Page]({{ page_prefix }}statements-page.html)
