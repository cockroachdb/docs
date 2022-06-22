{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ALL ZONE CONFIGURATIONS;
~~~

~~~
   zone_name  |                     config_sql
+-------------+-----------------------------------------------------+
  .default    | ALTER RANGE default CONFIGURE ZONE USING
              |     range_min_bytes = 1048576,
              |     range_max_bytes = 67108864,
              |     gc.ttlseconds = 90000,
              |     num_replicas = 3,
              |     constraints = '[]',
              |     lease_preferences = '[]'
  system      | ALTER DATABASE system CONFIGURE ZONE USING
              |     range_min_bytes = 1048576,
              |     range_max_bytes = 67108864,
              |     gc.ttlseconds = 90000,
              |     num_replicas = 5,
              |     constraints = '[]',
              |     lease_preferences = '[]'
  system.jobs | ALTER TABLE system.public.jobs CONFIGURE ZONE USING
              |     range_min_bytes = 1048576,
              |     range_max_bytes = 67108864,
              |     gc.ttlseconds = 600,
              |     num_replicas = 5,
              |     constraints = '[]',
              |     lease_preferences = '[]'
  .meta       | ALTER RANGE meta CONFIGURE ZONE USING
              |     range_min_bytes = 1048576,
              |     range_max_bytes = 67108864,
              |     gc.ttlseconds = 3600,
              |     num_replicas = 5,
              |     constraints = '[]',
              |     lease_preferences = '[]'
  .system     | ALTER RANGE system CONFIGURE ZONE USING
              |     range_min_bytes = 1048576,
              |     range_max_bytes = 67108864,
              |     gc.ttlseconds = 90000,
              |     num_replicas = 5,
              |     constraints = '[]',
              |     lease_preferences = '[]'
  .liveness   | ALTER RANGE liveness CONFIGURE ZONE USING
              |     range_min_bytes = 1048576,
              |     range_max_bytes = 67108864,
              |     gc.ttlseconds = 600,
              |     num_replicas = 5,
              |     constraints = '[]',
              |     lease_preferences = '[]'
(6 rows)
~~~
