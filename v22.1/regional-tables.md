---
title: Regional Tables
summary: Guidance on using regional table locality in a multi-region deployment.
toc: true
docs_area: deploy
---

In a [multi-region deployment](multiregion-overview.html), [regional table locality](multiregion-overview.html#table-locality) is a good choice for tables with the following requirements:

- Read and write latency must be low.
- Rows in the table, and all latency-sensitive queries, can be tied to specific regions.

Tables with regional table locality can survive zone or region failures, depending on the database-level [survival goal](multiregion-overview.html#survival-goals) setting.

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/misc/multiregion-max-offset.md %}
{{site.data.alerts.end}}

## Before you begin

{% include enterprise-feature.md %}

### Fundamentals

{% include {{ page.version.version }}/topology-patterns/multiregion-fundamentals.md %}

### Cluster setup

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-setup.md %}

## Configuration

### Summary

To use this pattern, set the [table locality](multiregion-overview.html#table-locality) to either [`REGIONAL BY TABLE`](#regional-tables) or [`REGIONAL BY ROW`](#regional-by-row-tables).

#### Regional tables

{% include {{page.version.version}}/sql/regional-table-description.md %}

#### Regional by row tables

{% include {{page.version.version}}/sql/regional-by-row-table-description.md %}

### Steps

{{site.data.alerts.callout_info}}
By default, all tables in a multi-region database are [regional tables](#regional-tables).  Therefore, the steps below show how to set up [regional by row tables](#regional-by-row-tables).
{{site.data.alerts.end}}

{% include {{page.version.version}}/topology-patterns/multiregion-db-setup.md %}

1. Create a `users` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city STRING NOT NULL,
        first_name STRING NOT NULL,
        last_name STRING NOT NULL,
        address STRING NOT NULL
    );
    ~~~

    By default, all tables in a multi-region cluster default to the [`REGIONAL BY TABLE`](#regional-tables) locality setting.  To verify this, issue a [`SHOW CREATE`](show-create.html) on the `users` table you just created:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW CREATE TABLE users;
    ~~~

    ~~~
      table_name |                        create_statement
    -------------+------------------------------------------------------------------
      users      | CREATE TABLE public.users (
                 |     id UUID NOT NULL DEFAULT gen_random_uuid(),
                 |     city STRING NOT NULL,
                 |     first_name STRING NOT NULL,
                 |     last_name STRING NOT NULL,
                 |     address STRING NOT NULL,
                 |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
                 |     FAMILY "primary" (id, city, first_name, last_name, address)
                 | ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION
    ~~~

1. Set the table's locality to [`REGIONAL BY ROW`](#regional-by-row-tables) using the [`ALTER TABLE ... SET LOCALITY`](set-locality.html) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE users SET LOCALITY REGIONAL BY ROW;
    ~~~

    ~~~
    NOTICE: LOCALITY changes will be finalized asynchronously; further schema changes on this table may be restricted until the job completes
    ALTER TABLE SET LOCALITY
    ~~~

1.  Identify which rows need to be optimized for access from which regions. Issue [`UPDATE`](update.html) statements that modify the automatically created [`crdb_region`](set-locality.html#crdb_region) column. Issue the statements below to associate each row with a home region that depends on its `city` column:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    UPDATE users SET crdb_region = 'us-central'   WHERE city IN ('chicago', 'milwaukee', 'dallas');
    UPDATE users SET crdb_region = 'us-east'      WHERE city IN ('washington dc', 'boston', 'new york');
    UPDATE users SET crdb_region = 'us-west'      WHERE city IN ('los angeles', 'san francisco', 'seattle');
    ~~~

    By default, the region column will get auto-assigned on insert; this is also known as "auto-homing".  For more information about how the `crdb_region` column works, see [`ALTER TABLE ... SET LOCALITY REGIONAL BY ROW`](set-locality.html#regional-by-row).

{% include {{page.version.version}}/sql/locality-optimized-search.md %}

{{site.data.alerts.callout_success}}
A good way to check that your [table locality settings](multiregion-overview.html#table-locality) are having the expected effect is by monitoring how the performance metrics of a workload change as the settings are applied to a running cluster.  For a tutorial showing how table localities can improve performance metrics across a multi-region cluster, see [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html).
{{site.data.alerts.end}}

## Characteristics

### Latency

For [`REGIONAL BY TABLE` tables](#regional-tables), you get low latency for single-region writes and reads, as well as multi-region stale reads.

For [`REGIONAL BY ROW` tables](#regional-by-row-tables), you get low-latency consistent multi-region reads & writes for rows which are homed in specific regions, and low-latency multi-region stale reads from all other regions.

### Resiliency

Because the `test` database does not specify a [survival goal](multiregion-overview.html#survival-goals), it uses the default [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures).  With the default settings, an entire availability zone (AZ) can fail without interrupting access to the database.

For more information about how to choose a database survival goal, see [When to use `ZONE` vs. `REGION` survival goals](when-to-use-zone-vs-region-survival-goals.html).

## Alternatives

- If rows in the table **cannot** be tied to specific geographies, reads must be up-to-date for business reasons or because the table is referenced by [foreign keys](foreign-key.html), and the table is rarely modified, consider the [`GLOBAL` Table Locality Pattern](global-tables.html).
- If your application can tolerate historical reads in some cases, consider the [Follower Reads pattern](topology-follower-reads.html).

## Tutorial

For a step-by-step demonstration showing how CockroachDB's multi-region capabilities (including [`REGIONAL BY ROW` tables](#regional-by-row-tables)) give you low-latency reads in a distributed cluster, see the tutorial on [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html).

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
