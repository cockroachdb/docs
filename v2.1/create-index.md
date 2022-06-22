---
title: CREATE INDEX
summary: The CREATE INDEX statement creates an index for a table. Indexes improve your database's performance by helping SQL quickly locate data.
toc: true
---

The `CREATE INDEX` [statement](sql-statements.html) creates an index for a table. [Indexes](indexes.html) improve your database's performance by helping SQL locate data without having to look through every row of a table.

To create an index on the schemaless data in a [`JSONB`](jsonb.html) column, use an [inverted index](inverted-indexes.html).

{{site.data.alerts.callout_info}}
Indexes are automatically created for a table's [`PRIMARY KEY`](primary-key.html) and [`UNIQUE`](unique.html) columns.

When querying a table, CockroachDB uses the fastest index. For more information about that process, see [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).
{{site.data.alerts.end}}

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Synopsis

**Standard index:**

<section>{% include {{ page.version.version }}/sql/diagrams/create_index.html %}</section>

**Inverted index:**

<section>{% include {{ page.version.version }}/sql/diagrams/create_inverted_index.html %}</section>

## Parameters

 Parameter | Description
-----------|-------------
`UNIQUE` | Apply the [`UNIQUE` constraint](unique.html) to the indexed columns.<br><br>This causes the system to check for existing duplicate values on index creation. It also applies the `UNIQUE` constraint at the table level, so the system checks for duplicate values when inserting or updating data.
 `INVERTED` | Create an [inverted index](inverted-indexes.html) on the schemaless data in the specified [`JSONB`](jsonb.html) column.<br><br> You can also use the PostgreSQL-compatible syntax `USING GIN`. For more details, see [Inverted Indexes](inverted-indexes.html#creation).
`IF NOT EXISTS` | Create a new index only if an index of the same name does not already exist; if one does exist, do not return an error.
`opt_index_name`<br>`index_name` | The name of the index to create, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).<br><br>If you do not specify a name, CockroachDB uses the format `<table>_<columns>_key/idx`. `key` indicates the index applies the `UNIQUE` constraint; `idx` indicates it does not. Example: `accounts_balance_idx`
`table_name` | The name of the table you want to create the index on.
`column_name` | The name of the column you want to index.
`ASC` or `DESC`| Sort the column in ascending (`ASC`) or descending (`DESC`) order in the index. How columns are sorted affects query results, particularly when using `LIMIT`.<br><br>__Default:__ `ASC`
`STORING ...`| Store (but do not sort) each column whose name you include. Note that columns that are part of a table's [`PRIMARY KEY`](primary-key.html) cannot be specified as `STORING` columns in secondary indexes on the table.<br><br>For information on when to use `STORING`, see  [Store Columns](#store-columns).<br><br>`COVERING` aliases `STORING` and works identically.
`opt_interleave` | You can potentially optimize query performance by [interleaving indexes](interleave-in-parent.html), which changes how CockroachDB stores your data.
`opt_partition_by` | Docs coming soon.

## Examples

### Create standard indexes

To create the most efficient indexes, we recommend reviewing:

- [Indexes: Best Practices](indexes.html#best-practices)
- [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2)

#### Single-column indexes

Single-column indexes sort the values of a single column.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON products (price);
~~~

Because each query can only use one index, single-column indexes are not typically as useful as multiple-column indexes.

#### Multiple-column indexes

Multiple-column indexes sort columns in the order you list them.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON products (price, stock);
~~~

To create the most useful multiple-column indexes, we recommend reviewing our [best practices](indexes.html#indexing-columns).

#### Unique indexes

Unique indexes do not allow duplicate values among their columns.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE UNIQUE INDEX ON products (name, manufacturer_id);
~~~

This also applies the [`UNIQUE` constraint](unique.html) at the table level, similarly to [`ALTER TABLE`](alter-table.html). The above example is equivalent to:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE products ADD CONSTRAINT products_name_manufacturer_id_key UNIQUE (name, manufacturer_id);
~~~

### Create inverted indexes

[Inverted indexes](inverted-indexes.html) can be created on schemaless data in a [`JSONB`](jsonb.html) column.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INVERTED INDEX ON users (profile);
~~~

The above example is equivalent to the following PostgreSQL-compatible syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users USING GIN (profile);
~~~

### Store columns

Storing a column improves the performance of queries that retrieve (but do not filter) its values.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON products (price) STORING (name);
~~~

However, to use stored columns, queries must filter another column in the same index. For example, SQL can retrieve `name` values from the above index only when a query's `WHERE` clause filters `price`.

### Change column sort order

To sort columns in descending order, you must explicitly set the option when creating the index. (Ascending order is the default.)

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON products (price DESC, stock);
~~~

How columns are sorted impacts the order of rows returned by queries using the index, which particularly affects queries using `LIMIT`.

### Query specific indexes

Normally, CockroachDB selects the index that it calculates will scan the fewest rows. However, you can override that selection and specify the name of the index you want to use. To find the name, use [`SHOW INDEX`](show-index.html).

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM products;
~~~

~~~
+------------+--------------------+------------+--------------+-------------+-----------+---------+----------+
| table_name |     index_name     | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+--------------------+------------+--------------+-------------+-----------+---------+----------+
| products   | primary            |   false    |            1 | id          | ASC       |  false  |  false   |
| products   | products_price_idx |    true    |            1 | price       | ASC       |  false  |  false   |
| products   | products_price_idx |    true    |            2 | id          | ASC       |  false  |   true   |
+------------+--------------------+------------+--------------+-------------+-----------+---------+----------+
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name FROM products@products_price_idx WHERE price > 10;
~~~

## See also

- [Indexes](indexes.html)
- [`SHOW INDEX`](show-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [Other SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
