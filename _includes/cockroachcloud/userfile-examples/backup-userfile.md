We recommend starting backups from a time at least 10 seconds in the past using [`AS OF SYSTEM TIME`](../{{site.current_cloud_version}}/as-of-system-time.html). Read our guidance in the [Performance](../{{site.current_cloud_version}}/backup.html#performance) section on the [`BACKUP`](../{{site.current_cloud_version}}/backup.html) page.

{{site.data.alerts.callout_info}}
Only database and table-level backups are possible when using `userfile` as storage. Restoring cluster-level backups will not work because `userfile` data is stored in the `defaultdb` database, and you cannot restore a cluster with existing table data.
{{site.data.alerts.end}}

#### Database and table

When working on the same cluster, `userfile` storage allows for database and table-level backups.

First, run the following statement to backup a database to a directory in the default `userfile` space:

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE bank INTO 'userfile://defaultdb.public.userfiles_$user/bank-backup' AS OF SYSTEM TIME '-10s';
~~~

This directory will hold the files that make up a backup; including the manifest file and data files.

{{site.data.alerts.callout_info}}
When backing up from a cluster and restoring a database or table that is stored in your `userfile` space to a different cluster, you can run [`cockroach userfile get`](../{{site.current_cloud_version}}/cockroach-userfile-get.html) to download the backup files to a local machine and [`cockroach userfile upload --url {CONNECTION STRING}`](../{{site.current_cloud_version}}/cockroach-userfile-upload.html) to upload to the `userfile` of the alternate cluster.
{{site.data.alerts.end}}

`BACKUP ... INTO` adds a backup to a collection within the backup destination. The path to the backup is created using a date-based naming scheme by default, unless an [explicit subdirectory](../v21.2/backup.html#specify-a-subdirectory-for-backups) is passed with the `BACKUP` statement. To view the backup paths in a given destination, use [`SHOW BACKUPS`](../{{site.current_cloud_version}}/restore.html#view-the-backup-subdirectories):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 'userfile://defaultdb.public.userfiles_$user/bank-backup';
~~~

~~~
       path
------------------------
2021/03/23-213101.37
2021/03/24-172553.85
2021/03/24-210532.53
(3 rows)
~~~