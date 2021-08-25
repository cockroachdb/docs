CockroachDB does not currently support [`BACKUP`s](backup.html) of individual tables that are part of [multi-region databases](multiregion-overview.html). For example, you cannot backup a [`GLOBAL`](global-tables.html) or [`REGIONAL`](regional-tables.html) table individually.

To work around this limitation, you must [back up the entire database](backup.html#backup-a-database).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/61133)
