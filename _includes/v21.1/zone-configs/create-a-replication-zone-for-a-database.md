To control replication for a specific database, use the `ALTER DATABASE ... CONFIGURE ZONE` statement to define the relevant values (other values will be inherited from the parent zone):

{% include copy-clipboard.html %}
~~~ sql
> ALTER DATABASE movr CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR DATABASE movr;
~~~

~~~
     target     |              raw_config_sql
+---------------+------------------------------------------+
  DATABASE movr | ALTER DATABASE movr CONFIGURE ZONE USING
                |     range_min_bytes = 134217728,
                |     range_max_bytes = 536870912,
                |     gc.ttlseconds = 100000,
                |     num_replicas = 5,
                |     constraints = '[]',
                |     lease_preferences = '[]'
(1 row)
~~~
