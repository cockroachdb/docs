CockroachDB implements SQL [cursor]({% link {{ page.version.version }}/cursors.md %}) support with the following limitations:

- `DECLARE` only supports forward cursors. Reverse cursors created with `DECLARE SCROLL` are not supported.
- `FETCH` supports forward, relative, and absolute variants, but only for forward cursors.
- `BINARY CURSOR`, which returns data in the Postgres binary format, is not supported.
- Scrollable cursor (also known as reverse `FETCH`) is not supported.
- [`SELECT ... FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) with a cursor is not supported.
- Respect for [`SAVEPOINT`s]({% link {{ page.version.version }}/savepoint.md %}) is not supported. Cursor definitions do not disappear properly if rolled back to a `SAVEPOINT` from before they were created.
