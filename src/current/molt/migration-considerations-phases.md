---
title: Migration Granularity
summary: Learn how to think about phased data migration, and whether or not to approach your migration in phases.
toc: true
docs_area: migrate
---

Choosing between a **bulk migration** (migrating all data at once) and a **phased migration** (migrating data in slices) is one of the most important decisions in your CockroachDB migration plan. This page explains when to choose each approach, how to define phases, and how to use MOLT tools effectively in either context. For end-to-end sequencing, see [].

In general:

* Choose a **bulk migration** if you can fit the entire migration sequence within a planned downtime window, your data volume is modest, and external integrations are simple.

* Choose a **phased migration** if your data volume is large or if  need to limit risk and downtime blast radius, or you can naturally partition workload by tenant, service/domain, table/shard, geography, or time. Use MOLT Fetch for initial loads per slice, MOLT Replicator for ongoing changes, MOLT Verify for per-slice checks, and perform many small cutovers instead of one big bang.

---

### How to think about “phases”
Here are some common ways to divide migrations:

* **Per-tenant**: Multi-tenant apps route traffic and data per customer/tenant. Migrate a small cohort first (canary), then progressively larger cohorts. This aligns with access controls and isolates blast radius.

* **Per-service/domain**: In microservice architectures, migrate data owned by a service or domain (e.g., billing, catalog) and route only that service to CockroachDB while others continue on the source. Requires clear data ownership and integration contracts.

* **Per-table or shard**: Start with non-critical tables, large-but-isolated tables, or shard ranges. For monolith schemas, you can still phase by tables with few foreign-key dependencies and clear read/write paths.

* **Per-region/market**: If traffic is regionally segmented, migrate one region/market at a time and validate latency, capacity, and routing rules before expanding.

Tips for picking slices:

* Prefer slices with clear routing keys (tenant_id, region_id) to simplify cutover and verification.

* Start with lower-risk/impact slices to exercise the toolchain and runbooks before high-value cohorts.

* Ensure each slice has an explicit rollback option and a measurable definition of “done” (schema parity, row counts/checksums, app SLOs).

---

### Tradeoffs: Bulk vs. Phased
The table below captures the core differences.

| Factor | Bulk migration | Phased migration |
|---|---|---|
| Downtime | Single, longer window; must fit full load + index build | Multiple short windows; can achieve minimal downtime per slice via replication |
| Risk | Higher blast radius if issues surface post-cutover | Lower blast radius; issues confined to a slice |
| Complexity | Simpler orchestration; one cutover | More orchestration; repeated verify and cutover steps |
| Validation | One-time, system-wide | Iterative per slice; faster feedback loops |
| Timeline | Shorter elapsed run if everything fits | Longer calendar time but safer path |
| Best for | Small/medium datasets, simple integrations, tolerant of planned downtime | Multi-tenant/sharded/microservice estates, low downtime tolerance, risk-averse programs |

Bulk loads and minimal-downtime flows are supported natively by MOLT; see the dedicated flow pages for detailed steps.

---

## MOLT toolkit support

#### Bulk migration (all-at-once)
When: You can complete the full data load and post-load steps within the maintenance window.

Tool pattern:

1) **Schema conversion**: Generate CockroachDB DDL with the Schema Conversion Tool (SCT), apply DDL, and drop secondary indexes/constraints that slow load (you’ll rebuild later).

2) **Initial load**: Run **MOLT Fetch** in data-load mode to bulk-ingest the entire dataset.

3) **Pre-cutover verify**: Run **MOLT Verify** for row counts/checksums and schema parity before you expose the target to traffic.

4) **Finalize schema**: Recreate indexes/constraints that were deferred to accelerate load.

5) **Cutover**: Redirect application traffic to CockroachDB; no replication is required in a pure bulk flow.

Notes:

* If your “bulk” window is tight, consider “load then replicate” even for a single-shot migration; it reduces write pause during cutover by draining replication rather than loading everything during downtime.

