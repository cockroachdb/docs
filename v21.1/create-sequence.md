---
title: CREATE SEQUENCE
summary:
toc: true
---

The `CREATE SEQUENCE` [statement](sql-statements.html) creates a new sequence in a database. Use a sequence to auto-increment integers in a table.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Considerations

- Using a sequence is slower than [auto-generating unique IDs with the `gen_random_uuid()`, `uuid_v4()` or `unique_rowid()` built-in functions](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb). Incrementing a sequence requires a write to persistent storage, whereas auto-generating a unique ID does not. Therefore, use auto-generated unique IDs unless an incremental sequence is preferred or required.
- A column that uses a sequence can have a gap in the sequence values if a transaction advances the sequence and is then rolled back. Sequence updates are committed immediately and aren't rolled back along with their containing transaction. This is done to avoid blocking concurrent transactions that use the same sequence.
- {% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}
- If a table references a sequence, and the reference explicitly specifies a database name, that [database cannot be renamed](rename-database.html). In this case, you can drop the column in the table that references the sequence, or you can modify the reference so that it does not specify the database name.
-  By default, you cannot create sequences that are [owned by](authorization.html#object-ownership) columns in tables in other databases. You can enable such sequence creation by setting the `sql.cross_db_sequence_owners.enabled` [cluster setting](cluster-settings.html) to `true`.

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/create_sequence.html %}</section>

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
`NO CYCLE` | Currently, all sequences are set to `NO CYCLE` and the sequence will not wrap.
`OWNED BY column_name` | Associates the sequence to a particular column. If that column or its parent table is dropped, the sequence will also be dropped.<br>Specifying an owner column with `OWNED BY` replaces any existing owner column on the sequence. To remove existing column ownership on the sequence and make the column free-standing, specify `OWNED BY NONE`.<br><br>**Default:** `NONE`
`opt_temp` |  Defines the sequence as a session-scoped temporary sequence. For more information, see [Temporary sequences](#temporary-sequences).<br><br>**Support for temporary sequences is [experimental](experimental-features.html#temporary-objects)**.

<!-- CYCLE | Not yet implemented. The sequence will wrap around when the sequence value hits the maximum or minimum value.
`CACHE <seq_value>` | The number of sequence values to allocate in memory for faster access. Currently, you can only `CACHE 1` or leave unspecified.-->

## Sequence functions

We support the following [SQL sequence functions](functions-and-operators.html):

- `nextval('seq_name')`
- `currval('seq_name')`
- `lastval()`
- `setval('seq_name', value, is_called)`

## Temporary sequences

 CockroachDB supports session-scoped temporary sequences. Unlike persistent sequences, temporary sequences can only be accessed from the session in which they were created, and they are dropped at the end of the session. You can create temporary sequences on both persistent tables and [temporary tables](temporary-tables.html).

{{site.data.alerts.callout_danger}}
**This is an experimental feature**. The interface and output are subject to change. For details, see the tracking issue [cockroachdb/cockroach#46260](https://github.com/cockroachdb/cockroach/issues/46260).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Temporary tables must be enabled in order to use temporary sequences. By default, temporary tables are disabled in CockroachDB. To enable temporary tables, set the `experimental_enable_temp_tables` [session variable](set-vars.html) to `on`.
{{site.data.alerts.end}}

### Details

- Temporary sequences are automatically dropped at the end of the session.
- A temporary sequence can only be accessed from the session in which it was created.
- Temporary sequences persist across transactions in the same session.
- Temporary sequences cannot be converted to persistent sequences.

{{site.data.alerts.callout_info}}
Like [temporary tables](temporary-tables.html), temporary sequences are not in the `public` schema. Instead, when you create the first temporary table, view, or sequence for a session, CockroachDB generates a single temporary schema (`pg_temp_<id>`) for all of the temporary objects in the current session for a database.
{{site.data.alerts.end}}

### Usage

To create a temporary sequence, add [`TEMP`/`TEMPORARY`](sql-grammar.html#opt_temp) to a `CREATE SEQUENCE` statement.

For example:

{% include copy-clipboard.html %}
~~~ sql
> SET experimental_enable_temp_tables=on;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TEMP SEQUENCE temp_seq START 1 INCREMENT 1;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE temp_seq;
~~~

~~~
  table_name |                                     create_statement
-------------+--------------------------------------------------------------------------------------------
  temp_seq   | CREATE TEMP SEQUENCE temp_seq MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 1 START 1
(1 row)
~~~

## Examples

### Create a sequence with default settings

In this example, we create a sequence with default settings.

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE customer_seq;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE customer_seq;
~~~

~~~
   table_name  |                                     create_statement
---------------+-------------------------------------------------------------------------------------------
  customer_seq | CREATE SEQUENCE customer_seq MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 1 START 1
(1 row)
~~~

### Create a sequence with user-defined settings

In this example, we create a sequence that starts at -1 and descends in increments of 2.

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE desc_customer_list START -1 INCREMENT -2;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE desc_customer_list;
~~~

~~~
      table_name     |                                          create_statement
---------------------+-----------------------------------------------------------------------------------------------------
  desc_customer_list | CREATE SEQUENCE desc_customer_list MINVALUE -9223372036854775808 MAXVALUE -1 INCREMENT -2 START -1
(1 row)
~~~

### View the current value of a sequence

To view the current value without incrementing the sequence, use:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customer_seq;
~~~

~~~
  last_value | log_cnt | is_called
-------------+---------+------------
           3 |       0 |   true
(1 row)
~~~

{{site.data.alerts.callout_info}}The <code>log_cnt</code> and <code>is_called</code> columns are returned only for PostgreSQL compatibility; they are not stored in the database.{{site.data.alerts.end}}

If a value has been obtained from the sequence in the current session, you can also use the `currval('seq_name')` function to get that most recently obtained value:

~~~ sql
> SELECT currval('customer_seq');
~~~

~~~
  currval
-----------
        3
(1 row)
~~~

### List all sequences

{% include copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES;
~~~

~~~
         sequence_schema        |   sequence_name
--------------------------------+---------------------
  public                        | customer_seq
  public                        | desc_customer_list
  pg_temp_1603124728816183000_1 | temp_seq
(3 rows)
~~~

## See also

- [`ALTER SEQUENCE`](alter-sequence.html)
- [`RENAME SEQUENCE`](rename-sequence.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW SEQUENCES`](show-sequences.html)
- [Functions and Operators](functions-and-operators.html)
- [Other SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
