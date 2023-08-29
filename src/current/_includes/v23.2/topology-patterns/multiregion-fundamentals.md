Multi-region patterns require thinking about the following questions:

- What are your [survival goals]({% link {{ page.version.version }}/multiregion-overview.md %}#survival-goals)?  Do you need to survive a [zone failure]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#survive-zone-failures)? Do you need to survive a [region failure]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#survive-region-failures)?
- What are the [table localities]({% link {{ page.version.version }}/multiregion-overview.md %}#table-locality) that will provide the performance characteristics you need for each table's data?
  - Do you need low-latency reads and writes from a single region? Do you need that single region to be configurable at the [row level]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables)? Or will [a single optimized region for the entire table]({% link {{ page.version.version }}/table-localities.md %}#regional-tables) suffice?
  - Do you have a "read-mostly" [table of reference data that is rarely updated]({% link {{ page.version.version }}/table-localities.md %}#global-tables), but that must be read with low latency from all regions?

For more information about CockroachDB multi-region capabilities, review the following pages:

- [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %})
- [How to Choose a Multi-Region Configuration]({% link {{ page.version.version }}/choosing-a-multi-region-configuration.md %})
- [When to use `ZONE` vs. `REGION` Survival Goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#when-to-use-zone-vs-region-survival-goals)
- [When to use `REGIONAL` vs. `GLOBAL` Tables]({% link {{ page.version.version }}/table-localities.md %}#when-to-use-regional-vs-global-tables)

In addition, reviewing the following information will be helpful:

- The concept of [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality), which CockroachDB uses to place and balance data based on how you define survival goal and table locality settings.
- The recommendations in our [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}), including our [hardware recommendations]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware). Afterwards, perform a proof of concept to size hardware for your use case.
- [SQL Performance Best Practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %})
