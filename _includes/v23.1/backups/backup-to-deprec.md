{{site.data.alerts.callout_danger}}
The [`BACKUP ... TO`](../v20.2/backup.html) and [`RESTORE ... FROM`](../v20.2/restore.html) syntax is **deprecated** as of v22.1 and will be removed in a future release.

We recommend using the `BACKUP ... INTO {collectionURI}` syntax, which creates or adds to a [backup collection](take-full-and-incremental-backups.html#backup-collections) in your storage location. For restoring backups, we recommend using `RESTORE FROM {backup} IN {collectionURI}` with `{backup}` being [`LATEST`](restore.html#restore-the-most-recent-backup) or a specific [subdirectory](restore.html#subdir-param).

For guidance on the syntax for backups and restores, see the [`BACKUP`](backup.html#examples) and [`RESTORE`](restore.html#examples) examples.
{{site.data.alerts.end}}
