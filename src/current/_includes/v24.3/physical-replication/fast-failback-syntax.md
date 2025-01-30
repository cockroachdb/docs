To {% if page.name == "alter-virtual-cluster.md" %} [fail back]({{ page.version.version }}/failover-replication.md#fail-back-to-the-primary-cluster) {% else %} fail back {% endif %} to a cluster that was previously the primary cluster, use the {% if page.name == "alter-virtual-cluster.md" %} `ALTER VIRTUAL CLUSTER` {% else %} [`ALTER VIRTUAL CLUSTER`]({{ page.version.version }}/alter-virtual-cluster.md) {% endif %} syntax:

{% include "_includes/copy-clipboard.html" %}
~~~ sql
ALTER VIRTUAL CLUSTER {original_primary_vc} START REPLICATION OF {promoted_standby_vc} ON {connection_string_standby};
~~~

The original primary virtual cluster may be almost up to date with the promoted standby's virtual cluster. The difference in data between the two virtual clusters will include only the writes that have been applied to the promoted standby after failover from the primary cluster.
