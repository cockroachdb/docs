To reduce latency while making {% if page.name == "online-schema-changes.md" %}online schema changes{% else %}[online schema changes]({% link "{{ page.version.version }}/online-schema-changes.md" %}){% endif %}, we recommend specifying a `lease_preference` [zone configuration]({% link "{{ page.version.version }}/configure-replication-zones.md" %}) on the `system` database to a single region and running all subsequent schema changes from a node within that region. For example, if the majority of online schema changes come from machines that are geographically close to `us-east1`, run the following:

~~~ sql
ALTER DATABASE system CONFIGURE ZONE USING constraints = '{"+region=us-east1": 1}', lease_preferences = '[[+region=us-east1]]';
~~~

Run all subsequent schema changes from a node in the specified region.

If you do not intend to run more schema changes from that region, you can safely [remove the lease preference from the zone configuration]({% link "{{ page.version.version }}/alter-database.md" %}#remove-a-replication-zone) for the system database.
