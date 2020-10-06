---
title: ALTER SEQUENCE
summary: Use the ALTER SEQUENCE statement to change the name, increment values, and other settings of a sequence.
toc: true
---

The `ALTER SEQUENCE` [statement](sql-statements.html) applies a [schema change](online-schema-changes.html) to a sequence.


{{site.data.alerts.callout_info}}
This page documents all supported sequence changes except for changing the name of a sequence and changing the schema of a sequence. For information about changing the name of a sequence, see [`RENAME SEQUENCE`](rename-sequence.html). For information about changing the schema of a sequence, see [`SET SCHEMA`](set-schema.html).
{{site.data.alerts.end}}

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/alter_sequence_options.html %}</section>

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
`MINVALUE` | The new minimum value of the sequence. <br><br>**Default:** `1`
`MAXVALUE` | The new maximum value of the sequence. <br><br>**Default:** `9223372036854775807`
`START` | The value the sequence starts at if you `RESTART` or if the sequence hits the `MAXVALUE` and `CYCLE` is set. <br><br>`RESTART` and `CYCLE` are not implemented yet.
`CYCLE` | The sequence will wrap around when the sequence value hits the maximum or minimum value. If `NO CYCLE` is set, the sequence will not wrap.
`OWNED BY column_name` | Associates the sequence to a particular column. If that column or its parent table is dropped, the sequence will also be dropped.<br><br>Specifying an owner column with `OWNED BY` replaces any existing owner column on the sequence. To remove existing column ownership on the sequence and make the column free-standing, specify `OWNED BY NONE`.<br><br>**Default:** `NONE`

## Examples

### Change the increment value of a sequence

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

### Set the next value of a sequence

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

{{site.data.alerts.callout_info}}
The `setval('seq_name', value, is_called)` function in CockroachDB SQL mimics the `setval()` function in PostgreSQL, but it does not store the `is_called` flag. Instead, it sets the value to `val - increment` for `false` or `val` for `true`.
{{site.data.alerts.end}}

Let's add another record to the table to check that the new record adheres to the new next value.

{% include copy-clipboard.html %}
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

## See also

- [`RENAME SEQUENCE`](rename-sequence.html)
- [`CREATE SEQUENCE`](create-sequence.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [`SHOW SEQUENCES`](show-sequences.html)
- [`SET SCHEMA`](set-schema.html)
- [Functions and Operators](functions-and-operators.html)
- [Other SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
