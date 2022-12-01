#### View the backup subdirectories

`BACKUP ... INTO` adds a backup to a [collection](../{{site.versions["cloud"]}}/take-full-and-incremental-backups.html#backup-collections) within the backup destination. The path to the backup is created using a date-based naming scheme. To view the backup paths in a given destination, use [`SHOW BACKUPS`](../{{site.versions["cloud"]}}/restore.html#view-the-backup-subdirectories):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

#### Restore a cluster

To restore a full cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories to restore a backup from, use [`SHOW BACKUPS`](../{{site.versions["cloud"]}}/restore.html#view-the-backup-subdirectories).

#### Restore a database

To restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories to restore a backup from, use [`SHOW BACKUPS`](../{{site.versions["cloud"]}}/restore.html#view-the-backup-subdirectories).

{{site.data.alerts.callout_info}}
`RESTORE DATABASE` can only be used if the entire database was backed up.
{{site.data.alerts.end}}

#### Restore a table

To restore a single table:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To restore multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers, bank.accounts FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories to restore a backup from, use [`SHOW BACKUPS`](../{{site.versions["cloud"]}}/restore.html#view-the-backup-subdirectories).
