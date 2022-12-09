#### Backup a cluster

To take a [full backup](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#full-backups) of a cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO \
's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

#### Backup a database

To take a [full backup](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#full-backups) of a single database:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
INTO 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#full-backups) of multiple databases:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank, employees \
INTO 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

#### Backup a table or view

To take a [full backup](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#full-backups) of a single table or view:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers \
INTO 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To resolve database or table naming conflicts during a restore, see [Troubleshooting naming conflicts](backups-page.html#troubleshooting).
