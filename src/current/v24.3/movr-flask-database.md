---
title: Create a Multi-region Database Schema
summary: This page documents the database schema for the multi-region Flask application built on CockroachDB.
toc: true
docs_area: develop
---

This page guides you through creating a database schema for an example global application. It is the second section of the [Develop and Deploy a Global Application]({% link {{ page.version.version }}/movr.md %}#develop-and-deploy-a-global-application) tutorial.

## Before you begin

Before you begin this section, complete the previous sections of the tutorial, ending with [MovR: A Global Application Use-Case]({% link {{ page.version.version }}/movr-flask-use-case.md %}).

We also recommend reviewing [CockroachDB's multi-region capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}), if you have not done so already.

## The `movr` database

The example MovR application is built on a multi-region deployment of CockroachDB, loaded with the `movr` database. This database contains the following tables:

- `users`
- `vehicles`
- `rides`

These tables store information about the users and vehicles registered with MovR, and the rides associated with those users and vehicles.

Initialization statements for `movr` are defined in [`dbinit.sql`](https://github.com/cockroachlabs/movr-flask/blob/master/dbinit.sql), a SQL file that you use later in this tutorial to load the database to a running cluster.

{{site.data.alerts.callout_info}}
The database schema used in this application is a slightly simplified version of the [`movr` database schema]({% link {{ page.version.version }}/movr.md %}) that is built into the `cockroach` binary. The schemas are similar, but they are not identical.

## Multi-region in CockroachDB

A distributed CockroachDB deployment consists of multiple, regional instances of CockroachDB that communicate as a single, logical entity. In [CockroachDB terminology]({% link {{ page.version.version }}/architecture/glossary.md %}#cockroachdb-architecture-terms), each instance is called a *node*. Together, the nodes form a *cluster*.

To keep track of geographic information about nodes in a cluster, CockroachDB uses [*cluster regions*]({% link {{ page.version.version }}/multiregion-overview.md %}#cluster-regions), [*database regions*]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions), and [*table localities*]({% link {{ page.version.version }}/multiregion-overview.md %}#table-locality).

### Cluster and database regions

When you [add a node to a cluster]({% link {{ page.version.version }}/cockroach-start.md %}), you can assign the node a specific [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality). Localities represent a geographic region or zone, and are meant to correspond directly to the cloud provider region or zone in which the node is deployed.

Each unique regional locality is stored in CockroachDB as a [cluster region]({% link {{ page.version.version }}/multiregion-overview.md %}#cluster-regions). After a cluster is deployed, you can assign regions to new and existing databases in the cluster. For an example of a deployment, refer to [Deploy a Global Serverless Application]({% link {{ page.version.version }}/movr-flask-deployment.md %}), the final step of this tutorial series.

{{site.data.alerts.callout_info}}
Only cluster regions specified at node startup can be used as [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions). You can view regions available to databases in the cluster with [`SHOW REGIONS FROM CLUSTER`]({% link {{ page.version.version }}/show-regions.md %}).
{{site.data.alerts.end}}

Here is the [`CREATE DATABASE`]({% link {{ page.version.version }}/create-database.md %}) statement for the `movr` database:

{% include_cached copy-clipboard.html %}
~~~ sql
> {% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/dbinit.sql ||-- START database ||-- END database %}
~~~

In this example, `movr` has the following [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions), which correspond to regions in Google Cloud:

- `gcp-us-east1` (primary)
- `gcp-europe-west1`
- `gcp-us-west1`

<a id="table-locality"></a>

### Table localities

After you have added regions to a database, you can control where the data in each table in the database is stored, using [table localities]({% link {{ page.version.version }}/multiregion-overview.md %}#table-locality).

By default, CockroachDB uses the table locality setting [`REGIONAL BY TABLE IN PRIMARY REGION`]({% link {{ page.version.version }}/table-localities.md %}#regional-tables) for all new tables added to a multi-region database. The `REGIONAL BY TABLE` locality optimizes read and write access to the data in a table from a single region (in this case, the primary region `gcp-us-east1`).

The `movr` database contains tables with rows of data that need to be accessed by users in more than one region. As a result, none of the tables benefit from using a `REGIONAL BY TABLE` locality. Instead, all three tables in the `movr` database schema should use a [`REGIONAL BY ROW` locality]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables). With `REGIONAL BY ROW` locality, CockroachDB initially assigns each row of the table to a region based on the locality of the node that inserted the row. Subsequent reads and writes are optimized based on the localities of the nodes querying those rows.

{{site.data.alerts.callout_info}}
As shown in the `CREATE TABLE` statements below, the `REGIONAL BY ROW` clauses do not identify a column to track the region for each row. To assign rows to regions, CockroachDB creates and manages a hidden [`crdb_region` column]({% link {{ page.version.version }}/alter-table.md %}#crdb_region), of [`ENUM`]({% link {{ page.version.version }}/enum.md %}) type `crdb_internal_region`. The values of `crdb_region` are populated using the regional locality of the node from which the query creating the row originates.
{{site.data.alerts.end}}

## The `users` table

Here is the `CREATE TABLE` statement for the `users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> {% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/dbinit.sql ||-- START users ||-- END users %}
~~~

## The `vehicles` table

{% include_cached copy-clipboard.html %}
~~~ sql
> {% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/dbinit.sql ||-- START vehicles ||-- END vehicles %}
~~~

The `vehicles` table has a [foreign key constraint]({% link {{ page.version.version }}/foreign-key.md %}) on the `users` table, for the `city` and `owner_id` columns. This guarantees that a vehicle is registered to a particular user (i.e., an "owner") in the city where that user is registered.

## The `rides` table

{% include_cached copy-clipboard.html %}
~~~ sql
> {% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/dbinit.sql ||-- START rides ||-- END rides %}
~~~

Like the `vehicles` table, the `rides` table has foreign key constraints. These constraints are on the `users` and the `vehicles` tables.

## Next steps

Now that you are familiar with the `movr` schema, you can [set up a development environment for the application]({% link {{ page.version.version }}/movr-flask-setup.md %}).

## See also

- [`movr-flask` on GitHub](https://github.com/cockroachlabs/movr-flask)
- [CockroachDB terminology]({% link {{ page.version.version }}/architecture/glossary.md %}#cockroachdb-architecture-terms)
- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [`CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone)
- [Define Table Partitions]({% link {{ page.version.version }}/partitioning.md %})
- [`ALTER TABLE ... PARTITION BY`]({% link {{ page.version.version }}/alter-table.md %}#partition-by)
