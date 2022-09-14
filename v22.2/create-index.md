---
title: CREATE INDEX
summary: The CREATE INDEX statement creates an index for a table. Indexes improve your database's performance by helping SQL quickly locate data.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: reference.sql
---

The `CREATE INDEX` [statement](sql-statements.html) creates an index for a table. [Indexes](indexes.html) improve your database's performance by helping SQL locate data without having to look through every row of a table.

Indexes are automatically created for a table's [`PRIMARY KEY`](primary-key.html) and [`UNIQUE`](unique.html) columns. When querying a table, CockroachDB uses the fastest index. For more information about that process, see [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

The following types cannot be included in an index key, but can be stored (and used in a covered query) using the [`STORING` or `COVERING`](create-index.html#store-columns) clause:

- [`JSONB`](jsonb.html)
- [`ARRAY`](array.html)
- The computed [`TUPLE`](scalar-expressions.html#tuple-constructors) type, even if it is constructed from indexed fields

To create an index on the schemaless data in a [`JSONB`](jsonb.html) column or on the data in an [`ARRAY`](array.html), use a [GIN index](inverted-indexes.html).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

## Synopsis

### Standard index

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_index.html %}
</div>

### GIN index

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_inverted_index.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`UNIQUE` | Apply the [`UNIQUE` constraint](unique.html) to the indexed columns.<br><br>This causes the system to check for existing duplicate values on index creation. It also applies the `UNIQUE` constraint at the table level, so the system checks for duplicate values when inserting or updating data.
`INVERTED` | Create a [GIN index](inverted-indexes.html) on the schemaless data in the specified [`JSONB`](jsonb.html) column.<br><br> You can also use the PostgreSQL-compatible syntax `USING GIN`. For more details, see [GIN Indexes](inverted-indexes.html#creation).
`IF NOT EXISTS` | Create a new index only if an index of the same name does not already exist; if one does exist, do not return an error.
`opt_index_name`<br>`index_name` | The name of the index to create, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).<br><br>If you do not specify a name, CockroachDB uses the format `<table>_<columns>_key/idx`. `key` indicates the index applies the `UNIQUE` constraint; `idx` indicates it does not. Example: `accounts_balance_idx`
`table_name` | The name of the table you want to create the index on.
`USING name` | An optional clause for compatibility with third-party tools. Accepted values for `name` are `btree`, `gin`, and `gist`, with `btree` for a standard secondary index, `gin` as the PostgreSQL-compatible syntax for a [GIN index](#create-gin-indexes), and `gist` for a [spatial index](spatial-indexes.html).
`name` | The name of the column you want to index. For [multi-region tables](multiregion-overview.html#table-localities), you can use the `crdb_region` column within the index in the event the original index may contain non-unique entries across multiple, unique regions.
`ASC` or `DESC`| Sort the column in ascending (`ASC`) or descending (`DESC`) order in the index. How columns are sorted affects query results, particularly when using `LIMIT`.<br><br>__Default:__ `ASC`
`STORING ...`| Store (but do not sort) each column whose name you include.<br><br>For information on when to use `STORING`, see  [Store Columns](#store-columns).  Note that columns that are part of a table's [`PRIMARY KEY`](primary-key.html) cannot be specified as `STORING` columns in secondary indexes on the table.<br><br>`COVERING` and `INCLUDE` are aliases for `STORING` and work identically.
`opt_partition_by` | An [Enterprise-only](enterprise-licensing.html) option that lets you [define index partitions at the row level](partitioning.html). As of CockroachDB v21.1 and later, most users should use [`REGIONAL BY ROW` tables](multiregion-overview.html#regional-by-row-tables). Indexes against regional by row tables are automatically partitioned, so explicit index partitioning is not required.
`opt_where_clause` |  An optional `WHERE` clause that defines the predicate boolean expression of a [partial index](partial-indexes.html).
`opt_index_visible` | An optional annotation that indicates whether the index is visible to the [cost-based optimizer](cost-based-optimizer.html#control-whether-the-optimzer-uses-an-index). If not visible, the index won't be used in queries unless specifically selected with an [index hint](indexes.html#selection). For an example, see [Set an index to be not visible](alter-index.html#set-an-index-to-be-not-visible).
`USING HASH` |  Creates a [hash-sharded index](hash-sharded-indexes.html).
`WITH storage_parameter` |  A comma-separated list of [spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). Supported parameters include `fillfactor`, `s2_max_level`, `s2_level_mod`, `s2_max_cells`, `geometry_min_x`, `geometry_max_x`, `geometry_min_y`, and `geometry_max_y`. The `fillfactor` parameter is a no-op, allowed for PostgreSQL-compatibility.<br><br>For details, see [Spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). For an example, see [Create a spatial index that uses all of the tuning parameters](spatial-indexes.html#create-a-spatial-index-that-uses-all-of-the-tuning-parameters).
`CONCURRENTLY` |  Optional, no-op syntax for PostgreSQL compatibility. All indexes are created concurrently in CockroachDB.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Create standard indexes

To create the most efficient indexes, we recommend reviewing:

- [Indexes: Best Practices](indexes.html#best-practices)
- [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2)

#### Single-column indexes

Single-column indexes sort the values of a single column.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name);
~~~

Because each query can only use one index, single-column indexes are not typically as useful as multiple-column indexes.

#### Multiple-column indexes

Multiple-column indexes sort columns in the order you list them.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name, city);
~~~

To create the most useful multiple-column indexes, we recommend reviewing our [best practices](schema-design-indexes.html#best-practices).

#### Unique indexes

Unique indexes do not allow duplicate values among their columns.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE UNIQUE INDEX ON users (name, id);
~~~

This also applies the [`UNIQUE` constraint](unique.html) at the table level, similar to [`ALTER TABLE`](alter-table.html). The preceding example is equivalent to:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD CONSTRAINT users_name_id_key UNIQUE (name, id);
~~~

Primary key columns that are not specified within a unique index are automatically marked as [`STORING`](indexes.html#storing-columns) in the [`information_schema.statistics`](information-schema.html#statistics) table and in [`SHOW INDEX`](show-index.html).

### Create GIN indexes

You can create [GIN indexes](inverted-indexes.html) on schemaless data in a [`JSONB`](jsonb.html) column.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INVERTED INDEX ON promo_codes (rules);
~~~

The preceding example is equivalent to the following PostgreSQL-compatible syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON promo_codes USING GIN (rules);
~~~

### Create spatial indexes

You can create [spatial indexes](spatial-indexes.html) on `GEOMETRY` and `GEOGRAPHY` columns.  Spatial indexes are a special type of [GIN index](inverted-indexes.html).

To create a spatial index on a `GEOMETRY` column:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX geom_idx_1 ON some_spatial_table USING GIST(geom);
~~~

Unlike GIN indexes, spatial indexes do not support an alternate `CREATE INVERTED INDEX ...` syntax.  Only the syntax shown here is supported.

For advanced users, there are a number of [spatial index tuning parameters](spatial-indexes.html#create-a-spatial-index-that-uses-all-of-the-tuning-parameters) that can be passed in using the syntax `WITH (var1=val1, var2=val2)` as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX geom_idx_2
  ON some_spatial_table USING GIST(geom)
  WITH (s2_max_cells = 20, s2_max_level = 12, s2_level_mod = 3);
~~~

{{site.data.alerts.callout_danger}}
Most users should not change the default spatial index settings. There is a risk that you will get worse performance by changing the default settings. For more information , see [Spatial indexes](spatial-indexes.html).
{{site.data.alerts.end}}

### Store columns

Storing a column improves the performance of queries that retrieve (but do not filter) its values.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (city) STORING (name);
~~~

However, to use stored columns, queries must filter another column in the same index. For example, SQL can retrieve `name` values from the above index only when a query's `WHERE` clause filters `city`.

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/sql/covering-index.md %}
{{site.data.alerts.end}}

### Change column sort order

To sort columns in descending order, you must explicitly set the option when creating the index. (Ascending order is the default.)

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (city DESC, name);
~~~

How a column is ordered in the index will affect the ordering of the index keys, and may affect the efficiency of queries that include an `ORDER BY` clause.

### Query specific indexes

Normally, CockroachDB selects the index that it calculates will scan the fewest rows. However, you can override that selection and specify the name of the index you want to use. To find the name, use [`SHOW INDEX`](show-index.html).

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM users;
~~~

~~~
  table_name |   index_name        | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+---------------------+------------+--------------+-------------+-----------+---------+----------+
  users      | users_pkey          |   false    |            1 | city        | ASC       |  false  |  false
  users      | users_pkey          |   false    |            2 | id          | ASC       |  false  |  false
  users      | users_pkey          |   false    |            3 | name        | N/A       |  true   |  false
  users      | users_pkey          |   false    |            4 | address     | N/A       |  true   |  false
  users      | users_pkey          |   false    |            5 | credit_card | N/A       |  true   |  false
  users      | users_city_name_idx |    true    |            1 | city        | DESC      |  false  |  false
  users      | users_city_name_idx |    true    |            2 | name        | ASC       |  false  |  false
  users      | users_city_name_idx |    true    |            3 | id          | ASC       |  false  |   true
(8 rows)

~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name FROM users@users_name_idx WHERE city='new york';
~~~

~~~
        name
+------------------+
  Catherine Nelson
  Devin Jordan
  James Hamilton
  Judy White
  Robert Murphy
(5 rows)
~~~

You can use the `@primary` alias to use the table's primary key in your query if no secondary index explicitly named `primary` exists on that table.

### Create a hash-sharded secondary index

{% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}

{% include {{page.version.version}}/performance/create-index-hash-sharded-secondary-index.md %}

## See also

- [Indexes](indexes.html)
- [`SHOW INDEX`](show-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [`SHOW JOBS`](show-jobs.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
