Cockroach Labs has discovered a bug relating to incremental backups, for CockroachDB v20.1.0 - v20.1.13. If a backup coincides with an in-progress index creation (backfill), `RESTORE`, or `IMPORT`, it is possible that a subsequent incremental backup will not include all of the indexed, restored or imported data.

Users are advised to upgrade to v20.1.15 or later, which includes resolutions.

For more information, including other affected versions, see [Technical Advisory 63162](../advisories/a63162.html).