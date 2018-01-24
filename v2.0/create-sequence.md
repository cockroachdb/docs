---
title: CREATE SEQUENCE
summary:
toc: false
---

<span class="version-tag">New in v2.0:</span> The `CREATE SEQUENCE` [statement](sql-statements.html) creates a new sequence in a database. Use a sequence to auto-increment integers in a table.

<div id="toc"></div>

## Considerations

- Using a sequence is slower than using the `SERIAL` data type – incrementing a sequence requires a write to persistent storage, whereas generating a new `SERIAL`value does not. Use the `SERIAL` data type unless a sequence is preferred or required.
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
`seq_name` | The name of the sequence to be created, which must be unique within its database and follow the [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.
`INCREMENT` | The value by which the sequence is incremented. A negative number creates a descending sequence. A positive number creates an ascending sequence.<br><br>**Default:** `1`
`MINVALUE` | The minimum value of the sequence. Default values apply if not specified or if you enter `NO MINVALUE`.<br><br>**Default for ascending:** `1` <br><br>**Default for descending:** `MININT`
`MAXVALUE` | The maximum value of the sequence. Default values apply if not specified or if you enter `NO MAXVALUE`.<br><br>**Default for ascending:** `MAXINT` <br><br>**Default for descending:** `-1`
`START` | The first value of the sequence. <br><br>**Default for ascending:** `1` <br><br>**Default for descending:** `-1`
`CYCLE` / `NO CYCLE` | Not yet implemented. The sequence will wrap around when the sequence value hits the maximum or minimum value. Currently, all sequences are set to `NO CYCLE` and the sequence will not wrap.

## Sequence Functions

We support the following [SQL sequence functions](functions-and-operators.html):

- `nextval('sequence_name')`
- `currval('sequence_name')`
- `lastval()`
- `setval('sequence_name', value, is_called)`

## Examples

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

## See Also
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [Functions and Operators](functions-and-operators.html)
