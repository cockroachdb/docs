---
title: SERIAL
summary: The SERIAL data type defaults to a unique 64-bit integer that is the combination of the insert timestamp and the ID of the node.
toc: true
---

The `SERIAL` [data type](data-types.html) is a column data type that, on insert, generates a 64-bit integer from the timestamp and ID of the node executing the insert. This combination is likely to be globally unique except in extreme cases (see this [example](create-table.html#create-a-table-with-auto-generated-unique-row-ids) for more details). Also, because value generation does not require talking to other nodes, it is much faster than sequentially auto-incrementing a value, which requires distributed coordination.

{{site.data.alerts.callout_info}}
In most cases, we recommend using the [`UUID`](uuid.html) data type with the `gen_random_uuid()` function as the default value, which generates 128-bit values (much larger than `SERIAL`'s 64-bit) and scatters them across all of a table's underlying key-value ranges, ensuring that multiple nodes share in the load. See [Create a table with auto-generated unique row IDs](uuid.html#create-a-table-with-auto-generated-unique-row-ids) for more details.
{{site.data.alerts.end}}


## Aliases

The `SERIAL` type is equivalent to [`INT DEFAULT unique_rowid()`](int.html).

In CockroachDB, the following are aliases for `SERIAL`:

- `SERIAL2`
- `SERIAL4`
- `SERIAL8`
- `SMALLSERIAL`
- `BIGSERIAL`

{{site.data.alerts.callout_danger}}
`SERIAL2` and `SERIAL4` are the same as `SERIAL` and store 8-byte values, not 2- or 4-byte values as their names might suggest.
{{site.data.alerts.end}}

## Syntax

Any `INT` value is a valid `SERIAL` value; in particular constant `SERIAL` values can be expressed using [numeric literals](sql-constants.html#numeric-literals).

## Size

[Same as `INT`](int.html#size).

## Examples

### Use `SERIAL` to auto-generate primary keys

In this example, we create a table with the `SERIAL` column as the primary key so we can auto-generate unique IDs on insert.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE serial (a SERIAL PRIMARY KEY, b STRING, c BOOL);
~~~

The [`SHOW COLUMNS`](show-columns.html) statement shows that the `SERIAL` type is just an alias for `INT` with `unique_rowid()` as the default.

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM serial;
~~~

~~~
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| column_name | data_type | is_nullable | column_default | generation_expression |   indices   |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| a           | INT       |    false    | unique_rowid() |                       | {"primary"} |
| b           | STRING    |    true     | NULL           |                       | {}          |
| c           | BOOL      |    true     | NULL           |                       | {}          |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
(3 rows)
~~~

When we insert rows without values in column `a` and display the new rows, we see that each row has defaulted to a unique value in column `a`.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO serial (b,c) VALUES ('red', true), ('yellow', false), ('pink', true);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO serial (a,b,c) VALUES (123, 'white', false);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM serial;
~~~

~~~
+--------------------+--------+-------+
|         a          |   b    |   c   |
+--------------------+--------+-------+
| 148656994422095873 | red    | true  |
| 148656994422161409 | yellow | false |
| 148656994422194177 | pink   | true  |
|                123 | white  | false |
+--------------------+--------+-------+
~~~

### Auto-incrementing is not always sequential

It's a common misconception that the auto-incrementing types in PostgreSQL and MySQL generate strictly sequential values. However, there can be gaps and the order is not completely guaranteed:

- Each insert increases the sequence by one, even when the insert is not committed. This means that auto-incrementing types may leave gaps in a sequence.
- Two concurrent transactions can commit in a different order than their use of sequences, and thus "observe" the values to decrease relative to each other. This effect is amplified by automatic transaction retries.

These are fundamental properties of a transactional systems with non-transactional sequences. PostgreSQL, MySQL, and CockroachDB do not increase sequences transactionally with other SQL statements, so these effects can happen in any case.

To experience this for yourself, run through the following example in PostgreSQL:

1. Create a table with a `SERIAL` column:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE increment (a SERIAL PRIMARY KEY);
    ~~~

2. Run four transactions for inserting rows:

    {% include copy-clipboard.html %}
    ~~~ sql
    > BEGIN; INSERT INTO increment DEFAULT VALUES; ROLLBACK;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > BEGIN; INSERT INTO increment DEFAULT VALUES; COMMIT;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > BEGIN; INSERT INTO increment DEFAULT VALUES; ROLLBACK;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > BEGIN; INSERT INTO increment DEFAULT VALUES; COMMIT;
    ~~~

3. View the rows created:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * from increment;
    ~~~

    ~~~
    +---+
    | a |
    +---+
    | 2 |
    | 4 |
    +---+
    ~~~

    Since each insert increased the sequence in column `a` by one, the first committed insert got the value `2`, and the second committed insert got the value `4`. As you can see, the values aren't strictly sequential, and the last value doesn't give an accurate count of rows in the table.

In summary, the `SERIAL` type in PostgreSQL and CockroachDB, and the `AUTO_INCREMENT` type in MySQL, all behave the same in that they do not create strict sequences. CockroachDB will likely create more gaps than these other databases, but will generate these values much faster. An alternative feature, introduced in v2.0, is the [`SEQUENCE`](create-sequence.html).

#### Additional examples

If two transactions occur concurrently, CockroachDB cannot guarantee monotonically increasing (i.e., first commit is smaller than second commit). Here are three more scenarios that demonstrate this:

Scenario 1:

- At time 1, transaction `T1` `BEGIN`s.
- At time 2, transaction `T2` `BEGIN`s on the same node (from a different client).
- At time 3, transaction `T1` creates a `SERIAL` value, `x`.
- At time 3 + 2 microseconds, txn T2 creates a SERIAL value, `y`.
- At time 4, transaction `T1` `COMMIT`s.
- At time 5, transaction `T2` `COMMIT`s.

If this happens, CockroachDB cannot guarantee whether `x < y` or `x > y`, despite the fact `T1` and `T2` began and were committed in different times. In this particular example, it's even likely that `x = y` because there is less than a 10-microsecond difference and the `SERIAL` values are constructed from the number of microseconds in the current time.

Scenario 2:

- At time 1, transaction `T1` `BEGIN`s.
- At time 1, transaction `T2` `BEGIN`s somewhere else, on a different node.
- At time 2, transaction `T1` creates a SERIAL value, `x`.
- At time 3, transaction `T2` creates a SERIAL value, `y`.
- At time 5, transaction `T1` `COMMIT`s.
- At time 5, transaction `T2` `COMMIT`s.

If this happens, CockroachDB cannot guarantee whether `x < y` or `x > y`. Both can happen, even though the transactions began and committed at the same time. However it's sure that `x != y` because the values were generated on different nodes.

Scenario 3:

- At time 1, transaction `T1` `BEGIN`s.
- At time 3, transaction `T1` creates a `SERIAL` value, `x`.
- At time 4, transaction `T1` `COMMIT`s.
- At time 5, transaction `T2` `BEGIN`s somewhere else, on a different node.
- At time 6, transaction `T2` creates a `SERIAL` value, `y`.
- At time 7, transaction `T2` `COMMIT`s.

There is less than a 250-microsecond difference between the system clocks of the two nodes.

If this happens, CockroachDB cannot again guarantee whether `x < y` or `x > y`. Even though the transactions "clearly" occurred one "after" the other, perhaps there was a clock skew between the two nodes and the system time of the second node is set earlier than the first node.

## Supported casting and conversion

[Values of type `SERIAL` can be converted to other types like any `INT` values](int.html#supported-casting-and-conversion).

## See also

[Data Types](data-types.html)
