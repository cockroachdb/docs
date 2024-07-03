You cannot alter the data type of a column if:

- The column is part of an [index]({% link {{ page.version.version }}/indexes.md %}).
- The column has [`CHECK` constraints]({% link {{ page.version.version }}/check.md %}).
- The column owns a [sequence]({% link {{ page.version.version }}/create-sequence.md %}).
- The column has a [`DEFAULT` expression]({% link {{ page.version.version }}/default-value.md %}). This will result in an `ERROR: ... column ... cannot also have a DEFAULT expression` with `SQLSTATE: 42P16`.
- The `ALTER COLUMN TYPE` statement is part of a combined `ALTER TABLE` statement.
- The `ALTER COLUMN TYPE` statement is inside an [explicit transaction]({% link {{ page.version.version }}/begin-transaction.md %}).

{{site.data.alerts.callout_info}}
Most `ALTER COLUMN TYPE` changes are finalized asynchronously. Schema changes on the table with the altered column may be restricted, and writes to the altered column may be rejected until the schema change is finalized.
{{site.data.alerts.end}}