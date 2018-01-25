---
title: SHOW CREATE SEQUENCE
summary: The SHOW CREATE SEQUENCE statement shows the CREATE SEQUENCE statement that would create a copy of the specified sequence.
toc: false
---

The `SHOW CREATE SEQUENCE` [statement](sql-statements.html) shows the `CREATE SEQUENCE` statement that would create a copy of the specified table.

<div id="toc"></div>

## Required Privileges

The user must have any [privilege](privileges.html) on the target sequence.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/show_create_sequence.html %}

## Parameters

Parameter | Description
----------|------------
`sequence_name` | The name of the sequence for which to show the `CREATE SEQUENCE` statement.

## Response

Field | Description
------|------------
`Sequence` | The name of the table.
`CreateSequence` | The [`CREATE SEQUENCE`](create-sequence.html) statement for creating a copy of the specified sequence.

## Example

~~~ sql
> CREATE SEQUENCE customer_seq;
~~~


~~~ sql
> CREATE SEQUENCE desc_customer_list START -1 INCREMENT -2;
~~~

~~~ sql
> SHOW CREATE SEQUENCE customer_seq;
~~~

~~~
+--------------+------------------------------------------------------------------------------------------+
|   Sequence   |                                      CreateSequence                                      |
+--------------+------------------------------------------------------------------------------------------+
| customer_seq | CREATE SEQUENCE customer_seq MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 1 START 1 |
+--------------+------------------------------------------------------------------------------------------+
~~~

~~~ sql
> SHOW CREATE SEQUENCE desc_customer_list;
~~~

~~~
+--------------------+----------------------------------------------------------------------------------------------------+
|      Sequence      |                                           CreateSequence                                           |
+--------------------+----------------------------------------------------------------------------------------------------+
| desc_customer_list | CREATE SEQUENCE desc_customer_list MINVALUE -9223372036854775808 MAXVALUE -1 INCREMENT -2 START -1 |
+--------------------+----------------------------------------------------------------------------------------------------+
~~~

## See Also

- [`CREATE SEQUENCE`](create-sequence.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
