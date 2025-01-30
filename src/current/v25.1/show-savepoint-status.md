---
title: SHOW SAVEPOINT STATUS
summary: The SHOW SAVEPOINT STATUS statement lists the active savepoints in the current transaction.
toc: true
docs_area: reference.sql
---

The `SHOW SAVEPOINT STATUS` [statement]({{ page.version.version }}/sql-statements.md) lists the active [savepoints]({{ page.version.version }}/savepoint.md) in the current [transaction]({{ page.version.version }}/transactions.md).

## Required privileges

No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to create or show a savepoint. However, privileges are required for each statement within a transaction.

## Synopsis

<div>
</div>

## Response

The following fields are returned for each savepoint.

Field | Description
------|------------
`savepoint_name` | The name of the savepoint.
`is_initial_savepoint` | Whether the savepoint is the outermost savepoint in the transaction.

## Example

1. Open a [transaction]({{ page.version.version }}/transactions.md) using [`BEGIN`]({{ page.version.version }}/begin-transaction.md), and create a [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions) using a [savepoint]({{ page.version.version }}/savepoint.md):

    ~~~ sql
    > BEGIN;
    SAVEPOINT foo;
    ~~~

1. Use the `SHOW SAVEPOINT STATUS` statement to list the active savepoints in the current nested transaction.

    ~~~ sql
    > SHOW SAVEPOINT STATUS;
    ~~~

    ~~~
      savepoint_name | is_initial_savepoint
    -----------------+-----------------------
      foo            |        true
    (1 row)
    ~~~

    Currently, there is only one savepoint.

1. Commit this nested transaction by issuing the [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md) statement, then clear the connection for the next transaction by issuing a [`COMMIT`]({{ page.version.version }}/commit-transaction.md) statement:

    ~~~ sql
    > RELEASE SAVEPOINT foo;
    COMMIT;
    ~~~

    If we did not want to commit this nested transaction, but restart it instead, we would have issued a [`ROLLBACK TO SAVEPOINT`]({{ page.version.version }}/rollback-transaction.md#rollback-a-nested-transaction).

## See also

- [`SAVEPOINT`]({{ page.version.version }}/savepoint.md)
- [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md)
- [`ROLLBACK`]({{ page.version.version }}/rollback-transaction.md)
- [`BEGIN`]({{ page.version.version }}/begin-transaction.md)
- [`COMMIT`]({{ page.version.version }}/commit-transaction.md)
- [Transactions]({{ page.version.version }}/transactions.md)