#### Phased migration (sliced)
When: You want to reduce risk, limit downtime blast radius, and/or leverage natural partitions (tenants/services/tables/shards/regions).

Per-slice loop:

1) **Define the slice**: Specify the routing key and all tables touched by the slice (including reference/lookup tables). Document read/write paths and dependencies.

2) **Schema conversion once; parameterize per slice**: Run SCT to produce target DDL; apply once. If you need per-slice variants (e.g., tenant-specific objects), template them.

3) **Initial load for the slice**: Use **MOLT Fetch** to move only the slice’s rows (via filters/selection); for large tables, consider range-based or predicate-based extraction.

4) **Start continuous replication**: Enable **MOLT Replicator** to stream ongoing changes from source to CockroachDB for just that slice. Let lag stabilize.

5) **Per-slice verification**: Run **MOLT Verify** focused on the slice (row counts, checksums, schema), and—optionally—semantic checks at the app layer (read-your-writes, idempotency behavior, latency).

6) **Micro-cutover**: Pause writes for the slice (e.g., drain tenant/service traffic), wait for replication to drain, then route that slice to CockroachDB. Keep replication running temporarily for safety or to support failback policies.

7) **Rinse and repeat**: Expand to the next slice as confidence grows. Keep a clear rollback runbook per slice. When all slices are moved, disable replication and decommission the source.

Notes:

* If business requires a back-out path during or after cutover, configure **failback** mode to replicate from CockroachDB back to the source until the rollback window expires.

* Treat each slice as a rehearsal—tune cluster sizing, indexing, and app configuration iteratively based on observations.

---

### Cutover considerations (both approaches)
Regardless of approach:

* Plan and rehearse cutover, including DNS/connection string flips, credential rotation, feature flags, and cache invalidation paths.

* For minimal downtime, combine “initial load + continuous replication,” then briefly pause writes to drain replication before finalizing cutover; the pause length depends on write volume and replication lag.

* Define a clear rollback plan. With replicator failback, you can synchronize CockroachDB-side changes back to the source to restore service quickly if needed.

---

### Choosing the right approach: a quick rubric
Score each item 1–5; higher totals favor phased migrations.

* Data volume and size of indexes are too large for your maintenance window.

* Application is mission-critical; downtime tolerance is near-zero or seconds.

* Estate is naturally partitioned (tenants/services/shards/regions), enabling isolated routing.

* High integration surface area (ETL, reporting, downstream consumers) increases change risk.

* Organization prefers incremental risk and progressive validation over a one-time event.

If your total is high, phase it. If your total is low and downtime is acceptable, bulk may be simpler.

---

### Example blueprints

#### Bulk (planned downtime)
* SCT -> apply DDL (defer secondary indexes)

* Fetch (data-load) full dataset

* Verify (counts/checksums)

* Rebuild indexes; smoke test

* Cutover all traffic to CockroachDB

#### Phased (per-tenant)
* Choose 5 low-risk tenants as canary

* SCT once; apply DDL

* Fetch tenant rows; start Replicator for those tenants

* Verify per tenant; drain and cut over tenant traffic

* Repeat with larger cohorts; disable Replicator after final cohort

---

### MOLT references
* Migration Overview: sequencing and tool roles.

* Migration Strategy: planning downtime, validation, and cutover.

* Migrate to CockroachDB: flow-specific guidance including bulk load, load and replicate, resume replication, and failback.

---

### Appendix: FAQ
Q: Can I mix bulk and phased?  
A: Yes. Many teams bulk-load non-critical/static tables during a short window, and phase live/critical tables with replication and micro-cutovers.

Q: How do I pick the first slice?  
A: Choose a slice with clear routing keys, moderate data volume, and limited dependencies—often a low-risk tenant or a service-owned table set. This maximizes learning with minimal blast radius.

Q: When should I enable failback?  
A: For mission-critical workloads or when organizational risk tolerance requires a rollback window after cutover. Keep failback replication running until SLAs are met and stakeholders sign off.
