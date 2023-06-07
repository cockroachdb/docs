 When a [backup is created by a schedule](create-schedule-for-backup.html), it is stored within a collection of backups in the given location. To view details for a backup created by a schedule, you can use the following:

- `SHOW BACKUPS IN collectionURI` statement to [view a list of the full backup's subdirectories](show-backup.html#view-a-list-of-the-available-full-backup-subdirectories).
- `SHOW BACKUP FROM subdirectory IN collectionURI` statement to [view a list of the full and incremental backups that are stored in a specific full backup's subdirectory](show-backup.html#view-a-list-of-the-full-and-incremental-backups-in-a-specific-full-backup-subdirectory).
- Use the [Schedules page](ui-schedules-page.html) in the [DB Console](ui-overview.html) to view a list of created backup schedules and their individual details.

For more details, see [`SHOW BACKUP`](show-backup.html).