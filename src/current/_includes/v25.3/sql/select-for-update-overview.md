{% if page.name != "select-for-update.md" %}`SELECT ... FOR UPDATE` exclusively locks the rows returned by a [selection query][selection], such that other transactions trying to access those rows must wait for the transaction that locked the rows to commit or rollback.{% endif %}

`SELECT ... FOR UPDATE` can be used to:

- Strengthen the isolation of a [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) transaction. If you need to read and later update a row within a transaction, use `SELECT ... FOR UPDATE` to acquire an exclusive lock on the row. This guarantees data integrity between the transaction's read and write operations. For details, see [Locking reads]({% link {{ page.version.version }}/read-committed.md %}#locking-reads).

- Order [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) transactions by controlling concurrent access to one or more rows of a table. These other transactions are placed into a queue based on when they tried to read the values of the locked rows.

	Because this queueing happens during the read operation, the [thrashing](https://wikipedia.org/wiki/Thrashing_(computer_science)) that would otherwise occur if multiple concurrently executing transactions attempt to `SELECT` the same data and then `UPDATE` the results of that selection is prevented. By preventing thrashing, `SELECT ... FOR UPDATE` also prevents [transaction retries][retries] that would otherwise occur due to [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).

	As a result, using `SELECT ... FOR UPDATE` leads to increased throughput and decreased tail latency for contended operations.

Note that using `SELECT ... FOR UPDATE` does not completely eliminate the chance of [serialization errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}). These errors can also arise due to [time uncertainty]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#transaction-conflicts). To eliminate the need for application-level retry logic, in addition to `SELECT FOR UPDATE` your application also needs to use a [driver that implements automatic retry handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling).

{{site.data.alerts.callout_info}}
By default, CockroachDB uses the `SELECT ... FOR UPDATE` locking mechanism during the initial row scan performed in [`UPDATE`]({% link {{ page.version.version }}/update.md %}) and [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}) statement execution. To turn off implicit `SELECT ... FOR UPDATE` locking for `UPDATE` and `UPSERT` statements, set the `enable_implicit_select_for_update` [session variable]({% link {{ page.version.version }}/set-vars.md %}) to `false`.
{{site.data.alerts.end}}

{% comment %} Reference Links {% endcomment %}

[retries]: transactions.html#transaction-retries
[selection]: selection-queries.html
