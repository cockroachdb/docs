Follow these recommendations when converting your schema for compatibility with CockroachDB.

- Define an explicit primary key on every table. For more information, refer to [Primary key best practices]({% link {{ page.version.version }}/schema-design-table.md %}#primary-key-best-practices).

- Do **not** use a sequence to define a primary key column. Instead, Cockroach Labs recommends that you use [multi-column primary keys]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#use-multi-column-primary-keys) or [auto-generating unique IDs]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#use-functions-to-generate-unique-ids) for primary key columns.

- By default on CockroachDB, `INT` is an alias for `INT8`, which creates 64-bit signed integers. PostgreSQL and MySQL default to 32-bit integers. Depending on your source database or application requirements, you may need to change the integer size to `4`. For more information, refer to [Considerations for 64-bit signed integers]({% link {{ page.version.version }}/int.md %}#considerations-for-64-bit-signed-integers).