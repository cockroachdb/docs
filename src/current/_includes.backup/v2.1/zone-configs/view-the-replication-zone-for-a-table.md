{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR TABLE tpch.customer;
~~~
~~~
    zone_name   |                      config_sql
+---------------+-------------------------------------------------------+
  tpch.customer | ALTER TABLE tpch.public.customer CONFIGURE ZONE USING
                |     range_min_bytes = 40000,
                |     range_max_bytes = 67108864,
                |     gc.ttlseconds = 90000,
                |     num_replicas = 3,
                |     constraints = '[]',
                |     lease_preferences = '[]'
(1 row)
~~~
