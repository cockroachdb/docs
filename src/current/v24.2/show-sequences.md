---
title: SHOW SEQUENCES
summary: The SHOW SEQUENCES statement lists the sequences in a database.
toc: true
docs_area: reference.sql
---

The `SHOW SEQUENCES` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists all sequences in a database.

## Required privileges

No [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) are required to list the sequences in a database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_sequences.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to list sequences. When omitted, the sequences in the [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database) are listed.

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

- [`CREATE SEQUENCE`]({% link {{ page.version.version }}/create-sequence.md %})
- [`DROP SEQUENCE`]({% link {{ page.version.version }}/drop-sequence.md %})
- [`ALTER SEQUENCE`]({% link {{ page.version.version }}/alter-sequence.md %})
