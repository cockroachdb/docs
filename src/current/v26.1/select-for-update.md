---
title: FOR UPDATE and FOR SHARE
summary: The FOR UPDATE and FOR SHARE clauses are used to lock SELECT statements.
keywords: concurrency control, locking, transactions, update locking, update, contention
toc: true
docs_area: reference.sql
---

`SELECT ... FOR UPDATE` and `SELECT ... FOR SHARE` are used to issue [locking reads]({% link {{ page.version.version }}/read-committed.md %}#locking-reads) at different [lock strengths](#lock-strengths).

## Syntax

The following diagram shows the supported syntax for the optional `FOR` locking clause of a `SELECT` statement.

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/for_locking.html %}
</div>

{{site.data.alerts.callout_success}}
For the full `SELECT` statement syntax documentation, see [Selection Queries]({% link {{ page.version.version }}/selection-queries.md %}).
{{site.data.alerts.end}}

## Parameters

|            Parameter             |                                                                                                                                                      Description                                                                                                                                                      |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `FOR SHARE`      | Acquire a shared lock on the rows returned by the [`SELECT`]({% link {{ page.version.version }}/selection-queries.md %}) statement. Shared locks are not enabled by default for `SERIALIZABLE` transactions. For details, see [`FOR SHARE` usage](#for-share-usage).
| `FOR UPDATE` | Acquire an exclusive lock on the rows returned by the [`SELECT`]({% link {{ page.version.version }}/selection-queries.md %}) statement. For details, see [`FOR UPDATE` usage](#for-update-usage).  

Under `SERIALIZABLE` isolation:

- Shared locks are not enabled by default. To enable shared locks for `SERIALIZABLE` transactions, configure the [`enable_shared_locking_for_serializable` session setting]({% link {{ page.version.version }}/session-variables.md %}). To perform [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) checks under `SERIALIZABLE` isolation with shared locks, configure the [`enable_implicit_fk_locking_for_serializable` session setting]({% link {{ page.version.version }}/session-variables.md %}). This matches the default [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) behavior.

- If the [`optimizer_use_lock_op_for_serializable` session setting]({% link {{ page.version.version }}/session-variables.md %}) is enabled, the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) uses a `Lock` operator to construct query plans for `SELECT` statements using the `FOR UPDATE` and `FOR SHARE` clauses. This more closely matches the PostgreSQL behavior, but will create more round trips from [gateway node]({% link {{ page.version.version }}/architecture/sql-layer.md %}#gateway-node) to [replica leaseholder]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) in some cases.

### Lock strengths

Lock "strength" determines how restrictive the lock is to concurrent transactions attempting to access the same row.

{% include {{ page.version.version }}/sql/select-lock-strengths.md %}

Note that CockroachDB [ensures serializability]({% link {{ page.version.version }}/demo-serializable.md %}) when using `SERIALIZABLE` isolation, regardless of the specified lock strength.                    

### `FOR UPDATE` usage

{% include {{page.version.version}}/sql/select-for-update-overview.md %}

For a demo on `SELECT FOR UPDATE` and how it - alongside SERIALISABLE ISOLATION - can protect you against the [ACID Rain attack](http://www.bailis.org/papers/acidrain-sigmod2017.pdf), watch the following video:

{% include_cached youtube.html video_id="vfq3o5yG-PU" %}

### `FOR SHARE` usage

`SELECT ... FOR SHARE` is primarily used with [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) transactions.

If you need to read the latest version of a row, but not update the row, use `SELECT ... FOR SHARE` to block all concurrent writes on the row without unnecessarily blocking concurrent reads. This allows an application to build cross-row consistency constraints by ensuring that rows that are read in a `READ COMMITTED` transaction will not change before the writes in the same transaction have been committed. For details, see [Locking reads]({% link {{ page.version.version }}/read-committed.md %}#locking-reads).

Under `READ COMMITTED` isolation, CockroachDB uses the `SELECT ... FOR SHARE` locking mechanism to perform [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) checks.

{{site.data.alerts.callout_info}}
Shared locks are not enabled by default for `SERIALIZABLE` transactions. To enable shared locks for `SERIALIZABLE` transactions, configure the [`enable_shared_locking_for_serializable` session setting]({% link {{ page.version.version }}/session-variables.md %}). To perform [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) checks under `SERIALIZABLE` isolation with shared locks, configure the [`enable_implicit_fk_locking_for_serializable` session setting]({% link {{ page.version.version }}/session-variables.md %}). This matches the default `READ COMMITTED` behavior.
{{site.data.alerts.end}}

### Lock promotion

A shared lock can be "promoted" to an exclusive lock.

If a transaction that holds a shared lock on a row subsqeuently issues an exclusive lock on the row, this will cause the transaction to reacquire the lock, effectively "promoting" the shared lock to an exclusive lock.

A shared lock cannot be promoted until all other shared locks on the row are released. If two concurrent transactions attempt to promote their shared locks on a row, this will cause *deadlock* between the transactions, causing one transaction to abort with a `40001` error ([`ABORT_REASON_ABORTED_RECORD_FOUND`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#abort_reason_aborted_record_found) or [`ABORT_REASON_PUSHER_ABORTED`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#abort_reason_pusher_aborted)) returned to the client. The remaining open transaction will then promote its lock.

### Lock behavior under `SERIALIZABLE` isolation

{% include {{page.version.version}}/known-limitations/select-for-update-limitations.md %}

### Wait policies

Wait policies determine how a `SELECT ... FOR UPDATE` or `SELECT ... FOR SHARE` statement handles conflicts with locks held by other active transactions. By default, locking reads that are blocked by an active transaction must wait for the transaction to finish.

Parameter | Description
----------|------------
`SKIP LOCKED` | Skip rows that cannot be immediately locked.
`NOWAIT` | Return an error if a row cannot be locked immediately.

For documentation on all other parameters of a `SELECT` statement, see [Selection Queries]({% link {{ page.version.version }}/selection-queries.md %}).

## Required privileges

The user must have the `SELECT` and `UPDATE` [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the tables used as operands.

## Aliases

- `FOR KEY SHARE` is an alias for `FOR SHARE`.
- `FOR NO KEY UPDATE` is an alias for `FOR UPDATE`.

## Examples

### Enforce transaction order when updating the same rows

This example uses `SELECT ... FOR UPDATE` to lock a row inside a transaction, forcing other transactions that want to update the same row to wait for the first transaction to complete. The other transactions that want to update the same row are effectively put into a queue based on when they first try to read the value of the row.

{% include {{page.version.version}}/sql/select-for-update-example-partial.md %}

Back in Terminal 1, update the row and commit the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE kv SET v = v + 5 WHERE k = 1;
~~~

~~~
UPDATE 1
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

~~~
COMMIT
~~~

Now that the transaction in Terminal 1 has committed, the transaction in Terminal 2 will be "unblocked", generating the following output, which shows the value left by the transaction in Terminal 1:

~~~
  k | v
+---+----+
  1 | 10
(1 row)
~~~

The transaction in Terminal 2 can now receive input, so update the row in question again:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE kv SET v = v + 5 WHERE k = 1;
~~~

~~~
UPDATE 1
~~~

Finally, commit the transaction in Terminal 2:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

~~~
COMMIT
~~~

### Reserve rows for updates using exclusive locks

See [Read Committed Transactions]({% link {{ page.version.version }}/read-committed.md %}#reserve-rows-for-updates-using-exclusive-locks).

### Reserve row values using shared locks

See [Read Committed Transactions]({% link {{ page.version.version }}/read-committed.md %}#reserve-row-values-using-shared-locks).

## See also

- [`SELECT`]({% link {{ page.version.version }}/select-clause.md %})
- [Selection Queries]({% link {{ page.version.version }}/selection-queries.md %})
- [Transaction Contention][transaction_contention]
- [Read Committed Transactions]({% link {{ page.version.version }}/read-committed.md %})

{% comment %} Reference links {% endcomment %}

[transaction_contention]: performance-best-practices-overview.html#transaction-contention
[retries]: transaction-retry-error-reference.html#client-side-retry-handling
[select]: {% link {{ page.version.version }}/select-clause.md %}
