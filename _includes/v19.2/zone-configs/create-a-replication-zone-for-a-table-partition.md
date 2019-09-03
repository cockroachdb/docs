{{site.data.alerts.callout_info}}
This is an [enterprise-only](enterprise-licensing.html) feature.
{{site.data.alerts.end}}

To [control replication for table partitions](partitioning.html#replication-zones), use the `ALTER PARTITION ... CONFIGURE ZONE` statement to define the values you want to change (other values will not be affected):

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION north_america OF TABLE customers CONFIGURE ZONE USING num_replicas = 5, constraints = '[-region=EU]';
~~~

~~~ sql
CONFIGURE ZONE 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR PARTITION north_america OF TABLE customers;
~~~

~~~
           zone_name           |                                  config_sql
+------------------------------+-------------------------------------------------------------------------------+
  test.customers.north_america | ALTER PARTITION north_america OF INDEX customers@primary CONFIGURE ZONE USING
                               |     range_min_bytes = 1048576,
                               |     range_max_bytes = 67108864,
                               |     gc.ttlseconds = 100000,
                               |     num_replicas = 5,
                               |     constraints = '[-region=EU]',
                               |     lease_preferences = '[]'
(1 row)
~~~
