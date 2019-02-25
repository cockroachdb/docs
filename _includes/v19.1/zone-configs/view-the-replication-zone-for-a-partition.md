{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR PARTITION north_america OF TABLE customers;
~~~
~~~
  zone_name |                             config_sql
+-----------+---------------------------------------------------------------------+
  .default  | ALTER PARTITION north_america OF RANGE default CONFIGURE ZONE USING
            |     range_min_bytes = 1048576,
            |     range_max_bytes = 67108864,
            |     gc.ttlseconds = 90000,
            |     num_replicas = 3,
            |     constraints = '[]',
            |     lease_preferences = '[]'
(1 row)
~~~

You can also use the following syntax for the same result:

{% include copy-clipboard.html %}
~~~ shell
> SHOW ZONE CONFIGURATION FOR TABLE customers PARTITION north_america;
~~~
