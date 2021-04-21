{{site.data.alerts.callout_success}}
The [Cost-based Optimizer](cost-based-optimizer.html) can take advantage of replication zones for secondary indexes when optimizing queries. For more information, see [Cost-based optimizer - preferring the nearest index](cost-based-optimizer.html#preferring-the-nearest-index).
{{site.data.alerts.end}}

{% include enterprise-feature.md %}

The [secondary indexes](indexes.html) on a table will automatically use the replication zone for the table. However, with an enterprise license, you can add distinct replication zones for secondary indexes.

To control replication for a specific secondary index, use the `ALTER INDEX ... CONFIGURE ZONE` statement to define the relevant values (other values will be inherited from the parent zone).

{{site.data.alerts.callout_success}}
To get the name of a secondary index, which you need for the `CONFIGURE ZONE` statement, use the [`SHOW INDEX`](show-index.html) or [`SHOW CREATE TABLE`](show-create.html) statements.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR INDEX vehicles@vehicles_auto_index_fk_city_ref_users;
~~~

~~~
                         target                        |                                 raw_config_sql
+------------------------------------------------------+---------------------------------------------------------------------------------+
  INDEX vehicles@vehicles_auto_index_fk_city_ref_users | ALTER INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                                                       |     range_min_bytes = 134217728,
                                                       |     range_max_bytes = 536870912,
                                                       |     gc.ttlseconds = 100000,
                                                       |     num_replicas = 5,
                                                       |     constraints = '[]',
                                                       |     lease_preferences = '[]'
(1 row)
~~~
