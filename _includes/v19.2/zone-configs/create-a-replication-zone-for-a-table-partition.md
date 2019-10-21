{{site.data.alerts.callout_info}}
This is an [enterprise-only](enterprise-licensing.html) feature.
{{site.data.alerts.end}}

To [control replication for table partitions](partitioning.html#replication-zones), use the `ALTER PARTITION ... CONFIGURE ZONE` statement to define the values you want to change (other values will not be affected):

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION us_west OF TABLE users CONFIGURE ZONE USING num_replicas = 5, constraints = '[-region=us-east1,-region=europe-west1]';
~~~

~~~ sql
CONFIGURE ZONE 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR PARTITION us_west OF TABLE users;
~~~

~~~
               target              |                        raw_config_sql
+----------------------------------+---------------------------------------------------------------+
  PARTITION us_west OF TABLE users | ALTER PARTITION us_west OF TABLE users CONFIGURE ZONE USING
                                   |     range_min_bytes = 16777216,
                                   |     range_max_bytes = 67108864,
                                   |     gc.ttlseconds = 100000,
                                   |     num_replicas = 5,
                                   |     constraints = '[-region=us-east1, -region=europe-west1]',
                                   |     lease_preferences = '[]'
(1 row)
~~~
