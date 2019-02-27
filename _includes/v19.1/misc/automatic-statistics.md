<span class="version-tag">New in v19.1</span>: By default, CockroachDB generates table statistics automatically as tables are updated.

If you need to turn off automatic statistics collection:

1. Run the following statement to disable the automatic statistics [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING sql.stats.experimental_automatic_collection.enabled=false
    ~~~

2. Look up what statistics were created by the automatic statistics generator using the [`SHOW STATISTICS`](show-statistics.html) statement.

3. Delete the automatically generated statistics using the instructions in [delete statistics](create-statistics.html#delete-statistics).

4. Restart the nodes in your cluster to clear the statistics caches.
