---
title: What's New in CockroachDB Cloud
toc: true
summary: Additions and changes in CockroachDB Cloud since October 3, 2021.
---

## November 8, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General changes

- {{ site.data.products.serverless }}, a fully-managed, auto-scaling deployment of CockroachDB, is now available. To get started with {{ site.data.products.serverless }} for free, see the [Quickstart](../cockroachcloud/quickstart.html).
- CockroachCloud Free (beta) and CockroachCloud are now {{ site.data.products.serverless }} and {{ site.data.products.dedicated }}, respectively. Your ability to use your cluster will not be affected.
- {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4](v21.2.0-beta.4.html).
- New {{ site.data.products.dedicated }} clusters will now run CockroachDB [v21.1.11](v21.1.11.html).

### Console changes

- The [**Statements**](../cockroachcloud/statements-page.html), [**Transactions**](../cockroachcloud/transactions-page.html), and [**Sessions**](../cockroachcloud/sessions-page.html) pages are now available for {{ site.data.products.serverless }} clusters on the **SQL Activity** page. 
- Statements and transaction statistics are now retained longer for all clusters.
- Legends are now displayed by default for time-series graphs on the [Cluster Overview](../cockroachcloud/cluster-overview-page.html#cluster-overview-metrics) page. 
- The **Transaction retries** metric is no longer part of the **Current activity** panel on the {{ site.data.products.serverless }} [Cluster Overview](../cockroachcloud/cluster-overview-page.html#cluster-statistics-panel) page.
- Deleting an organization with outstanding charges that have not been billed is now prohibited.
- There is now a more clear error message for users attempting to log into {{ site.data.products.db }} using GitHub when they have email and password authentication configured.
- Average RU usage is now shown in the **Request Units** chart for the {{ site.data.products.serverless }} [Cluster Overview](../cockroachcloud/cluster-overview-page.html#request-units) page.
- The PowerShell command to [download the CockroachDB binary](../cockroachcloud/connect-to-your-cluster.html?filters=windows#step-3-connect-to-your-cluster) is now improved for Windows users.
- When under 1 GiB of storage has been used, storage is now shown in MiB instead of GiB in the **Storage used** graph on the {{ site.data.products.serverless }} [Cluster Overview](../cockroachcloud/cluster-overview-page.html#storage-used) page.
- A more descriptive error message is now displayed when attempting to create or edit a [SQL user](../cockroachcloud/user-authorization.html#manage-sql-users) with an invalid username.
- Previously, clicking **cancel** while editing a cluster would take users back to the **Clusters** page. Now, users are taken back to the cluster's **Overview** page.

### Bug fixes

- Fixed a bug where, if a user had reached the maximum number of {{ site.data.products.serverless }} clusters and refreshed the **Create your cluster** page, the {{ site.data.products.serverless-plan }} plan was auto-selected even though it is disabled.
- Fixed a bug where clicking **Cancel** while logging in with GitHub would report and internal error.
- Fixed a bug where organization deletion was temporarily broken.
- Fixed a bug that was preventing the **Request Units** and **SQL Statements** graphs on the {{ site.data.products.serverless }} [Cluster Overview](../cockroachcloud/cluster-overview-page.html#cluster-overview-metrics) page from updating after a certain amount of time.
