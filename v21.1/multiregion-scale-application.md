---
title: Scale to Multiple Regions
summary: Learn how to scale a single-region application to a multi-region application.
toc: true
---

This page provides guidance for scaling a single-region application to a multi-region application.

Before reading this page, we recommend reviewing [CockroachDB's multi-region capabilities](multiregion-overview.html).

## Overview

Scaling an application from a single region to multiple regions consists of:

- [Scaling the database](#scale-the-database), which includes transforming the database schema into a multi-region schema and adding new nodes to a CockroachDB cluster.

- [Scaling the application](#scale-the-application), which includes deploying the application in new regions and, if necessary, updating the application code to work with the multi-region database schema.

## Scale the database

To scale a database from a single region to multiple regions:

1. Use an [`ALTER DATABASE ... SET PRIMARY REGION`](set-primary-region.html) statement to set the database's [primary region](multiregion-overview.html#database-regions) to the single region in which the cluster is deployed. This region must have been specified as a [regional locality](cockroach-start.html#locality) at cluster startup.

    Setting the primary database region before adding new regional nodes to the cluster prevents CockroachDB from [rebalancing row replications](architecture/replication-layer.html#leaseholder-rebalancing) across all regions each time a node is added in a new region.

    {{site.data.alerts.callout_info}}
    Executing `ALTER` statements performs a [schema migration](online-schema-changes.html) on the cluster. If you are using a schema migration tool, you will need to execute these statements as raw SQL, as the [multi-region SQL syntax](multiregion-overview.html) is specific to CockroachDB.

    Here are some simple tutorials on executing schema migrations against CockroachDB clusters:
    - [Migrate CockroachDB Schemas with Liquibase](liquibase.html).
    - [Migrate CockroachDB Schemas with Flyway](flyway.html).
    - [Execute SQL statements from a file](cockroach-sql.html#execute-sql-statements-from-a-file) and [Change and Remove Objects in a Database Schema](schema-design-update.html).
    {{site.data.alerts.end}}

1. Add nodes to the cluster in new regions.

    For instructions on adding nodes to an existing cluster, see one of the following pages:
    - For managed CockroachCloud deployments, see [Cluster Management](../cockroachcloud/cluster-management.html).
    - For orchestrated deployments, see [Orchestrate CockroachDB Across Multiple Kubernetes Clusters](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html).
    - For manual deployments, see [`cockroach start`](cockroach-start.html) and [Manual Deployment](manual-deployment.html).

    {{site.data.alerts.callout_info}}
    You must specify a [regional locality](cockroach-start.html#locality) for each node at startup. These regional localities are represented as [cluster regions](multiregion-overview.html#cluster-regions) in the cluster.
    {{site.data.alerts.end}}

1. Use an [`ALTER DATABASE ... ADD REGIONS`](add-region.html) statement to add the new regions to your database. Only cluster regions (i.e., regional localities specified at cluster startup) can be added as [database regions](multiregion-overview.html#database-regions).

1. Use [`ALTER DATABASE ... SURVIVE ... FAILURE`](survive-failure.html) statements to set your database's [survival goals](multiregion-overview.html#survival-goals).

1. Use [`ALTER TABLE ... SET LOCALITY`](set-locality.html) statements to set [table localities](multiregion-overview.html#table-locality) for each table.

## Scale the application

Scaling application deployments in multiple regions can greatly improve latency for the end-user of the application.

For guidance on connecting to CockroachDB from an application deployment, see one of the following pages:

- For connecting to managed, CockroachCloud deployments, see [Connect to Your CockroachCloud Cluster](../cockroachcloud/connect-to-your-cluster.html) and [Connect to the Database (CockroachCloud)](connect-to-the-database-cockroachcloud.html).
- For connecting to a standard CockroachDB deployment, see [`cockroach sql`](cockroach-sql.html) and [Connect to the Database](connect-to-the-database.html).

To limit the latency between the application and the database, each deployment of the application should communicate with the closest database deployment. For details on configuring database connections for individual application deployments, consult your cloud provider's documentation. For an example using Google Cloud services, see [Multi-region Application Deployment](multi-region-deployment.html).

{{site.data.alerts.callout_info}}
A multi-region application deployment does not require a multi-region database deployment. Deploying a global application in multiple regions can yield significant latency benefits for the end user, even if you have not yet scaled your database in multiple regions. For an example, see [Reducing Multi-Region Latency with Follower Reads](https://www.cockroachlabs.com/blog/follower-reads/#:~:text=Deployment%202%3A%20Global%20Application%20Deployment%2C%20No%20Follower%20reads).

If you do scale the application first, make sure that you reconfigure each application deployment to communicate with the closest database deployment after deploying the database in multiple regions.
{{site.data.alerts.end}}

### Update the application code for multi-region

For most table localities, including the default locality `LOCALITY REGIONAL BY TABLE IN PRIMARY REGION`, *you do not need to update your application code after migrating your database schema for multi-region*. CockroachDB automatically optimizes queries against multi-region databases, based on the regional locality of the node executing the query, and on the multi-region configuration of the database. For more details, see [Regional Tables](regional-tables.html#regional-by-row-tables). For an extended example, see [Develop and Deploy a Global Application: Create a Multi-region Database Schema](movr-flask-database.html).

However, there are some scenarios in which you might need to update the SQL operations in your application. For example:

- If a table has a `REGIONAL BY ROW AS <custom_region_column>` table locality, and you want to explicitly insert regional values into a table, as shown in [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html#configure-regional-by-row-tables).
- If a table has a `REGIONAL BY ROW` locality, and you want to update the hidden `crdb_region` column of existing rows in the table based on some other column value, as shown in [Set the table locality to `REGIONAL BY ROW`](set-locality.html#set-the-table-locality-to-regional-by-row).
- If a table has a `REGIONAL BY ROW` locality, and you want to filter a selection query based on the value of the region-tracking column.

In all of these scenarios, statements reference the column that tracks the region for each row in a `REGIONAL BY ROW` locality. This column can be a custom column of the built-in `ENUM` type `crdb_internal_region`, or it can be the default, hidden [`crdb_region` column](set-locality.html#crdb_region).

#### Representing `crdb_region` in ORMs

If your application's ORM framework supports enumerated data types, and you need to explicitly reference the `crdb_region` column (or a custom region column) in a SQL operation in your application code, you should do the following:

- Using the ORM framework's type library, create an enumerated type, with the type name `crdb_internal_region` and enumerated values for each of the existing regions.
- Add a new region column to the relevant table mappings, with the new enumerated data type and the column name `crdb_region` (or the name of the custom region column of the table). Note that this column does not persist to the database; it is simply a mapping for the application.
- Reference the region column in read/write operations as needed.

For example, suppose that you have a single-region table that has just been transformed into a multi-region table. In the absence of an explicit, back-filling computed column for the hidden `crdb_region` column, the following code (written in Python, with [SQLAlchemy](https://www.sqlalchemy.org/)) updates the `crdb_region` values in rows that were inserted before the multi-region transformation was executed:

1. Create the `ENUM` type:

    {% include copy-clipboard.html %}
    ~~~ python
    from sqlalchemy.types import Enum
    ...

    region_list = list(tup[0] for tup in session.execute(text('SELECT region FROM [SHOW REGIONS]')).fetchall())
    region_enum = Enum(*region_list, name='crdb_internal_region', create_type=False, native_enum=False)
    ~~~

2. Update the mapping in the application code:

    {% include copy-clipboard.html %}
    ~~~ python
    crdb_region = Column('crdb_region', region_enum)
    MyTable.append_column(crdb_region)
    ~~~

    {{site.data.alerts.callout_info}}
    SQLAlchemy allows you to append columns to a table-mapped object with the `sqlalchemy.Table` class method [`append_column()`](https://docs.sqlalchemy.org/en/13/core/metadata.html#sqlalchemy.schema.Table.append_column). If your ORM framework does not support updating mapping objects dynamically, you might need to add the column to the table-mapping class definition and reinstantiate the object.
    {{site.data.alerts.end}}

3. Reference the column value as needed.

    Here is an example function that updates the region value in a given table, using the values of a `city` column:

    {% include copy-clipboard.html %}
    ~~~ python
    from sqlalchemy_cockroachdb import run_transaction
    ...

    def update_region(engine, table, region, cities):

        def update_region_helper(session, table, region, cities):
            query = table.update().where(column('city').in_(cities)).values({crdb_region: region})
            session.execute(query)

        run_transaction(sessionmaker(bind=engine),
                        lambda session: update_region_helper(session, table, region, cities))
    ~~~

If your ORM framework does not support `ENUM` data types, or if you run into type compatibility issues, you can alternatively try the following approach:

- Add `crdb_region` (or the custom region-tracking column) to an existing table object as a *string*-typed column.
- Validate the string input for `crdb_region` values, using one of the following approaches:
    - Implement client-side string validation to check if the string input matches one of the allowed enumerated types.
    - Add some exception handling to catch data errors (e.g., `sqlalchemy.exc.DataError: (psycopg2.errors.InvalidTextRepresentation)` in SQLAlchemy).

## See also

- [Multi-region Capabilities Overview](multiregion-overview.html)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)
