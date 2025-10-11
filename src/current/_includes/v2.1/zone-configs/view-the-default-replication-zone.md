{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR RANGE default;
~~~

~~~
  zone_name |                config_sql
+-----------+------------------------------------------+
  .default  | ALTER RANGE default CONFIGURE ZONE USING
            |     range_min_bytes = 1048576,
            |     range_max_bytes = 67108864,
            |     gc.ttlseconds = 90000,
            |     num_replicas = 3,
            |     constraints = '[]',
            |     lease_preferences = '[]'
(1 row)
~~~
