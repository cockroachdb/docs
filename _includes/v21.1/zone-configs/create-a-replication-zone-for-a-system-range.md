In addition to the databases and tables that are visible via the SQL interface, CockroachDB stores internal data in what are called system ranges. CockroachDB comes with pre-configured replication zones for some of these ranges:

Target Name | Description
----------|-----------------------------
`meta` | The "meta" ranges contain the authoritative information about the location of all data in the cluster.<br><br>These ranges must retain a majority of replicas for the cluster as a whole to remain available and historical queries are never run on them, so CockroachDB comes with a **pre-configured** `meta` replication zone with `num_replicas` set to 5 to make these ranges more resilient to node failure and a lower-than-default `gc.ttlseconds` to keep these ranges smaller for reliable performance.<br><br>If your cluster is running in multiple datacenters, it's a best practice to configure the meta ranges to have a copy in each datacenter.
`liveness` | The "liveness" range contains the authoritative information about which nodes are live at any given time.<br><br>These ranges must retain a majority of replicas for the cluster as a whole to remain available and historical queries are never run on them, so CockroachDB comes with a **pre-configured** `liveness` replication zone with `num_replicas` set to 5 to make these ranges more resilient to node failure and a lower-than-default `gc.ttlseconds` to keep these ranges smaller for reliable performance.
`system` | There are system ranges for a variety of other important internal data, including information needed to allocate new table IDs and track the status of a cluster's nodes.<br><br>These ranges must retain a majority of replicas for the cluster as a whole to remain available, so CockroachDB comes with a **pre-configured** `system` replication zone with `num_replicas` set to 5 to make these ranges more resilient to node failure.
`timeseries` | The "timeseries" ranges contain monitoring data about the cluster that powers the graphs in CockroachDB's DB Console. If necessary, you can add a `timeseries` replication zone to control the replication of this data.

{{site.data.alerts.callout_danger}}
Use caution when editing replication zones for system ranges, as they could cause some (or all) parts of your cluster to stop working.
{{site.data.alerts.end}}

To control replication for one of the above sets of system ranges, use the [`ALTER RANGE ... CONFIGURE ZONE`](configure-zone.html) statement to define the relevant values (other values will be inherited from the parent zone):

{% include copy-clipboard.html %}
~~~ sql
> ALTER RANGE meta CONFIGURE ZONE USING num_replicas = 7;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR RANGE meta;
~~~

~~~
    target   |            raw_config_sql
+------------+---------------------------------------+
  RANGE meta | ALTER RANGE meta CONFIGURE ZONE USING
             |     range_min_bytes = 134217728,
             |     range_max_bytes = 536870912,
             |     gc.ttlseconds = 3600,
             |     num_replicas = 7,
             |     constraints = '[]',
             |     lease_preferences = '[]'
(1 row)
~~~
