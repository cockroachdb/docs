---
title: BEGIN
toc: false
---

The `BEGIN` [statement](sql-statements.html) initiates a [transaction](transactions.html), which bundles multiple SQL statements into a single all-or-nothing transaction. 

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/begin_transaction.html %}

## Privileges

No privileges are required to initiate a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, the following are aliases for the `BEGIN` statement:

- `BEGIN TRANSACTION` 
- `START TRANSACTION` 

## Parameters

| Parameter | Description |
|-----------|-------------|
|  |  |
