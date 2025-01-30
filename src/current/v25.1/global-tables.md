---
title: Global Tables
summary: Guidance on using global table locality in a multi-region deployment.
toc: true
docs_area: deploy
---

In a [multi-region deployment]({{ page.version.version }}/multiregion-overview.md), [`GLOBAL` table locality]({{ page.version.version }}/table-localities.md#global-tables) is a good choice for tables with the following requirements:

- Read latency must be low, but write latency can be much higher.
- Reads must be up-to-date for business reasons or because the table is referenced by [foreign keys]({{ page.version.version }}/foreign-key.md).
- Rows in the table, and all latency-sensitive reads, **cannot** be tied to specific regions.

In general, this pattern is suited well for reference tables that are rarely updated.

Tables with the `GLOBAL` locality can survive zone or region failures, depending on the database-level [survival goal]({{ page.version.version }}/multiregion-overview.md#survival-goals) setting.

{{site.data.alerts.callout_success}}
{{site.data.alerts.end}}

## Before you begin



### Fundamentals


### Cluster setup


## Configuration

### Summary

To use this pattern, set the [table locality]({{ page.version.version }}/multiregion-overview.md#table-locality) to `GLOBAL`.


### Steps


1. Create a [`GLOBAL` table]({{ page.version.version }}/table-localities.md#global-tables) by issuing the following statement:

    ~~~ sql
    CREATE TABLE postal_codes (
      id INT PRIMARY KEY,
      code STRING
    ) LOCALITY GLOBAL;
    ~~~

    Alternatively, you can set an existing table's locality to `GLOBAL` using [`ALTER TABLE ... SET LOCALITY`]({{ page.version.version }}/alter-table.md#set-locality):

    ~~~ sql
    > ALTER TABLE postal_codes SET LOCALITY GLOBAL;
    ~~~

{{site.data.alerts.callout_success}}
A good way to check that your [table locality settings]({{ page.version.version }}/multiregion-overview.md#table-locality) are having the expected effect is by monitoring how the performance metrics of a workload change as the settings are applied to a running cluster.  For a tutorial showing how table localities can improve performance metrics across a multi-region cluster, see [Low Latency Reads and Writes in a Multi-Region Cluster]({{ page.version.version }}/demo-low-latency-multi-region-deployment.md).
{{site.data.alerts.end}}

## Characteristics

### Latency

Global tables support low-latency, global reads of read-mostly data using an extension to CockroachDB's standard transaction protocol called [non-blocking transactions]({{ page.version.version }}/architecture/transaction-layer.md#non-blocking-transactions).

#### Reads

Thanks to the [non-blocking transaction]({{ page.version.version }}/architecture/transaction-layer.md#non-blocking-transactions) protocol extension, reads against `GLOBAL` tables access a consistent local replica and therefore never leave the region. This keeps read latency low.

#### Writes

Writes incur higher latencies than reads, since they require a "commit-wait" step to ensure consistency. For more information about how this works, see [non-blocking transactions]({{ page.version.version }}/architecture/transaction-layer.md#non-blocking-transactions).

### Resiliency

Because the `test` database does not specify a [survival goal]({{ page.version.version }}/multiregion-overview.md#survival-goals), it uses the default [`ZONE` survival goal]({{ page.version.version }}/multiregion-survival-goals.md#survive-zone-failures). With the default settings, an entire zone can fail without interrupting access to the database.

For more information about how to choose a database survival goal, see [When to Use `ZONE` vs. `REGION` Survival Goals]({{ page.version.version }}/multiregion-survival-goals.md#when-to-use-zone-vs-region-survival-goals).

## Troubleshooting

### High follower read latency on global tables

Reads on multi-region global tables can experience sporadic high latency on [follower reads]({{ page.version.version }}/follower-reads.md) if the round trip time between cluster nodes is higher than 150ms. To work around this issue, consider setting the `kv.closed_timestamp.lead_for_global_reads_override` [cluster setting]({{ page.version.version }}/cluster-settings.md) to a value greater than 800ms. 

The value of `kv.closed_timestamp.lead_for_global_reads_override` will impact write latency to global tables, so you should proceed in 100ms increments until the high read latency no longer occurs. If you've increased the setting to 1500ms and the problem persists, you should [contact support]({{ page.version.version }}/support-resources.md).

## Alternatives

- If rows in the table, and all latency-sensitive queries, can be tied to specific geographies, consider the [`REGIONAL` Table Locality Pattern]({{ page.version.version }}/regional-tables.md) pattern.

## Tutorial

For a step-by-step demonstration showing how CockroachDB's multi-region capabilities (including `GLOBAL` and `REGIONAL` tables) give you low-latency reads in a distributed cluster, see the tutorial on [Low Latency Reads and Writes in a Multi-Region Cluster]({{ page.version.version }}/demo-low-latency-multi-region-deployment.md).

## See also
