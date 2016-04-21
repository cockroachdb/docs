---
title: RELEASE SAVEPOINT
toc: false
---

When using the CockroachDB-provided function for client-side transaction retries, the `RELEASE SAVEPOINT cockroach_restart` statement commits the transaction's changes once there are no retryable errors. `RELEASE SAVEPOINT` is supported only for this special savepoint. For more details, see [Transaction Retries](transactions.html#transaction-retries).  

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/release_savepoint.html %}

## Required Privileges

No [privileges](privileges.html) are required to release a savepoint. However, privileges are required for each statement within a transaction.

## Parameters

| Parameter | Description |
|-----------|-------------|
|  |  |

## See Also

- [Transaction Retries](transactions.html#transaction-retries)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`ROLLBACK`](rollback-transaction.html)
