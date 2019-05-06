The following are limitations in the v19.1 release and will be addressed in the future:

- Changefeeds only work on tables with a single [column family](column-families.html) (which is the default for new tables).
- Many DDL queries (including [`TRUNCATE`](truncate.html) and [`DROP TABLE`](drop-table.html)) will cause errors on a changefeed watching the affected tables. You will need to [start a new changefeed](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Changefeeds cannot be [backed up](backup.html) or [restored](restore.html).
- Partial or intermittent sink unavailability may impact changefeed stability; however, [ordering guarantees](change-data-capture.html#ordering-guarantees) will still hold for as long as a changefeed [remains active](change-data-capture.html#monitor-a-changefeed).
- Changefeeds cannot be altered. To alter, cancel the changefeed and [create a new one with updated settings from where it left off](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Additional target options will be added, including partitions and ranges of primary key rows.
