Follow these recommendations when converting your schema for compatibility with CockroachDB.

- Every table **must** have an explicit primary key in order to [load data with MOLT Fetch]({% link molt/migration-strategy.md %}#data-load-best-practices). For more information, refer to [Primary key best practices]({% link {{ site.current_cloud_version }}/schema-design-table.md %}#primary-key-best-practices).

- Ensure that the source and target schemas are **matching**. 

	- If you enable automatic schema creation with the [`drop-on-target-and-recreate`]({% link molt/molt-fetch.md %}#target-table-handling) option, review [Type mapping]({% link molt/molt-fetch.md %}#type-mapping) to understand which source types can be mapped to CockroachDB types.

	- If you create the target schema manually, review the MOLT Fetch behaviors in [Mismatch handling]({% link molt/molt-fetch.md %}#mismatch-handling).

- Review [Transformations]({% link molt/molt-fetch.md %}#transformations) to understand how computed columns and partitioned tables can be mapped to the target, and how target tables can be renamed.

- Before moving data, Cockroach Labs recommends dropping any [constraints]({% link {{ site.current_cloud_version }}/alter-table.md %}#drop-constraint) and [indexes]({% link {{site.current_cloud_version}}/drop-index.md %}) on the target CockroachDB database. Note all indexes and constraints on source tables that need to be preserved or recreated after migration.

- By default on CockroachDB, `INT` is an alias for `INT8`, which creates 64-bit signed integers. PostgreSQL and MySQL default to 32-bit integers. Depending on your source database or application requirements, you may need to change the integer size to `4`. For more information, refer to [Considerations for 64-bit signed integers]({% link {{ site.current_cloud_version }}/int.md %}#considerations-for-64-bit-signed-integers).