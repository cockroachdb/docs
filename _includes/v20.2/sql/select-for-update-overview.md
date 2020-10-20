The `SELECT FOR UPDATE` statement is used to order transactions by controlling concurrent access to one or more rows of a table.

It works by locking the rows returned by a [selection query][selection], such that other transactions trying to access those rows are forced to wait for the transaction that locked the rows to finish. These other transactions are effectively put into a queue based on when they tried to read the value of the locked rows.

Because this queueing happens during the read operation, the [thrashing](https://en.wikipedia.org/wiki/Thrashing_(computer_science)) that would otherwise occur if multiple concurrently executing transactions attempt to `SELECT` the same data and then `UPDATE` the results of that selection is prevented. By preventing thrashing, CockroachDB also prevents [transaction retries][retries] that would otherwise occur.

As a result, using `SELECT FOR UPDATE` leads to increased throughput and decreased tail latency for contended operations.

CockroachDB currently does not support the `FOR SHARE`/`FOR KEY SHARE` [locking strengths](select-for-update.html#locking-strengths), or the `SKIP LOCKED` [wait policy](select-for-update.html#wait-policies).

{{site.data.alerts.callout_info}}
By default, CockroachDB uses the `SELECT FOR UPDATE` locking mechanism during the initial row scan performed in [`UPDATE`](update.html) and [`UPSERT`](upsert.html) statement execution. To turn off implicit `SELECT FOR UPDATE` locking for `UPDATE` and `UPSERT` statements, set `enable_implicit_select_for_update` to `false`.
{{site.data.alerts.end}}

<!-- Reference Links -->

[retries]: transactions.html#transaction-retries
[selection]: selection-queries.html
