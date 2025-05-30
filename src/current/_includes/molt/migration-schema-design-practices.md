Follow these recommendations when converting your schema for compatibility with CockroachDB.

- Define an explicit primary key on every table. For more information, refer to [Primary key best practices]({% link {{ site.current_cloud_version }}/schema-design-table.md %}#primary-key-best-practices).

- By default on CockroachDB, `INT` is an alias for `INT8`, which creates 64-bit signed integers. PostgreSQL and MySQL default to 32-bit integers. Depending on your source database or application requirements, you may need to change the integer size to `4`. For more information, refer to [Considerations for 64-bit signed integers]({% link {{ site.current_cloud_version }}/int.md %}#considerations-for-64-bit-signed-integers).