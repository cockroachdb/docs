---
title: SERIAL
summary: The SERIAL data type defaults to a unique 64-bit signed integer that is the combination of the insert timestamp and the ID of the node.
toc: false
---

The `SERIAL` [data type](data-types.html) is a column data type which
generates new integer values on each default insert. The default value
is the combination of the insert timestamp and the ID of the node
executing the insert. This combination is guaranteed to be globally
unique. Also, because value generation does not require talking to
other nodes, it is much faster than sequentially auto-incrementing a
value, which requires distributed coordination.

{{site.data.alerts.callout_info}}
This data type is **experimental**. We believe it is a better solution
than PostgeSQL's `SERIAL` and MySQL's `AUTO_INCREMENT`> types, both of
which auto-increment integers but not necessarily in a strictly
sequential fashion (see the
[Auto-Incrementing Is Not Always Sequential](#auto-incrementing-is-not-always-sequential)
example below). However, if you find that this feature is incompatible
with your application, please [open an
issue](https://github.com/cockroachdb/cockroach/issues) or [chat
with us on Gitter](https://gitter.im/cockroachdb/cockroach).
{{site.data.alerts.end}}

<div id="toc"></div>

## Aliases

The `SERIAL` type is equivalent to [`INT DEFAULT unique_rowid()`](int.html).

In CockroachDB, the following are aliases for `SERIAL`:

- `SMALLSERIAL`
- `BIGSERIAL`

## Syntax

Any `INT` value is a valid `SERIAL` value; in particular constant
`SERIAL` values can be expressed using
[numeric literals](sql-constants.html#numeric-literals).

## Size

[Same as `INT`](int.html#size).

## Examples

### Use `SERIAL` to Auto-Generate Primary Keys

In this example, we create a table with the `SERIAL` column as the `PRIMARY KEY` so we can auto-generate unique IDs on insert.

~~~ sql
> CREATE TABLE serial (a SERIAL PRIMARY KEY, b STRING(30), c BOOL);
~~~

The [`SHOW COLUMNS`](show-columns.html) statement shows that the `SERIAL` type is just an alias for `INT` with `unique_rowid()` as the default.

~~~ sql
> SHOW COLUMNS FROM serial;
~~~
~~~
+-------+------------+-------+----------------+
| Field |    Type    | Null  |    Default     |
+-------+------------+-------+----------------+
| a     | INT        | false | unique_rowid() |
| b     | STRING(30) | true  | NULL           |
| c     | BOOL       | true  | NULL           |
+-------+------------+-------+----------------+
~~~

When we insert rows without values in column `a` and display the new
rows, we see that each row has defaulted to a unique value in column
`a`.

~~~ sql
> INSERT INTO serial (b,c) VALUES ('red', true), ('yellow', false), ('pink', true);
> INSERT INTO serial (a,b,c) VALUES (123, 'white', false);
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

### Auto-Incrementing Is Not Always Sequential

It's a common misconception that the auto-incrementing types in PostgreSQL and MySQL generate strictly sequential values. In fact, each insert increases the sequence by one, even when the insert is not commited. This means that auto-incrementing types may leave gaps in a sequence.

To experience this for yourself, run through the following example in PostgreSQL:

1. Create a table with a `SERIAL` column.

   ~~~ sql
   > CREATE TABLE increment (a SERIAL PRIMARY KEY);
   ~~~

2. Run four transactions for inserting rows.

   ~~~ sql
   > BEGIN; INSERT INTO increment DEFAULT VALUES; ROLLBACK;
   > BEGIN; INSERT INTO increment DEFAULT VALUES; COMMIT;
   > BEGIN; INSERT INTO increment DEFAULT VALUES; ROLLBACK;
   > BEGIN; INSERT INTO increment DEFAULT VALUES; COMMIT;
   ~~~

3. View the rows created.

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

   Since each insert increased the sequence in column `a` by one, the first commited insert got the value `2`, and the second commited insert got the value `4`. As you can see, the values aren't strictly sequential, and the last value doesn't give an accurate count of rows in the table.

In summary, the `SERIAL` type in PostgreSQL and CockroachDB, and the `AUTO_INCREMENT` type in MySQL, all behave the same in that they do not create strict sequences. CockroachDB will likely create more gaps than these other databases, but will generate these values much faster.

## Supported Casting & Conversion

[Values of type `SERIAL` can be converted to other types like any `INT` values](int.html#supported-casting--conversion).

## See Also

[Data Types](data-types.html)
