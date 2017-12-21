---
title: ALTER SEQUENCE
summary:
toc: false
---

<span class="version-tag">New in v2.0:</span> The `ALTER SEQUENCE` [statement](sql-statements.html) applies a schema change to a sequence.

{{site.data.alerts.callout_info}}To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see <a href="https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/">Online Schema Changes in CockroachDB</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database.

## Synopsis

~~~
ALTER SEQUENCE [IF EXISTS] <sequence_name>
  [INCREMENT <increment>]
  [MINVALUE <minvalue> | NO MINVALUE]
  [MAXVALUE <maxvalue> | NO MAXVALUE]
  [START <start>]
  [[NO] CYCLE]
~~~

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|------------
`IF EXISTS` | Modify the sequence only if it exists; if it does not exist, do not return an error.
`sequence_name` | The name of the sequence you want to modify.
`INCREMENT` | The new value by which the sequence is incremented. A negative number creates a descending sequence. A positive number creates an ascending sequence.
`MINVALUE` | The new minimum value of the sequence.
`MAXVALUE` | The new maximum value of the sequence.
`START` | The value the sequence starts at if you `RESTART` or if the sequence hits the `MAXVALUE` and `CYCLE` is set. <br><br>`RESTART` and `CYCLE` are not implemented yet.
`CYCLE` | The sequence will wrap around when the sequence value hits the maximum or minimum value. If `NO CYCLE` is set, the sequence will not wrap.
`newname` | The new name of the sequence, which must be unique to its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). <br><br>Name changes do not propagate to the  table(s) using the sequence.

## Examples

### Change the Increment of a Sequence

In this example, we're going to change the increment of a sequence from its current state (i.e., `1`) to `2`.

{% include copy-clipboard.html %}
~~~ sql
> ALTER SEQUENCE customer_seq INCREMENT 2;
~~~

Next, we'll add another record to the table and check that the new record adheres to the new sequence.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customer_list (customer, address) VALUES ('Marie', '333 Ocean Ave');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customer_list;
~~~
~~~
+----+----------+--------------------+
| id | customer |      address       |
+----+----------+--------------------+
|  1 | Lauren   | 123 Main Street    |
|  2 | Jesse    | 456 Broad Ave      |
|  3 | Amruta   | 9876 Green Parkway |
|  5 | Marie    | 333 Ocean Ave      |
+----+----------+--------------------+
~~~

## See Also

- [`CREATE SEQUENCE`](create-sequence.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [Functions and Operators](functions-and-operators.html)
