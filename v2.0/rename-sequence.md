---
title: RENAME SEQUENCE
summary: The RENAME SEQUENCE statement changes the name of a sequence.
toc: false
---

<span class="version-tag">New in v2.0:</span> The `RENAME SEQUENCE` [statement](sql-statements.html) changes the name of a sequence.

{{site.data.alerts.callout_danger}}If you rename a sequence that's being used in a table, the change will not propagate to the <code>DEFAULT</code> expressions that reference the sequence. {{site.data.alerts.end}}

{{site.data.alerts.callout_info}}To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see <a href="https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/">Online Schema Changes in CockroachDB</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database.

## Synopsis

<section>{% include sql/{{ page.version.version }}/diagrams/rename_sequence.html %}</section>

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

In this example, we will change the name of sequence `customer_seq` to `customer_number`.

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
> ALTER SEQUENCE test_db.customer_seq RENAME TO test_db.customer_number;
~~~
~~~
RENAME SEQUENCE
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.sequences;
~~~
~~~
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| sequence_catalog | sequence_schema |   sequence_name    | data_type | numeric_precision | numeric_precision_radix | numeric_scale | start_value |    minimum_value     |    maximum_value    | increment | cycle_option |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| def              | db_2            | test_4             | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
| def              | test_db         | customer_number    | INT       |                64 |                       2 |             0 |         101 |                    1 | 9223372036854775807 |         2 | NO           |
| def              | test_db         | desc_customer_list | INT       |                64 |                       2 |             0 |        1000 | -9223372036854775808 |                  -1 |        -2 | NO           |
| def              | test_db         | test_sequence3     | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
(4 rows)
~~~

### Move a Sequence

In this example, we will move the sequence we renamed in the first example (`customer_number`) to a different database.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.sequences;
~~~
~~~
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| sequence_catalog | sequence_schema |   sequence_name    | data_type | numeric_precision | numeric_precision_radix | numeric_scale | start_value |    minimum_value     |    maximum_value    | increment | cycle_option |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| def              | db_2            | test_4             | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
| def              | test_db         | customer_number    | INT       |                64 |                       2 |             0 |         101 |                    1 | 9223372036854775807 |         2 | NO           |
| def              | test_db         | desc_customer_list | INT       |                64 |                       2 |             0 |        1000 | -9223372036854775808 |                  -1 |        -2 | NO           |
| def              | test_db         | test_sequence3     | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
(4 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER SEQUENCE test_db.customer_number RENAME TO db_2.customer_number;
~~~
~~~
RENAME SEQUENCE
~~~
~~~ sql
> SELECT * FROM information_schema.sequences;
~~~
~~~
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| sequence_catalog | sequence_schema |   sequence_name    | data_type | numeric_precision | numeric_precision_radix | numeric_scale | start_value |    minimum_value     |    maximum_value    | increment | cycle_option |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
| def              | db_2            | test_4             | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
| def              | db_2            | customer_number    | INT       |                64 |                       2 |             0 |         101 |                    1 | 9223372036854775807 |         2 | NO           |
| def              | test_db         | desc_customer_list | INT       |                64 |                       2 |             0 |        1000 | -9223372036854775808 |                  -1 |        -2 | NO           |
| def              | test_db         | test_sequence3     | INT       |                64 |                       2 |             0 |           1 |                    1 | 9223372036854775807 |         1 | NO           |
+------------------+-----------------+--------------------+-----------+-------------------+-------------------------+---------------+-------------+----------------------+---------------------+-----------+--------------+
(4 rows)
~~~

## See Also

- [`CREATE SEQUENCE`](create-sequence.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [Functions and Operators](functions-and-operators.html)
