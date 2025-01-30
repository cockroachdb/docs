Dependent objects must be {% if page.name == "restore.md" %} restored {% else %} backed up {% endif %} at the same time as the objects they depend on. When you back up a table, it will not include any dependent tables, [views]({{ page.version.version }}/views.md), or [sequences]({{ page.version.version }}/create-sequence.md).

For example, if you back up view `v` that depends on table `t`, it will only back up `v`, not `t`. When you try to restore `v`, the restore will fail because the referenced table is not present in the backup.

Alternatively, you can pass a `skip` option with {% if page.name == "restore.md" %} `RESTORE` {% else %} [`RESTORE`]({{ page.version.version }}/restore.md) {% endif %} to skip the dependency instead:

Dependent object | Depends on | Skip option
-------|------------+-------------
Table with [foreign key]({{ page.version.version }}/foreign-key.md) constraints | The table it `REFERENCES`. | [`skip_missing_foreign_keys`]({{ page.version.version }}/restore.md#skip_missing_foreign_keys)
Table with a [sequence]({{ page.version.version }}/create-sequence.md) | The sequence. | [`skip_missing_sequences`]({{ page.version.version }}/restore.md#skip-missing-sequences)
[Views]({{ page.version.version }}/views.md) | The tables used in the view's `SELECT` statement. | [`skip_missing_views`]({{ page.version.version }}/restore.md#skip-missing-views)

We recommend treating tables with [foreign keys]({{ page.version.version }}/foreign-key.md), which contribute to [views]({{ page.version.version }}/views.md), or that use sequences or user-defined types as a single unit with their dependencies. While you can restore individual tables, you may find that backing up and restoring at the database level is more convenient.