---
title: SHOW SAVEPOINT STATUS
summary: The SHOW SAVEPOINT STATUS statement lists the active savepoints in the current transaction.
toc: true
---

The `SHOW SAVEPOINT STATUS` [statement](sql-statements.html) lists the active [savepoints](savepoint.html) in the current [transaction](transactions.html).

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to create or show a savepoint. However, privileges are required for each statement within a transaction.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_savepoint_status.html %}
</div>

## Response

The following fields are returned for each savepoint.

Field | Description
------|------------
`savepoint_name` | The name of the savepoint.
`is_initial_savepoint` | Whether the savepoint is the outermost savepoint in the transaction.

## Example

First, open a [transaction](transactions.html) using [`BEGIN`](begin-transaction.html), and create a [nested transaction](transactions.html#nested-transactions) using a [savepoint](savepoint.html):

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
SAVEPOINT foo;
~~~

Next, use the `SHOW SAVEPOINT STATUS` statement to list the active savepoints in the current nested transaction.

{% include copy-clipboard.html %}
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

We can commit this nested transaction by issuing the [`RELEASE SAVEPOINT`](release-savepoint.html) statement.  Then, we clear the connection for the next transaction by issuing a [`COMMIT`](commit-transaction.html) statement.

{% include copy-clipboard.html %}
~~~ sql
> RELEASE SAVEPOINT foo;
COMMIT;
~~~

If we did not want to commit this nested transaction, but restart it instead, we would have issued a [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#rollback-a-nested-transaction).

## See also

- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [Transactions](transactions.html)
