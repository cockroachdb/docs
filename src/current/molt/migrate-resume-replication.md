---
title: Resume Replication
summary: Resume replication after an interruption.
toc: true
docs_area: migrate
---

Resume replication using [MOLT Replicator]({% link molt/molt-replicator.md %}) by running `replicator` with the same arguments used during [initial replication setup]({% link molt/migrate-load-replicate.md %}#start-replicator). Replicator will automatically resume from the saved checkpoint in the existing staging schema.

{{site.data.alerts.callout_info}}
These instructions assume you have already started replication at least once. To start replication for the first time, refer to [Load and Replicate]({% link molt/migrate-load-replicate.md %}#start-replicator).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

## Resume replication after interruption

1. Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) command corresponding to your source database type, using the same `--stagingSchema` value from your [initial replication command]({% link molt/migrate-load-replicate.md %}#start-replicator).

	<section class="filter-content" markdown="1" data-scope="postgres">
	Be sure to specify the same `--slotName` value that you used during your [initial replication command]({% link molt/migrate-load-replicate.md %}#start-replicator). The replication slot on the source PostgreSQL database automatically tracks the LSN (Log Sequence Number) checkpoint, so replication will resume from where it left off.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator pglogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--targetSchema defaultdb.public \
	--slotName molt_slot \
	--stagingSchema _replicator \
	--metricsAddr :30005 \
	--verbose
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	Replicator will automatically use the saved GTID (Global Transaction Identifier) from the `memo` table in the staging schema (in this example, `_replicator.memo`) and track advancing GTID checkpoints there. Do **not** specify `--defaultGTIDSet` when resuming.

	{{site.data.alerts.callout_success}}
	When resuming replication, the `--defaultGTIDSet` flag is optional and only used as a fallback if no saved GTID exists. To have Replicator start from a different GTID instead of resuming from the checkpoint, clear the `memo` table with `DELETE FROM _replicator.memo;` and run the `replicator` command with a new `--defaultGTIDSet` value.
	{{site.data.alerts.end}}

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator mylogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--targetSchema defaultdb.public \
	--stagingSchema _replicator \
	--metricsAddr :30005 \
	--userscript table_filter.ts \
	--verbose
	~~~

	{{site.data.alerts.callout_success}}
	For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON source_database.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
	{{site.data.alerts.end}}
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	Replicator will automatically find the correct restart SCN (System Change Number) from the `_oracle_checkpoint` table in the staging schema. The restart point is determined by the non-committed row with the smallest `startscn` column value. Do **not** specify `--scn` or `--backfillFromSCN` when resuming.

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

## Troubleshooting

{% include molt/molt-troubleshooting-replication.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})