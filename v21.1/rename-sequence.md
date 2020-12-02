---
title: RENAME SEQUENCE
summary: The RENAME SEQUENCE statement changes the name of a sequence.
toc: true
---

The `RENAME TO` [statement](sql-statements.html) is part of [`ALTER SEQUENCE`](alter-sequence.html), and changes the name of a sequence.

{{site.data.alerts.callout_danger}}
You cannot rename a sequence that's being used in a table. To rename the sequence, <a href="alter-column.html#remove-default-constraint">drop the <code>DEFAULT</code> expressions</a> that reference the sequence, rename the sequence, and <a href="alter-column.html#set-or-change-a-default-value">add the <code>DEFAULT</code> expressions</a> back.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
`ALTER SEQUENCE ... RENAME TO` can be used to move a sequence from one database to another, but it cannot be used to move a sequence from one schema to another. To change a sequence's schema, use [`SET SCHEMA`](set-schema.html).

Note that, in a future release, `ALTER SEQUENCE ... RENAME TO` will be limited to changing the name of a sequence, and will not have to the ability to change a sequence's database.
{{site.data.alerts.end}}

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/rename_sequence.html %}</section>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|------------
`IF EXISTS` | Rename the sequence only if it exists; if it does not exist, do not return an error.
`current_name` | The current name of the sequence you want to modify.
`new_name` | The new name of the sequence, which must be unique to its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). <br><br>Name changes do not propagate to the  table(s) using the sequence.

## Examples

### Rename a Sequence

In this example, we will change the name of sequence.

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE even_numbers INCREMENT 2 START 2;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
  public          | even_numbers
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER SEQUENCE even_numbers RENAME TO even_sequence;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
  public          | even_sequence
(1 row)
~~~

### Move a Sequence

In this example, we will move the sequence we renamed in the first example (`even_sequence`) from `defaultdb` (i.e., the default database) to a different database.

{% include copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES FROM defaultdb;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
  public          | even_sequence
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE mydb;
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER SEQUENCE even_sequence RENAME TO newdb.even_sequence;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES FROM defaultdb;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
(0 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES FROM mydb;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
  public          | even_sequence
(1 row)
~~~

## See also

- [`CREATE SEQUENCE`](create-sequence.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [`SHOW SEQUENCES`](show-sequences.html)
- [Functions and Operators](functions-and-operators.html)
