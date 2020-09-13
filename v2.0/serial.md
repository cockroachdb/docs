---
title: SERIAL
summary: The SERIAL pseudo-type produces integer values automatically.
toc: true
---

The `SERIAL` pseudo [data type](data-types.html) is a keyword that can
be used *in lieu* of a real data type when defining table columns. It
is approximately equivalent to using an [integer type](int.html) with
a [`DEFAULT` expression](default-value.html) that generates different
values every time it is evaluated. This default expression in turn
ensures that inserts that do not specify this column will receive an
automatically generated value instead of `NULL`.

{{site.data.alerts.callout_info}}
`SERIAL` is provided only for compatibility with PostgreSQL. New applications should use real data types and a suitable `DEFAULT` expression.

In most cases, we recommend using the [`UUID`](uuid.html) data type with the `gen_random_uuid()` function as the default value, which generates 128-bit values (larger than `SERIAL`'s maximum of 64 bits) and more uniformly scatters them across all of a table's underlying key-value ranges. UUIDs ensure more effectively that multiple nodes share the insert load when a UUID column is used in an index or primary key.

See [this FAQ entry](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb) for more details.
{{site.data.alerts.end}}

## Behavior

The keyword `SERIAL` is recognized in `CREATE TABLE` and is
automatically translated to a real data type and a [`DEFAULT`
expression](default-value.html) using `unique_rowid()` during table
creation.

The result of this translation is then used internally by CockroachDB,
and can be observed using [`SHOW CREATE TABLE`](show-create-table.html).

The chosen `DEFAULT` expression ensures that different values are
automatically generated for the column during row insertion.  These
are not guaranteed to increase monotonically, see [this section
below](#auto-incrementing-is-not-always-sequential) for details.

{{site.data.alerts.callout_info}}
The particular choice of `DEFAULT` expression when clients use the
`SERIAL` keyword is subject to change in future versions of
CockroachDB. Applications that wish to use `unique_rowid()`
specifically must use the full explicit syntax `INT DEFAULT
unique_rowid()` and avoid `SERIAL` altogether.
{{site.data.alerts.end}}

For compatibility with PostgreSQL, CockroachDB recognizes the following keywords as aliases to `SERIAL`:

- `SERIAL2`
- `SERIAL4`
- `SERIAL8`
- `SMALLSERIAL`
- `BIGSERIAL`

{{site.data.alerts.callout_danger}}
`SERIAL2` and `SERIAL4` are the same as `SERIAL` and store 8-byte values, not 2- or 4-byte values as their names might suggest.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
This behavior is updated in CockroachDB v2.1.
{{site.data.alerts.end}}

### Automatically generated values

The default expression `unique_rowid()` produces a 64-bit integer from
the current timestamp and ID of the node executing the
[`INSERT`](insert.html) or [`UPSERT`](upsert.html) operation.
This behavior is statistically likely to be globally unique except in
extreme cases (see [this FAQ
entry](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb)
for more details).

Also, because value generation using `unique_rowid()` does not require
inter-node coordination, its performance scales unimpeded when
multiple SQL clients are writing to the table from different nodes.

## Examples

### Use `SERIAL` to Auto-Generate Primary Keys

In this example, we create a table with the `SERIAL` column as the primary key so we can auto-generate unique IDs on insert.

~~~ sql
> CREATE TABLE serial (a SERIAL PRIMARY KEY, b STRING, c BOOL);
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
| b     | STRING     | true  | NULL           |
| c     | BOOL       | true  | NULL           |
+-------+------------+-------+----------------+
~~~

When we insert rows without values in column `a` and display the new rows, we see that each row has defaulted to a unique value in column `a`.

~~~ sql
> INSERT INTO serial (b,c) VALUES ('red', true), ('yellow', false), ('pink', true);
> INSERT INTO serial (a,b,c) VALUES (123, 'white', false);
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

## Auto-Incrementing Is Not Always Sequential

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


## See also

- [FAQ: How do I auto-generate unique row IDs in CockroachDB?](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb)
- [Data Types](data-types.html)
