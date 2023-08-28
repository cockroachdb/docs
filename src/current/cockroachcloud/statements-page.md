---
title: Statements Page
summary: How to use the Statements page to view and manage SQL statements on CockroachDB Cloud.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

The **Statements** page helps you:

- Identify frequently executed or high latency [SQL statements](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/sql-statements).
- View SQL statement fingerprint [details](#statement-details-page).
- Download SQL statement [diagnostics](#diagnostics) for troubleshooting.

{% if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console. The **Statements** tab is selected.
{% else %}
To view this page, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **SQL Activity** in the **Monitoring** section of the left side navigation. Select the **Statements** tab.
{% endif %}

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

{% include {{version_prefix}}ui/statements-filter.md %}

## Statement statistics

{% include {{version_prefix}}ui/statistics.md %}

{% include common/ui/statements-page.md %}

{% include {{version_prefix}}ui/statements-table.md %}

{% include {{version_prefix}}ui/statement-details.md %}
