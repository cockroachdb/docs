{{site.data.alerts.callout_info}}
`SHOW BACKUP` cannot display metadata for locality-aware backups taken with the [`incremental_location`](show-backup.html#show-a-backup-taken-with-the-incremental-location-option) option.
{{site.data.alerts.end}}

To view a list of [locality-aware backups](take-and-restore-locality-aware-backups.html), pass the endpoint [collection URI](backup.html#backup-file-urls) that is set as the `default` location with `COCKROACH_LOCALITY=default`: 

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 's3://{default collection URI}/{path}?AWS_ACCESS_KEY_ID={placeholder}&AWS_SECRET_ACCESS_KEY={placeholder}';
~~~

~~~
        path
-------------------------
/2023/02/23-150925.62
/2023/03/08-192859.44
(2 rows)
~~~

To view a [locality-aware backup](take-and-restore-locality-aware-backups.html), pass locality-aware backup URIs to `SHOW BACKUP`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP FROM LATEST IN ('s3://{bucket name}/locality?AWS_ACCESS_KEY_ID={placeholder}&AWS_SECRET_ACCESS_KEY={placeholder}&COCKROACH_LOCALITY=default', 's3://{bucket name}/locality?AWS_ACCESS_KEY_ID={placeholder}&AWS_SECRET_ACCESS_KEY={placeholder}&COCKROACH_LOCALITY=region%3Dus-west');
~~~

~~~
  database_name | parent_schema_name |        object_name         | object_type | backup_type | start_time |          end_time          | size_bytes | rows | is_full_cluster
----------------+--------------------+----------------------------+-------------+-------------+------------+----------------------------+------------+------+------------------
  NULL          | NULL               | movr                       | database    | full        | NULL       | 2023-02-23 15:09:25.625777 |       NULL | NULL |        f
  movr          | NULL               | public                     | schema      | full        | NULL       | 2023-02-23 15:09:25.625777 |       NULL | NULL |        f
  movr          | public             | users                      | table       | full        | NULL       | 2023-02-23 15:09:25.625777 |       5633 |   58 |        f
  movr          | public             | vehicles                   | table       | full        | NULL       | 2023-02-23 15:09:25.625777 |       3617 |   17 |        f
  movr          | public             | rides                      | table       | full        | NULL       | 2023-02-23 15:09:25.625777 |     159269 |  511 |        f
  movr          | public             | vehicle_location_histories | table       | full        | NULL       | 2023-02-23 15:09:25.625777 |      79963 | 1092 |        f
  movr          | public             | promo_codes                | table       | full        | NULL       | 2023-02-23 15:09:25.625777 |     221763 | 1003 |        f
  movr          | public             | user_promo_codes           | table       | full        | NULL       | 2023-02-23 15:09:25.625777 |        927 |   11 |        f
(8 rows)
~~~