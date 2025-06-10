{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CHANGEFEED JOBS;
~~~
~~~
    job_id             |                                                                                   description                                                                  | ...
+----------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+ ...
  685724608744325121   | CREATE CHANGEFEED FOR TABLE mytable INTO 'kafka://localhost:9092' WITH confluent_schema_registry = 'http://localhost:8081', format = 'avro', resolved, updated | ...
  685723987509116929   | CREATE CHANGEFEED FOR TABLE mytable INTO 'kafka://localhost:9092' WITH confluent_schema_registry = 'http://localhost:8081', format = 'avro', resolved, updated | ...
(2 rows)
~~~

To show an individual changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CHANGEFEED JOB {job_id};
~~~
~~~
        job_id        |                                               description                                               | user_name | status  |              running_status              |            created            |            started            | finished |           modified            |      high_water_timestamp      | readable_high_water_timestamptz | error |                          sink_uri                          |         full_table_names         | topics | format
----------------------+---------------------------------------------------------------------------------------------------------+-----------+---------+------------------------------------------+-------------------------------+-------------------------------+----------+-------------------------------+--------------------------------+---------------------------------+-------+------------------------------------------------------------+----------------------------------+--------+---------
  1053639803034894337 | CREATE CHANGEFEED FOR TABLE customers INTO 'gs://bucket-name?AUTH=specified&CREDENTIALS=redacted'       | root      | running | running: resolved=1741616141.951323000,0 | 2025-03-10 14:09:10.047524+00 | 2025-03-10 14:09:10.047524+00 | NULL     | 2025-03-10 14:15:44.955653+00 | 1741616141951323000.0000000000 | 2025-03-10 14:15:41.951323+00   |       | gs://bucket-name?AUTH=specified&CREDENTIALS=redacted       | {online_retail.public.customers} | NULL   | json
(1 row)
~~~