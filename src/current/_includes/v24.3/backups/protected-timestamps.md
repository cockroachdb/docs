Scheduled backups ensure that the data to be backed up is protected from garbage collection until it has been successfully backed up. This active management of [protected timestamps]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) means that you can run scheduled backups at a cadence independent from the [GC TTL]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) of the data. This is unlike non-scheduled backups that are tightly coupled to the GC TTL. See [Garbage collection and backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#garbage-collection-and-backups) for more detail.

The data being backed up will not be eligible for garbage collection until a successful backup completes. At this point, the schedule will release the existing protected timestamp record and write a new one to protect data for the next backup that is scheduled to run. It is important to consider that when a scheduled backup fails there will be an accumulation of data until the next successful backup. Resolving the backup failure or [dropping the backup schedule]({% link {{ page.version.version }}/drop-schedules.md %}) will make the data eligible for garbage collection once again.

You can also use the `exclude_data_from_backup` option with a scheduled backup as a way to prevent protected timestamps from prolonging garbage collection on a table. See the example [Exclude a table's data from backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#exclude-a-tables-data-from-backups) for usage information.