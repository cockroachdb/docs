---
title: Statements Page
summary: The Statements page helps you identify frequently executed or high latency SQL statements, view statement details, and download statement diagnostics.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Statements** page provides information about the execution of SQL statements in your cluster, using data in the cluster's [`crdb_internal` system catalog]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#crdb_internal-system-catalog). To view it, click **SQL Activity**, then click **Statements**.

It offers two views:

- **Statement Fingerprints** show information about completed SQL statements.
- **Active Executions** show information about SQL statements which are currently executing.

Choose a view by selecting the **Statement Fingerprints** or **Active Executions** radio button. The selection is retained when you switch between the **Statements** and **Transactions** tabs on the **SQL Activity** page.

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

## Statement Fingerprints view

The **Statements Fingerprints** view helps you:

- Identify frequently executed or high latency [SQL statements]({% link {{ page.version.version }}/sql-statements.md %}).
- View SQL statement fingerprint [details](#statement-fingerprint-page).
- Download SQL statement [diagnostics](#diagnostics) for troubleshooting.

{% if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To view this page, click **SQL Activity** in the left-hand navigation of the CockroachDB {{ site.data.products.cloud }} Console.
{% endif %}

The **Statements** tab is selected. The **Statement Fingerprints** radio button is selected and the [Statements table](#statements-table) displays.

The following screenshot shows the statement fingerprint for `SELECT city, id FROM vehicles WHERE city = $1` while running the [`movr` workload]({% link {{ page.version.version }}/cockroach-workload.md %}#run-the-movr-workload):

<img src="{{ 'images/v23.2/statement-fingerprint.png' | relative_url }}" alt="Statement fingerprint" style="border:1px solid #eee;max-width:100%" />

If you click the statement fingerprint in the **Statements** column, the [**Statement Fingerprint** page](#statement-fingerprint-page) displays.

<img src="{{ 'images/v23.2/statement-details.png' | relative_url }}" alt="Statement details" style="border:1px solid #eee;max-width:100%" />

## Active Executions view

The **Active Executions** view helps you:

- Understand and tune workload performance, particularly for long-running statements.

{% if page.cloud != true %}
To display this view, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To display this view, click **SQL Activity** in the left-hand navigation of the CockroachDB {{ site.data.products.cloud }} Console.
{% endif %}

The **Statements** tab is selected. Click the **Active Executions** radio button. The [Active Executions table](#active-executions-table) displays.

{{site.data.alerts.callout_info}}
Active executions are polled every 10 seconds. Faster-running executions will potentially disappear upon each refresh.
{{site.data.alerts.end}}

The following screenshot shows the active statement execution for `SELECT city, id FROM vehicles WHERE city = 'washington dc'` while running the [`movr` workload]({% link {{ page.version.version }}/cockroach-workload.md %}#run-the-movr-workload):

<img src="{{ 'images/v23.2/statement-execution.png' | relative_url }}" alt="Statement execution" style="border:1px solid #eee;max-width:100%" />

If you click the execution ID in the **Statement Execution ID** column, the [**Statement Execution** details page](#statement-execution-details-page) displays.

<img src="{{ 'images/v23.2/statement-execution-details.png' | relative_url }}" alt="Statement execution details" style="border:1px solid #eee;max-width:100%" />

{% include {{ page.version.version }}/ui/statements-filter.md %}

## Statement statistics

{% include {{ page.version.version }}/ui/statistics.md %}

{% include common/ui/statements-page.md %}

{% include {{ page.version.version }}/ui/statements-table.md %}

{% include {{ page.version.version }}/ui/statement-details.md %}

{% include {{ page.version.version }}/ui/active-statement-executions.md %}
