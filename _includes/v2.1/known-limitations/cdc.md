The following are limitations in the v2.1 release and will be addressed in the future:

- The CockroachDB core changefeed is not ready for external testing.
- Changefeeds only work on tables with a single [column family](column-families.html) (which is the default for new tables).
- Many DDL queries (including [`TRUNCATE`](truncate.html) and [`DROP TABLE`](drop-table.html)) will cause errors on a changefeed watching the affected tables. You will need to [start a new changefeed](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Changefeeds cannot be [backed up](backup.html) or [restored](restore.html).
- Changefeed backoff/retry behavior during partial or intermittent sink unavailability has not been optimized; however, [ordering guarantees](change-data-capture.html#ordering-guarantees) will still hold for as long as a changefeed [remains active](change-data-capture.html#monitor-a-changefeed).
- Changefeeds use a pull model, but will use a push model in the future, lowering latencies considerably.
- Changefeeds cannot be altered. To alter, cancel the changefeed and [create a new one with updated settings from where it left off](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Additional envelope options will be added, including one that displays the old and new values for the changed row.
- Additional target options will be added, including partitions and ranges of primary key rows.
