Column | Type | Description
-------|------|------------
`collection_ts` | `TIMESTAMPTZ NOT NULL` | The timestamp when the transaction [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) event was collected.
`blocking_txn_id` | `UUID NOT NULL` | The ID of the blocking transaction. You can join this column into the [`cluster_contention_events`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_contention_events) table.
`blocking_txn_fingerprint_id` | `BYTES NOT NULL`| The ID of the blocking transaction fingerprint. To surface historical information about the transactions that caused the [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention), you can join this column into the [`statement_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#statement_statistics) and [`transaction_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#transaction_statistics) tables.
`waiting_txn_id` | `UUID NOT NULL` | The ID of the waiting transaction. You can join this column into the [`cluster_contention_events`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_contention_events) table.
`waiting_txn_fingerprint_id` | `BYTES NOT NULL` | The ID of the waiting transaction fingerprint. To surface historical information about the transactions that caused the [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention), you can join this column into the [`statement_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#statement_statistics) and [`transaction_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#transaction_statistics) tables.
`waiting_stmt_id` | `STRING NOT NULL` | The statement id of the transaction that was waiting (unique for each statement execution).
`waiting_stmt_fingerprint_id` | `BYTES NOT NULL` | The ID of the waiting statement fingerprint. To surface historical information about the statements that caused the [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention), you can join this column into the [`statement_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#statement_statistics) table.
`contention_duration` | `INTERVAL NOT NULL` | The interval of time the waiting transaction spent waiting for the blocking transaction.
`contending_key` | `BYTES NOT NULL` | The key on which the transactions contended.
`contending_pretty_key` | `STRING NOT NULL` | The specific key that was involved in the contention event, in readable format.
`database_name` | `STRING NOT NULL` | The database where the contention occurred.
`schema_name` | `STRING NOT NULL` | The schema where the contention occurred.
`table_name` | `STRING NOT NULL` | The table where the contention occurred.
`index_name` | `STRING NULL` | The index where the contention occurred.
`contention_type` | `STRING NOT NULL` | The type of contention: `LOCK_WAIT` or `SERIALIZATION_CONFLICT`.