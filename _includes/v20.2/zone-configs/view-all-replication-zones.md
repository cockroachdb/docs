{% include copy-clipboard.html %}
~~~ sql
> SHOW ALL ZONE CONFIGURATIONS;
~~~

~~~
                       target                      |                               raw_config_sql
+--------------------------------------------------+-----------------------------------------------------------------------------+
  RANGE default                                    | ALTER RANGE default CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 90000,
                                                   |     num_replicas = 3,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  DATABASE system                                  | ALTER DATABASE system CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 90000,
                                                   |     num_replicas = 5,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  TABLE system.public.jobs                         | ALTER TABLE system.public.jobs CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 600,
                                                   |     num_replicas = 5,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  RANGE meta                                       | ALTER RANGE meta CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 3600,
                                                   |     num_replicas = 5,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  RANGE system                                     | ALTER RANGE system CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 90000,
                                                   |     num_replicas = 5,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  RANGE liveness                                   | ALTER RANGE liveness CONFIGURE ZONE USING
                                                   |     range_min_bytes = 134217728,
                                                   |     range_max_bytes = 536870912,
                                                   |     gc.ttlseconds = 600,
                                                   |     num_replicas = 5,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  TABLE system.public.replication_constraint_stats | ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE USING
                                                   |     gc.ttlseconds = 600,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
  TABLE system.public.replication_stats            | ALTER TABLE system.public.replication_stats CONFIGURE ZONE USING
                                                   |     gc.ttlseconds = 600,
                                                   |     constraints = '[]',
                                                   |     lease_preferences = '[]'
...
~~~
