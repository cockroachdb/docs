To control replication for a specific database, use the `ALTER DATABASE ... CONFIGURE ZONE` statement to define the values you want to change (other values will not be affected):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE test CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR DATABASE test;
~~~

~~~
  zone_name |                config_sql
+-----------+------------------------------------------+
  test      | ALTER DATABASE test CONFIGURE ZONE USING
            |     range_min_bytes = 1048576,
            |     range_max_bytes = 67108864,
            |     gc.ttlseconds = 100000,
            |     num_replicas = 5,
            |     constraints = '[]',
            |     lease_preferences = '[]'
(1 row)
~~~
