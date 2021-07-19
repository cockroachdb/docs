Per our guidance in the [Performance](../{{site.versions["stable"]}}/backup.html#performance) section, we recommend starting backups from a time at least 10 seconds in the past using [`AS OF SYSTEM TIME`](as-of-system-time.html).

The following example uses `userfile` storage and its features to backup a cluster and restore that cluster information to another cluster. When quick testing is needed with different levels of data, or, in preparation for accidental loss of data, this workflow provides a way to recover in those scenarios with `userfile` storage.

#### Cluster

After connecting to the cluster that contains the data you would like to backup, run the following `BACKUP` statement:

~~~sql
BACKUP TO 'userfile://defaultdb.public.userfiles_$user/cluster-backup' AS OF SYSTEM TIME '-10s';
~~~

This has made a back up of the cluster to the default `userfile` space.

~~~
job_id       |  status   | fraction_completed | rows | index_entries |  bytes
---------------------+-----------+--------------------+------+---------------+-----------
677076679499032337 | succeeded |                  1 | 2927 |          1350 | 15982956
(1 row)
~~~

Next, use the following `cockroach userfile get` to command to fetch the files stored in the `userfile` storage. Note that without passing a specific directory this command would fetch all files stored in the default user space in `userfile`:

~~~shell
cockroach userfile get 'userfile://defaultdb.public.userfiles_$user/cluster-backup' --url {CONNECTION STRING}
~~~

Your output will show your files downloading to your current directory. For example, this the `cluster-backup` directory has downloaded to the development machine's home directory (`~/cluster-backup`):

~~~
cockroach userfile get 'userfile://defaultdb.public.userfiles_$user/cluster-backup' --url "postgresql://kathryn:kathlovesdoingtests@free-tier5.gcp-europe-west1.cockroachlabs.cloud:26257?sslmode=verify-full&sslrootcert=$HOME/.postgresql/root.crt&options=--cluster%3Dmoist-rat-46"
downloaded cluster-backup/BACKUP-CHECKPOINT-677076679499032337-CHECKSUM to cluster-backup/BACKUP-CHECKPOINT-677076679499032337-CHECKSUM (4 B)
downloaded cluster-backup/BACKUP-CHECKPOINT-CHECKSUM to cluster-backup/BACKUP-CHECKPOINT-CHECKSUM (4 B)
downloaded cluster-backup/BACKUP-STATISTICS to cluster-backup/BACKUP-STATISTICS (144 KiB)
downloaded cluster-backup/BACKUP_MANIFEST to cluster-backup/BACKUP_MANIFEST (4.1 KiB)
downloaded cluster-backup/BACKUP_MANIFEST-CHECKSUM to cluster-backup/BACKUP_MANIFEST-CHECKSUM (4 B)
downloaded cluster-backup/data/677076685373351697.sst to cluster-backup/data/677076685373351697.sst (1.2 KiB)
downloaded cluster-backup/data/677076685373384465.sst to cluster-backup/data/677076685373384465.sst (1.1 KiB)
downloaded cluster-backup/data/677076685374007057.sst to cluster-backup/data/677076685374007057.sst (1.1 KiB)
. . .
~~~

At this point, the original cluster you have backed up to `userfile` storage and you have a copy of that backup on your local machine. In the case that you need to use that cluster's data for recovery or testing purposes, you can now upload these files to a new cluster with `userfile upload` and `RESTORE`.

With the connection string to your **second** cluster, upload your backup to this cluster's `userfile` space:

~~~shell
cockroach userfile upload --recursive ~/cluster-backup 'userfile://defaultdb.public.userfiles_$user/cluster-backup' --url {CONNECTION STRING}
~~~

The `--recursive` flag allows for all the backup files within the `cluster-backup` directory to upload to the default user file storage space within the specified directory.

Now, `RESTORE` the backup files to the **second** cluster:

~~~sql
RESTORE FROM userfile:///cluster-backup;
~~~

Note that userfile:/// refers to the default path `userfile://defaultdb.public.userfiles_$user/`.



#### Database and table

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



<!--TODO EDIT THIS NOTE -->
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
