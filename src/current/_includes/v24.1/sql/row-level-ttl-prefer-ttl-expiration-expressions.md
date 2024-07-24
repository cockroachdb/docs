Most users should use `ttl_expiration_expression` instead of `ttl_expire_after` for the following reasons:

- If you add `ttl_expire_after` to an existing table, it **will cause a full table rewrite, which can affect performance**. Specifically, it will result in a [schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) that (1) creates a new [hidden column]({% link {{page.version.version}}/show-create.md%}#show-the-create-table-statement-for-a-table-with-a-hidden-column) `crdb_internal_expiration` for all rows, and (2) backfills the value of that new column to `now()` + `ttl_expire_after`.
- You cannot use `ttl_expire_after` with an existing [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) column.
- If you use `ttl_expiration_expression`, you can use an existing [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) column called e.g. `updated_at`.
