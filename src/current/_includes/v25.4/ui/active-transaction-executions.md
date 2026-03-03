## Active Executions table

Click **Columns** to select the columns to display in the table.

The Active Executions table gives details for each transaction fingerprint in the transaction:

Column | Description
-----|------------
Transaction Execution ID | The execution ID of the transaction.
Most Recent Statement | The most recently executed statement in the transaction.
Status | The status of the execution: `Preparing`, `Waiting`, or `Executing`.
Start Time (UTC) | The timestamp when the execution started.
Elapsed Time | The time elapsed since the transaction started.
Time Spent Waiting | The amount of time the execution experienced [lock contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).
Statements | The number of statements in the transaction.
Retries | The number of times statements in the transaction were retried.
Isolation Level | The [isolation level]({{ link_prefix }}transactions.html#isolation-levels) used for the transaction execution.
Application | The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.

To view details of an active transaction execution, click an execution ID in the **Transaction Execution ID** column to open the [**Transaction Execution** details page](#transaction-execution-details-page).

## Transaction execution details page

The transaction execution details page provides the following details on the transaction execution.

- **Start Time (UTC)**: The timestamp when the execution started.
- **Elapsed Time**: The time elapsed since the transaction started.
- **Status**: The status of the execution: `Preparing`, `Waiting`, or `Executing`.
- **Priority**: The [priority]({{ link_prefix }}transactions.html#transaction-priorities) of the transaction.
- **Internal Retries**: The number of retries of statements in the transaction.
- **Last Retry Reason**: The [reason]({{ link_prefix }}transaction-retry-error-reference.html) for the last statement retry.
- **Number of Statements**: The number of statements in the transaction.
- **Application Name**: The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.
- **Most Recent Statement Execution ID**: Link to the ID of the most recently [executed statement]({{ page_prefix }}statements-page.html#active-executions-table) in the transaction.
- **Session ID**: Link to the ID of the [session]({{ page_prefix }}sessions-page.html) in which the transaction is running.

If a transaction execution is waiting, the transaction execution details are followed by Contention Insights and details of the transaction execution on which the blocked transaction execution is waiting. For more information about contention, see [Transaction contention]({{ link_prefix }}performance-best-practices-overview.html#transaction-contention).

<img src="{{ 'images/v25.4/waiting-transaction.png' | relative_url }}" alt="Movr rides transactions" style="border:1px solid #eee;max-width:100%" />

## See also

- [Transactions]({{ link_prefix }}transactions.html)
- [Transaction Layer]({{ link_prefix }}architecture/transaction-layer.html)
- [Run Multi-Statement Transactions]({{ link_prefix }}run-multi-statement-transactions.html)
{% if page.cloud != true %}
- [Transaction latency graphs]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#transactions)
{% endif %}
- [Transaction retries]({{ link_prefix }}transactions.html#transaction-retries)
- [Statements Page]({{ page_prefix }}statements-page.html)
