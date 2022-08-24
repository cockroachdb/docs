Use `SHOW BACKUP ... check_files` with a backup for validation:

{% include_cached copy-clipboard.html %}
~~~sql
SHOW BACKUP "2022/09/19-134123.64" IN "s3://bucket?AWS_ACCESS_KEY_ID={Access Key ID}&AWS_SECRET_ACCESS_KEY={Secret Access Key}" WITH check_files;
~~~

This will return the following output after validating that the backup files are correct and present:

~~~
  database_name | parent_schema_name |        object_name         | object_type | backup_type | start_time |          end_time          | size_bytes | rows  | is_full_cluster | file_bytes
----------------+--------------------+----------------------------+-------------+-------------+------------+----------------------------+------------+-------+-----------------+-------------
  NULL          | NULL               | movr                       | database    | full        | NULL       | 2022-09-19 13:41:23.645189 |       NULL |  NULL |        f        |       NULL
  movr          | NULL               | public                     | schema      | full        | NULL       | 2022-09-19 13:41:23.645189 |       NULL |  NULL |        f        |       NULL
  movr          | public             | users                      | table       | full        | NULL       | 2022-09-19 13:41:23.645189 |      31155 |   340 |        f        |      16598
  movr          | public             | vehicles                   | table       | full        | NULL       | 2022-09-19 13:41:23.645189 |      22282 |   113 |        f        |      12459
  movr          | public             | rides                      | table       | full        | NULL       | 2022-09-19 13:41:23.645189 |     261950 |   902 |        f        |     135831
  movr          | public             | vehicle_location_histories | table       | full        | NULL       | 2022-09-19 13:41:23.645189 |     742557 | 10850 |        f        |     318583
  movr          | public             | promo_codes                | table       | full        | NULL       | 2022-09-19 13:41:23.645189 |     228320 |  1034 |        f        |     118376
  movr          | public             | user_promo_codes           | table       | full        | NULL       | 2022-09-19 13:41:23.645189 |       9320 |   111 |        f        |       4832
~~~

The output will return `file_bytes` along with the columns you receive from `SHOW BACKUP` without `check_files`. The `file_bytes` column indicates the estimated bytes in external storage for a particular table object. For more detail on the output columns, see the `SHOW BACKUP` [Response](show-backup.html#response) table.

If `SHOW BACKUP ... check_files` cannot read from a file, it will return an error message with the file path: 

~~~
ERROR: The following files are missing from the backup:
	s3:/bucket-name/2022/09/19-134123.64/data/797981063156727810.sst 
~~~

`SHOW BACKUP ... check_files` will return up to ten file paths for incorrect or missing files.