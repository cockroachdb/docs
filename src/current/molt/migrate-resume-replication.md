---
title: Resume Replication
summary: Restart ongoing replication using an existing staging schema checkpoint.
toc: true
docs_area: migrate
---

Use [MOLT Replicator]({% link molt/molt-replicator.md %}) to resume replication to CockroachDB after an interruption, without reloading data.

{{site.data.alerts.callout_info}}
These steps assume that you previously started replication. Refer to [Load and Replicate]({% link molt/migrate-load-replicate.md %}#start-replicator).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

## Resume replication after interruption

Resume replication using [MOLT Replicator]({% link molt/molt-replicator.md %}) by running the replicator binary directly with the same arguments used during [initial replication setup]({% link molt/migrate-load-replicate.md %}#start-replicator). Replicator will automatically resume from the saved checkpoint in the existing staging schema.

1. Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) command corresponding to your source database type, using the same `--stagingSchema` value from your initial replication setup.

	<section class="filter-content" markdown="1" data-scope="postgres">
	Use the `replicator pglogical` command. Be sure to specify the same `--slotName` value that you used during initial replication setup.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator pglogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--slotName molt_slot \
	--stagingSchema _replicator \
	--metricsAddr :30005
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	Use the `replicator mylogical` command. Replicator will automatically use the saved GTID from the staging schema, or fall back to the specified `--defaultGTIDSet` if no saved state exists.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator mylogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--defaultGTIDSet 4c658ae6-e8ad-11ef-8449-0242ac140006:1-29 \
	--stagingSchema _replicator \
	--metricsAddr :30005 \
	--userscript table_filter.ts
	~~~

	{{site.data.alerts.callout_success}}
	For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON source_database.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
	{{site.data.alerts.end}}
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	Use the `replicator oraclelogminer` command. Replicator will automatically find the correct restart SCN from the `_oracle_checkpoint` table in the staging schema. The restart point is determined by the non-committed row with the smallest `startscn` column value. Do not specify `--scn` or `--backfillFromSCN` flags when resuming.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator oraclelogminer \
	--sourceConn $SOURCE \
	--sourcePDBConn $SOURCE_PDB \
	--sourceSchema migration_schema \
	--targetConn $TARGET \
	--stagingSchema _replicator \
	--metricsAddr :30005 \
	--userscript table_filter.ts
	~~~

	{{site.data.alerts.callout_info}}
	When filtering out tables in a schema with a userscript, replication performance may decrease because filtered tables are still included in LogMiner queries and processed before being discarded.
	{{site.data.alerts.end}}
	</section>

	Replication resumes from the last checkpoint without performing a fresh load. Monitor the metrics endpoint at `http://localhost:30005/_/varz` to track replication progress.

<section class="filter-content" markdown="1" data-scope="postgres oracle">
## Tuning parameters

{% include molt/optimize-replicator-performance.md %}
</section>

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})