---
title: SELECT FOR UPDATE
summary: The SELECT FOR UPDATE statement is used to order transactions under contention.
keywords: concurrency control, locking, transactions, update locking, update, contention
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

{% include {{page.version.version}}/sql/select-for-update-overview.md %}

## Syntax

The following diagram shows the supported syntax for the optional `FOR` locking clause of a `SELECT` statement.

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/for_locking.html %}
</div>

For the full `SELECT` statement syntax documentation, see [Selection Queries](selection-queries.html).

## Parameters

### Locking strengths

Locking strength dictates the row-level locking behavior on rows retrieved by a `SELECT` statement.

Parameter | Description
----------|------------
`FOR SHARE`/`FOR KEY SHARE` | This syntax is a no-op, allowed for PostgreSQL compatibility. Specifying `FOR SHARE`/`FOR KEY SHARE` does not cause CockroachDB to use shared locks over the rows retrieved by a statement.<br><br>Note that CockroachDB always [ensures serializability](demo-serializable.html), regardless of the specified locking strength.
`FOR UPDATE`/`FOR NO KEY UPDATE` | Lock the rows returned by the [`SELECT`](selection-queries.html) statement, such that other transactions trying to access the rows must wait for the transaction to finish.<br><br>Note that in CockroachDB, the `FOR NO KEY UPDATE` locking strength is identical to the `FOR UPDATE` locking strength.

### Wait policies

 Wait policies determine how a `SELECT FOR UPDATE` statement handles conflicts with locks held by other active transactions. By default, `SELECT FOR UPDATE` queries on rows that are already locked by an active transaction must wait for the transaction to finish.

Parameter | Description
----------|------------
`SKIP LOCKED` | This syntax is not supported, as skipping locked rows is not yet supported by CockroachDB.
`NOWAIT` | Return an error if a row cannot be locked immediately.

For documentation on all other parameters of a `SELECT` statement, see [Selection Queries](selection-queries.html).

## Required privileges

The user must have the `SELECT` and `UPDATE` [privileges](security-reference/authorization.html#managing-privileges) on the tables used as operands.

## Examples

### Enforce transaction order when updating the same rows

This example uses `SELECT FOR UPDATE` to lock a row inside a transaction, forcing other transactions that want to update the same row to wait for the first transaction to complete. The other transactions that want to update the same row are effectively put into a queue based on when they first try to read the value of the row.

{% include {{page.version.version}}/sql/select-for-update-example-partial.md %}

Back in Terminal 1, update the row and commit the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE kv SET v = v + 5 WHERE k = 1;
~~~

~~~
UPDATE 1
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

~~~
COMMIT
~~~

Now that the transaction in Terminal 1 has committed, the transaction in Terminal 2 will be "unblocked", generating the following output, which shows the value left by the transaction in Terminal 1:

~~~
  k | v
+---+----+
  1 | 10
(1 row)
~~~

The transaction in Terminal 2 can now receive input, so update the row in question again:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE kv SET v = v + 5 WHERE k = 1;
~~~

~~~
UPDATE 1
~~~

Finally, commit the transaction in Terminal 2:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

~~~
COMMIT
~~~

## See also

- [`SELECT`](select-clause.html)
- [Selection Queries](selection-queries.html)
- [Transaction Contention][transaction_contention]

<!-- Reference links -->

[transaction_contention]: performance-best-practices-overview.html#transaction-contention
[retries]: transactions.html#client-side-intervention
[select]: select-clause.html
