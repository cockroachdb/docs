In addition to the databases and tables that are visible via the SQL interface, CockroachDB stores internal data in what are called system ranges. CockroachDB comes with pre-configured replication zones for some of these ranges:

Zone Name | Description
----------|-----------------------------
`.meta` | The "meta" ranges contain the authoritative information about the location of all data in the cluster.<br><br>Because historical queries are never run on meta ranges and it is advantageous to keep these ranges smaller for reliable performance, CockroachDB comes with a **pre-configured** `.meta` replication zone giving these ranges a lower-than-default `gc.ttlseconds`.<br><br>If your cluster is running in multiple datacenters, it's a best practice to configure the meta ranges to have a copy in each datacenter.
`.liveness` | The "liveness" range contains the authoritative information about which nodes are live at any given time.<br><br>Just as for "meta" ranges, historical queries are never run on the liveness range, so CockroachDB comes with a **pre-configured** `.liveness` replication zone giving this range a lower-than-default `gc.ttlseconds`.<br><br>**If this range is unavailable, the entire cluster will be unavailable, so giving it a high replication factor is strongly recommended.**
`.timeseries` | The "timeseries" ranges contain monitoring data about the cluster that powers the graphs in CockroachDB's Admin UI. If necessary, you can add a `.timeseries` replication zone to control the replication of this data.
`.system` | There are system ranges for a variety of other important internal data, including information needed to allocate new table IDs and track the status of a cluster's nodes. If necessary, you can add a `.system` replication zone to control the replication of this data.

To control replication for one of the above sets of system ranges, use the `CONFIGURE ZONE` statement to define the values you want to change (other values will not be affected):

{% include copy-clipboard.html %}
~~~ sql
> ALTER RANGE system CONFIGURE ZONE USING num_replicas = 7, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR RANGE meta;
~~~

~~~
   zone_name  |              config_sql
+-------------+---------------------------------------+
  .system     | ALTER RANGE meta CONFIGURE ZONE USING
              |     range_min_bytes = 1048576,
              |     range_max_bytes = 67108864,
              |     gc.ttlseconds = 100000,
              |     num_replicas = 7,
              |     constraints = '[]',
              |     lease_preferences = '[]'
(1 row)
~~~
