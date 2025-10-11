
{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR PARTITION north_america OF TABLE roachlearn.students;
~~~

~~~
              zone_name             |                                           config_sql
+-----------------------------------+------------------------------------------------------------------------------------------------+
  roachlearn.students.north_america | ALTER PARTITION north_america OF INDEX roachlearn.public.students@primary CONFIGURE ZONE USING
                                    |     range_min_bytes = 16777216,
                                    |     range_max_bytes = 67108864,
                                    |     gc.ttlseconds = 90000,
                                    |     num_replicas = 3,
                                    |     constraints = '[+region=us]',
                                    |     lease_preferences = '[]'
~~~
