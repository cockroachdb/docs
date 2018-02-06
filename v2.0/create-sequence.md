---
title: CREATE SEQUENCE
summary:
toc: false
---

<span class="version-tag">New in v2.0:</span> The `CREATE SEQUENCE` [statement](sql-statements.html) creates a new sequence in a database. Use a sequence to auto-increment integers in a table.

<div id="toc"></div>

## Considerations

- Using a sequence is slower than [auto-generating unique IDs with the `UUID`, `BYTES`, or `SERIAL` data type](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb). Incrementing a sequence requires a write to persistent storage, whereas auto-generating a unique ID does not. Therefore, use auto-generated unique IDs unless an incremental sequence is preferred or required.
- A column that uses a sequence can have a gap in the sequence values if a transaction advances the sequence and is then rolled back. Sequence updates are committed immediately and aren't rolled back along with their containing transaction. This is done to avoid blocking concurrent transactions that use the same sequence.

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database.

## Synopsis

<section>{% include sql/{{ page.version.version }}/diagrams/create_sequence.html %}</section>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|------------
`seq_name` | The name of the sequence to be created, which must be unique within its database and follow the [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.seq_name`.
`INCREMENT` | The value by which the sequence is incremented. A negative number creates a descending sequence. A positive number creates an ascending sequence.<br><br>**Default:** `1`
`MINVALUE` | The minimum value of the sequence. Default values apply if not specified or if you enter `NO MINVALUE`.<br><br>**Default for ascending:** `1` <br><br>**Default for descending:** `MININT`
`MAXVALUE` | The maximum value of the sequence. Default values apply if not specified or if you enter `NO MAXVALUE`.<br><br>**Default for ascending:** `MAXINT` <br><br>**Default for descending:** `-1`
`START` | The first value of the sequence. <br><br>**Default for ascending:** `1` <br><br>**Default for descending:** `-1`
`CYCLE` / `NO CYCLE` | Not yet implemented. The sequence will wrap around when the sequence value hits the maximum or minimum value. Currently, all sequences are set to `NO CYCLE` and the sequence will not wrap.

## Sequence Functions

We support the following [SQL sequence functions](functions-and-operators.html):

- `nextval('seq_name')`
- `currval('seq_name')`
- `lastval()`
- `setval('seq_name', value, is_called)`

## Examples

### List All Sequences

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

### Create a Sequence with Default Settings

In this example, we create a sequence with default settings.

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE customer_seq;
~~~

{% include copy-clipboard.html %}
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

### Create a Sequence with User-Defined Settings

In this example, we create a sequence that starts at -1 and descends in increments of 2.

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE desc_customer_list START -1 INCREMENT -2;
~~~

{% include copy-clipboard.html %}
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

### Create a Table with a Sequence

In this example, we create a table using the sequence we created in the first example as the table's primary key.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customer_list (
    id INT PRIMARY KEY DEFAULT nextval('customer_seq'),
    customer string,
    address string
  );
~~~

Insert a few records to see the sequence.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customer_list (customer, address)
  VALUES
    ('Lauren', '123 Main Street'),
    ('Jesse', '456 Broad Ave'),
    ('Amruta', '9876 Green Parkway');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customer_list;
~~~
~~~
+----+----------+--------------------+
| id | customer |      address       |
+----+----------+--------------------+
|  1 | Lauren   | 123 Main Street    |
|  2 | Jesse    | 456 Broad Ave      |
|  3 | Amruta   | 9876 Green Parkway |
+----+----------+--------------------+
~~~

### View the Current Value of a Sequence

To view the current value without incrementing the sequence, use:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customer_seq;
~~~
~~~
+------------+---------+-----------+
| last_value | log_cnt | is_called |
+------------+---------+-----------+
|          3 |       0 |   true    |
+------------+---------+-----------+
~~~

{{site.data.alerts.callout_info}}The <code>log_cnt</code> and <code>is_called</code> columns are returned only for PostgreSQL compatibility; they are not stored in the database.{{site.data.alerts.end}}

If a value has been obtained from the sequence in the current session, you can also use the `currval('seq_name')` function to get that most recently obtained value:

~~~ sql
> SELECT currval('customer_seq');
~~~
~~~
+---------+
| currval |
+---------+
|       3 |
+---------+
~~~

## See Also
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`RENAME SEQUENCE`](rename-sequence.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [Functions and Operators](functions-and-operators.html)
- [Other SQL Statements](sql-statements.html)
