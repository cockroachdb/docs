---
title: Jobs Page
summary: The Jobs page of the DB Console provides details about long-running tasks performed by your cluster.
toc: true
docs_area: reference.db_console
---

The **Jobs** page of the DB Console provides details about long-running tasks performed by your cluster. These can include:

{% include {{ page.version.version }}/sql/schema-changes.md %}.
- [`IMPORT`](import.html).
- {{ site.data.products.enterprise }} [`BACKUP`](backup.html) and [`RESTORE`](restore.html).
- [User-created table statistics](create-statistics.html) created for use by the [cost-based optimizer](cost-based-optimizer.html).
- [Automatic table statistics](cost-based-optimizer.html#table-statistics).
- [Changefeeds](change-data-capture-overview.html).

All users can see their own jobs, and `admin` users can view all jobs performed across all nodes in the cluster.

To view this page, click **Jobs** in the left-hand navigation of the DB Console.

{% include common/ui/jobs-page.md %}

{% include {{ page.version.version }}/ui/jobs.md %}
