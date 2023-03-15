---
title: Migrate and Replicate Data with Striim
summary: Use Striim to migrate data to a CockroachDB cluster or replicate data to a secondary source.
toc: true
docs_area: migrate
---

[Striim](https://www.striim.com/) offers a [managed service](https://www.striim.com/product/striim-cloud/) and a [self-hosted platform](https://www.striim.com/product/striim-platform/) that you can use to do the following:

- [Migrate data to CockroachDB](#migrate-and-replicate-data-to-cockroachdb) from an existing, publicly hosted database containing application data, such as PostgreSQL, MySQL, Oracle, or Microsoft SQL Server. 
- [Replicate data to a secondary source](#replicate-data-from-cockroachdb-to-a-secondary-source) such as Kafka or cloud storage.

As of this writing, Striim supports the following database [sources](https://www.striim.com/docs/en/sources.html):

- HP NonStop SQL/MX
- MariaDB
- MariaDB Galera Cluster
- MySQL
- Oracle
- PostgreSQL
- SQL Server
- Sybase
- Teradata

This page describes the Striim functionality at a high level. For detailed information, refer to the [Striim documentation](https://www.striim.com/docs/platform/en/pipelines.html).

## Before you begin

Complete the following items before using Striim:

- Ensure you have a secure, publicly available CockroachDB cluster running the latest **{{ page.version.version }}** [production release](../releases/index.html), and have created a [SQL user](security-reference/authorization.html#sql-users) that you can use to configure your Striim target.

- Manually create all schema objects in the target CockroachDB cluster. Although Striim offers a feature called Auto Schema Conversion, we recommend converting and importing your schema before running Striim to ensure that the data populates successfully.
    - If you are migrating from PostgreSQL, MySQL, Oracle, or Microsoft SQL Server, [use the **Schema Conversion Tool**](../cockroachcloud/migrations-page.html) to convert and export your schema. Ensure that any schema changes are also reflected on your tables.

    {{site.data.alerts.callout_info}}
    All tables must have an explicitly defined primary key. For more guidance, see [Migrate Your Database to CockroachDB](migration-overview.html#step-1-convert-your-schema).
    {{site.data.alerts.end}}

## Migrate and replicate data to CockroachDB

You can use Striim to migrate tables from a source database to CockroachDB. This can comprise an initial load that copies the selected schemas and their data from the source database to CockroachDB, followed by continuous replication of ongoing changes using Striim change data capture (CDC).

### Initial load

To perform the initial load, create a Striim application and configure the source database using one of the **Initial Load** sources. Configure CockroachDB as a **PostgreSQL** target. For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster](connect-to-the-database.html). Do the following before deploying the application:

- Specify the **Connection URL** in [JDBC format](connect-to-the-database.html?filters=java&#step-5-connect-to-the-cluster) while appending the `reWriteBatchedInserts=true` property, and without specifying the username. For example:

	~~~
	jdbc:postgresql://{host}:{port}/{database}?password={password}&sslmode=verify-full&reWriteBatchedInserts=true
	~~~

- After creating the target, [export the application](https://www.striim.com/docs/platform/en/hands-on-quick-tour.html#UUID-a846e232-87e4-d88b-eb77-fa80691bbdf7) and add the field `_h_ConnectionRetryCode: '40001'` to the TQL file. For example:

	~~~
	CREATE OR REPLACE TARGET cockroach USING Global.DatabaseWriter ( 
	  ConnectionRetryPolicy: 'retryInterval=30, maxRetries=3', 
	  ParallelThreads: '5', 
	  CheckPointTable: 'CHKPOINT', 
	  BatchPolicy: 'EventCount:128,Interval:60', 
	  Password_encrypted: 'true', 
	  StatementCacheSize: '4', 
	  CDDLAction: 'Process', 
	  Password: 'xxxxx', 
	  Tables: 'public.test_table_large,public.test_table_large', 
	  CommitPolicy: 'EventCount:128,Interval:60', 
	  DatabaseProviderType: 'Postgres', 
	  PreserveSourceTransactionBoundary: 'false', 
	  ConnectionURL: 'jdbc:postgresql://{host}:{port}/{database}?password={password}&sslmode=verify-full&reWriteBatchedInserts=true', 
	  Username: 'root', 
	  _h_ConnectionRetryCode: '40001', 
	  adapterName: 'DatabaseWriter' ) 
	~~~

	Then [import the modified TQL file](https://www.striim.com/docs/platform/en/creating-apps-by-importing-tql.html) to create a new application.

{{site.data.alerts.callout_info}}
To minimize downtime for your migration, configure a separate [continuous replication](#continuous-replication) application before you deploy the initial load application. Once the initial load is complete, deploy the continuous replication application.
{{site.data.alerts.end}}

Deploy this application to perform the initial load of data to CockroachDB. Remember that you should have already [created the schema objects](#before-you-begin) on CockroachDB.

### Continuous replication

To perform continuous replication of ongoing changes, create another Striim application and configure the source database using one of the **CDC** sources. Configure CockroachDB as a **PostgreSQL** target. For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster](connect-to-the-database.html). Do the following before deploying the application:

- Configure the CDC reader as described in the [Striim documentation](https://www.striim.com/docs/en/switching-from-initial-load-to-continuous-replication.html).

- Set up your source database for continuous replication as described in the [Striim for BigQuery documentation](https://www.striim.com/docs/GCP/StriimForBigQuery/en/connect_source-select.html).

- Repeat the guidance for creating the [initial load](#initial-load) application:

	- When configuring CockroachDB as a target, specify the **Connection URL** in [JDBC format](connect-to-the-database.html?filters=java&#step-5-connect-to-the-cluster) while appending the `reWriteBatchedInserts=true` property, and without specifying the username.

	- After creating the target, [export the application](https://www.striim.com/docs/platform/en/hands-on-quick-tour.html#UUID-a846e232-87e4-d88b-eb77-fa80691bbdf7) and add the field `_h_ConnectionRetryCode: '40001'` to the TQL file. Then [import the modified TQL file](https://www.striim.com/docs/platform/en/creating-apps-by-importing-tql.html) to create a new application.

Deploy this application once the [initial load](#initial-load) application has finished running. 

## Replicate data from CockroachDB to a secondary source

You can use Striim to replicate ongoing changes from CockroachDB to a secondary source. This may include a [downstream sink](changefeed-sinks.html) such as Kafka or cloud storage for purposes such as reporting, caching, or full-text indexing. For a list of targets, see the [Striim documentation](https://www.striim.com/docs/en/targets.html).

To perform continuous replication of ongoing changes, create a Striim application, configure CockroachDB as a **PostgreSQL CDC** source, and select an appropriate downstream target. For information about where to find the CockroachDB connection parameters, see [Connect to a CockroachDB Cluster](connect-to-the-database.html).

## See also

- [Migrate Your Database to CockroachDB](migration-overview.html)
- [Schema Conversion Tool](../cockroachcloud/migrations-page.html)
- [Change Data Capture Overview](change-data-capture-overview.html)
- [Third-Party Tools Supported by Cockroach Labs](third-party-database-tools.html)