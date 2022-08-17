---
title: ALTER COLUMN
summary: Use the ALTER COLUMN statement to set, change, or drop a column's DEFAULT constraint or to drop the NOT NULL constraint.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

`ALTER COLUMN` is a subcommand of [`ALTER TABLE`](alter-table.html). You can use `ALTER COLUMN` to do the following:

- Set, change, or drop a column's [`DEFAULT` constraint](default-value.html).
- Set or drop a column's [`NOT NULL` constraint](not-null.html).
- Set, change, or drop an [`ON UPDATE` expression](create-table.html#on-update-expressions).
- Change a column's [data type](data-types.html).
- Set the [visibility](#set-the-visibility-of-a-column) of a column.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

{{site.data.alerts.callout_info}}
Support for altering column types is [experimental](experimental-features.html), with certain limitations. For details, see [Altering column data types](#altering-column-data-types).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ remote_include_version }}/grammar_svg/alter_column.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table with the column to modify. |
| `column_name` | The name of the column to modify. |
| `SET DEFAULT a_expr` | The new [default value](default-value.html). |
| `typename` | The new [data type](data-types.html) you want to use.<br> Support for altering column types is [experimental](experimental-features.html), with certain limitations. For details, see [Altering column data types](#altering-column-data-types). |
| `USING a_expr` |  How to compute a new column value from the old column value. |

## View schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Alter column data types

Support for altering column data types is [experimental](experimental-features.html), with [certain limitations](#limitations-on-altering-data-types). To enable column type altering, set the `enable_experimental_alter_column_type_general` [session variable](set-vars.html) to `true`.

The following are equivalent in CockroachDB:

- `ALTER TABLE ... ALTER ... TYPE`
- `ALTER TABLE ... ALTER COLUMN TYPE`
- `ALTER TABLE ... ALTER COLUMN SET DATA TYPE`

For examples of `ALTER COLUMN TYPE`, [Examples](#convert-to-a-different-data-type).

### Limitations on altering data types

You cannot alter the data type of a column if:

- The column is part of an [index](indexes.html).
- The column has [`CHECK` constraints](check.html).
- The column owns a [sequence](create-sequence.html).
- The `ALTER COLUMN TYPE` statement is part of a [combined `ALTER TABLE` statement](alter-table.html#subcommands).
- The `ALTER COLUMN TYPE` statement is inside an [explicit transaction](begin-transaction.html).

{{site.data.alerts.callout_info}}
Most `ALTER COLUMN TYPE` changes are finalized asynchronously. Schema changes on the table with the altered column may be restricted, and writes to the altered column may be rejected until the schema change is finalized.
{{site.data.alerts.end}}

## Examples

### Set or change a `DEFAULT` value

Setting the [`DEFAULT` value constraint](default-value.html) inserts the value when data's written to the table without explicitly defining the value for the column. If the column already has a `DEFAULT` value set, you can use this statement to change it.

The following example inserts the Boolean value `true` whenever you inserted data to the `subscriptions` table without defining a value for the `newsletter` column.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter SET DEFAULT true;
~~~

### Remove `DEFAULT` constraint

If the column has a defined [`DEFAULT` value](default-value.html), you can remove the constraint, which means the column will no longer insert a value by default if one is not explicitly defined for the column.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP DEFAULT;
~~~

### Set `NOT NULL` constraint

To specify that the column cannot contain `NULL` values, set the [`NOT NULL` constraint](not-null.html).

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter SET NOT NULL;
~~~

### Remove `NOT NULL` constraint

If the column has the [`NOT NULL` constraint](not-null.html) applied to it, you can remove the constraint, which means the column becomes optional and can have *NULL* values written into it.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP NOT NULL;
~~~

### Convert a computed column into a regular column

{% include {{ page.version.version }}/computed-columns/convert-computed-column.md %}

### Alter the formula for a computed column

{% include {{ page.version.version }}/computed-columns/alter-computed-column.md %}

### Convert to a different data type

The [TPC-C](performance-benchmarking-with-tpcc-small.html) database has a `customer` table with a column `c_credit_lim` of type `DECIMAL(10,2)`:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_credit_lim';
~~~

~~~
  column_name  |   data_type
---------------+----------------
  c_credit_lim | DECIMAL(10,2)
(1 row)
~~~

To change the data type from `DECIMAL` to `STRING`:

1. Set the `enable_experimental_alter_column_type_general` [session variable](set-vars.html) to `true`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET enable_experimental_alter_column_type_general = true;
    ~~~

1. Alter the column type:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE customer ALTER c_credit_lim TYPE STRING;
    ~~~

    ~~~
    NOTICE: ALTER COLUMN TYPE changes are finalized asynchronously; further schema changes on this table may be restricted until the job completes; some writes to the altered column may be rejected until the schema change is finalized
    ~~~

1. Verify the type:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_credit_lim';
    ~~~

    ~~~
      column_name  | data_type
    ---------------+------------
      c_credit_lim | STRING
    (1 row)
    ~~~


### Change a column type's precision

The [TPC-C](performance-benchmarking-with-tpcc-small.html) `customer` table contains a column `c_balance` of type `DECIMAL(12,2)`:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_balance';
~~~

~~~
  column_name |   data_type
--------------+----------------
  c_balance   | DECIMAL(12,2)
(1 row)
~~~

To increase the precision of the `c_balance` column from `DECIMAL(12,2)` to `DECIMAL(14,2)`:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_balance TYPE DECIMAL(14,2);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_balance';
~~~

~~~
  column_name |   data_type
--------------+----------------
  c_balance   | DECIMAL(14,2)
(1 row)
~~~

### Change a column's type using an expression

You can change the data type of a column and create a new, computed value from the old column values, with a [`USING` clause](#parameters). For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_discount';
~~~

~~~
  column_name |  data_type
--------------+---------------
  c_discount  | DECIMAL(4,4)
(1 row)
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_discount TYPE STRING USING ((c_discount*100)::DECIMAL(4,2)::STRING || ' percent');
~~~

~~~
NOTICE: ALTER COLUMN TYPE changes are finalized asynchronously; further schema changes on this table may be restricted until the job completes; some writes to the altered column may be rejected until the schema change is finalized
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS FROM customer) SELECT column_name, data_type FROM x WHERE column_name='c_discount';
~~~

~~~
  column_name | data_type
--------------+------------
  c_discount  | STRING
(1 row)
~~~

{% include_cached copy-clipboard.html %}
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

### Set the visibility of a column

To specify that a column won't be returned when using `*` in a [`SELECT` clause](select-clause.html), set the `NOT VISIBLE` property. You can set the `NOT VISIBLE` property only on individual columns.

For example, the `users` table of the [`movr` database](movr.html) contains the `credit_card` column. If you don't want users to see that column when running `SELECT * FROM users;`, you can hide it as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER COLUMN credit_card SET NOT VISIBLE;
~~~

When you run `SELECT *`, the column doesn't appear:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE city = 'rome';
~~~

~~~
id                                     | city |       name        |            address
---------------------------------------+------+-------------------+--------------------------------
e6666666-6666-4800-8000-00000000002d   | rome | Misty Adams       | 82289 Natasha River Suite 12
eb851eb8-51eb-4800-8000-00000000002e   | rome | Susan Morse       | 49364 Melissa Squares Suite 4
f0a3d70a-3d70-4000-8000-00000000002f   | rome | Victoria Jennings | 31562 Krista Squares Suite 62
f5c28f5c-28f5-4000-8000-000000000030   | rome | Eric Perez        | 57624 Kelly Forks
fae147ae-147a-4000-8000-000000000031   | rome | Richard Bullock   | 21194 Alexander Estate
(5 rows)
~~~

The column is still selectable if you name it directly in the `target_elem` parameter:

~~~ sql
> SELECT id, credit_card FROM users WHERE city = 'rome';
~~~

~~~
id                                     | credit_card
---------------------------------------+--------------
e6666666-6666-4800-8000-00000000002d   | 4418943046
eb851eb8-51eb-4800-8000-00000000002e   | 0655485426
f0a3d70a-3d70-4000-8000-00000000002f   | 2232698265
f5c28f5c-28f5-4000-8000-000000000030   | 2620636730
fae147ae-147a-4000-8000-000000000031   | 2642076323
(5 rows)
~~~

To unhide the column, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER COLUMN credit_card SET VISIBLE;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * from user WHERE city = 'rome';
~~~

~~~
                   id                  | city |       name        |            address            | credit_card
---------------------------------------+------+-------------------+-------------------------------+--------------
  e6666666-6666-4800-8000-00000000002d | rome | Misty Adams       | 82289 Natasha River Suite 12  |  4418943046
  eb851eb8-51eb-4800-8000-00000000002e | rome | Susan Morse       | 49364 Melissa Squares Suite 4 |  0655485426
  f0a3d70a-3d70-4000-8000-00000000002f | rome | Victoria Jennings | 31562 Krista Squares Suite 62 |  2232698265
  f5c28f5c-28f5-4000-8000-000000000030 | rome | Eric Perez        | 57624 Kelly Forks             |  2620636730
  fae147ae-147a-4000-8000-000000000031 | rome | Richard Bullock   | 21194 Alexander Estate        |  2642076323
(5 rows)
~~~

## See also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW JOBS`](show-jobs.html)
- [Online Schema Changes](online-schema-changes.html)
