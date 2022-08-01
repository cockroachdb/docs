{{site.data.alerts.callout_info}}
You cannot `DISCARD` any zone configurations on multi-region tables, indexes, or partitions if the [multi-region abstractions](migrate-to-multiregion-sql.html#replication-zone-patterns-and-multi-region-sql-abstractions) created the zone configuration.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE t CONFIGURE ZONE DISCARD;
~~~

~~~
CONFIGURE ZONE 1
~~~
