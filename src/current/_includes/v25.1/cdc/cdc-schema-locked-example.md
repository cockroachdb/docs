Use the `schema_locked` [storage parameter]({{ page.version.version }}/with-storage-parameter.md) to disallow [schema changes]({{ page.version.version }}/online-schema-changes.md) on a watched table, which allows the changefeed to take a fast path that avoids checking if there are schema changes that could require synchronization between [changefeed aggregators]({{ page.version.version }}/how-does-an-enterprise-changefeed-work.md). This helps to decrease the latency between a write committing to a table and it emitting to the [changefeed's sink]({{ page.version.version }}/changefeed-sinks.md). Enabling `schema_locked` 

Enable `schema_locked` on the watched table with the [`ALTER TABLE`]({{ page.version.version }}/alter-table.md) statement:

{% include "_includes/copy-clipboard.html" %}
~~~ sql
ALTER TABLE watched_table SET (schema_locked = true);
~~~

While `schema_locked` is enabled on a table, attempted schema changes on the table will be rejected and an error returned. If you need to run a schema change on the locked table, unlock the table with `schema_locked = false`, complete the schema change, and then lock the table again with `schema_locked = true`. The changefeed will run as normal while `schema_locked = false`, but it will not benefit from the performance optimization.

{% include "_includes/copy-clipboard.html" %}
~~~ sql
ALTER TABLE watched_table SET (schema_locked = false);
~~~