{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR RANGE default;
~~~

~~~
     target     |              raw_config_sql
+---------------+------------------------------------------+
  RANGE default | ALTER RANGE default CONFIGURE ZONE USING
                |     range_min_bytes = 134217728,
                |     range_max_bytes = 536870912,
                |     gc.ttlseconds = 90000,
                |     num_replicas = 3,
                |     constraints = '[]',
                |     lease_preferences = '[]'
(1 row)
~~~
