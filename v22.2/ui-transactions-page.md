---
title: Transactions Page
summary: The Transactions page helps you identify frequently retried or high latency transactions and view transaction details.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Transactions** page offers two views on transactions: **Transaction Fingerprints**, which represents one or more completed SQL transactions and **Active Executions**,
which represents individual transaction executions in progress.

You choose a view by selecting the **Transaction Fingerprints** or **Active Executions** radio button. The selection is retained when you switch between the Statements and Transactions tabs on the SQL Activity page.

{{site.data.alerts.callout_success}}
In contrast to the [**Statements** page](ui-statements-page.html), which displays [SQL statement fingerprints](ui-statements-page.html#sql-statement-fingerprints), the **Transactions** page displays transaction fingerprints, that is, SQL statement fingerprints grouped by [transaction](transactions.html).
{{site.data.alerts.end}}

## Transaction Fingerprints view

The **Transaction Fingerprints** view helps you:

- Identify frequently [retried]({{ link_prefix }}transactions.html#transaction-retries) transactions.
- [Troubleshoot]({{ link_prefix }}query-behavior-troubleshooting.html) high latency transactions or execution failures.
- View transaction [details](#transaction-details-page).

{% if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To view this page, click **SQL Activity** in the left-hand navigation of the {{ site.data.products.db }} Console. Click the **Transactions** tab.
{% endif %}

Click the **Transactions** tab. The **Transaction Fingerprints** radio button is selected and the [Transactions table](#transactions-table) displays.

The following screenshot shows the transaction fingerprint for `SELECT city, id FROM vehicles WHERE city = $1` while running the [`movr` workload](cockroach-workload.html#run-the-movr-workload).

<img src="{{ 'images/v22.2/transaction-fingerprint.png' | relative_url }}" alt="Transaction fingerprint" style="border:1px solid #eee;max-width:100%" />

If you click the transaction fingerprint in the **Transactions** column, the [**Transaction Details** page](#transaction-details-page) displays.

<img src="{{ 'images/v22.2/transaction-details.png' | relative_url }}" alt="Transaction details" style="border:1px solid #eee;max-width:100%" />

## Active Executions view

The **Active Executions** view helps you:

- Understand and tune workload performance, particularly long-running transactions.

{% if page.cloud != true %}
To display this view, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To display this view, click **SQL Activity** in the left-hand navigation of the {{ site.data.products.db }} Console.
{% endif %}

The **Statements** tab is selected. Click the **Transactions** tab and the **Active Executions** radio button. The [Active Executions table](#active-executions-table) displays.

{{site.data.alerts.callout_info}}
Active executions are polled every 10 seconds and fast-running executions will potentially disappear upon each refresh.
{{site.data.alerts.end}}

The following screenshot shows the active statement execution for `SELECT city, id FROM vehicles WHERE city = 'paris'`:

<img src="{{ 'images/v22.2/transaction-execution.png' | relative_url }}" alt="Transaction execution" style="border:1px solid #eee;max-width:100%" />

If you click the execution ID in the **Transaction Execution ID** column, the [**Transaction Execution** details page](#transaction-execution-details-page) displays.

<img src="{{ 'images/v22.2/transaction-execution-details.png' | relative_url }}" alt="Transaction execution details" style="border:1px solid #eee;max-width:100%" />

## Search and filter

By default, the **Transactions** page shows transactions from all applications and databases running on the cluster.

### Search field

To search using the search field:

1. Type a string over `Search Transactions`. To search for exact terms in order, wrap the search string in quotes.
1. Press `Enter`.

    The list of transactions is filtered by the string.

{% include {{ page.version.version }}/ui/transactions-filter.md %}

## Transaction statistics

{% include {{ page.version.version }}/ui/statistics.md %}

{% include common/ui/transactions-page.md %}

{% include {{ page.version.version }}/ui/transactions-table.md %}

{% include {{ page.version.version }}/ui/transaction-details.md %}

{% include {{ page.version.version }}/ui/active-transaction-executions.md %}
