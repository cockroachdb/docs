Use the `schema_locked` [storage parameter]({% link "{{ page.version.version }}/with-storage-parameter.md" %}) to disallow [schema changes]({% link "{{ page.version.version }}/online-schema-changes.md" %}) on a watched table, which allows the changefeed to take a fast path that avoids checking if there are schema changes that could require synchronization between [changefeed aggregators]({% link "{{ page.version.version }}/how-does-a-changefeed-work.md" %}). This helps to decrease the latency between a write committing to a table and it emitting to the [changefeed's sink]({% link "{{ page.version.version }}/changefeed-sinks.md" %}). Enabling `schema_locked` 

Enable `schema_locked` on the watched table with the [`ALTER TABLE`]({% link "{{ page.version.version }}/alter-table.md" %}) statement:

{% include "copy-clipboard.html" %}
~~~ sql
ALTER TABLE watched_table SET (schema_locked = true);
~~~

While `schema_locked` is enabled on a table, attempted schema changes on the table will be rejected and an error returned. If you need to run a schema change on the locked table, unlock the table with `schema_locked = false`, complete the schema change, and then lock the table again with `schema_locked = true`. The changefeed will run as normal while `schema_locked = false`, but it will not benefit from the performance optimization.

{% include "copy-clipboard.html" %}
~~~ sql
ALTER TABLE watched_table SET (schema_locked = false);
~~~