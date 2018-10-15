{% include copy-clipboard.html %}
~~~ sql
> SHOW ALL ZONE CONFIGURATIONS;
~~~

~~~
      zone_name      |                         config_sql
+--------------------+------------------------------------------------------------+
  .default           | ALTER RANGE default CONFIGURE ZONE USING
                     |     range_min_bytes = 1048576,
                     |     range_max_bytes = 67108864,
                     |     gc.ttlseconds = 90000,
                     |     num_replicas = 3,
                     |     constraints = '[]',
                     |     lease_preferences = '[]'
  system             | ALTER DATABASE system CONFIGURE ZONE USING
                     |     range_min_bytes = 1048576,
                     |     range_max_bytes = 67108864,
                     |     gc.ttlseconds = 90000,
                     |     num_replicas = 5,
                     |     constraints = '[]',
                     |     lease_preferences = '[]'
  system.jobs        | ALTER TABLE system.public.jobs CONFIGURE ZONE USING
                     |     range_min_bytes = 1048576,
                     |     range_max_bytes = 67108864,
                     |     gc.ttlseconds = 600,
                     |     num_replicas = 5,
                     |     constraints = '[]',
                     |     lease_preferences = '[]'
  .meta              | ALTER RANGE meta CONFIGURE ZONE USING
                     |     range_min_bytes = 1048576,
                     |     range_max_bytes = 67108864,
                     |     gc.ttlseconds = 3600,
                     |     num_replicas = 5,
                     |     constraints = '[]',
                     |     lease_preferences = '[]'
  .system            | ALTER RANGE system CONFIGURE ZONE USING
                     |     range_min_bytes = 1048576,
                     |     range_max_bytes = 67108864,
                     |     gc.ttlseconds = 90000,
                     |     num_replicas = 5,
                     |     constraints = '[]',
                     |     lease_preferences = '[]'
  .liveness          | ALTER RANGE liveness CONFIGURE ZONE USING
                     |     range_min_bytes = 1048576,
                     |     range_max_bytes = 67108864,
                     |     gc.ttlseconds = 600,
                     |     num_replicas = 5,
                     |     constraints = '[]',
                     |     lease_preferences = '[]'
  tpch               | ALTER DATABASE tpch CONFIGURE ZONE USING
                     |     constraints = '[]'
  tpch.customer      | ALTER TABLE tpch.public.customer CONFIGURE ZONE USING
                     |     range_min_bytes = 40000
  zone_config_test.t | ALTER TABLE zone_config_test.public.t CONFIGURE ZONE USING
                     |     range_min_bytes = 0,
                     |     range_max_bytes = 90000,
                     |     gc.ttlseconds = 89999,
                     |     num_replicas = 4,
                     |     constraints = '[-region=west]'
(9 rows)
~~~
