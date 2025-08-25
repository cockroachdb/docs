[`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) has the following limitations:

- While importing into an existing table, the table is taken offline.
- After importing into an existing table, [constraints]({% link {{ page.version.version }}/constraints.md %}) will be un-validated and need to be [re-validated]({% link {{ page.version.version }}/alter-table.md %}#validate-constraint).
- Imported rows must not conflict with existing rows in the table or any unique secondary indexes.
- `IMPORT INTO` works for only a single existing table.
- `IMPORT INTO` can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
    ~~~