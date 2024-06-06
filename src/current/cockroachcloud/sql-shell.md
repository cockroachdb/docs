---
title: SQL Shell
summary: Use Cloud Console SQL Shell to run statements.
toc: true
cloud: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/preview.md %}
{{site.data.alerts.end}}

The **SQL Shell** page on the {{ site.data.products.db }} Console enables you to run queries on your cluster directly from your browser.

To use this feature, select a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page), and navigate to the cluster's **SQL Shell** page.

## Limitations

- All statements in the SQL Shell are executed within a transaction, so you cannot use the [SET CLUSTER SETTING](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/set-cluster-setting) statement to configure cluster settings.
- The SQL Shell does not yet support sessions.
- The SQL Shell is available to CockroachDB {{ site.data.products.cloud }} users with the [Cluster Administrator role]({% link cockroachcloud/managing-access.md %}).
- The SQL Shell is not available by default for CockroachDB {{ site.data.products.dedicated }} advanced clusters. To get access to the SQL Shell for your CockroachDB {{ site.data.products.dedicated }} advanced cluster, [contact us](https://support.cockroachlabs.com/hc/en-us).

## Overview

Above the SQL Shell input field, you will see the active user and cluster details in the format `{user name} @ {cluster-name}:{active-database}`. Note that the user displayed is the **Team member** currently logged into the {{ site.data.products.cloud }} Console, not the active SQL user, which is `root`. Team members without the [Cluster Administrator role]({% link cockroachcloud/managing-access.md %}) needed to access the {{ site.data.products.cloud }} Console SQL Shell can still access CockroachDB's [command line SQL shell](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql).

You can change the active database in the dropdown menu above the input field. If you create a new database in the SQL Shell, you will have to reload the page to refresh the database dropdown menu. Reloading the page will also clear your activity.

To execute a SQL statement, enter it in the input field and either click **Run** or use the **Enter** key. The statement status will be **Loading** until it either **Succeeds** or returns an **Error**. Any results returned can be exported by clicking the **Export results** button below the executed statement.

You can select any statement that you've previously run and copy it, edit it, or re-run it.

## Example workflow

The following examples assume you have already [created a CockroachDB {{ site.data.products.cloud }} cluster]({% link cockroachcloud/create-a-serverless-cluster.md %}) and have [access](#limitations) to the SQL Shell.

1. In the SQL Shell, run [`CREATE TABLE`](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/create-table) followed by a table name, the column names, and the [data type](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/data-types) and [constraint](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/constraints), if any, for each column:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE dogs (
        id INT PRIMARY KEY,
        name STRING
    );
    ~~~

1. Insert rows into the table using [`INSERT INTO`](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/insert) followed by the table name and then the column values listed in the order in which the columns appear in the table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO dogs VALUES (1, 'Petee'), (2, 'Carl');
    ~~~

1. Click the copy icon next to the successful `INSERT INTO` statement, paste it into the input field, edit the values, and run it again:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO dogs VALUES (3, 'Blue'), (4, 'Clifford');
    ~~~

1. Query the table with [`SELECT`](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/select-clause) followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT name FROM dogs;
    ~~~

    ~~~
         | name
    +----+----------+
       1 | Petee
       2 | Carl
       3 | Blue
       4 | Clifford
    ~~~

1. Edit the executed `SELECT` statement to replace `name` with the `*` wildcard symbol and click **Run**:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM dogs;
    ~~~

    ~~~
         | id | name
    +----+----------+
      1  | 1 | Petee
      2  | 2 | Carl
      3  | 3 | Blue
      4  | 4 | Clifford
    ~~~
    
    Note that each line of a query's results will be numbered independently of the output. This is for readability and will not be shown in any exported data.

1. Click **Export results** to download a CSV file of the output.

## See also

- [`cockroach sql`](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroach-sql)
- [Learn CockroachDB SQL](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/learn-cockroachdb-sql)