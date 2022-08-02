To reduce latency while making {% if page.name == "online-schema-changes.md" %}online schema changes{% else %}[online schema changes](online-schema-changes.html){% endif %}, we recommend specifying a `lease_preference` [zone configuration](configure-replication-zones.html) on the `system` database to a single region and running all subsequent schema changes from a node within that region. For example, if the majority of online schema changes come from machines that are geographically close to `us-east1`, run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE system CONFIGURE ZONE USING constraints = '{"+region=us-east1": 1}', lease_preferences = '[[+region=us-east1]]';
~~~

Run all subsequent schema changes from a node in the specified region.

After the schema changes have completed, disable the zone configuration.
