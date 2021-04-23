---
title: The Regional Table Locality Pattern
summary: Guidance on using the Regional Table Locality Pattern in a multi-region deployment.
toc: true
redirect_from:
- topology-geo-partitioned-replicas.html
- topology-geo-partitioned-leaseholders.html
---

In a [multi-region deployment](multiregion-overview.html), the [Regional Table Locality Pattern](multiregion-overview.html#table-locality) is a good choice for tables with the following requirements:

- Read and write latency must be low.
- Rows in the table, and all latency-sensitive queries, can be tied to specific geographies, e.g., city, state, region.

{{site.data.alerts.callout_info}}
Tables with the Regional Table Locality Pattern can survive zone or region failures, depending on the database-level [survival goal](multiregion-overview.html#survival-goals) setting.
{{site.data.alerts.end}}

## Prerequisites

### Fundamentals

{% include {{ page.version.version }}/topology-patterns/multiregion-fundamentals.md %}

### Cluster setup

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-setup.md %}

## Configuration

{{site.data.alerts.callout_info}}
Regional tables (and the other [multi-region capabilities](multiregion-overview.html)) require an [Enterprise license](https://www.cockroachlabs.com/get-cockroachdb).
{{site.data.alerts.end}}

### Summary

Using this pattern, you tell CockroachDB to set the [table locality](multiregion-overview.html#table-locality) to either [`REGIONAL BY TABLE`](#regional-tables) or [`REGIONAL BY ROW`](#regional-by-row-tables), and CockroachDB handles the details.

#### Regional tables

{% include {{page.version.version}}/sql/regional-table-description.md %}

#### Regional by row tables

{% include {{page.version.version}}/sql/regional-by-row-table-description.md %}

### Steps

{% include {{page.version.version}}/topology-patterns/multiregion-db-setup.md %}

Next, create a `users` table:

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city STRING NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    address STRING NOT NULL
);
~~~

Since all tables in a multi-region cluster default to the [`REGIONAL BY TABLE`](#regional-tables) locality setting, let's set the table's locality to [`REGIONAL BY ROW`](#regional-by-row-tables) using the following [`ALTER TABLE`](alter-table.html) statements: [`ADD COLUMN`](add-column.html), [`ALTER COLUMN`](alter-column.html), and [`SET LOCALITY`](set-locality.html).

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE users ADD COLUMN region crdb_internal_region AS (
  CASE WHEN city = 'milwaukee' THEN 'us-central'
       WHEN city = 'chicago' THEN 'us-central'
       WHEN city = 'dallas' THEN 'us-central'
       WHEN city = 'new york' THEN 'us-east'
       WHEN city = 'boston' THEN 'us-east'
       WHEN city = 'washington dc' THEN 'us-east'
       WHEN city = 'san francisco' THEN 'us-west'
       WHEN city = 'seattle' THEN 'us-west'
       WHEN city = 'los angeles' THEN 'us-west'
  END
) STORED;
ALTER TABLE users ALTER COLUMN region SET NOT NULL;
ALTER TABLE users SET LOCALITY REGIONAL BY ROW AS "region";
~~~

To confirm that your `users` table data is replicated across the cluster in accordance with the `REGIONAL BY ROW` table locality, check the **Data Distribution** [debug page](ui-debug-pages.html) in the [DB Console](ui-overview.html).  It will look something like the output below (which is edited for length).  Translating from zone configurations into human language, this output says:

- Make the database resilient to zone failures, with replicas in each region (this is the default [`ZONE` survival goal](multiregion-overview.html#survival-goals)).
- Put the leaseholders in `us-east`, since it's the [primary database region](multiregion-overview.html#database-regions).
- Make the `users` table a [regional by row table](#regional-by-row-tables) by [partitioning](partitioning.html) the [primary key index](primary-key.html) by region.  When rows are added or updated, which region the row is associated is specified as part of the update.  For details, see the instructions for [updating a row's home region](set-locality.html#crdb_region).  Thanks to CockroachDB's [multi-region capabilities](multiregion-overview.html), you do not need to do any partitioning "by hand", the database does it for you based on your desired [table locality setting](multiregion-overview.html#table-locality).

~~~
ALTER DATABASE test CONFIGURE ZONE USING
    num_replicas = 5,
    num_voters = 3,
    constraints = '{+region=us-central: 1, +region=us-east: 1, +region=us-west: 1}',
    voter_constraints = '[+region=us-east]',
    lease_preferences = '[[+region=us-east]]'
...
ALTER PARTITION "europe-west1" OF INDEX test.public.users@primary CONFIGURE ZONE USING
	num_voters = 3,
	voter_constraints = '[+region=europe-west1]',
	lease_preferences = '[[+region=europe-west1]]'
ALTER PARTITION "us-east1" OF INDEX test.public.users@primary CONFIGURE ZONE USING
	num_voters = 3,
	voter_constraints = '[+region=us-east1]',
	lease_preferences = '[[+region=us-east1]]'
ALTER PARTITION "us-west1" OF INDEX test.public.users@primary CONFIGURE ZONE USING
	num_voters = 3,
	voter_constraints = '[+region=us-west1]',
	lease_preferences = '[[+region=us-west1]]'
~~~

{{site.data.alerts.callout_success}}
A better way to check that your [table locality settings](multiregion-overview.html#table-locality) are having the expected effect is by monitoring how the performance metrics of a workload change as the settings are applied to a running cluster.  For a tutorial showing how to use table localities to improve performance metrics across a multi-region cluster, see [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html).
{{site.data.alerts.end}}

## Characteristics

### Latency

For [`REGIONAL BY TABLE` tables](#regional-tables), you get low latency for single-region writes and multi-region stale reads.

For [`REGIONAL BY ROW` tables](#regional-by-row-tables), you get low-latency consistent multi-region reads & writes for rows which are homed in specific regions.

### Resiliency

Because the `test` database does not specify a [survival goal](multiregion-overview.html#survival-goals), it uses the default [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures).  With the default settings, an entire AZ can fail without interrupting access to the database.

For more information about how to choose a database survival goal, see [When to use `ZONE` vs. `REGION` survival goals](when-to-use-zone-vs-region-survival-goals.html).

## Alternatives

- If rows in the table **cannot** be tied to specific geographies, and reads must be up-to-date for business reasons or because the table is referenced by [foreign keys](foreign-key.html), consider the [`GLOBAL` Table Locality Pattern](topology-global-tables.html).
- If your application can tolerate historical reads in some cases, consider the [Follower Reads](topology-follower-reads.html) pattern.

## Tutorial

For a step-by-step demonstration showing how CockroachDB's multi-region capabilities (including [`REGIONAL BY ROW` tables](#regional-by-row-tables)) give you low-latency reads in a distributed cluster, see the tutorial on [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html).

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
