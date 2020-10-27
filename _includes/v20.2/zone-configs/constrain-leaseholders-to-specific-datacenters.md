In addition to [constraining replicas to specific availability zones](configure-replication-zones.html#per-replica-constraints-to-specific-availability-zones), you may also specify preferences for where the range's leaseholders should be placed.  This can result in increased performance in some scenarios.

The [`ALTER TABLE ... CONFIGURE ZONE`](configure-zone.html) statement below requires that the cluster try to place the ranges' leaseholders in zone `us-east1`; if that is not possible, it will try to place them in zone `us-west1`.

For more information about how the `lease_preferences` field works, see its description in the [Replication zone variables](configure-replication-zones.html#replication-zone-variables) section.

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users CONFIGURE ZONE USING num_replicas = 3, constraints = '{"+region=us-east1": 1, "+region=us-west1": 1}', lease_preferences = '[[+region=us-east1], [+region=us-west1]]';
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR TABLE users;
~~~

~~~
    target    |                           raw_config_sql
+-------------+--------------------------------------------------------------------+
  TABLE users | ALTER TABLE users CONFIGURE ZONE USING
              |     range_min_bytes = 134217728,
              |     range_max_bytes = 536870912,
              |     gc.ttlseconds = 100000,
              |     num_replicas = 3,
              |     constraints = '{+region=us-east1: 1, +region=us-west1: 1}',
              |     lease_preferences = '[[+region=us-east1], [+region=us-west1]]'
(1 row)
~~~
