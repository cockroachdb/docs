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

To use this feature, select a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page), and navigate to the cluster's **SQL Shell** page.

## Limitations

- All statements in the SQL Shell are executed within a transaction, so queries like [`SET CLUSTER SETTING`](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/set-cluster-setting.html) are not supported.
- The SQL Shell does not yet support [sessions](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/sessions.html).
- The SQL Shell is available only to users of enrolled organizations with the [Cluster Administrator or Cluster Operator role]({% link cockroachcloud/managing-access.md %}).

## Overview

Above the SQL Shell input field, you will see the active user and cluster details in the format `{user name} @ {cluster-name}:{database}`. Note that the user is the **Team member** you are logged into the {{ site.data.products.cloud }} Console as, not a SQL user, and you must have the Cluster Administrator or Cluster Operator [role]({% link cockroachcloud/managing-access.md %}) to use this SQL Shell. Other users can still access CockroachDB's [command line SQL shell](https://cockroachlabs.com/docs/{{site.versions["stable"]}}/cockroach-sql.html).

You can change the active database in the dropdown menu above the input field. If you create a new database in the SQL Shell, you will have to reload the page to refresh the database dropdown menu. Refreshing the page will also clear your activity.

To execute a SQL statement, enter it in the input field and either click **Run** or use the **Enter** key. The statement status will be **Loading** until it either **Succeeds** or returns an **Error**. Any results returned can be exported by clicking the **Export results** button below the executed statement.

You can select any statement that you've previously run and copy it, edit it, or re-run it.

### Example

The following example is adapted from the Learn Cockroach SQL documentation.

## See also

- [`cockroach sql`](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroach-sql.html)
- [Learn CockroachDB SQL](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/learn-cockroach-sql.html)