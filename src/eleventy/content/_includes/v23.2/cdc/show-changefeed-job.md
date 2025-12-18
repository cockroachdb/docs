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

To show an individual {{ site.data.products.enterprise }} changefeed:

~~~ sql
SHOW CHANGEFEED JOB {job_id};
~~~
~~~
        job_id       |                                     description                                      | user_name | status  |              running_status              |          created           |          started           | finished |          modified          |      high_water_timestamp      | error |    sink_uri    |  full_table_names   | topics | format
---------------------+--------------------------------------------------------------------------------------+-----------+---------+------------------------------------------+----------------------------+----------------------------+----------+----------------------------+--------------------------------+-------+----------------+---------------------+--------+----------
  866218332400680961 | CREATE CHANGEFEED FOR TABLE movr.users INTO 'external://aws' WITH format = 'parquet' | root      | running | running: resolved=1684438482.937939878,0 | 2023-05-18 14:14:16.323465 | 2023-05-18 14:14:16.360245 | NULL     | 2023-05-18 19:35:16.120407 | 1684438482937939878.0000000000 |       | external://aws | {movr.public.users} | NULL   | parquet
(1 row)
~~~