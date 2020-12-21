To edit the default replication zone, use the `ALTER RANGE ... CONFIGURE ZONE` statement to define the values you want to change (other values will remain the same):

{% include copy-clipboard.html %}
~~~ sql
> ALTER RANGE default CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

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
                |     gc.ttlseconds = 100000,
                |     num_replicas = 5,
                |     constraints = '[]',
                |     lease_preferences = '[]'
(1 row)
~~~
