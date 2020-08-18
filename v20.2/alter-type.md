---
title: ALTER TYPE
summary: Use the ALTER TYPE statement to change a column's data type.
toc: true
---

<span class="version-tag">New in v20.2:</span> The `ALTER TYPE` [statement](sql-statements.html) is part of [`ALTER TABLE`](alter-table.html) and changes a column's [data type](data-types.html).

{{site.data.alerts.callout_info}}
Support for altering column types is [experimental](experimental-features.html) in CockroachDB versions v20.2, with certain [limitations](#limitations). To enable all supported column type altering, set the `enable_experimental_alter_column_type_general` [session variable](set-vars.html) to `true`.
{{site.data.alerts.end}}

## Limitations

You can alter the the type of a column if:

- The column is not part of an [index](indexes.html).
- The column does not have [`CHECK` constraints](check.html).
- The column does not own a [sequence](create-sequence.html).
- The `ALTER TYPE` statement is not part of a [combined `ALTER TABLE` statement](alter-table.html#subcommands).
- The `ALTER TYPE` statement is not inside an [explicit transaction](begin-transaction.html).

{{site.data.alerts.callout_info}}
Most `ALTER TYPE` changes are finalized asynchronously. Schema changes on the table with the altered column may be restricted, and writes to the altered column may be rejected until the schema change is finalized.
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/alter_type.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

| Parameter | Description
|-----------|-------------
| `table_name` | The name of the table with the column whose data type you want to change.
| `column_name` | The name of the column whose data type you want to change.
| `typename` | The new data typedata-types.html you want to use.
| `USING a_expr` | <span class="version-tag">New in v20.2:</span> Specifies how to compute a new column value from the old column value. |

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Convert to a different data type

The [TPC-C](performance-benchmarking-with-tpc-c-1k-warehouses.html) database has a `customer` table with a column `c_credit_lim` of type [`DECIMAL(10,2)`](decimal.html):

{% include copy-clipboard.html %}
~~~ sql
> SELECT column_name, data_type FROM [SHOW COLUMNS FROM customer] WHERE column_name='c_credit_lim';
~~~

~~~
  column_name  |   data_type
---------------+----------------
  c_credit_lim | DECIMAL(10,2)
(1 row)
~~~

Suppose you want to change the data type from `DECIMAL` to [`STRING`](string.html).

First, set the `enable_experimental_alter_column_type_general` [session variable](set-vars.html) to `true`:

{% include copy-clipboard.html %}
~~~ sql
> SET enable_experimental_alter_column_type_general = true;
~~~

Then, alter the column type:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_credit_lim TYPE STRING;
~~~

~~~
NOTICE: ALTER COLUMN TYPE changes are finalized asynchronously; further schema changes on this table may be restricted until the job completes; some writes to the altered column may be rejected until the schema change is finalized
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT column_name, data_type FROM [SHOW COLUMNS FROM customer] WHERE column_name='c_credit_lim';
~~~

~~~
  column_name  | data_type
---------------+------------
  c_credit_lim | STRING
(1 row)
~~~


### Change data type precision

The [TPC-C](performance-benchmarking-with-tpc-c-1k-warehouses.html) `customer` table contains a column `c_balance` of type [`DECIMAL(12,2)`](decimal.html):

{% include copy-clipboard.html %}
~~~ sql
> SELECT column_name, data_type FROM [SHOW COLUMNS FROM customer] WHERE column_name='c_balance';
~~~

~~~
  column_name |   data_type
--------------+----------------
  c_balance   | DECIMAL(12,2)
(1 row)
~~~

Suppose you want to increase the precision of the `c_balance` column from `DECIMAL(12,2)` to `DECIMAL(14,2)`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_balance TYPE DECIMAL(14,2);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT column_name, data_type FROM [SHOW COLUMNS FROM customer] WHERE column_name='c_balance';
~~~

~~~
  column_name |   data_type
--------------+----------------
  c_balance   | DECIMAL(14,2)
(1 row)
~~~

### Create a new computed column value

<span class="version-tag">New in v20.2:</span> You can change the data type of a column and create a new, computed value from the old column values, with a [`USING` clause](#parameters). For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT column_name, data_type FROM [SHOW COLUMNS FROM customer] WHERE column_name='c_discount';
~~~

~~~
  column_name |  data_type
--------------+---------------
  c_discount  | DECIMAL(4,4)
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT c_discount FROM customer LIMIT 10;
~~~

~~~
  c_discount
--------------
      0.1569
      0.4629
      0.2932
      0.0518
      0.3922
      0.1106
      0.0622
      0.4916
      0.3072
      0.0316
(10 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_discount TYPE STRING USING ((c_discount*100)::DECIMAL(4,2)::STRING || ' percent');
~~~

~~~
NOTICE: ALTER COLUMN TYPE changes are finalized asynchronously; further schema changes on this table may be restricted until the job completes; some writes to the altered column may be rejected until the schema change is finalized
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT column_name, data_type FROM [SHOW COLUMNS FROM customer] WHERE column_name='c_discount';
~~~

~~~
  column_name | data_type
--------------+------------
  c_discount  | STRING
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT c_discount FROM customer LIMIT 10;
~~~

~~~
   c_discount
-----------------
  15.69 percent
  46.29 percent
  29.32 percent
  5.18 percent
  39.22 percent
  11.06 percent
  6.22 percent
  49.16 percent
  30.72 percent
  3.16 percent
(10 rows)
~~~

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ALTER COLUMN`](alter-column.html)
- [Other SQL Statements](sql-statements.html)
- [`SHOW JOBS`](show-jobs.html)
