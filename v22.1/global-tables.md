---
title: Global Tables
summary: Guidance on using global table locality in a multi-region deployment.
toc: true
docs_area: deploy
---

In a [multi-region deployment](multiregion-overview.html), [`GLOBAL` table locality](multiregion-overview.html#global-tables) is a good choice for tables with the following requirements:

- Read latency must be low, but write latency can be much higher.
- Reads must be up-to-date for business reasons or because the table is referenced by [foreign keys](foreign-key.html).
- Rows in the table, and all latency-sensitive reads, **cannot** be tied to specific regions.

In general, this pattern is suited well for reference tables that are rarely updated.

Tables with the `GLOBAL` locality can survive zone or region failures, depending on the database-level [survival goal](multiregion-overview.html#survival-goals) setting.

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

To use this pattern, set the [table locality](multiregion-overview.html#table-locality) to `GLOBAL`.

{% include {{page.version.version}}/sql/global-table-description.md %}

### Steps

{% include {{page.version.version}}/topology-patterns/multiregion-db-setup.md %}

1. Create a [`GLOBAL` table](multiregion-overview.html#global-tables) by issuing the following statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE postal_codes (
      id INT PRIMARY KEY,
      code STRING
    ) LOCALITY GLOBAL;
    ~~~

    Alternatively, you can set an existing table's locality to `GLOBAL` using [`ALTER TABLE ... SET LOCALITY`](set-locality.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE postal_codes SET LOCALITY GLOBAL;
    ~~~

{{site.data.alerts.callout_success}}
A good way to check that your [table locality settings](multiregion-overview.html#table-locality) are having the expected effect is by monitoring how the performance metrics of a workload change as the settings are applied to a running cluster.  For a tutorial showing how table localities can improve performance metrics across a multi-region cluster, see [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html).
{{site.data.alerts.end}}

## Characteristics

### Latency

Global tables support low-latency, global reads of read-mostly data using an extension to CockroachDB's standard transaction protocol called [non-blocking transactions](architecture/transaction-layer.html#non-blocking-transactions).

#### Reads

Thanks to the [non-blocking transaction](architecture/transaction-layer.html#non-blocking-transactions) protocol extension, reads against `GLOBAL` tables access a consistent local replica and therefore never leave the region. This keeps read latency low.

#### Writes

Writes incur higher latencies than reads, since they require a "commit-wait" step to ensure consistency. For more information about how this works, see [non-blocking transactions](architecture/transaction-layer.html#non-blocking-transactions).

### Resiliency

Because the `test` database does not specify a [survival goal](multiregion-overview.html#survival-goals), it uses the default [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures). With the default settings, an entire zone can fail without interrupting access to the database.

For more information about how to choose a database survival goal, see [When to Use `ZONE` vs. `REGION` Survival Goals](when-to-use-zone-vs-region-survival-goals.html).

## Troubleshooting

### High follower read latency on global tables

Reads on multi-region global tables can experience sporadic high latency on [follower reads](follower-reads.html) if the round trip time between cluster nodes is higher than 150ms. To work around this issue, consider setting the `kv.closed_timestamp.lead_for_global_reads_override` [cluster setting](cluster-settings.html) to a value greater than 800ms. 

The value of `kv.closed_timestamp.lead_for_global_reads_override` will impact write latency to global tables, so you should proceed in 100ms increments until the high read latency no longer occurs. If you've increased the setting to 1500ms and the problem persists, you should [contact support](support-resources.html).

## Alternatives

- If rows in the table, and all latency-sensitive queries, can be tied to specific geographies, consider the [`REGIONAL` Table Locality Pattern](regional-tables.html) pattern.

## Tutorial

For a step-by-step demonstration showing how CockroachDB's multi-region capabilities (including `GLOBAL` and `REGIONAL` tables) give you low-latency reads in a distributed cluster, see the tutorial on [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html).

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
