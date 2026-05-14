---
title: Continuous Replication
summary: Learn when and how to use continuous replication during data migration to minimize downtime and keep the target synchronized with the source.
toc: true
docs_area: migrate
---

Continuous replication can be used during a migration to keep a CockroachDB target cluster synchronized with a live source database. This is often used to minimize downtime at cutover. It can complement bulk data loading or be used independently.

This page explains when to choose continuous replication, how to combine it with bulk loading, and how to use MOLT tools effectively for each approach.

In general:

- Choose to **bulk load only** if you can schedule a downtime window long enough to complete the entire data load and do not need to capture ongoing changes during migration.

- Choose a **hybrid approach (bulk load + continuous replication)** when you need to minimize downtime and keep the target synchronized with ongoing source database changes until cutover.

- You can choose **continuous replication only** for tables with transient data, or in other contexts where you only need to capture ongoing changes and are not concerned with migrating a large initial dataset. While it's possible to only use continuous replication, this is less common for an entire migration. This is because with large data volumes, streaming changes from the initial set of data can be much slower than bulk loading the dataset.

## Permissible downtime

Downtime is the primary factor to consider in determining your migration's approach to continuous replication.

If your migration can accommodate a window of **planned downtime** that's made known to your users in advance, a bulk load approach is simpler. A pure bulk load approach is well-suited for test or pre-production refreshes, or with migrations that can successfully move data within a planned downtime window.

If your migration needs to **minimize downtime**, you will likely need to keep the source database live for as long as possible, continuing to allow write traffic to the source until cutover. In this case, an initial bulk load will need to be followed by a replication period, during which you stream incremental changes from the source to the target CockroachDB cluster. This is ideal for large datasets that are impractical to move within a narrow downtime window, or when you need validation time with a live, continuously synced target before switching traffic. The final downtime is minimized to a brief pause to let replication drain before switching traffic, with the pause length driven by write volume and observed replication lag.

If you're migrating your data [in mulitple phases]({% link molt/migration-considerations-granularity.md %}), consider the fact that each phase can have its own separate downtime window and cutover, and that migrating in phases can reduce the length of each individual downtime window.

## Tradeoffs

This table considers the tradeoffs of the two main options for this variable, "bulk load only" and a "hybrid approach."

| | Bulk load only | Hybrid (bulk + replication) |
|---|---|---|
| **Downtime** | Requires full downtime for entire load | Minimal final downtime (brief pause to drain) |
| **Performance** | Fastest overall if window allows | Spreads work: bulk moves mass, replication handles ongoing changes |
| **Complexity** | Fewer moving parts, simpler orchestration | Requires replication infrastructure and monitoring |
| **Risk management** | Full commit at once; rollback more disruptive | Supports failback flows for rollback options |
| **Cutover** | Traffic off until entire load completes | Traffic paused briefly while replication drains |
| **Timeline** | Shortest migration time if downtime permits | Longer preparation but safer path |
| **Best for** | Simple moves, test environments, scheduled maintenance | Production migrations, large datasets, high availability requirements |

## Decision framework

Use these questions to guide your approach:

**What downtime can you tolerate?**
If you can't guarantee a window long enough for the full load, favor the hybrid approach to minimize downtime at cutover.

**How large is the dataset and how fast can you bulk-load it?**
If load time fits inside downtime, bulk-only is simplest. Otherwise, consider a hybrid approach.

**How active is the source (write rate and burstiness)?**
Higher write rates mean a longer final drain; this pushes you toward hybrid with close monitoring of replication lag before cutover.

**How much validation do you require pre-cutover?**
Hybrid gives you time to validate a live, synchronized target before switching traffic.

## MOLT toolkit support

The MOLT toolkit provides two complementary tools for data migration: [MOLT Fetch]({% link molt/molt-fetch.md %}) for bulk loading the initial dataset, and [MOLT Replicator]({% link molt/molt-replicator.md %}) for continuous replication. These tools work independently or together depending on your chosen replication approach.

### Bulk load only

Use MOLT Fetch to [export and load data]({% link molt/molt-fetch.md %}#bulk-data-load) to CockroachDB.

For pure bulk migrations, set the [`--ignore-replication-check`]({% link molt/molt-fetch-commands-and-flags.md %}#ignore-replication-check) flag to skip gathering replication checkpoints. This simplifies the workflow when you don't need to track change positions for subsequent replication.

MOLT Fetch supports both `IMPORT INTO` (default, for highest throughput with offline tables) and `COPY FROM` (for online tables) loading methods. Because a pure bulk load approach will likely involve substantial application downtime, you may benefit from using `IMPORT INTO`. In this case, do not use the [`--use-copy`]({% link molt/molt-fetch-commands-and-flags.md %}#use-copy) flag. Learn more about Fetch's [data load modes]({% link molt/molt-fetch.md %}#import-into-vs-copy-from).

A migration that does not utilize continuous replication would not need to use MOLT Replicator.

### Hybrid (bulk load + continuous replication)

Use MOLT Fetch to [export and load the inital dataset]({% link molt/molt-fetch.md %}#initial-bulk-load-before-replication) to CockroachDB. Then start MOLT Replicator to [begin streaming changes]({% link molt/molt-replicator.md %}#forward-replication-after-initial-load) from the source database to CockroachDB.

When you run MOLT Fetch without [`--ignore-replication-check`]({% link molt/molt-fetch-commands-and-flags.md %}#ignore-replication-check), it emits a checkpoint value that marks the point in time when the bulk load snapshot was taken. After MOLT Fetch completes, the checkpoint is stored in the target database. MOLT Replicator then uses this checkpoint to begin streaming changes from exactly that point, ensuring no data is missed between the bulk load and continuous replication. Learn more about [replication checkpoints]({% link molt/molt-replicator.md %}#replication-checkpoints).

MOLT Fetch supports both `IMPORT INTO` (default, for highest throughput with offline tables) and `COPY FROM` (for online tables) loading methods. Because a hybrid approach will likely aim to have less downtime, you may need to use `COPY FROM` if your tables remain online. In this case, use the [`--use-copy`]({% link molt/molt-fetch-commands-and-flags.md %}#use-copy) flag. Learn more about Fetch's [data load modes]({% link molt/molt-fetch.md %}#import-into-vs-copy-from).

MOLT Replicator replicates full tables by default. If you choose to combine continuous replication with a [phased migration]({% link molt/migration-considerations-granularity.md %}), you will either need to select phases that include whole tables, or else use [userscripts]({% link molt/replicator-flags.md %}#userscript) to select rows to replicate.

MOLT Replicator can be stopped after cutover, or it can remain online to continue streaming changes indefinitely.

### Continuous replication only

If you're only interested in capturing recent changes, skip MOLT Fetch entirely and just use MOLT Replicator.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Migration Granularity]({% link molt/migration-considerations-granularity.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
