---
title: DROP SEQUENCE
summary:
toc: true
---

The `DROP SEQUENCE` [statement](sql-statements.html) removes a sequence from a database.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `DROP` [privilege](authorization.html#assign-privileges) on the specified sequence(s).

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_sequence.html %}</section>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|------------
`IF EXISTS` |  Drop the sequence only if it exists; if it does not exist, do not return an error.
`sequence_name` | The name of the sequence you want to drop. Find the sequence name with `SHOW CREATE` on the table that uses the sequence.
`RESTRICT` | _(Default)_ Do not drop the sequence if any objects (such as [constraints](constraints.html) and tables) use it.
`CASCADE` | Not yet implemented. Currently, you can only drop a sequence if nothing depends on it.

<!-- `CASCADE` > Drop all objects (such as [constraints](constraints.html) and tables) that depend on the sequence.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously. -->

## Examples

### Remove a sequence (no dependencies)

In this example, other objects do not depend on the sequence being dropped.

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
> DROP SEQUENCE even_numbers;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
(0 rows)
~~~

<!-- ### Remove a Sequence and Dependent Objects with `CASCADE`

In this example, a table depends on the sequence that's being dropped. Therefore, it's only possible to drop the sequence while simultaneously dropping the dependent table using `CASCADE`.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

~~~ sql
> DROP SEQUENCE customer_seq CASCADE;
~~~
~~~
DROP SEQUENCE
~~~ -->

## See also
- [`CREATE SEQUENCE`](create-sequence.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`RENAME SEQUENCE`](rename-sequence.html)
- [`SHOW SEQUENCES`](show-sequences.html)
- [Functions and Operators](functions-and-operators.html)
- [Other SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
