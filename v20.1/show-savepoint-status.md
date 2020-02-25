---
title: SHOW SAVEPOINT STATUS
summary: The SHOW SAVEPOINT STATUS statement lists the active savepoints in the current transaction.
toc: true
---

The `SHOW SAVEPOINT STATUS` [statement](sql-statements.html) lists the active [savepoints](savepoint.html) in the current [transaction](transactions.html).

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to create or show a savepoint. However, privileges are required for each statement within a transaction.

## Response

The following fields are returned for each savepoint.

Field | Description
------|------------
`savepoint_name` | The name of the savepoint.
`is_restart_savepoint` | Whether the savepoint is [being used to implement client-side transaction retries](savepoint.html#savepoints-for-client-side-transaction-retries).

## Example

First, open a [transaction](transactions.html) and create a [savepoint](savepoint.html):

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
SAVEPOINT foo;
~~~

{% include copy-clipboard.html %}
~~~ sql
SHOW SAVEPOINT STATUS;
~~~

~~~
  savepoint_name | is_restart_savepoint
-----------------+-----------------------
  foo            |        false
(1 row)
~~~

Remove the savepoint from the transaction with [`RELEASE SAVEPOINT`](release-savepoint.html), and exit the transaction with [`COMMIT`](commit-transaction.html):

{% include copy-clipboard.html %}
~~~ sql
RELEASE SAVEPOINT foo;
COMMIT;
~~~

## See also

- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [Transactions](transactions.html)
