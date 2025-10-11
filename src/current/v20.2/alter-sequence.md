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

<div>{% include {{ page.version.version }}/sql/diagrams/alter_sequence_options.html %}</div>

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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE customer_seq;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE customer_seq;
~~~

~~~
   table_name  |                                     create_statement
---------------+-------------------------------------------------------------------------------------------
  customer_seq | CREATE SEQUENCE customer_seq MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 1 START 1
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER SEQUENCE customer_seq INCREMENT 2;
~~~

~~~
   table_name  |                                        create_statement
---------------+--------------------------------------------------------------------------------------------------
  customer_seq | CREATE SEQUENCE public.customer_seq MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 2 START 1
(1 row)
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
