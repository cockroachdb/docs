The following deprecations/removals are announced in v25.4.

- The functionality provided by session variable `enforce_home_region_follower_reads_enabled` was deprecated in v24.2.4 and is now removed. {% comment %}TODO: Verify with michae2 - Is this backward-incompatible?{% endcomment %}(The variable itself remains for backward compatibility but has no effect.) Note that the related session variable `enforce_home_region` is **not** deprecated and still functions normally. [#148314][#148314]

- The cluster settings `storage.columnar_blocks.enabled` and `bulkio.backup.deprecated_full_backup_with_subdir.enabled` have been removed. For details, refer to [Removed settings](#v25-4-0-settings-removed).

- The bespoke restore and import event logs have been deprecated. For any deployment that is reliant on those logs, use the status change event log which now plumbs the SQL user that owns the job. [#153889][#153889]

- The `incremental_location` backup option is now deprecated and will be removed in a future release. This feature was added so customers could define different TTL policies for incremental backups vs full backups. Users can still do this since incremental backups are by default stored in a distinct directory relative to full backups (`{collection_root}/incrementals`). [#153890][#153890]

[#148314]: https://github.com/cockroachdb/cockroach/pull/148314
[#153889]: https://github.com/cockroachdb/cockroach/pull/153889
[#153890]: https://github.com/cockroachdb/cockroach/pull/153890