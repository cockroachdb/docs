Multi-region patterns require thinking about the following questions:

- What are your [survival goals](multiregion-overview.html#survival-goals)?  Do you need to survive a [zone failure](multiregion-overview.html#surviving-zone-failures)? Do you need to survive a [region failure](multiregion-overview.html#surviving-region-failures)?
- What are the [table localities](multiregion-overview.html#table-locality) that will provide the performance characteristics you need for each table's data?
  - Do you need low-latency reads and writes from a single region? Do you need that single region to be configurable at the [row level](multiregion-overview.html#regional-by-row-tables)? Or will [a single optimized region for the entire table](multiregion-overview.html#regional-tables) suffice?
  - Do you have a "read-mostly" [table of reference data that is rarely updated](multiregion-overview.html#global-tables), but that must be read with low latency from all regions?

For more information about CockroachDB multi-region capabilities, review the following pages:

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [How to Choose a Multi-Region Configuration](choosing-a-multi-region-configuration.html)
- [When to use `ZONE` vs. `REGION` Survival Goals](when-to-use-zone-vs-region-survival-goals.html)
- [When to use `REGIONAL` vs. `GLOBAL` Tables](when-to-use-regional-vs-global-tables.html)

In addition, reviewing the following information will be helpful:

- The concept of [locality](cockroach-start.html#locality), which CockroachDB uses to place and balance data based on how you define survival goal and table locality settings.
- The recommendations in our [Production Checklist](recommended-production-settings.html), including our [hardware recommendations](recommended-production-settings.html#hardware). Afterwards, perform a proof of concept to size hardware for your use case.
- [SQL Performance Best Practices](performance-best-practices-overview.html)
