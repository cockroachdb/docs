---
title: Transactions Page
summary: The Transactions page helps you identify frequently retried or high latency transactions and view transaction details.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

The **Transactions** page helps you:

- Identify frequently [retried](../{{ version_prefix }}transactions.html#transaction-retries) transactions.
- [Troubleshoot](../{{ version_prefix }}query-behavior-troubleshooting.html) high latency transactions or execution failures.
- View transaction [details](#transaction-details-page).

{{site.data.alerts.callout_success}}
In contrast to the [**Statements** page]({{ link_prefix }}statements-page.html), which displays [SQL statement fingerprints]({{ link_prefix }}statements-page.html#sql-statement-fingerprints), the **Transactions** page displays SQL statement fingerprints grouped by [transaction](../{{ version_prefix }}transactions.html).
{{site.data.alerts.end}}

{% if page.cloud != true %}
To view this page, click **SQL Activity** in the left-hand navigation of the DB Console. Click the **Transactions** tab.
{% else %}
To view this page, select a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page), and click **SQL Activity** in the **Monitoring** section of the left side navigation. Select the **Transactions** tab.
{% endif %}

{% include {{version_prefix}}ui/transactions-filter.md %}

## Transaction statistics

{% include {{version_prefix}}ui/statistics.md %}

{% include common/ui/transactions-page.md %}

{% include {{version_prefix}}ui/transactions-table.md %}

{% include {{version_prefix}}ui/transaction-details.md %}
