{{site.data.alerts.callout_info}}
Change data capture was originally built with one case study in mind. It is currently undergoing continued development and testing. Please [file a Github issue](file-an-issue.html) with us to request a feature or if you identify a bug.
{site.data.alerts.end}}

- Changefeeds only work on tables with a single [column family](column-families.html) (which is the default for new tables).
- Changefeeds do not share internal buffers, so each running changefeed will increase total memory usage. To watch multiple tables, we recommend creating a changefeed with a comma-separated list of tables.
- Many DDL queries (including [`TRUNCATE`](truncate.html) and [`DROP TABLE`](drop-table.html)) will cause errors on a changefeed watching the affected tables. You will need to [start a new changefeed](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Changefeeds cannot be [backed up](backup.html) or [restored](restore.html).
- Partial or intermittent sink unavailability may impact changefeed stability; however, [ordering guarantees](change-data-capture.html#ordering-guarantees) will still hold for as long as a changefeed [remains active](change-data-capture.html#monitor-a-changefeed).
- Changefeeds cannot be altered. To alter, cancel the changefeed and [create a new one with updated settings from where it left off](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Additional target options will be added, including partitions and ranges of primary key rows.
- There is an open correctness issue with changefeeds connected to cloud storage sinks where new row information will display with a lower timestamp than what has already been emitted, which violates our [ordering guarantees](change-data-capture.html#ordering-guarantees).
- Changefeeds do not pick up data ingested with the [`IMPORT INTO`](import-into.html) statement.
- Using a [cloud storage sink](create-changefeed.html#cloud-storage-sink) only works with `JSON` and emits [newline-delimited json](http://ndjson.org) files.
