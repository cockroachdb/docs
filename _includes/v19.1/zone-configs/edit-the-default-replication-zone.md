To edit the default replication zone, use the `ALTER RANGE ... CONFIGURE ZONE` statement to define the values you want to change (other values will remain the same):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER RANGE default CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

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
            |     gc.ttlseconds = 100000,
            |     num_replicas = 5,
            |     constraints = '[]',
            |     lease_preferences = '[]'
(1 row)
~~~
