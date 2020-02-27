The following are limitations in the v19.1 release and will be addressed in the future:

- Changefeeds only work on tables with a single [column family](column-families.html) (which is the default for new tables).
- Many DDL queries (including [`TRUNCATE`](truncate.html) and [`DROP TABLE`](drop-table.html)) will cause errors on a changefeed watching the affected tables. You will need to [start a new changefeed](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Changefeeds cannot be [backed up](backup.html) or [restored](restore.html).
- Partial or intermittent sink unavailability may impact changefeed stability; however, [ordering guarantees](change-data-capture.html#ordering-guarantees) will still hold for as long as a changefeed [remains active](change-data-capture.html#monitor-a-changefeed).
- Changefeeds cannot be altered. To alter, cancel the changefeed and [create a new one with updated settings from where it left off](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Additional target options will be added, including partitions and ranges of primary key rows.
- There is an open correctness issue with changefeeds using resolved timestamps connected to cloud storage sinks. While this issue is unlikely, new row information could display with a lower timestamp than what has already been emitted, which violates our [ordering guarantees](change-data-capture.html#ordering-guarantees). This issue is fixed in v19.2 and beyond.
- In v19.1.0, when emitting deletes, [cloud storage sinks](create-changefeed.html#cloud-storage-sink) do not emit the record's keys; therefore, the deleted record is not identifiable. This has been fixed in v19.1.1 and above.
- Using a [cloud storage sink](create-changefeed.html#cloud-storage-sink) only works with `JSON` and emits [newline-delimited json](http://ndjson.org) files.
