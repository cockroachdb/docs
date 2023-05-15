{{site.data.alerts.callout_info}}
When you discard a zone configuration, the objects it was applied to will then inherit a configuration from an object "the next level up"; e.g., if the object whose configuration is being discarded is a table, it will use its parent database's configuration.

You cannot `DISCARD` any zone configurations on multi-region tables, indexes, or partitions if the [multi-region abstractions](migrate-to-multiregion-sql.html#replication-zone-patterns-and-multi-region-sql-abstractions) created the zone configuration.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE t CONFIGURE ZONE DISCARD;
~~~

~~~
CONFIGURE ZONE 1
~~~
