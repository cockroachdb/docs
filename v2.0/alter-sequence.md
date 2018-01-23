---
title: ALTER SEQUENCE
summary: Use the ALTER SEQUENCE statement to change the name, increment values, and other settings of a sequence.
toc: false
---

<span class="version-tag">New in v2.0:</span> The `ALTER SEQUENCE` [statement](sql-statements.html) [changes the name](rename-sequence.html), increment values, and other settings of a sequence.

{{site.data.alerts.callout_info}}To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see <a href="https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/">Online Schema Changes in CockroachDB</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database.

## Synopsis

<section>{% include sql/{{ page.version.version }}/diagrams/alter_sequence_options.html %}</section>

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
`MINVALUE` | The new minimum value of the sequence. <br><br>Default: `1`
`MAXVALUE` | The new maximum value of the sequence. <br><br>Default: `9223372036854775807`
`START` | The value the sequence starts at if you `RESTART` or if the sequence hits the `MAXVALUE` and `CYCLE` is set. <br><br>`RESTART` and `CYCLE` are not implemented yet.
`CYCLE` | The sequence will wrap around when the sequence value hits the maximum or minimum value. If `NO CYCLE` is set, the sequence will not wrap.

## Examples

### Change the Increment Value of a Sequence

In this example, we're going to change the increment value of a sequence from its current state (i.e., `1`) to `2`.

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

### Set the Next Value of a Sequence

In this example, we're going to change the next value of the example sequence (`customer_seq`). Currently, the next value will be `7` (i.e., `5` + `INCREMENT 2`). We will change the next value to `20`.

{{site.data.alerts.callout_info}}You cannot set a value outside the <code>MAXVALUE</code> or <code>MINVALUE</code> of the sequence. {{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> SELECT setval('customer_seq', 20, false);
~~~
~~~
+--------+
| setval |
+--------+
|     20 |
+--------+
~~~

{{site.data.alerts.callout_info}}The <code>setval('seq_name', value, is_called)</code> function in CockroachDB SQL mimics the <code>setval()</code> function in PostgreSQL, but it does not store the <code>is_called</code> flag. Instead, it sets the value to <code>val - increment</code> for <code>false</code> or <code>val</code> for <code>true</code>. {{site.data.alerts.end}}

Let's add another record to the table to check that the new record adheres to the new next value.

~~~ sql
> INSERT INTO customer_list (customer, address) VALUES ('Lola', '333 Schermerhorn');
~~~
~~~
+----+----------+--------------------+
| id | customer |      address       |
+----+----------+--------------------+
|  1 | Lauren   | 123 Main Street    |
|  2 | Jesse    | 456 Broad Ave      |
|  3 | Amruta   | 9876 Green Parkway |
|  5 | Marie    | 333 Ocean Ave      |
| 20 | Lola     | 333 Schermerhorn   |
+----+----------+--------------------+
~~~


## See Also

- [`RENAME SEQUENCE`](rename-sequence.html)
- [`CREATE SEQUENCE`](create-sequence.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [Functions and Operators](functions-and-operators.html)
- [Other SQL Statements](sql-statements.html)
