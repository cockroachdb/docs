In addition to [constraining replicas to specific datacenters](configure-replication-zones.html#per-replica-constraints-to-specific-datacenters), you may also specify preferences for where the range's leaseholders should be placed.  This can result in increased performance in some scenarios.

The [`ALTER TABLE ... CONFIGURE ZONE`](configure-zone.html) statement below requires that the cluster try to place the ranges' leaseholders in zone `us-east-1b`; if that is not possible, it will try to place them in zone `us-east-1a`.

For more information about how the `lease_preferences` field works, see its description in the [Replication zone variables](configure-replication-zones.html#replication-zone-variables) section.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE kv CONFIGURE ZONE USING num_replicas = 3, constraints = '{"+zone=us-east-1a": 1, "+zone=us-east-1b": 1}', lease_preferences = '[[+zone=us-east-1b], [+zone=us-east-1a]]';
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR TABLE kv;
~~~

~~~
 zone_name |                               config_sql
-----------+------------------------------------------------------------------------
 test.kv   | ALTER TABLE kv CONFIGURE ZONE USING                                   +
           |         range_min_bytes = 1048576,                                    +
           |         range_max_bytes = 67108864,                                   +
           |         gc.ttlseconds = 90000,                                        +
           |         num_replicas = 3,                                             +
           |         constraints = '{+zone=us-east-1a: 1, +zone=us-east-1b: 1}',   +
           |         lease_preferences = '[[+zone=us-east-1b], [+zone=us-east-1a]]'
(1 row)
~~~
