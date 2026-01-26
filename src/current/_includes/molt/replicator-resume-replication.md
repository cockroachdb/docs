<section class="filter-content" markdown="1" data-scope="postgres">
Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `pglogical` command using the same `--stagingSchema` value from your [initial replication command]({% link molt/migrate-load-replicate.md %}?filters=postgres#start-replicator).

Be sure to specify the same `--slotName` value that you used during your [initial replication command]({% link molt/migrate-load-replicate.md %}?filters=postgres#start-replicator). The replication slot on the source PostgreSQL database automatically tracks the LSN (Log Sequence Number) checkpoint, so replication will resume from where it left off.

{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.migration_schema \
--slotName molt_slot \
--stagingSchema defaultdb._replicator \
--metricsAddr :30005 \
-v
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `mylogical` command using the same `--stagingSchema` value from your [initial replication command]({% link molt/migrate-load-replicate.md %}?filters=mysql#start-replicator).

Replicator will automatically use the saved GTID (Global Transaction Identifier) from the `memo` table in the staging schema (in this example, `defaultdb._replicator.memo`) and track advancing GTID checkpoints there. To have Replicator start from a different GTID instead of resuming from the checkpoint, clear the `memo` table with `DELETE FROM defaultdb._replicator.memo;` and run the `replicator` command with a new `--defaultGTIDSet` value.

{{site.data.alerts.callout_success}}
For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON migration_db.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.public \
--stagingSchema defaultdb._replicator \
--metricsAddr :30005 \
--userscript table_filter.ts \
-v
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `oraclelogminer` command using the same `--stagingSchema` value from your [initial replication command]({% link molt/migrate-load-replicate.md %}?filters=oracle#start-replicator).

Replicator will automatically find the correct restart SCN (System Change Number) from the `_oracle_checkpoint` table in the staging schema. The restart point is determined by the non-committed row with the smallest `startscn` column value.

{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer \
--sourceConn $SOURCE \
--sourcePDBConn $SOURCE_PDB \
--sourceSchema MIGRATION_USER \
--targetSchema defaultdb.migration_schema \
--targetConn $TARGET \
--stagingSchema defaultdb._replicator \
--metricsAddr :30005 \
--userscript table_filter.ts \
-v
~~~

{{site.data.alerts.callout_info}}
When [filtering out tables in a schema with a userscript]({% link molt/userscript-cookbook.md %}#filter-multiple-tables), replication performance may decrease because filtered tables are still included in LogMiner queries and processed before being discarded.
{{site.data.alerts.end}}
</section>

Replication resumes from the last checkpoint without performing a fresh load. Monitor the metrics endpoint at `http://localhost:30005/_/varz` to track replication progress.