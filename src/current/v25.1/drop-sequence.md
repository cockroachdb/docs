---
title: DROP SEQUENCE
summary: The DROP SEQUENCE statement removes a sequence from a database.
toc: true
docs_area: reference.sql
---

The `DROP SEQUENCE` [statement]({{ page.version.version }}/sql-statements.md) removes a sequence from a database.


## Required privileges

The user must have the `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the specified sequence(s).

## Synopsis


## Parameters

 Parameter | Description
-----------|------------
`IF EXISTS` |  Drop the sequence only if it exists; if it does not exist, do not return an error.
`sequence_name_list` | A comma-separated list of sequence names. Find the sequence name with `SHOW CREATE` on the table that uses the sequence.
`RESTRICT` | _(Default)_ Do not drop the sequence if any objects (such as [constraints]({{ page.version.version }}/constraints.md) and tables) use it.
`CASCADE` | Not implemented. You can drop a sequence only if nothing depends on it.

{% comment %} `CASCADE` > Drop all objects (such as [constraints]({{ page.version.version }}/constraints.md) and tables) that depend on the sequence.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously. {% endcomment %}

## Examples

### Remove a sequence (no dependencies)

In this example, other objects do not depend on the sequence being dropped.

~~~ sql
> CREATE SEQUENCE even_numbers INCREMENT 2 START 2;
~~~

~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
  public          | even_numbers
(1 row)
~~~

~~~ sql
> DROP SEQUENCE even_numbers;
~~~

~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
(0 rows)
~~~

{% comment %} ### Remove a Sequence and Dependent Objects with `CASCADE`

In this example, a table depends on the sequence that's being dropped. Therefore, it's only possible to drop the sequence while simultaneously dropping the dependent table using `CASCADE`.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

~~~ sql
> DROP SEQUENCE customer_seq CASCADE;
~~~
~~~
DROP SEQUENCE
~~~ {% endcomment %}

## See also
- [`CREATE SEQUENCE`]({{ page.version.version }}/create-sequence.md)
- [`ALTER SEQUENCE`]({{ page.version.version }}/alter-sequence.md)
- [`SHOW SEQUENCES`]({{ page.version.version }}/show-sequences.md)
- [Functions and Operators]({{ page.version.version }}/functions-and-operators.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)