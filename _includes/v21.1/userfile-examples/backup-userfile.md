We recommend starting backups from a time at least 10 seconds in the past using [`AS OF SYSTEM TIME`](as-of-system-time.html). Read our guidance in the [Performance](../{{site.versions["stable"]}}/backup.html#performance) section on the [`BACKUP`](../{{site.versions["stable"]}}/backup.html) page.

{{site.data.alerts.callout_info}}
Only database and table-level backups are possible when using `userfile` as storage. Cluster-level backups will include `userfile` data as well, since this is also stored as table data in `defaultdb`.
{{site.data.alerts.end}}

#### Database and table

When working on the same cluster, `userfile` storage allows for database and table-level backups.

First, run the following statement to backup a database to a directory in the default `userfile` space:

~~~sql
BACKUP DATABASE bank TO 'userfile://defaultdb.public.userfiles_$user/bank-backup' AS OF SYSTEM TIME '-10s';
~~~

This directory will hold the files that make up a backup; including the manifest file and data files.

{{site.data.alerts.callout_info}}
If you need to restore a database or table that is stored in your `userfile` space as backup files to a different cluster, run [`cockroach userfile get`](../{{site.versions["stable"]}}/cockroach-userfile-get.html) to download the backup files to a local machine and [`cockroach userfile upload --url {CONNECTION STRING}`](../{{site.versions["stable"]}}/cockroach-userfile-upload.html) to upload to the `userfile` of the alternate cluster.
{{site.data.alerts.end}}

In cases when your database needs to be restored, run the following:

~~~sql
RESTORE DATABASE bank FROM 'userfile://defaultdb.public.userfiles_$user/bank-backup';
~~~

It is also possible to run `userfile:///bank-backup` as `userfile:///` refers to the default path `userfile://defaultdb.public.userfiles_$user/`.

Once the backup data is no longer needed, delete from the `userfile` storage with the following command:

~~~shell
cockroach userfile delete bank-backup --url {CONNECTION STRING}
~~~

If you use `cockroach userfile delete {file}`, it will take as long as the [garbage collection](configure-replication-zones.html#gc-ttlseconds) to be removed from disk.
