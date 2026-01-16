---
title: CREATE SEQUENCE
summary: The CREATE SEQUENCE statement creates a new sequence in a database. Use a sequence to auto-increment integers in a table.
toc: true
docs_area: reference.sql
---

The `CREATE SEQUENCE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) creates a new sequence in a database. Use a sequence to auto-increment integers in a table.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Considerations

- Using a sequence is slower than [auto-generating unique IDs with the `gen_random_uuid()`, `uuid_v4()`, or `unique_rowid()` built-in functions]({% link {{ page.version.version }}/sql-faqs.md %}#how-do-i-auto-generate-unique-row-ids-in-cockroachdb) and is likely to cause performance problems due to [hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}). Incrementing a sequence requires a write to persistent storage. In CockroachDB, all writes are [replicated and must reach a write quorum]({% link {{ page.version.version }}/architecture/replication-layer.md %}). In [multi-region deployments]({% link {{ page.version.version }}/multiregion-overview.md %}), replicated writes can add cross-region latency (for example, in a [region survival]({% link {{ page.version.version }}/multiregion-survival-goals.md %}) configuration) and become a throughput bottleneck for write-heavy workloads. [Cached sequences](#per-node-cache) can reduce the frequency of these writes, though gaps in sequence values may occur if cached values are lost. Auto-generating a unique ID does not require a replicated write. Therefore, use auto-generated unique IDs unless an incremental sequence is preferred or required. For more information, refer to [Unique ID best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#unique-id-best-practices).
- A column that uses a sequence can have a gap in the sequence values if a transaction advances the sequence and is then rolled back. Sequence updates are committed immediately and aren't rolled back along with their containing transaction. This is done to avoid blocking concurrent transactions that use the same sequence.
- {% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}
-  By default, you cannot create sequences that are [owned by]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) columns in tables in other databases. You can enable such sequence creation by setting the `sql.cross_db_sequence_owners.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `true`.

## Required privileges

The user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the parent database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_sequence.html %}
</div>

## Parameters

 Parameter | Description
