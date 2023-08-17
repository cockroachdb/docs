Locks acquired using {% if page.name == "select-for-update.md" %} `SELECT ... FOR UPDATE` {% else %} [`SELECT ... FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) {% endif %} are dropped on [lease transfers]({% link {{ page.version.version }}/architecture/replication-layer.md %}#epoch-based-leases-table-data) and [range splits and merges]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#range-merges). `SELECT ... FOR UPDATE` locks should be thought of as best-effort, and should not be relied upon for correctness, as they are implemented as fast, in-memory [unreplicated locks](architecture/transaction-layer.html#unreplicated-locks).

If a lease transfer or range split/merge occurs on a range held by an unreplicated lock, the lock is dropped, and the following behaviors can occur:

- The desired ordering of concurrent accesses to one or more rows of a table expressed by your use of `SELECT ... FOR UPDATE` may not be preserved (that is, a transaction _B_ against some table _T_ that was supposed to wait behind another transaction _A_ operating on _T_ may not wait for transaction _A_).
- The transaction that acquired the (now dropped) unreplicated lock may fail to commit, leading to [transaction retry errors with code `40001` and the `restart transaction` error message]({% link {{ page.version.version }}/common-errors.md %}#restart-transaction).

We intend to improve the reliability of these locks. For details, see [cockroachdb/cockroach#75456](https://github.com/cockroachdb/cockroach/issues/75456).

Note that [serializable isolation]({% link {{ page.version.version }}/transactions.md %}#serializable-isolation) is preserved despite this limitation.
