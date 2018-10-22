The following are limitations in the v2.1 release and will be addressed in the future:

- The CockroachDB core changefeed is not ready for external testing.
- Changefeeds only work on tables with a single [column family](column-families.html) (which is the default for new tables).
- Many DDL queries (including [`TRUNCATE`](truncate.html) and [`DROP TABLE`](drop-table.html)) will cause errors on a changefeed watching the affected tables. Also, any schema changes with column backfills (e.g., adding a column with a default, adding a computed column, adding a `NOT NULL` column, dropping a column) will cause the changefeed to stop and you will need to [start a new changefeed](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Changefeeds cannot be [backed up](backup.html) or [restored](restore.html).
- Changefeed behavior under most types of failures/degraded conditions is not yet tuned.
- Changefeeds use a pull model, but will use a push model in the future, lowering latencies considerably.
- Changefeeds cannot be altered. To alter, cancel the changefeed and create a new one with updated settings from where it left off.
- Additional envelope options will be added, including one that displays the old and new values for the changed row.
- Additional target options will be added, including partitions and ranges of primary key rows.
