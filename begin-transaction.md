---
title: BEGIN
summary: Use the BEGIN statement to initiate a CockroachDB transaction.
toc: false
---

The `BEGIN` [statement](sql-statements.html) initiates a [transaction](transactions.html), which bundles multiple SQL statements into a single all-or-nothing transaction. 

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/begin_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to initiate a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, the following are aliases for the `BEGIN` statement:

- `BEGIN TRANSACTION` 
- `START TRANSACTION` 

## Parameters

| Parameter | Description |
|-----------|-------------|
|  |  |

## See Also

- [Transactions](transactions.html)
- [`COMMIT`](commit-transaction.html)
- [`ROLLBACK`](rollback-transaction.html)
