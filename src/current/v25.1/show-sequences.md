---
title: SHOW SEQUENCES
summary: The SHOW SEQUENCES statement lists the sequences in a database.
toc: true
docs_area: reference.sql
---

The `SHOW SEQUENCES` [statement]({{ page.version.version }}/sql-statements.md) lists all sequences in a database.

## Required privileges

No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to list the sequences in a database.

## Synopsis

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to list sequences. When omitted, the sequences in the [current database]({{ page.version.version }}/sql-name-resolution.md#current-database) are listed.

## Example

~~~ sql
> CREATE SEQUENCE sequence_test;
~~~

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

- [`CREATE SEQUENCE`]({{ page.version.version }}/create-sequence.md)
- [`DROP SEQUENCE`]({{ page.version.version }}/drop-sequence.md)
- [`ALTER SEQUENCE`]({{ page.version.version }}/alter-sequence.md)