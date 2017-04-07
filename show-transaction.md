---
title: SHOW TRANSACTION
summary: The SHOW TRANSACTION statement shows you the current transaction's priority or isolation level.
keywords: reflection
toc: false
---

The `SHOW TRANSACTION` [statement](sql-statements.html) shows you the current transaction's [isolation level](transactions.html#isolation-levels) or [priority](transactions.html#transaction-priorities).

{{site.data.alerts.callout_info}}When run outside of a transaction, <code>SHOW TRANSACTION</code> returns the default isolation level or priority.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/show_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to view transaction isolation level or priority.

## Examples

### Show the Transaction's Isolation Level

~~~ sql
> BEGIN;

> SET TRANSACTION ISOLATION LEVEL SNAPSHOT, PRIORITY HIGH;

> SHOW TRANSACTION ISOLATION LEVEL;
~~~
~~~
+-----------------------------+
| transaction isolation level |
+-----------------------------+
| SNAPSHOT                    |
+-----------------------------+
(1 row)

~~~

### Show the Transaction's Priority

~~~ sql
> BEGIN;

> SET TRANSACTION ISOLATION LEVEL SNAPSHOT, PRIORITY HIGH;

> SHOW TRANSACTION PRIORITY;
~~~
~~~
+----------------------+
| transaction priority |
+----------------------+
| HIGH                 |
+----------------------+
(1 row)
~~~

## See Also

- [Transactions](transactions.html)
- [`SET TRANSACTION`](set-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
