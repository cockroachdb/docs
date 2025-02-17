You cannot alter the data type of a column if:

- The column is part of an [index]({% link {{ page.version.version }}/indexes.md %}).
- The column has [`CHECK` constraints]({% link {{ page.version.version }}/check.md %}).
- The column owns a [sequence]({% link {{ page.version.version }}/create-sequence.md %}).
- The `ALTER COLUMN TYPE` statement is part of a combined `ALTER TABLE` statement.
- The `ALTER COLUMN TYPE` statement is inside an [explicit transaction]({% link {{ page.version.version }}/begin-transaction.md %}).
- The column is part of a [TTL expression]({% link {{ page.version.version }}/row-level-ttl.md %}).
- The column is used in a [function body]({% link {{ page.version.version }}/user-defined-functions.md %}).
- The column is part of a [computed column expression]({% link {{ page.version.version }}/computed-columns.md %}).
- The column is referenced in a [view]({% link {{ page.version.version }}/views.md %}).
