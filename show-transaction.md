---
title: SHOW TRANSACTION
summary: The SHOW TRANSACTION statement lists the default transaction isolation level or transaction priority for the current session or for an individual transaction.
keywords: reflection
toc: false
---

The `SHOW TRANSACTION` [statement](sql-statements.html) lists the default transaction isolation level or transaction priority for the current session or for an individual [transaction](transactions.html).

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
| TRANSACTION ISOLATION LEVEL |
+-----------------------------+
| SNAPSHOT                    |
+-----------------------------+
~~~

### Show the Transaction's Priority

~~~ sql
> BEGIN;

> SET TRANSACTION ISOLATION LEVEL SNAPSHOT, PRIORITY HIGH;

> SHOW TRANSACTION PRIORITY;
~~~
~~~
+----------------------+
| TRANSACTION PRIORITY |
+----------------------+
| HIGH                 |
+----------------------+
~~~

## See Also

- [Transactions](transactions.html)
- [`SET TRANSACTION`](set-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)