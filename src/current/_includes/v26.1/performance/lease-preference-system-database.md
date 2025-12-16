To reduce latency while making {% if page.name == "online-schema-changes.md" %}online schema changes{% else %}[online schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}){% endif %}, we recommend specifying a `lease_preference` [zone configuration]({% link {{ page.version.version }}/configure-replication-zones.md %}) on the `system` database to a single region and running all subsequent schema changes from a node within that region. For example, if the majority of online schema changes come from machines that are geographically close to `us-east1`, run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE system CONFIGURE ZONE USING constraints = '{"+region=us-east1": 1}', lease_preferences = '[[+region=us-east1]]';
~~~

{{site.data.alerts.callout_info}}
Access to tables and built-in functions in the `system` database is controlled by the [`allow_unsafe_internals` session variable]({% link {{ page.version.version }}/session-variables.md %}#allow-unsafe-internals). The above `ALTER DATABASE system` statement executes regardless of the variable's setting because it does not access tables or invoke built-in functions.
{{site.data.alerts.end}}

Run all subsequent schema changes from a node in the specified region.

If you do not intend to run more schema changes from that region, you can safely [remove the lease preference from the zone configuration]({% link {{ page.version.version }}/alter-database.md %}#remove-a-replication-zone) for the system database.
