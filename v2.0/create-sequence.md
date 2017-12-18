---
title: CREATE SEQUENCE
summary:
toc: false
---

<span class="version-tag">New in v2.0:</span> The `CREATE SEQUENCE` [statement](sql-statements.html) creates a new sequence in a database. Use a sequence to auto-increment integers in a table.

{{site.data.alerts.callout_info}}Using sequences may slow down your application because it does a write to persistent storage. Use the serial data type unless a sequence is preferred or required.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}Sequences can have gaps. To avoid blocking concurrent transactions that use same sequence, transactions cannot be rolled back and values cannot be returned again.{{site.data.alerts.end}}

<div id="toc"></div>

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database.

## Synopsis

~~~
CREATE SEQUENCE <seqname>
  [INCREMENT <increment>]
  [MINVALUE <minvalue> | NO MINVALUE]
  [MAXVALUE <maxvalue> | NO MAXVALUE]
  [START <start>]
  [[NO] CYCLE]
~~~

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|------------
`seqname` | The name of the sequence to create, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.
`INCREMENT` | The value by which the sequence is incremented. A negative number creates a descending sequence. A positive number creates an ascending sequence.<br><br>**Default:** `1`
`MINVALUE` | The minimum value of the sequence. Default values apply if not specified or if you enter `NO MINVALUE`.<br><br>**Default for ascending:** `1` <br><br>**Default for descending:** `MININT`
`MAXVALUE` | The maximum value of the sequence. Default values apply if not specified or if you enter `NO MAXVALUE`.<br><br>**Default for ascending:** `MAXINT` <br><br>**Default for descending:** `-1`
`START` | The first value of the sequence. <br><br>**Default for ascending:** `1` <br><br>**Default for descending:** `-1`
`CYCLE` | The sequence will wrap around when the sequence value hits the maximum or minimum value. If `NO CYCLE` is set, the sequence will not wrap. <br><br>**Default:** `NO CYCLE`

## Sequence Functions

We support the following [SQL sequence functions](/functions-and-operators.html#sequence-functions):

- `nextval('seqname')`
- `currval('seqname')`
- `lastval()`
- `setval('seqname', value, is_called)`

## Examples

### Create a Sequence with Default Settings

In this example, we create a sequence with default settings.

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE customer_seq;
~~~

### Create a Sequence with User-Defined Settings

In this example, we create a sequence that starts at 1000 and descends in increments of 2.

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE desc_customer_list START 1000 INCREMENT -2;
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
> INSERT INTO customer_list (customer, address) VALUES ('Lauren', '123 Main Street'), ('Jesse', '456 Broad Ave'), ('Amruta', '9876 Green Parkway');
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
> SELECT currval('customer_seq');
~~~
~~~
+-------------------------+
| currval('customer_seq') |
+-------------------------+
|                       3 |
+-------------------------+
~~~


## See Also
- [ALTER SEQUENCE](alter-sequence.html)
- [DROP SEQUENCE](drop-sequence.html)
- [Functions and Operators](functions-and-operators.html)
