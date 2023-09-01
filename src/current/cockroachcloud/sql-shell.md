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

## Example workflow

The following examples assume you have already [created a CockroachDB {{ site.data.products.cloud }} cluster]({% link cockroachcloud/create-a-serverless-cluster.md %}) and have [access](#limitations) to the SQL Shell.

1. In the SQL Shell, run [`CREATE TABLE`](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/create-table.html) followed by a table name, the column names, and the [data type](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/data-types.html) and [constraint](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/constraints.html), if any, for each column:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE accounts (
        id INT PRIMARY KEY,
        balance DECIMAL
    );
    ~~~

    After a few seconds, the statement will succeed.

1. Insert rows into the table using [`INSERT INTO`](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/insert.html) followed by the table name and then the column values listed in the order in which the columns appear in the table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO accounts VALUES (1, 10000.50);
    ~~~

1. Click the copy icon next to the successful `INSERT INTO` statement, paste it into the input field, edit the values, and run it again:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO accounts VALUES (2, 20000.50);
    ~~~

1. Query the table with [`SELECT`](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/select-clause.html) followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT balance FROM accounts;
    ~~~

    ~~~
      balance
    +----------+
      10000.50
      25000.00
       8100.73
       9400.10
      NULL
      NULL
    (6 rows)
    ~~~

1. Edit the previous statement to use the `*` wildcard:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM accounts;
    ~~~

    ~~~
      id | balance
    +----+----------+
       1 | 10000.50
       2 | 25000.00
       3 |  8100.73
       4 |  9400.10
       5 | NULL
       6 | NULL
    (6 rows)
    ~~~

1. Click **Export results** to download a CSV file of the output.

## See also

- [`cockroach sql`](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroach-sql.html)
- [Learn CockroachDB SQL](https://cockroachlabs.com/docs/{{ site.current_cloud_version }}/learn-cockroachdb-sql.html)