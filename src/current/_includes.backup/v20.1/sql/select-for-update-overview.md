<span class="version-tag">New in v20.1</span>: The `SELECT FOR UPDATE` statement is used to order transactions by controlling concurrent access to one or more rows of a table.

It works by locking the rows returned by a [selection query][selection], such that other transactions trying to access those rows are forced to wait for the transaction that locked the rows to finish. These other transactions are effectively put into a queue based on when they tried to read the value of the locked rows.

Because this queueing happens during the read operation, the thrashing that would otherwise occur if multiple concurrently executing transactions attempt to `SELECT` the same data and then `UPDATE` the results of that selection is prevented.  By preventing this thrashing, CockroachDB also prevents the [transaction retries][retries] that would otherwise occur.

As a result, using `SELECT FOR UPDATE` leads to increased throughput and decreased tail latency for contended operations.

<!-- Reference Links -->

[retries]: transactions.html#transaction-retries
[selection]: selection-queries.html
