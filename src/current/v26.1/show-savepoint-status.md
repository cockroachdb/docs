---
title: SHOW SAVEPOINT STATUS
summary: The SHOW SAVEPOINT STATUS statement lists the active savepoints in the current transaction.
toc: true
docs_area: reference.sql
---

The `SHOW SAVEPOINT STATUS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the active [savepoints]({% link {{ page.version.version }}/savepoint.md %}) in the current [transaction]({% link {{ page.version.version }}/transactions.md %}).

## Required privileges

No [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) are required to create or show a savepoint. However, privileges are required for each statement within a transaction.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_savepoint_status.html %}
</div>

## Response

The following fields are returned for each savepoint.

Field | Description
------|------------
`savepoint_name` | The name of the savepoint.
`is_initial_savepoint` | Whether the savepoint is the outermost savepoint in the transaction.

## Example

1. Open a [transaction]({% link {{ page.version.version }}/transactions.md %}) using [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %}), and create a [nested transaction]({% link {{ page.version.version }}/transactions.md %}#nested-transactions) using a [savepoint]({% link {{ page.version.version }}/savepoint.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    SAVEPOINT foo;
    ~~~

1. Use the `SHOW SAVEPOINT STATUS` statement to list the active savepoints in the current nested transaction.

    {% include_cached copy-clipboard.html %}
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

1. Commit this nested transaction by issuing the [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %}) statement, then clear the connection for the next transaction by issuing a [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}) statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > RELEASE SAVEPOINT foo;
    COMMIT;
    ~~~

    If we did not want to commit this nested transaction, but restart it instead, we would have issued a [`ROLLBACK TO SAVEPOINT`]({% link {{ page.version.version }}/rollback-transaction.md %}#rollback-a-nested-transaction).

## See also

- [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %})
- [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %})
- [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %})
- [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %})
- [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %})
- [Transactions]({% link {{ page.version.version }}/transactions.md %})
