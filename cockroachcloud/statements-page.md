---
title: Statements Page
summary: How to use the Statements page to view and manage SQL statements on CockroachDB Cloud.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.versions["cloud"]}}/{% endcapture %}

The **Statements** page helps you:

- Identify frequently executed or high latency [SQL statements](../{{site.versions["cloud"]}}/sql-statements.html).
- View SQL statement fingerprint [details](#statement-details-page).
- Download SQL statement [diagnostics](#diagnostics) for troubleshooting.

{% if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console. The **Statements** tab is selected.
{% else %}
To view this page, click **SQL Activity** in the left-hand navigation of the {{ site.data.products.db }} Console. The **Statements** tab is selected.
{% endif %}

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

## Search and filter

By default, this page shows statements from all applications and databases running on the cluster.

You can search for statements using the search field or the date range selector.

### Search field

To search using the search field, type a string over `Search Statements` and press `Enter`. The list of statements is filtered by the string.

{% include {{version_prefix}}ui/statements-filter.md %}

## Statement statistics

{% include {{version_prefix}}ui/statistics.md %}

{% include common/ui/statements-page.md %}

{% include {{version_prefix}}ui/statements-table.md %}

{% include {{version_prefix}}ui/statement-details.md %}
