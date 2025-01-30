---
title: Jobs Page
summary: The Jobs page of the DB Console provides details about long-running tasks performed by your cluster.
toc: true
docs_area: reference.db_console
---

The **Jobs** page of the DB Console provides details about long-running tasks performed by your cluster. These can include:

- [`IMPORT`]({{ page.version.version }}/import-into.md).
- {{ site.data.products.enterprise }} [`BACKUP`]({{ page.version.version }}/backup.md) and [`RESTORE`]({{ page.version.version }}/restore.md).
- [User-created table statistics]({{ page.version.version }}/create-statistics.md) created for use by the [cost-based optimizer]({{ page.version.version }}/cost-based-optimizer.md).
- [Automatic table statistics]({{ page.version.version }}/cost-based-optimizer.md#table-statistics).
- [Changefeeds]({{ page.version.version }}/change-data-capture-overview.md).

All users can see their own jobs. You must be an [`admin` user]({{ page.version.version }}/security-reference/authorization.md#admin-role) or a SQL user with the [`VIEWJOB`]({{ page.version.version }}/security-reference/authorization.md#viewjob) [system privilege]({{ page.version.version }}/security-reference/authorization.md#supported-privileges) to view all jobs performed across all nodes in the cluster.

To view this page, click **Jobs** in the left-hand navigation of the DB Console.

