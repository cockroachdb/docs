- `bulkio.backup.deprecated_full_backup_with_subdir.enabled`

    Removed the `bulkio.backup.deprecated_full_backup_with_subdir.enabled` cluster setting. This optional ability to specify a target subdirectory with the `BACKUP` command when creating a full backup was deprecated in v22.1. [#153628][#153628]

- `sql.schema.approx_max_object_count` (default: `20000`)

    Added cluster setting `sql.schema.approx_max_object_count` to prevent creation of new schema objects when the limit is exceeded. The check uses cached table statistics for performance and is approximate - it may not be immediately accurate until table statistics are updated by the background statistics refreshing job. Clusters that have been running stably with a larger object count should raise the limit or disable the limit by setting the value to `0`. In future releases, the default value for this setting will be raised as more CockroachDB features support larger object counts. [#154576][#154576]

[#153628]: https://github.com/cockroachdb/cockroach/pull/153628
[#154576]: https://github.com/cockroachdb/cockroach/pull/154576
