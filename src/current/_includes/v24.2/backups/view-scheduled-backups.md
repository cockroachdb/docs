 When a [backup is created by a schedule]({{ page.version.version }}/create-schedule-for-backup.md), it is stored within a collection of backups in the given location. To view details for a backup created by a schedule, you can use the following:

- `SHOW BACKUPS IN collectionURI` statement to [view a list of the full backup's subdirectories]({{ page.version.version }}/show-backup.md#view-a-list-of-the-available-full-backup-subdirectories).
- `SHOW BACKUP FROM subdirectory IN collectionURI` statement to [view a list of the full and incremental backups that are stored in a specific full backup's subdirectory]({{ page.version.version }}/show-backup.md#view-a-list-of-the-full-and-incremental-backups-in-a-specific-full-backup-subdirectory).
- Use the [Schedules page]({{ page.version.version }}/ui-schedules-page.md) in the [DB Console]({{ page.version.version }}/ui-overview.md) to view a list of created backup schedules and their individual details.

For more details, see [`SHOW BACKUP`]({{ page.version.version }}/show-backup.md).