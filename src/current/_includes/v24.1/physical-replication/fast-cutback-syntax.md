{% include_cached new-in.html version="v24.1" %} To cut back to a cluster that was previously the primary cluster, use the [`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER {original_primary_vc} START REPLICATION OF {promoted_standby_vc} ON {connection_string_standby};
~~~

The original primary virtual cluster may be almost up to date with the promoted standby's virtual cluster. The difference in data between the two virtual clusters will include only the writes that have been applied to the promoted standby after cutover from the primary cluster.