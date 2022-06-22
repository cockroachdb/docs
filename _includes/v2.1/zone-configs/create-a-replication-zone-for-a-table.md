To control replication for a specific table,  use the `ALTER TABLE ... CONFIGURE ZONE` statement to define the values you want to change (other values will not be affected):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE customers CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR TABLE customers;
~~~

~~~
    zone_name    |                 config_sql
+----------------+--------------------------------------------+
  test.customers | ALTER TABLE customers CONFIGURE ZONE USING
                 |     range_min_bytes = 1048576,
                 |     range_max_bytes = 67108864,
                 |     gc.ttlseconds = 100000,
                 |     num_replicas = 5,
                 |     constraints = '[]',
                 |     lease_preferences = '[]'
(1 row)
~~~
