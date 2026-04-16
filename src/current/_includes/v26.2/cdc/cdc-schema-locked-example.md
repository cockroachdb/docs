Use the `schema_locked` [storage parameter]({% link {{ page.version.version }}/with-storage-parameter.md %}) to indicate that a [schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) is not currently ongoing on a watched table. This allows the changefeed to take a fast path that avoids checking if there are schema changes that could require synchronization between [changefeed aggregators]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}). This helps to decrease the latency between a write committing to a table and it emitting to the [changefeed's sink]({% link {{ page.version.version }}/changefeed-sinks.md %}).

Enable `schema_locked` on the watched table with the [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE watched_table SET (schema_locked = true);
~~~

By default, CockroachDB attempts to automatically unset `schema_locked` before performing many schema changes and reapply it when done. To require manual unlocks for all DDL on schema-locked tables, set [`sql.schema.auto_unlock.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-schema-auto-unlock-enabled) to `false`. Some schema changes, such as `ALTER TABLE ... SET LOCALITY`, cannot automatically unset `schema_locked` even when automatic unlocking is enabled. For these cases, you must manually unlock the table with `schema_locked = false`, complete the schema change, and then lock the table again with `schema_locked = true`. The changefeed will run as normal while `schema_locked` is unset, but it will not benefit from the performance optimization.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE watched_table SET (schema_locked = false);
~~~
