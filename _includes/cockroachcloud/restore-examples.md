#### View the backup subdirectories

`BACKUP ... INTO` adds a backup to a collection within the backup destination. The path to the backup is created using a date-based naming scheme. To view the backup paths in a given destination, use [`SHOW BACKUPS`](../{{site.versions["stable"]}}/restore.html#view-the-backup-subdirectories):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}';
~~~

~~~
        path
------------------------
2021/03/23-213101.37
2021/03/24-172553.85
2021/03/24-210532.53
(3 rows)
~~~

When you restore a backup, add the backup's subdirectory path (e.g., `2021/03/23-213101.37`) to the storage URL.

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
