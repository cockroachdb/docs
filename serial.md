---
title: SERIAL
summary: The SERIAL data type defaults to a unique 64-bit signed integer that is the combination of the insert timestamp and the ID of the node.
toc: false
---

The `SERIAL` [data type](data-types.html) defaults to a unique 64-bit signed integer. The default value is the combination of the insert timestamp and the ID of the node executing the insert. This combination is guaranteed to be globally unique. Also, because value generation does not require talking to other nodes, it is much faster than sequentially auto-incrementing a value, which requires distributed coordination.

{{site.data.alerts.callout_info}}This data type is <strong>experimental</strong>. We believe it is a better solution than PostgeSQL's <code>SERIAL</code> and MySQL's <code>AUTO_INCREMENT</code> types, both of which auto-increment integers but not necessarily in a strictly sequential fashion (see the <a href="#auto-incrementing-is-not-always-sequential">Auto-Incrementing Is Not Always Sequential</a> example below). However, if you find that this feature is incompatible with your application, please <a href="https://github.com/cockroachdb/cockroach/issues">open an issue</a> or <a href="https://gitter.im/cockroachdb/cockroach">chat with us on Gitter</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Aliases

The `SERIAL` type is equivalent to [`INT DEFAULT unique_rowid()`](int.html).

In CockroachDB, the following are aliases for `SERIAL`:

- `SMALLSERIAL`
- `BIGSERIAL`

## Format

The `SERIAL` type is generally used to default to a unique ID. When inserting into a `SERIAL` column, you therefore do not manually specify a value. 

## Size

A `SERIAL` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. 

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

When we insert 3 rows without values in column `a` and return the new rows, we see that each row has defaulted to a unique value in column `a`. 

~~~ sql
> INSERT INTO serial (b,c) VALUES ('red', true), ('yellow', false), ('pink', true) RETURNING *;
~~~
~~~
+--------------------+--------+-------+
|         a          |   b    |   c   |
+--------------------+--------+-------+
| 148656994422095873 | red    | true  |
| 148656994422161409 | yellow | false |
| 148656994422194177 | pink   | true  |
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


## See Also

[Data Types](data-types.html)