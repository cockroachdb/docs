{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR PARTITION us_west OF TABLE users;
~~~

~~~
               target              |                       raw_config_sql
+----------------------------------+-------------------------------------------------------------+
  PARTITION us_west OF TABLE users | ALTER PARTITION us_west OF TABLE users CONFIGURE ZONE USING
                                   |     range_min_bytes = 16777216,
                                   |     range_max_bytes = 67108864,
                                   |     gc.ttlseconds = 90000,
                                   |     num_replicas = 3,
                                   |     constraints = '[+region=us-west1]',
                                   |     lease_preferences = '[]'
(1 row)
~~~
