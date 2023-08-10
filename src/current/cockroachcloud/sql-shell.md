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

- All statements from the SQL Shell are within a transaction. Queries like SET CLUSTER SETTING are not supported.
- The SQL Shell is currently session less.

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

- [Learn CockroachDB SQL](../{{site.versions["stable"]}}/learn-cockroachdb-sql.html)