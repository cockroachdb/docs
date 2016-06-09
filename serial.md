---
title: SERIAL
toc: false
---

The `SERIAL` [data type](data-types.html) stores 64-bit signed integers and  defaults to a unique value per row. A `SERIAL` column is therefore the same as an [`INT`](int.html) column with the `unique_rowid()` function as the default. 

The default value for a `SERIAL` column is the combination of the insert timestamp and the ID of the node executing the insert. This combination is guaranteed to be globally unique, and because value generation does not require talking to other nodes, it is much faster than sequentially auto-incrementing a value, which requires distributed coordination.

{{site.data.alerts.callout_info}}This data type is <strong>experimental</strong>. We believe it is a better solution than PostgeSQL's <code>SERIAL</code> and MySQL's <code>AUTO_INCREMENT</code> types, both of which auto-increment integers but not necessarily in a strictly sequential fashion (see the <a href="#auto-incrementing-is-not-always-sequential">Auto-Incrementing Is Not Always Sequential</a> example below). However, if you find that this feature is incompatible with your application, please <a href="https://github.com/cockroachdb/cockroach/issues">open an issue</a> or <a href="https://gitter.im/cockroachdb/cockroach">chat with us on Gitter</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Format

When inserting into an `SERIAL` column, format the value as a numeric literal, e.g.,  `12345`. 

## Size

A `SERIAL` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. 

## Examples

### Use `SERIAL` to Auto-Generate Primary Keys

In this example, we create a table with the `SERIAL` column as the `PRIMARY KEY` so we can auto-generate unique IDs on insert.

~~~
> CREATE TABLE serial (a SERIAL PRIMARY KEY, b STRING(30), c BOOL);
CREATE TABLE
~~~

The [`SHOW COLUMNS`](show-columns.html) statement shows that the `SERIAL` type is just an alias for `INT` with `unique_rowid()` as the default. 

~~~
> SHOW COLUMNS FROM serial;
+-------+------------+-------+----------------+
| Field |    Type    | Null  |    Default     |
+-------+------------+-------+----------------+
| a     | INT        | false | unique_rowid() |
| b     | STRING(30) | true  | NULL           |
| c     | BOOL       | true  | NULL           |
+-------+------------+-------+----------------+
~~~

When we insert 3 rows without column `a` values and return the new rows, we see that each row has defaulted to a unique value in column `a`. 

~~~
> INSERT INTO serial (b,c) VALUES ('red', true), ('yellow', false), ('pink', true) RETURNING *;
+--------------------+--------+-------+
|         a          |   b    |   c   |
+--------------------+--------+-------+
| 148656994422095873 | red    | true  |
| 148656994422161409 | yellow | false |
| 148656994422194177 | pink   | true  |
+--------------------+--------+-------+
~~~

Of course, we can explicitly insert an integer value into the `SERIAL` column as long as it meets the unique and non-null constraints.

~~~
> INSERT INTO serial VALUES (12345, 'orange', false) RETURNING *;
+--------------------+--------+-------+
|         a          |   b    |   c   |
+--------------------+--------+-------+
|              12345 | orange | false |
| 148656994422095873 | red    | true  |
| 148656994422161409 | yellow | false |
| 148656994422194177 | pink   | true  |
+--------------------+--------+-------+
~~~

### Auto-Incrementing Is Not Always Sequential

Some people assume that the auto-incrementing types in PostgreSQL and MySQL generate strictly sequential values that provide an accurate count of rows in a table. In fact, each insert increases the sequence by one, even when the insert is not commited. This means that these auto-incrementing types may leave gaps in a sequence. 

To demonstrate this possibility, we create a table and treat the `INT` column like an auto-incrementing column in PostgreSQL or MySQL. 

~~~
> CREATE TABLE increment (a INT PRIMARY KEY, b TIMESTAMP DEFAULT now());
CREATE TABLE
~~~ 

We then run four transactions for inserting rows. 

~~~
> BEGIN; INSERT INTO increment (a) VALUES (1); ROLLBACK;
ROLLBACK

> BEGIN; INSERT INTO increment (a) VALUES (2); COMMIT;
COMMIT

> BEGIN; INSERT INTO increment (a) VALUES (3); ROLLBACK;
ROLLBACK

> BEGIN; INSERT INTO increment (a) VALUES (4); COMMIT;
COMMIT
~~~ 

Since each insert increases the sequence in column `a` by one, the first commited insert gets the value 2, and the second commited insert gets the value 4. Therefore, as we see in the `SELECT` results below, column `a` values aren't strictly sequential and the last value doesn't give an accurate count of rows in the table.

~~~
> SELECT * from increment;
+---+----------------------------------------+
| a |                   b                    |
+---+----------------------------------------+
| 2 | 2016-06-09 03:07:24.051212 +0000 +0000 |
| 4 | 2016-06-09 03:07:28.563259 +0000 +0000 |
+---+----------------------------------------+
~~~

## See Also

[Data Types](data-types.html)