---
title: Statements Page
summary: The Statements page helps you identify frequently executed or high latency SQL statements, view statement details, and download statement diagnostics.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Statements** page  of the DB Console helps you:

- Identify frequently executed or high latency [SQL statements](sql-statements.html).
- View SQL statement [details](#statement-details-page).
- Download SQL statement [diagnostics](#diagnostics) for [troubleshooting]().

To view this page, click **SQL Activity** in the left-hand navigation of the DB Console. The **Statements** tab is selected.

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

{% include common/ui/statements-page.md %}

{% include {{ page.version.version }}/ui/statements-table.md %}

{% include {{ page.version.version }}/ui/statement-details.md %}
