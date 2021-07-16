
First, run the following statement to backup a database to a directory in the default `userfile` space:

~~~sql
BACKUP DATABASE bank TO 'userfile://defaultdb.public.userfiles_$user/bank-backup' AS OF SYSTEM TIME '-10s';
~~~

This directory will hold the files that make up a backup; including the manifest file and data files.

Then to restore a database from the backup, run the following:

~~~sql
RESTORE DATABASE bank FROM 'userfile://defaultdb.public.userfiles_$user/bank-backup';
~~~

It is also possible to run `userfile:///bank-backup` as `userfile:///` refers to the default path `userfile://defaultdb.public.userfiles_$user/`.

{{site.data.alerts.callout_info}}
We only recommend database and/or table-level backups when using `userfile` as storage. Cluster-level backups will take backups of the `userfile` data as well, since this is also stored as table data.
{{site.data.alerts.end}}

Once the backup data is no longer needed, delete from the `userfile` storage with the following command:

~~~shell
cockroach userfile delete bank-backup --certs-dir=certs
~~~

{{site.data.alerts.callout_info}}
If you use `cockroach userfile delete {file}`, it will take as long as the [garbage collection](configure-replication-zones.html#gc-ttlseconds) to be removed from disk.
{{site.data.alerts.end}}
