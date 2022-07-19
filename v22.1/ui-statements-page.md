---
title: Statements Page
summary: The Statements page helps you identify frequently executed or high latency SQL statements, view statement details, and download statement diagnostics.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Statements** page  of the DB Console helps you:

- Identify frequently executed or high latency [SQL statements](sql-statements.html).
- View SQL statement fingerprint [details](#statement-fingerprint-page).
- Download SQL statement [diagnostics](#diagnostics) for troubleshooting.

To view this page, click **SQL Activity** in the left-hand navigation of the DB Console. The **Statements** tab is selected.

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

## Search and filter

By default, the Statements page shows SQL statements from all applications and databases running on the cluster.

### Search statements

To search using the search field, type a string over `Search Statements` and press `Enter`. The list of statements is filtered by the string.

{% include {{ page.version.version }}/ui/statements-filter.md %}

## Statement statistics

{% include {{ page.version.version }}/ui/statistics.md %}

{% include common/ui/statements-page.md %}

{% include {{ page.version.version }}/ui/statements-table.md %}

{% include {{ page.version.version }}/ui/statement-details.md %}
