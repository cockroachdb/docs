---
title: What&#39;s New in CockroachCloud
toc: true
summary: Additions and changes in CockroachCloud since June 7, 2021.
---

## July 6, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General changes

- New CockroachCloud clusters will now run CockroachDB [v21.1.5](v21.1.5.html).
- Starting this month, paid CockroachCloud clusters will be billed monthly instead of every two weeks.

### Console changes

- [Multi-region](../cockroachcloud/create-your-cluster.html#step-3-select-the-region-s) clusters can now be created through the Console. To learn more about creating a multi-region cluster, see [Planning your cluster](../cockroachcloud/cluster-management.html?filters=dedicated#planning-your-cluster).
- The **Connect** modal now has updated commands to make [connecting to your cluster](../cockroachcloud/connect-to-a-serverless-cluster.html) a smoother experience on Mac, Linux, and Windows.
- All CockroachCloud users now have access to the [**Transactions** page](../cockroachcloud/transactions-page.html) in the Console.
- Navigation on the **Clusters** page is now a vertical sidebar instead of horizontal tabs.
- Added a tooltip to the **Upgrade** option in the **Action** Menu, which gives users more version-specific context.
- Users can now **Clear SQL Stats** from the [**Statements** page](../cockroachcloud/statements-page.html) for clusters running [v21.1.3](v21.1.3.html) or later.

### Bug fixes

- Fixed a bug where clicking on the [**Alerts** page](../cockroachcloud/alerts-page.html) broke the Organization header for users with multiple Organizations.
- Fixed a bug where nodes were cycling in clusters running [v21.1.4](v21.1.4.html).
- Fixed several broken links to documentation throughout the Console.
- Users will no longer see alerts for clusters that are not in a **ready** state.
- Fixed a bug that was causing users to receive false positive CPU alerts.