-----------|------------
`seq_name` | The name of the sequence to be created, which must be unique within its database and follow the [identifier rules]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers). When the parent database is not set as the default, the name must be formatted as `database.seq_name`.
`INCREMENT` | The value by which the sequence is incremented. A negative number creates a descending sequence. A positive number creates an ascending sequence.<br><br>**Default:** `1`
`MINVALUE` | The minimum value of the sequence. Default values apply if not specified or if you enter `NO MINVALUE`.<br><br>**Default for ascending:** `1` <br><br>**Default for descending:** `MININT`
`MAXVALUE` | The maximum value of the sequence. Default values apply if not specified or if you enter `NO MAXVALUE`.<br><br>**Default for ascending:** `MAXINT` <br><br>**Default for descending:** `-1`
`START [WITH]` | The first value of the sequence. <br><br>**Default for ascending:** `1` <br><br>**Default for descending:** `-1`
`RESTART [WITH]` | Sets `nextval` to the specified number, or back to the original `START` value.
`NO CYCLE` | All sequences are set to `NO CYCLE` and the sequence will not wrap.
`CACHE` | The number of sequence values to cache in memory for reuse in the session. A cache size of `1` means that there is no cache, and cache sizes of less than `1` are not valid.<br><br>**Default:** `1` (sequences are not cached by default)
`PER NODE CACHE` <a name="per-node-cache"></a> | The number of sequence values to cache in memory at the node level. All sessions on the node share the same cache, which can be concurrently accessed, and which reduces the chance of creating large gaps between generated IDs. A cache size of `1` means that there is no cache, and cache sizes of less than `1` are not valid.<br><br>**Default:** `256` (controlled by the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `sql.defaults.serial_sequences_cache_size` when the [session variable]({% link {{ page.version.version }}/set-vars.md %}) `serial_normalization` is set to `sql_sequence_cached_node`)
`OWNED BY column_name` <a name="owned-by"></a> | Associates the sequence to a particular column. If that column or its parent table is dropped, the sequence will also be dropped.<br>Specifying an owner column with `OWNED BY` replaces any existing owner column on the sequence. To remove existing column ownership on the sequence and make the column free-standing, specify `OWNED BY NONE`.<br><br>**Default:** `NONE`
`opt_temp` | Defines the sequence as a session-scoped temporary sequence. For more information, see [Temporary sequences](#temporary-sequences).

{% comment %} CYCLE | Not yet implemented. The sequence will wrap around when the sequence value reaches the maximum or minimum value.
{% endcomment %}

## Sequence functions

CockroachDB supports the following [SQL sequence functions]({% link {{ page.version.version }}/functions-and-operators.md %}):

- `nextval('seq_name')`
- `currval('seq_name')`
- `lastval()`
- `setval('seq_name', value, is_called)`

## Temporary sequences

CockroachDB supports session-scoped temporary sequences. Unlike persistent sequences, temporary sequences can only be accessed from the session in which they were created, and they are dropped at the end of the session. You can create temporary sequences on both persistent tables and [temporary tables]({% link {{ page.version.version }}/temporary-tables.md %}).

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %} For details, see the tracking issue [cockroachdb/cockroach#46260](https://github.com/cockroachdb/cockroach/issues/46260).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Temporary tables must be enabled in order to use temporary sequences. By default, temporary tables are disabled in CockroachDB. To enable temporary tables, set the `experimental_enable_temp_tables` [session variable]({% link {{ page.version.version }}/set-vars.md %}) to `on`.
{{site.data.alerts.end}}

### Details

- Temporary sequences are automatically dropped at the end of the session.
- A temporary sequence can only be accessed from the session in which it was created.
- Temporary sequences persist across transactions in the same session.
- Temporary sequences cannot be converted to persistent sequences.

{{site.data.alerts.callout_info}}
Like [temporary tables]({% link {{ page.version.version }}/temporary-tables.md %}), temporary sequences are not in the `public` schema. Instead, when you create the first temporary table, view, or sequence for a session, CockroachDB generates a single temporary schema (`pg_temp_<id>`) for all of the temporary objects in the current session for a database.
{{site.data.alerts.end}}

### Usage

To create a temporary sequence, add [`TEMP`/`TEMPORARY`]({% link {{ page.version.version }}/sql-grammar.md %}#opt_temp) to a `CREATE SEQUENCE` statement.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET experimental_enable_temp_tables=on;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TEMP SEQUENCE temp_seq START 1 INCREMENT 1;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE customer_seq;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE customer_seq;
~~~

~~~
   table_name  |                                     create_statement
---------------+-------------------------------------------------------------------------------------------
  customer_seq | CREATE SEQUENCE customer_seq MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 1 START 1
(1 row)
~~~

### Use a sequence when creating a table

In this example, we [create a table]({% link {{ page.version.version }}/create-table.md %}), using the [`nextval()` function]({% link {{ page.version.version }}/functions-and-operators.md %}#sequence-functions) for a [default value]({% link {{ page.version.version }}/default-value.md %}), with the `customer_seq` sequence as its input:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE customers (
    uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rownum INT DEFAULT nextval('customer_seq'),
    name STRING
);
~~~

Inserting into this table with an `INSERT` statement that relies on default values will call `nextval`, which increments the sequence.

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (name) VALUES ('Max'), ('Alice');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers;
~~~

~~~
                  uid                  | rownum | name
---------------------------------------+--------+--------
  1c7f5b79-88c4-49ec-b40b-6098d28bb822 |      2 | Alice
  7ce844af-6a3f-4c52-ba07-25623f345804 |      1 | Max
(2 rows)
~~~

### View the current value of a sequence

To view the current value without incrementing the sequence, use:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customer_seq;
~~~

~~~
  last_value | log_cnt | is_called
-------------+---------+------------
           2 |       0 |   true
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
        2
(1 row)
~~~

### Set the next value of a sequence

In this example, we're going to change the next value of `customer_seq` using the [`setval()` function]({% link {{ page.version.version }}/functions-and-operators.md %}#sequence-functions). Currently, the next value will be `3` (i.e., `2` + `INCREMENT 1`). We will change the next value to `5`.

{{site.data.alerts.callout_info}}
You cannot set a value outside the <code>MAXVALUE</code> or <code>MINVALUE</code> of the sequence.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT setval('customer_seq', 5, false);
~~~

~~~
  setval
----------
       5
(1 row)
~~~

{{site.data.alerts.callout_info}}
The `setval('seq_name', value, is_called)` function in CockroachDB SQL mimics the `setval()` function in PostgreSQL, but it does not store the `is_called` flag. Instead, it sets the value to `val - increment` for `false` or `val` for `true`.
{{site.data.alerts.end}}

Let's add another record to the table to check that the new record adheres to the new next value.

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (name) VALUES ('Sam');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers;
~~~

~~~
                  uid                  | rownum | name
---------------------------------------+--------+--------
  19ffe03d-5eac-4a2f-8aa8-1569b998aa44 |      5 | Sam
  1c7f5b79-88c4-49ec-b40b-6098d28bb822 |      2 | Alice
  7ce844af-6a3f-4c52-ba07-25623f345804 |      1 | Max
(3 rows)
~~~

### Create a sequence with user-defined settings

In this example, we create a sequence that starts at -1 and descends in increments of 2.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE desc_customer_list START -1 INCREMENT -2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE desc_customer_list;
~~~

~~~
      table_name     |                                          create_statement
---------------------+-----------------------------------------------------------------------------------------------------
  desc_customer_list | CREATE SEQUENCE desc_customer_list MINVALUE -9223372036854775808 MAXVALUE -1 INCREMENT -2 START -1
(1 row)
~~~

### List all sequences

{% include_cached copy-clipboard.html %}
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

### Cache sequence values in memory

 For improved performance, use the `CACHE` keyword to cache sequence values in memory.

For example, to cache 10 sequence values in memory:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE customer_seq_cached CACHE 10;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE customer_seq_cached;
~~~

~~~
      table_name      |                                                create_statement
----------------------+------------------------------------------------------------------------------------------------------------------
  customer_seq_cached | CREATE SEQUENCE public.customer_seq_cached MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 1 START 1 CACHE 10
(1 row)
~~~

### Cache sequence values per node

For improved performance, use the `PER NODE CACHE` clause to cache sequence values in memory at the node level.

For example, to cache 10 sequence values per node:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SEQUENCE customer_seq_node_cached PER NODE CACHE 10;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE customer_seq_node_cached;
~~~

~~~
      table_name      |                                                create_statement
----------------------+------------------------------------------------------------------------------------------------------------------
  customer_seq_node_cached | CREATE SEQUENCE public.customer_seq_node_cached MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 1 START 1 PER NODE CACHE 10
(1 row)
~~~

## See also

- [`ALTER SEQUENCE`]({% link {{ page.version.version }}/alter-sequence.md %})
- [`DROP SEQUENCE`]({% link {{ page.version.version }}/drop-sequence.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})
- [`SHOW SEQUENCES`]({% link {{ page.version.version }}/show-sequences.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
