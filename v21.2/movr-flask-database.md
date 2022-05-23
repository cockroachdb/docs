---
title: Create a Multi-region Database Schema
summary: This page documents the database schema for the multi-region Flask application built on CockroachDB.
toc: true
redirect_from: multi-region-database.html
docs_area: develop
---

This page walks you through creating a database schema for an example global application. It is the second section of the [Develop and Deploy a Global Application](movr-flask-overview.html) tutorial.

## Before you begin

Before you begin this section, complete the previous section of the tutorial, [MovR: A Global Application Use-Case](movr-flask-use-case.html).

We also recommend reviewing [CockroachDB's multi-region capabilities](multiregion-overview.html), if you have not done so already.

## The `movr` database

The example MovR application is built on a multi-region deployment of CockroachDB, loaded with the `movr` database. This database contains the following tables:

- `users`
- `vehicles`
- `rides`

These tables store information about the users and vehicles registered with MovR, and the rides associated with those users and vehicles.

Initialization statements for `movr` are defined in [`dbinit.sql`](https://github.com/cockroachlabs/movr-flask/blob/master/dbinit.sql), a SQL file that you use later in this tutorial to load the database to a running cluster.

{{site.data.alerts.callout_info}}
The database schema used in this application is a slightly simplified version of the [`movr` database schema](movr.html) that is built into the `cockroach` binary. The schemas are similar, but they are not the same.
{{site.data.alerts.end}}

## Multi-region in CockroachDB

A distributed CockroachDB deployment consists of multiple, regional instances of CockroachDB that communicate as a single, logical entity. In [CockroachDB terminology](architecture/overview.html#cockroachdb-architecture-terms), each instance is called a *node*. Together, the nodes form a *cluster*.

To keep track of geographic information about nodes in a cluster, CockroachDB uses [*cluster regions*](multiregion-overview.html#cluster-regions), [*database regions*](multiregion-overview.html#database-regions), and [*table localities*](multiregion-overview.html#table-locality).

### Cluster and database regions

When you [add a node to a cluster](cockroach-start.html), you can assign the node a specific [locality](cockroach-start.html#locality). Localities represent a geographic region or zone, and are meant to correspond directly to the cloud provider region or zone in which the node is deployed.

Each unique regional locality is stored in CockroachDB as a [cluster region](multiregion-overview.html#cluster-regions). After a [cluster is deployed](movr-flask-deployment.html), you can assign regions to new and existing databases in the cluster.

{{site.data.alerts.callout_info}}
Only cluster regions specified at node startup can be used as [database regions](multiregion-overview.html#database-regions). You can view regions available to databases in the cluster with [`SHOW REGIONS FROM CLUSTER`](show-regions.html).
{{site.data.alerts.end}}

Here is the [`CREATE DATABASE`](create-database.html) statement for the `movr` database:

{% include_cached copy-clipboard.html %}
~~~ sql
> {% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/dbinit.sql |-- START database |-- END database %}
~~~

Note that `movr` has the following [database regions](multiregion-overview.html#database-regions), which correspond to regions in Google Cloud:

- `gcp-us-east1` (primary)
- `gcp-europe-west1`
- `gcp-us-west1`

<a id="table-locality"></a>

### Table localities

After you have added regions to a database, you can control where the data in each table in the database is stored, using [table localities](multiregion-overview.html#table-locality).

By default, CockroachDB uses the table locality setting [`REGIONAL BY TABLE IN PRIMARY REGION`](multiregion-overview.html#regional-tables) for all new tables added to a multi-region database. The `REGIONAL BY TABLE` table locality optimizes read and write access to the data in a table from a single region (in this case, the primary region `gcp-us-east1`).

The `movr` database contains tables with rows of data that need to be accessed by users in more than one region. As a result, none of the tables benefit from using a `REGIONAL BY TABLE` locality. Instead, all three tables in the `movr` database schema should use a [`REGIONAL BY ROW` locality](multiregion-overview.html#regional-by-row-tables). For `REGIONAL BY ROW` tables, CockroachDB automatically assigns each row to a region based on the locality of the node from which the row is inserted. It then optimizes subsequent read and write queries executed from nodes located in the region assigned to the rows being queried.

{{site.data.alerts.callout_info}}
As shown in the `CREATE TABLE` statements below, the `REGIONAL BY ROW` clauses do not identify a column to track the region for each row. To assign rows to regions, CockroachDB creates and manages a hidden [`crdb_region` column](set-locality.html#crdb_region), of [`ENUM`](enum.html) type `crdb_internal_region`. The values of `crdb_region` are populated using the regional locality of the node from which the query creating the row originates.
{{site.data.alerts.end}}

## The `users` table

Here is the `CREATE TABLE` statement for the `users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> {% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/dbinit.sql |-- START users |-- END users %}
~~~

## The `vehicles` table

{% include_cached copy-clipboard.html %}
~~~ sql
> {% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/dbinit.sql |-- START vehicles |-- END vehicles %}
~~~

Note that the `vehicles` table has a [foreign key constraint](foreign-key.html) on the `users` table, for the `city` and `owner_id` columns. This guarantees that a vehicle is registered to a particular user (i.e., an "owner") in the city where that user is registered.

## The `rides` table

{% include_cached copy-clipboard.html %}
~~~ sql
> {% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/dbinit.sql |-- START rides |-- END rides %}
~~~

Note that, like the `vehicles` table, the `rides` table has foreign key constraints. These constraints are on the `users` and the `vehicles` tables.

## Next steps

Now that you are familiar with the `movr` schema, you can [set up a development environment for the application](movr-flask-setup.html).

## See also

- [`movr-flask` on GitHub](https://github.com/cockroachlabs/movr-flask)
- [CockroachDB terminology](architecture/overview.html#cockroachdb-architecture-terms)
- [Configure Replication Zones](configure-replication-zones.html)
- [`CONFIGURE ZONE`](configure-zone.html)
- [Define Table Partitions](partitioning.html)
- [`PARTITION BY`](partition-by.html)
