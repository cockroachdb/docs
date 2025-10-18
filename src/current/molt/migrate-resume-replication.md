---
title: Start or Resume Replication
summary: Start replication without MOLT Fetch or resume replication after an interruption.
toc: true
docs_area: migrate
---

Use [MOLT Replicator]({% link molt/molt-replicator.md %}) to start or resume replication to CockroachDB without reloading data.

{{site.data.alerts.callout_info}}
To resume replication after an interruption, refer to [Resume replication after interruption](#resume-replication-after-interruption). To start replication without first running MOLT Fetch, refer to [Start replication without MOLT Fetch](#start-replication-without-molt-fetch).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

## Start replication without MOLT Fetch

If you want to start replication without first running [MOLT Fetch]({% link molt/molt-fetch.md %}), you need to manually obtain a replication checkpoint from the source database and then start MOLT Replicator with the appropriate checkpoint flags.

<section class="filter-content" markdown="1" data-scope="postgres">
1. Create a publication for the tables you want to replicate:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE PUBLICATION molt_publication FOR TABLE employees, payments, orders;
	~~~

1. Create a replication slot to track the LSN checkpoint:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SELECT pg_create_logical_replication_slot('molt_slot', 'pgoutput');
	~~~

	~~~
	 pg_create_logical_replication_slot
	-------------------------------------
	 (molt_slot,0/167A220)
	~~~

1. Run the `replicator pglogical` command, specifying the slot name with `--slotName`. The replication slot automatically tracks the LSN checkpoint, so you don't need to specify an LSN value. Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator pglogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--targetSchema defaultdb.public \
	--slotName molt_slot \
	--stagingSchema _replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--verbose
	~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
1. Get the current GTID set to use as the starting point for replication:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	-- For MySQL < 8.0:
	SHOW MASTER STATUS;
	-- For MySQL 8.0+:
	SHOW BINARY LOG STATUS;
	~~~

	~~~
	+---------------+----------+--------------+------------------+-------------------------------------------+
	| File          | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set                         |
	+---------------+----------+--------------+------------------+-------------------------------------------+
	| binlog.000005 |      197 |              |                  | 77263736-7899-11f0-81a5-0242ac120002:1-38 |
	+---------------+----------+--------------+------------------+-------------------------------------------+
	~~~

1. Run the `replicator mylogical` command, specifying the GTID from the `Executed_Gtid_Set` value with `--defaultGTIDSet`. Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator mylogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--targetSchema defaultdb.public \
	--defaultGTIDSet 77263736-7899-11f0-81a5-0242ac120002:1-38 \
	--stagingSchema _replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--userscript table_filter.ts \
	--verbose
	~~~

	{{site.data.alerts.callout_success}}
	For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON source_database.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
	{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
1. Get the current SCN to use as the starting point for replication:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SELECT CURRENT_SCN FROM V$DATABASE;
	~~~

	Use this SCN value for both `--backfillFromSCN` and `--scn` flags.

1. Run the `replicator oraclelogminer` command, specifying the SCN values from the checkpoint queries. Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator oraclelogminer \
	--sourceConn $SOURCE \
	--sourcePDBConn $SOURCE_PDB \
	--targetConn $TARGET \
	--sourceSchema migration_schema \
	--targetSchema defaultdb.public \
	--backfillFromSCN 26685444 \
	--scn 26685786 \
	--stagingSchema _replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--userscript table_filter.ts \
	--verbose
	~~~

	{{site.data.alerts.callout_info}}
	When filtering out tables in a schema with a userscript, replication performance may decrease because filtered tables are still included in LogMiner queries and processed before being discarded.
	{{site.data.alerts.end}}
</section>

## Resume replication after interruption

Resume replication using [MOLT Replicator]({% link molt/molt-replicator.md %}) by running the replicator binary directly with the same arguments used during [initial replication setup]({% link molt/migrate-load-replicate.md %}#start-replicator). Replicator will automatically resume from the saved checkpoint in the existing staging schema.

1. Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) command corresponding to your source database type, using the same `--stagingSchema` value from your [initial replication command]({% link molt/migrate-load-replicate.md %}#start-replicator).

	<section class="filter-content" markdown="1" data-scope="postgres">
	Use the `replicator pglogical` command. Be sure to specify the same `--slotName` value that you used during your [initial replication command]({% link molt/migrate-load-replicate.md %}#start-replicator). The replication slot on the source PostgreSQL database automatically tracks the LSN (Log Sequence Number) checkpoint, so replication will resume from where it left off.

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
	Use the `replicator mylogical` command. Replicator will automatically use the saved GTID (Global Transaction Identifier) from the `memo` table in the staging schema (in this example, `_replicator.memo`) and track advancing GTID checkpoints there.

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
	--userscript table_filter.ts
	~~~

	{{site.data.alerts.callout_success}}
	For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON source_database.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
	{{site.data.alerts.end}}
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	Use the `replicator oraclelogminer` command. Replicator will automatically find the correct restart SCN (System Change Number) from the `_oracle_checkpoint` table in the staging schema. The restart point is determined by the non-committed row with the smallest `startscn` column value. Do not specify `--scn` or `--backfillFromSCN` flags when resuming.

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

{% include molt/molt-troubleshooting.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})