---
title: Statements Page
summary: The Statements page helps you identify frequently executed or high latency SQL statements, view statement details, and download statement diagnostics.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Statements** page offers two views on statements: **Statement Fingerprints**, which represents one or more completed SQL statements and **Active Executions**,
which represents individual statement executions in progress.

You choose a view by selecting the **Statement Fingerprints** or **Active Executions** radio button. The selection is retained when you switch between the Statements and Transactions tabs on the SQL Activity page.

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

## Statement Fingerprints view

The **Statements Fingerprints** view helps you:

- Identify frequently executed or high latency [SQL statements](sql-statements.html).
- View SQL statement fingerprint [details](#statement-fingerprint-page).
- Download SQL statement [diagnostics](#diagnostics) for troubleshooting.

{% if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To view this page, click **SQL Activity** in the left-hand navigation of the {{ site.data.products.db }} Console.
{% endif %}

The **Statements** tab is selected. The **Statement Fingerprints** radio button is selected and the [Statements table](#statements-table) displays.

The following screenshot shows the statement fingerprint for `SELECT city, id FROM vehicles WHERE city = $1` while running the [`movr` workload](cockroach-workload.html#run-the-movr-workload).

<img src="{{ 'images/v22.2/statement-fingerprint.png' | relative_url }}" alt="Statement fingerprint" style="border:1px solid #eee;max-width:100%" />

If you click the statement fingerprint in the **Statements** column, the [**Statement Fingerprint** page](#statement-fingerprint-page) displays.

<img src="{{ 'images/v22.2/statement-details.png' | relative_url }}" alt="Statement details" style="border:1px solid #eee;max-width:100%" />

## Active Executions view

The **Active Executions** view helps you:

- Understand and tune workload performance, particularly long-running statements.

{% if page.cloud != true %}
To display this view, click **SQL Activity** in the left-hand navigation of the DB Console.
{% else %}
To display this view, click **SQL Activity** in the left-hand navigation of the {{ site.data.products.db }} Console.
{% endif %}

The **Statements** tab is selected. Click the **Active Executions** radio button. The [Active Executions table](#active-executions-table) displays.

{{site.data.alerts.callout_info}}
Active executions are polled every 10 seconds and fast-running executions will potentially disappear upon each refresh.
{{site.data.alerts.end}}

The following screenshot shows the active statement execution for `SELECT city, id FROM vehicles WHERE city = 'washington dc'`:

<img src="{{ 'images/v22.2/statement-execution.png' | relative_url }}" alt="Statement execution" style="border:1px solid #eee;max-width:100%" />

If you click the execution ID in the **Statement Execution ID** column, the [**Statement Execution** details page](#active-execution-details-page) displays.

<img src="{{ 'images/v22.2/statement-execution-details.png' | relative_url }}" alt="Statement execution details" style="border:1px solid #eee;max-width:100%" />

## Search and filter

By default, the Statements page shows SQL statements from all applications and databases running on the cluster.

### Search statements

To search using the search field:

1. Type a string over `Search Statements`. To search for exact terms in order, wrap the search string in quotes.
1. Press `Enter`.

    The list of statements is filtered by the string.

{% include {{ page.version.version }}/ui/statements-filter.md %}

## Statement statistics

{% include {{ page.version.version }}/ui/statistics.md %}

{% include common/ui/statements-page.md %}

{% include {{ page.version.version }}/ui/statements-table.md %}

{% include {{ page.version.version }}/ui/statement-details.md %}

{% include {{ page.version.version }}/ui/active-statement-executions.md %}
