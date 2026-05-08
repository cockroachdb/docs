MOLT Fetch can initialize target tables on the CockroachDB database in one of three modes using `--table-handling`:

|              Mode             |                MOLT Fetch flag                 |                                                                                                                                        Description                                                                                                                                        |
|-------------------------------|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `none`                        | Default mode                                   | <ul><li>Loads data into existing tables without altering schema or data.</li><li>Exits early if schemas mismatch in some cases.</li></ul>                                                                                                                                                 |
| `truncate-if-exists`          | `--table-handling truncate-if-exists`          | <ul><li>Truncates target tables before loading data.</li><li>Exits early if schemas mismatch in some cases.</li></ul>                                                                                                                                                                     |
| `drop-on-target-and-recreate` | `--table-handling drop-on-target-and-recreate` | <ul><li>Drops and recreates target tables before loading data.</li><li>Automatically creates missing tables with [`PRIMARY KEY`]({% link {{site.current_cloud_version}}/primary-key.md %}) and [`NOT NULL`]({% link {{site.current_cloud_version}}/not-null.md %}) constraints.</li></ul> |

- Use `none` when you need to retain existing data and schema.
- Use `--table-handling truncate-if-exists` to clear existing data while preserving schema definitions. 
- Use `--table-handling drop-on-target-and-recreate` for initial imports or when source and target schemas differ, letting MOLT Fetch generate compatible tables automatically.

{{site.data.alerts.callout_info}}
When using the `drop-on-target-and-recreate` option, only [`PRIMARY KEY`]({% link {{site.current_cloud_version}}/primary-key.md %}) and [`NOT NULL`]({% link {{site.current_cloud_version}}/not-null.md %}) constraints are preserved on the target tables. Other constraints, such as [`FOREIGN KEY`]({% link {{site.current_cloud_version}}/foreign-key.md %}) references, [`UNIQUE`]({% link {{site.current_cloud_version}}/unique.md %}), or [`DEFAULT`]({% link {{site.current_cloud_version}}/default-value.md %}) value expressions, are **not** retained.
{{site.data.alerts.end}}

To guide schema creation with `drop-on-target-and-recreate`, you can explicitly map source types to CockroachDB types. Refer to [Type mapping]({% link molt/molt-fetch.md %}#type-mapping).