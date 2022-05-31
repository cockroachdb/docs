To reduce latency while making online schema changes, we recommend specifying a `lease_preference` on the `system` database to a single region and running all subsequent schema changes from a node within that region. For example, if the majority of online schema changes come from machines that are geographically close to `us-east1`, run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE system CONFIGURE ZONE USING constraints = '{"+region=us-east1": 1}', lease_preferences = '[[+region=us-east1]]';
~~~

After running this successfully, run all subsequent schema changes from a node existing in the abovementioned region.
