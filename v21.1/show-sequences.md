---
title: SHOW SEQUENCES
summary: The SHOW SEQUENCES statement lists the sequences in a database.
toc: true
---

The `SHOW SEQUENCES` [statement](sql-statements.html) lists all sequences in a database.

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to list the sequences in a database.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/show_sequences.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to list sequences. When omitted, the sequences in the [current database](sql-name-resolution.html#current-database) are listed.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE sequence_test;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
  public          | sequence_test
(1 row)
~~~

## See also

- [`CREATE SEQUENCE`](create-sequence.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
