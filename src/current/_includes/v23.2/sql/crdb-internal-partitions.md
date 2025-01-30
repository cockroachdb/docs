{{site.data.alerts.callout_success}}
In testing, scripting, and other programmatic environments, we recommend querying the `crdb_internal.partitions` internal table for partition information instead of using the `SHOW PARTITIONS` statement. For more information, see [Querying partitions programmatically]({{ page.version.version }}/show-partitions.md#querying-partitions-programmatically).
{{site.data.alerts.end}}
