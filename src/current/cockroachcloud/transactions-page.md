---
title: Transactions Page
summary: The Transactions page helps you identify frequently retried or high latency transactions and view transaction details.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

{% include {{version_prefix}}ui/transactions-views.md %}

{% include {{version_prefix}}ui/transactions-filter.md %}

## Transaction statistics

{% include {{version_prefix}}ui/statistics.md %}

{% include common/ui/transactions-page.md %}

{% include {{version_prefix}}ui/transactions-table.md %}

{% include {{version_prefix}}ui/transaction-details.md %}

{% include {{version_prefix}}ui/active-transaction-executions.md %}