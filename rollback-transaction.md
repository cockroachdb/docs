---
title: ROLLBACK
summary: The ROLLBACK statement aborts the current transaction, discarding all updates made by statements included in the transaction.
toc: false
---

The `ROLLBACK` [statement](sql-statements.html) aborts the current [transaction](transactions.html), discarding all updates made by statements included in the transaction.

When using the CockroachDB-provided function for client-side transaction retries, the `ROLLBACK TO SAVEPOINT cockroach_restart` statement restarts the transaction if any included statement returns a retryable error (identified via the 40001 error code or retry transaction string in the error message). For more details, see [Transaction Retries](transactions.html#transaction-retries). 

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/rollback_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to rollback a transaction. However, privileges are required for each statement within a transaction.

## Parameters

| Parameter | Description |
|-----------|-------------|
|  |  |

## See Also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
