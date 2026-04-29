- `bulkio.backup.deprecated_full_backup_with_subdir.enabled`

    Removed the `bulkio.backup.deprecated_full_backup_with_subdir.enabled` cluster setting. This optional ability to specify a target subdirectory with the `BACKUP` command when creating a full backup was deprecated in v22.1. [#153628][#153628]

- `sql.schema.approx_max_object_count` (default: `20000`)

    Added cluster setting `sql.schema.approx_max_object_count` to prevent creation of new schema objects when the limit is exceeded. The check uses cached table statistics for performance and is approximate - it may not be immediately accurate until table statistics are updated by the background statistics refreshing job. Clusters that have been running stably with a larger object count should raise the limit or disable the limit by setting the value to `0`. In future releases, the default value for this setting will be raised as more CockroachDB features support larger object counts. [#154576][#154576]

- This release includes a fix in Kafka topic creation, resolving a bug where changefeeds using a field or table name containing capital letters would result in the unicode value for a quotation mark `_u0022_` being used in the topic name instead of the intended double quote `"` character. As a result of this fix, existing changefeed topics that contain the `_u0022_` unicode are updated in v25.4 to automatically have the topic name updated to use double quote characters instead. Update your Kafka sinks to account for the topic name change. [#149438][#149438]

[#149438]: https://github.com/cockroachdb/cockroach/pull/149438
[#153628]: https://github.com/cockroachdb/cockroach/pull/153628
[#154576]: https://github.com/cockroachdb/cockroach/pull/154576
