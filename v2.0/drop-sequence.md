---
title: DROP SEQUENCE
summary:
toc: false
---

<span class="version-tag">New in v2.0:</span> The `DROP SEQUENCE` [statement](sql-statements.html) removes a sequence from a database.

<div id="toc"></div>

## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the specified sequence(s).

## Synopsis

<section>{% include sql/{{ page.version.version }}/diagrams/drop_sequence.html %}</section>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|------------
`IF EXISTS` |  Drop the sequence only if it exists; if it does not exist, do not return an error.
`sequence_name` | The name of the sequence you want to drop. Find the sequence name with `SHOW CREATE TABLE` on the table that uses the sequence.
`RESTRICT` | _(Default)_ Do not drop the sequence if any objects (such as [constraints](constraints.html) and tables) depend on it.
`CASCADE` | Not yet implemented. Currently, you can only drop a sequence if nothing depends on it.

<!-- `CASCADE` > Drop all objects (such as [constraints](constraints.html) and tables) that depend on the sequence.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously. -->

## Examples

### Remove a Sequence (No Dependents)

In this example, other objects do not depend on the sequence being dropped.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.sequences;
~~~
~~~
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| sequence_catalog | sequence_schema |   sequence_name    | data_type | numeric_precision | numeric_precision_radix | numeric_scale | start_value |    minimum_value     |    maximum_value    | increment | cycle_option |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| def              | db_2            | test_4             | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
| def              | test_db         | customer_seq       | INT       |                64 |                       2 |             0 |         101 |                    1 | 9223372036854775807 |         2 | NO           |
| def              | test_db         | desc_customer_list | INT       |                64 |                       2 |             0 |        1000 | -9223372036854775808 |                  -1 |        -2 | NO           |
| def              | test_db         | test_sequence3     | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
(4 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> DROP SEQUENCE customer_seq;
~~~
~~~
DROP SEQUENCE
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.sequences
~~~
~~~
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| sequence_catalog | sequence_schema |   sequence_name    | data_type | numeric_precision | numeric_precision_radix | numeric_scale | start_value |    minimum_value     |    maximum_value    | increment | cycle_option |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| def              | db_2            | test_4             | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
| def              | test_db         | desc_customer_list | INT       |                64 |                       2 |             0 |        1000 | -9223372036854775808 |                  -1 |        -2 | NO           |
| def              | test_db         | test_sequence3     | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
(4 rows)
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

## See Also
- [`CREATE SEQUENCE`](create-sequence.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`RENAME SEQUENCE`](rename-sequence.html)
- [Functions and Operators](functions-and-operators.html)
- [Other SQL Statements](sql-statements.html)
