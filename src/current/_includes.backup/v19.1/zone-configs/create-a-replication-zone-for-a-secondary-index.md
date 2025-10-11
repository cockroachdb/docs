{{site.data.alerts.callout_success}}
<span class="version-tag">New in v19.1</span>: The [Cost-based Optimizer](cost-based-optimizer.html) can take advantage of replication zones for secondary indexes when optimizing queries. For more information, see [Cost-based optimizer - preferring the nearest index](cost-based-optimizer.html#preferring-the-nearest-index).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
This is an [enterprise-only](enterprise-licensing.html) feature.
{{site.data.alerts.end}}

The [secondary indexes](indexes.html) on a table will automatically use the replication zone for the table. However, with an enterprise license, you can add distinct replication zones for secondary indexes.

To control replication for a specific secondary index, use the `ALTER INDEX ... CONFIGURE ZONE` statement to define the values you want to change (other values will not be affected).

{{site.data.alerts.callout_success}}
To get the name of a secondary index, which you need for the `CONFIGURE ZONE` statement, use the [`SHOW INDEX`](show-index.html) or [`SHOW CREATE TABLE`](show-create.html) statements.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER INDEX tpch.frequent_customers CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR INDEX tpch.customer@frequent_customers;
~~~

~~~
             zone_name             |                                config_sql
+----------------------------------+--------------------------------------------------------------------------+
  tpch.customer@frequent_customers | ALTER INDEX tpch.public.customer@frequent_customers CONFIGURE ZONE USING
                                   |     range_min_bytes = 1048576,
                                   |     range_max_bytes = 67108864,
                                   |     gc.ttlseconds = 100000,
                                   |     num_replicas = 5,
                                   |     constraints = '[]',
                                   |     lease_preferences = '[]'
(1 row)
~~~
