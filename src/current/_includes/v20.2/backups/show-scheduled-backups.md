#### View a list of the full backup's subdirectories

{% include copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
          path
------------------------
  2020/09/24-204152.88
  2020/09/24-204623.44
  2020/09/24-205612.40
  2020/09/24-207328.36
(4 rows)
~~~

The path format is `<year>/<month>/<day>-<timestamp>`.

#### View a list of the full and incremental backups in a specific full backup subdirectory

{% include copy-clipboard.html %}
~~~ sql
> SHOW BACKUP '2020/09/24-204152.88' IN 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
  database_name | parent_schema_name |        object_name         | object_type |            start_time            |             end_time             | size_bytes | rows | is_full_cluster
----------------+--------------------+----------------------------+-------------+----------------------------------+----------------------------------+------------+------+------------------
  NULL          | NULL               | system                     | database    | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  system        | public             | users                      | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        144 |    3 |      true
  system        | public             | zones                      | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        201 |    7 |      true
  system        | public             | settings                   | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        875 |    6 |      true
  system        | public             | ui                         | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |          0 |    0 |      true
  system        | public             | jobs                       | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |     795117 |   80 |      true
  system        | public             | locations                  | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        261 |    5 |      true
  system        | public             | role_members               | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        184 |    2 |      true
  system        | public             | comments                   | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       1013 |    2 |      true
  NULL          | NULL               | defaultdb                  | database    | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  movr          | public             | users                      | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       4911 |   50 |      true
  movr          | public             | vehicles                   | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       3182 |   15 |      true
  movr          | public             | rides                      | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |     156387 |  500 |      true
  movr          | public             | vehicle_location_histories | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |      73918 | 1000 |      true
  movr          | public             | promo_codes                | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |     216083 | 1000 |      true
  movr          | public             | user_promo_codes           | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  NULL          | NULL               | system                     | database    | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  system        | public             | users                      | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | zones                      | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | settings                   | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | ui                         | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | jobs                       | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |     102381 |    1 |      true
  system        | public             | locations                  | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | role_members               | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | comments                   | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       1347 |    2 |      true
  NULL          | NULL               | defaultdb                  | database    | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  movr          | public             | users                      | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | vehicles                   | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | rides                      | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | vehicle_location_histories | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | promo_codes                | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | user_promo_codes           | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
(40 rows)

~~~
