- Statements containing multiple modification subqueries mutating the same row could cause corruption. These statements are disallowed by default, but you can enable multiple modification subqueries with one the following:
    - Set the `sql.multiple_modifications_of_table.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `true`.
    - Use the `enable_multiple_modifications_of_table` [session variable]({% link {{ page.version.version }}/set-vars.md %}).

    If multiple mutations inside the same statement affect different tables with [`FOREIGN KEY`]({% link {{ page.version.version }}/foreign-key.md %}) relations and `ON CASCADE` clauses between them, the results will be different from what is expected in PostgreSQL. [#70731](https://github.com/cockroachdb/cockroach/issues/70731)
