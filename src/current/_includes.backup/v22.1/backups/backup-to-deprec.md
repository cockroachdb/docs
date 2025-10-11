{{site.data.alerts.callout_danger}}
The `BACKUP ... TO` and `RESTORE ... FROM` syntax is **deprecated** as of v22.1 and will be removed in a future release.

We recommend using the `BACKUP ... INTO {collectionURI}` syntax, which creates or adds to a [backup collection]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections) in your storage location. For restoring backups, we recommend using `RESTORE FROM {backup} IN {collectionURI}` with `{backup}` being [`LATEST`]({% link {{ page.version.version }}/restore.md %}#restore-the-most-recent-backup) or a specific [subdirectory]({% link {{ page.version.version }}/restore.md %}#subdir-param).

For guidance on the syntax for backups and restores, see the [`BACKUP`]({% link {{ page.version.version }}/backup.md %}#examples) and [`RESTORE`]({% link {{ page.version.version }}/restore.md %}#examples) examples.
{{site.data.alerts.end}}
