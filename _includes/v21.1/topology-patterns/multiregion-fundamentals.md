Multi-region patterns require thinking about the following questions:

- What are my [survival goals](multiregion-overview.html#survival-goals)?  Do I need to survive a [zone failure](multiregion-overview.html#surviving-zone-failures)?  A [region failure](multiregion-overview.html#surviving-region-failures)?
- Given the constraints provided by my survival goals, what are the [table localities](multiregion-overview.html#table-locality) that will provide the performance characteristics I need for each table's data?
  - Do I need low-latency reads and writes from a single region? Do I need them at the [table level](multiregion-overview.html#regional-tables)?  Or will the [row level](multiregion-overview.html#regional-by-row-tables) suffice?
  - Do I have a "read-mostly" [table of reference data that is rarely updated](multiregion-overview.html#global-tables), but that needs to be available to all regions?

For more information about our multi-region capabilities, review the following pages:

- [Multi-region overview](multiregion-overview.html)
- [Choosing a multi-region configuration](choosing-a-multi-region-configuration.html)
- [When to use `ZONE` vs. `REGION` Survival Goals](when-to-use-zone-vs-region-survival-goals.html)
- [When to use `REGIONAL` vs. `GLOBAL` Tables](when-to-use-regional-vs-global-tables.html)

In addition, reviewing the following information will be helpful:

- The concept of [locality](cockroach-start.html#locality), which makes CockroachDB aware of the location of nodes and able to intelligently place and balance data based on how you define [survival goals](multiregion-overview.html#survival-goals) and [table localities](multiregion-overview.html#table-locality).
- The recommendations in our [Production Checklist](recommended-production-settings.html).
- This page doesn't account for hardware specifications, so be sure to follow our [hardware recommendations](recommended-production-settings.html#hardware) and perform a POC to size hardware for your use case.
- Finally, adopt these [SQL Best Practices](performance-best-practices-overview.html) to get good performance.
