---
title: Scale to Multiple Regions
summary: Learn how to scale a single-region application to multiple regions.
toc: true
docs_area: develop
---

This page provides guidance for scaling a single-region application to multiple regions.

Before reading this page, review [Multi-Region Capabilities Overview](multiregion-overview.html).

## Overview

Scaling an application from a single region to multiple regions consists of:

- [Scaling the database](#scale-the-database), which includes adding new nodes to a CockroachDB cluster in different regions, adding regions to the database schema, and optionally transforming the database schema to leverage multi-region table localities.

- [Scaling the application](#scale-the-application), which includes deploying the application in new regions and, if necessary, updating the application code to work with the multi-region database schema.

## Scale the database

### Step 1. Prep the database

Use an [`ALTER DATABASE ... SET PRIMARY REGION`](set-primary-region.html) statement to set the database's [primary region](multiregion-overview.html#database-regions) to a region in which the cluster is deployed. This region must have been specified as a [regional locality](cockroach-start.html#locality) at cluster startup.

Setting the primary region before adding new regional nodes to the cluster prevents CockroachDB from [rebalancing row replications](architecture/replication-layer.html#leaseholder-rebalancing) across all regions each time a node is added in a new region.

{{site.data.alerts.callout_info}}
Executing `ALTER` statements performs a [schema migration](online-schema-changes.html) on the cluster. If you are using a schema migration tool, you will need to execute these statements as raw SQL, as the [multi-region SQL syntax](multiregion-overview.html) is specific to CockroachDB.

Here are some simple tutorials on executing schema migrations against CockroachDB clusters:

- [Migrate CockroachDB Schemas with Liquibase](liquibase.html)
- [Migrate CockroachDB Schemas with Flyway](flyway.html)
- [Migrate CockroachDB Schemas with Alembic](alembic.html)
- [Execute SQL statements from a file](cockroach-sql.html#execute-sql-statements-from-a-file) and [Change and Remove Objects in a Database Schema](schema-design-update.html)
{{site.data.alerts.end}}

### Step 2. Scale the cluster deployment

Scale the cluster by adding nodes to the cluster in new regions.

For instructions on adding nodes to an existing cluster, see one of the following pages:

- For managed {{ site.data.products.db }} deployments, see [Cluster Management](../cockroachcloud/cluster-management.html).
- For orchestrated deployments, see [Orchestrate CockroachDB Across Multiple Kubernetes Clusters](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html).
- For manual deployments, see [`cockroach start`](cockroach-start.html) and [Manual Deployment](manual-deployment.html).

{{site.data.alerts.callout_info}}
For orchestrated and manual deployments, you must specify a [regional locality](cockroach-start.html#locality) for each node at startup. These regional localities are represented as [cluster regions](multiregion-overview.html#cluster-regions) in the cluster.
{{site.data.alerts.end}}

### Step 3. Scale the database schema

Use an [`ALTER DATABASE ... ADD REGIONS`](add-region.html) statement to add the new regions to your database. Only cluster regions (i.e., regional localities specified at cluster startup) can be added as [database regions](multiregion-overview.html#database-regions).

After you add new regions to the database schema, you can optionally configure the [survival goals](multiregion-overview.html#survival-goals) and [table localities](multiregion-overview.html#table-locality) of the multi-region database:

- Add [`ALTER DATABASE ... SURVIVE ... FAILURE`](survive-failure.html) statements to set your database's [survival goals](multiregion-overview.html#survival-goals).

- Add [`ALTER TABLE ... SET LOCALITY`](set-locality.html) statements to set [table localities](multiregion-overview.html#table-locality) for each table.

## Scale the application

### Step 1. Scale application deployments

Scaling application deployments in multiple regions can greatly improve latency for the end-user of the application.

For guidance on connecting to CockroachDB from an application deployment, see one of the following pages:

- For connecting to managed, {{ site.data.products.db }} deployments, see [Connect to Your {{ site.data.products.dedicated }} Cluster](../cockroachcloud/connect-to-your-cluster.html) and [Connect to the Database ({{ site.data.products.dedicated }})](connect-to-the-database.html?filters=dedicated).
- For connecting to a standard CockroachDB deployment, see [`cockroach sql`](cockroach-sql.html) and [Connect to the Database](connect-to-the-database.html).

To limit the latency between the application and the database, each deployment of the application should communicate with the closest database deployment. For details on configuring database connections for individual application deployments, consult your cloud provider's documentation. For an example using Google Cloud services, see [Multi-Region Application Deployment](multi-region-deployment.html).

{{site.data.alerts.callout_info}}
A multi-region application deployment does not require a multi-region database deployment. Deploying a global application in multiple regions can yield significant latency benefits for the end user, even if you have not yet scaled your database in multiple regions. For an example, see [Reducing Multi-Region Latency with Follower Reads](https://www.cockroachlabs.com/blog/follower-reads/#:~:text=Deployment%202%3A%20Global%20Application%20Deployment%2C%20No%20Follower%20reads).

If you do scale the application first, make sure that you reconfigure each application deployment to communicate with the closest database deployment after deploying the database in multiple regions.
{{site.data.alerts.end}}

### Step 2. *(Optional)* Update the application code for multi-region

For most table localities, including the default locality `LOCALITY REGIONAL BY TABLE IN PRIMARY REGION`, *you do not need to update your application code after migrating your database schema for multi-region*. CockroachDB automatically optimizes queries against multi-region databases, based on the regional locality of the node executing the query, and on the multi-region configuration of the database. For more details, see [Regional Tables](regional-tables.html#regional-by-row-tables). For an extended example, see [Develop and Deploy a Global Application: Create a Multi-Region Database Schema](movr-flask-database.html).

However, there are some scenarios in which you might need to update the SQL operations in your application. For example:

- If a table has a `REGIONAL BY ROW AS <custom_region_column>` table locality, and you want to explicitly insert regional values into a table, as shown in [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html#configure-regional-by-row-tables).
- If a table has a `REGIONAL BY ROW` locality, and you want to update the `crdb_region` value of existing rows in the table based on some other column value, as shown in [Set the table locality to `REGIONAL BY ROW`](set-locality.html#set-the-table-locality-to-regional-by-row).
- If a table has a `REGIONAL BY ROW` locality, and you want to filter a [selection query](select-clause.html#filter-rows) based on the `crdb_region` value.

In all of these scenarios, statements reference the column that tracks the region for each row in a `REGIONAL BY ROW` locality. This column can be a custom column of the built-in `ENUM` type `crdb_internal_region`, or it can be the default, hidden [`crdb_region` column](set-locality.html#crdb_region).

If you need to explicitly reference the region-tracking column in a SQL operation in your application code, you should do the following:

- Verify that the region-tracking column is visible to the ORM.

    To make a hidden column visible, use an [`ALTER TABLE ... ALTER COLUMN ... SET VISIBLE` statement](alter-column.html). By default, the `crdb_region` column created by CockroachDB is hidden.
- Using your ORM framework, sync the mapping objects in your application to reflect the latest database schema with the region-tracking column(s).
- Reference the region-tracking column in read/write operations as needed.

For example, suppose that you have a single-region table called `users` that has just been transformed into a multi-region table with a `REGIONAL BY ROW` locality. When the application was first deployed, this table had no region-tracking column. During the multi-region database schema transformation, CockroachDB automatically created a hidden `crdb_region` column to track the region of each row.

In the absence of an explicit, back-filling computed column for the hidden `crdb_region` column, there is no way for CockroachDB to determine the region for old rows of data. The following steps update the `crdb_region` values in rows that were inserted before the multi-region transformation, based on the values of a `city` column:

1. Make `crdb_region` visible in the relevant `REGIONAL BY ROW` table(s):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE users ALTER COLUMN crdb_region SET VISIBLE;
    ~~~

1. Update the table mappings in the application code (written in Python, with [SQLAlchemy](https://www.sqlalchemy.org/)):

    {% include_cached copy-clipboard.html %}
    ~~~ python
    from models import Base

    ...

    Base.metadata.reflect(bind=self.engine, extend_existing=True, autoload_replace=True)
    ~~~

    {{site.data.alerts.callout_info}}
    SQLAlchemy allows you to update all table mappings to reflect the database with the `sqlalchemy.schema.MetaData` class method [`reflect()`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.MetaData.reflect). If your ORM framework does not support updating mapping objects dynamically, you might need to add the column to the table-mapping class definition as a `String`-typed column and reinstantiate the object.
    {{site.data.alerts.end}}

1. Reference the column value as needed.

    Here is an example function that updates the region value in a given table, using the values of the `city` column:

    {% include_cached copy-clipboard.html %}
    ~~~ python
    from sqlalchemy_cockroachdb import run_transaction
    ...

    def update_region(engine, table, region, cities):

        def update_region_helper(session, table, region, cities):
            query = table.update().where(column('city').in_(cities)).values({'crdb_region': region})
            session.execute(query)

        run_transaction(sessionmaker(bind=engine),
                        lambda session: update_region_helper(session, table, region, cities))
    ~~~

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)
