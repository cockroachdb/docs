---
title: DROP SEQUENCE
summary: The DROP SEQUENCE statement removes a sequence from a database.
toc: true
docs_area: reference.sql
---

The `DROP SEQUENCE` [statement](sql-statements.html) removes a sequence from a database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the specified sequence(s).

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_sequence.html %}</div>

## Parameters

 Parameter | Description
-----------|------------
`IF EXISTS` |  Drop the sequence only if it exists; if it does not exist, do not return an error.
`sequence_name_list` | A comma-separated list of sequence names. Find the sequence name with `SHOW CREATE` on the table that uses the sequence.
`RESTRICT` | _(Default)_ Do not drop the sequence if any objects (such as [constraints](constraints.html) and tables) use it.
`CASCADE` | Not implemented. You can drop a sequence only if nothing depends on it.

<!-- `CASCADE` > Drop all objects (such as [constraints](constraints.html) and tables) that depend on the sequence.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously. -->

## Examples

### Remove a sequence (no dependencies)

In this example, other objects do not depend on the sequence being dropped.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE even_numbers INCREMENT 2 START 2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
  public          | even_numbers
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP SEQUENCE even_numbers;
~~~

{% include_cached copy-clipboard.html %}
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
- [`SHOW SEQUENCES`](show-sequences.html)
- [Functions and Operators](functions-and-operators.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
