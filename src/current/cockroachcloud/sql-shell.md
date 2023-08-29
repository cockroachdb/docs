---
title: SQL Shell
summary: Use Cloud Console SQL Shell to run statements.
toc: true
cloud: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/limited-access.md %}
{{site.data.alerts.end}}

The **SQL Shell** page on the {{ site.data.products.db }} Console enables you to run queries on your cluster directly from your browser.

To view this page, select a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page), and navigate to the cluster's **SQL Shell** page.

## Limitations

- All statements in the SQL Shell are executed within a transaction, so queries like [`SET CLUSTER SETTING`]({% link /{{ site.current_cloud_version }}/set-cluster-setting.md %}) are not supported.
- The SQL Shell does not yet support [sessions]({% link /{{ site.current_cloud_version }}/sessions.md %}).
- The SQL Shell is available only to users of enrolled organizations with the [cluster admin role]({% link cockroachcloud/managing-access.md %}).

## Functionality

- SQL user
- Select DB
- Run statement
- Edit and re-run
- Copy statement
- Loading, success, no results
- Clear
- Export results
- Share feedback

## See also

- [`cockroach sql`]({% link /{{ site.current_cloud_version }}/cockroach-sql.md %})
- [Learn CockroachDB SQL]({% link /{{ site.current_cloud_version }}/learn-cockroachdb-sql.md %})