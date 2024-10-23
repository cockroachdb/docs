CockroachDB implements SQL {% if page.name == "known-limitations.md" %} [cursor]({% link {{ page.version.version }}/cursors.md %}) {% else %} cursor {% endif %} support with the following limitations:

- `DECLARE` only supports forward cursors. Reverse cursors created with `DECLARE SCROLL` are not supported. [#77102](https://github.com/cockroachdb/cockroach/issues/77102)
- `FETCH` supports forward, relative, and absolute variants, but only for forward cursors. [#77102](https://github.com/cockroachdb/cockroach/issues/77102)
- `BINARY CURSOR`, which returns data in the Postgres binary format, is not supported. [#77099](https://github.com/cockroachdb/cockroach/issues/77099)
- `WITH HOLD`, which allows keeping a cursor open for longer than a transaction by writing its results into a buffer, is accepted as valid syntax within a single transaction but is not supported. It acts as a no-op and does not actually perform the function of `WITH HOLD`, which is to make the cursor live outside its parent transaction. Instead, if you are using `WITH HOLD`, you will be forced to close that cursor within the transaction it was created in. [#77101](https://github.com/cockroachdb/cockroach/issues/77101)
    - This syntax is accepted (but does not have any effect):
        {% include_cached copy-clipboard.html %}
        ~~~ sql
        BEGIN;
        DECLARE test_cur CURSOR WITH HOLD FOR SELECT * FROM foo ORDER BY bar;
        CLOSE test_cur;
        COMMIT;
        ~~~
    - This syntax is not accepted, and will result in an error:
        {% include_cached copy-clipboard.html %}
        ~~~ sql
        BEGIN;
        DECLARE test_cur CURSOR WITH HOLD FOR SELECT * FROM foo ORDER BY bar;
        COMMIT; -- This will fail with an error because CLOSE test_cur was not called inside the transaction.
        ~~~
- Scrollable cursor (also known as reverse `FETCH`) is not supported. [#77102](https://github.com/cockroachdb/cockroach/issues/77102)
- [`SELECT ... FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) with a cursor is not supported. [#77103](https://github.com/cockroachdb/cockroach/issues/77103)
- Respect for [`SAVEPOINT`s]({% link {{ page.version.version }}/savepoint.md %}) is not supported. Cursor definitions do not disappear properly if rolled back to a `SAVEPOINT` from before they were created. [#77104](https://github.com/cockroachdb/cockroach/issues/77104)
