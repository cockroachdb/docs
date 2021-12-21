#### View the backup subdirectories

`BACKUP ... INTO` adds a backup to a collection within the backup destination. The path to the backup is created using a date-based naming scheme by default, unless an [explicit subdirectory](../{{site.versions["stable"]}}/backup.html#specify-a-subdirectory-for-backups) is passed with the `BACKUP` statement. To view the backup paths in a given destination, use [`SHOW BACKUPS`](../{{site.versions["stable"]}}/restore.html#view-the-backup-subdirectories):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}';
~~~

~~~
       path
-------------------------
/2021/12/14-190909.83
/2021/12/20-155249.37
/2021/12/21-142943.73
(3 rows)
~~~

When you restore a backup, add the backup's subdirectory path (e.g. `/2021/12/21-142943.73`) to the `RESTORE` statement.

Incremental backups will be appended to the full backup with `BACKUP ... INTO LATEST IN {destination}`. Your storage location will contain the incremental as a date-based subdirectory within the full backup.

In the following example `/2021/12/21-142943.73` contains the full backup. The incremental backups (`144748.08/` and `144639.97/`) are appended as subdirectories to the full backup:

~~~
2021
|—— 12
   |—— 21-142943.73/
       |—— 20211221/
           |—— 144748.08/
           |—— 144639.97/
~~~

To output more detail about the backups contained within a directory, see [View a list of the full and incremental backups in a specific full backup subdirectory](../{{site.versions["stable"]}}/show-backup.html#view-a-list-of-the-full-and-incremental-backups-in-a-specific-full-backup-subdirectory)

See [Incremental backups with explicitly specified destinations](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html#incremental-backups-with-explicitly-specified-destinations) to control where your backups go.

#### Restore a cluster

To restore a full cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM '2021/03/23-213101.37' IN 's3://{bucket_name}/{path/to/backup}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](../{{site.versions["stable"]}}/restore.html#view-the-backup-subdirectories).

#### Restore a database

To restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM '2021/03/23-213101.37' IN 's3://{bucket_name}/{path/to/backup}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](../{{site.versions["stable"]}}/restore.html#view-the-backup-subdirectories).

{{site.data.alerts.callout_info}}
`RESTORE DATABASE` can only be used if the entire database was backed up.
{{site.data.alerts.end}}

#### Restore a table

To restore a single table:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers FROM '2021/03/23-213101.37' IN 's3://{bucket_name}/{path/to/backup}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To restore multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers, bank.accounts FROM '2021/03/23-213101.37' IN 's3://{bucket_name}/{path/to/backup}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](../{{site.versions["stable"]}}/restore.html#view-the-backup-subdirectories).
