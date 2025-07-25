---
title: CREATE INDEX
summary: The CREATE INDEX statement creates an index for a table. Indexes improve your database's performance by helping SQL quickly locate data.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: reference.sql
---

The `CREATE INDEX` [statement]({% link {{ page.version.version }}/sql-statements.md %}) creates an index for a table. [Indexes]({% link {{ page.version.version }}/indexes.md %}) improve your database's performance by helping SQL locate data without having to look through every row of a table.

Indexes are automatically created for a table's [`PRIMARY KEY`]({% link {{ page.version.version }}/primary-key.md %}) and [`UNIQUE`]({% link {{ page.version.version }}/unique.md %}) columns. When querying a table, CockroachDB uses the fastest index. For more information about that process, see [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

The following types cannot be included in an index key, but can be stored (and used in a covered query) using the [`STORING` or `COVERING`]({% link {{ page.version.version }}/create-index.md %}#store-columns) clause:

- [`JSONB`]({% link {{ page.version.version }}/jsonb.md %})
- [`ARRAY`]({% link {{ page.version.version }}/array.md %})
- The computed [`TUPLE`]({% link {{ page.version.version }}/scalar-expressions.md %}#tuple-constructors) type, even if it is constructed from indexed fields

To create an index on the schemaless data in a [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) column or on the data in an [`ARRAY`]({% link {{ page.version.version }}/array.md %}), use a [GIN index]({% link {{ page.version.version }}/inverted-indexes.md %}).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the table.

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
`UNIQUE` | Apply the [`UNIQUE` constraint]({% link {{ page.version.version }}/unique.md %}) to the indexed columns.<br><br>This causes the system to check for existing duplicate values on index creation. It also applies the `UNIQUE` constraint at the table level, so the system checks for duplicate values when inserting or updating data.
`INVERTED` | Create a [GIN index]({% link {{ page.version.version }}/inverted-indexes.md %}) on the schemaless data in the specified [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) column.<br><br> You can also use the PostgreSQL-compatible syntax `USING GIN`. For more details, see [GIN Indexes]({% link {{ page.version.version }}/inverted-indexes.md %}#creation).
`VECTOR` | Create a [vector index]({% link {{ page.version.version }}/vector-indexes.md %}) on the specifed [`VECTOR`]({% link {{ page.version.version }}/vector.md %}) column.<br><br>For more details, refer to [Vector Indexes]({% link {{ page.version.version }}/vector-indexes.md %}).
`IF NOT EXISTS` | Create a new index only if an index of the same name does not already exist; if one does exist, do not return an error.
`opt_index_name`<br>`index_name` | The name of the index to create, which must be unique to its table and follow these [identifier rules]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers).<br><br>If you do not specify a name, CockroachDB uses the format `<table>_<columns>_key/idx`. `key` indicates the index applies the `UNIQUE` constraint; `idx` indicates it does not. Example: `accounts_balance_idx`
`table_name` | The name of the table you want to create the index on.
`USING name` | An optional clause for compatibility with third-party tools. Accepted values for `name` are `btree`, `gin`, and `gist`, with `btree` for a standard secondary index, `gin` as the PostgreSQL-compatible syntax for a [GIN index](#create-gin-indexes), `gist` for a [spatial index]({% link {{ page.version.version }}/spatial-indexes.md %}), and `cspann` for a [vector index]({% link {{ page.version.version }}/vector-indexes.md %}). `hnsw` is aliased to `cspann` for compatibility with [`pgvector`](https://github.com/pgvector/pgvector) syntax.
`name` | The name of the column you want to index. For [multi-region tables]({% link {{ page.version.version }}/multiregion-overview.md %}#table-localities), you can use the `crdb_region` column within the index in the event the original index may contain non-unique entries across multiple, unique regions.
`ASC` or `DESC`| Sort the column in ascending (`ASC`) or descending (`DESC`) order in the index. How columns are sorted affects query results, particularly when using `LIMIT`.<br><br>__Default:__ `ASC`
`STORING ...`| Store (but do not sort) each column whose name you include.<br><br>For information on when to use `STORING`, see  [Store Columns](#store-columns).  Note that columns that are part of a table's [`PRIMARY KEY`]({% link {{ page.version.version }}/primary-key.md %}) cannot be specified as `STORING` columns in secondary indexes on the table.<br><br>`COVERING` and `INCLUDE` are aliases for `STORING` and work identically.
`opt_partition_by` | An option that lets you [define index partitions at the row level]({% link {{ page.version.version }}/partitioning.md %}). As of CockroachDB v21.1 and later, most users should use [`REGIONAL BY ROW` tables]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables). Indexes against regional by row tables are automatically partitioned, so explicit index partitioning is not required.
`opt_where_clause` |  An optional `WHERE` clause that defines the predicate boolean expression of a [partial index]({% link {{ page.version.version }}/partial-indexes.md %}).
`opt_index_visible` | An optional `VISIBLE`, `NOT VISIBLE`, or `VISIBILITY` clause that indicates that an [index is visible, not visible, or partially visible to the cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}#control-whether-the-optimizer-uses-an-index). If not visible, the index will not be used in queries unless it is specifically selected with an [index hint]({% link {{ page.version.version }}/indexes.md %}#selection) or the property is overridden with the [`optimizer_use_not_visible_indexes` session variable]({% link {{ page.version.version }}/set-vars.md %}#optimizer-use-not-visible-indexes). For examples, see [Set index visibility]({% link {{ page.version.version }}/alter-index.md %}#set-index-visibility).<br><br>Indexes that are not visible are still used to enforce `UNIQUE` and `FOREIGN KEY` [constraints]({% link {{ page.version.version }}/constraints.md %}). For more considerations, see [Index visibility considerations](alter-index.html#not-visible).
`USING HASH` |  Creates a [hash-sharded index]({% link {{ page.version.version }}/hash-sharded-indexes.md %}).
`WITH storage_parameter` |  A comma-separated list of [spatial index tuning parameters]({% link {{ page.version.version }}/spatial-indexes.md %}#index-tuning-parameters). Supported parameters include `fillfactor`, `s2_max_level`, `s2_level_mod`, `s2_max_cells`, `geometry_min_x`, `geometry_max_x`, `geometry_min_y`, and `geometry_max_y`. The `fillfactor` parameter is a no-op, allowed for PostgreSQL-compatibility.<br><br>For details, see [Spatial index tuning parameters]({% link {{ page.version.version }}/spatial-indexes.md %}#index-tuning-parameters). For an example, see [Create a spatial index that uses all of the tuning parameters]({% link {{ page.version.version }}/spatial-indexes.md %}#create-a-spatial-index-that-uses-all-of-the-tuning-parameters).
`CONCURRENTLY` |  Optional, no-op syntax for PostgreSQL compatibility. All indexes are created concurrently in CockroachDB.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Create standard indexes

To create the most efficient indexes, we recommend reviewing:

- [Indexes: Best Practices]({% link {{ page.version.version }}/indexes.md %}#best-practices)
- [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/)

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

To create the most useful multiple-column indexes, we recommend reviewing our [best practices]({% link {{ page.version.version }}/schema-design-indexes.md %}#best-practices).

#### Unique indexes

Unique indexes do not allow duplicate values among their columns.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE UNIQUE INDEX ON users (name, id);
~~~

This also applies the [`UNIQUE` constraint]({% link {{ page.version.version }}/unique.md %}) at the table level, similar to [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}). The preceding example is equivalent to:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD CONSTRAINT users_name_id_key UNIQUE (name, id);
~~~

Primary key columns that are not specified within a unique index are automatically marked as [`STORING`]({% link {{ page.version.version }}/indexes.md %}#storing-columns) in the [`information_schema.statistics`]({% link {{ page.version.version }}/information-schema.md %}#statistics) table and in [`SHOW INDEX`]({% link {{ page.version.version }}/show-index.md %}).

### Create GIN indexes

You can create [GIN indexes]({% link {{ page.version.version }}/inverted-indexes.md %}) on schemaless data in a [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) column.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON promo_codes USING GIN (rules);
~~~

The following syntax is equivalent:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INVERTED INDEX ON promo_codes (rules);
~~~

### Create trigram indexes

You can create [trigram indexes]({% link {{ page.version.version }}/trigram-indexes.md %}) on `STRING` columns by specifying the `gin_trgm_ops` or `gist_trgm_ops` opclass:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE INDEX ON rides USING GIN (vehicle_city gin_trgm_ops);
~~~

The following syntax is equivalent:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE INVERTED INDEX ON rides(vehicle_city gin_trgm_ops);
~~~

{{site.data.alerts.callout_info}}
GIN and GiST indexes are implemented identically on CockroachDB. `GIN` and `GIST` are therefore synonymous when defining a trigram index.
{{site.data.alerts.end}}
  
### Create spatial indexes

You can create [spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %}) on `GEOMETRY` and `GEOGRAPHY` columns.  Spatial indexes are a special type of [GIN index]({% link {{ page.version.version }}/inverted-indexes.md %}).

To create a spatial index on a `GEOMETRY` column:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX geom_idx_1 ON some_spatial_table USING GIST(geom);
~~~

Unlike GIN indexes, spatial indexes do not support an alternate `CREATE INVERTED INDEX ...` syntax.  Only the syntax shown here is supported.

For advanced users, there are a number of [spatial index tuning parameters]({% link {{ page.version.version }}/spatial-indexes.md %}#create-a-spatial-index-that-uses-all-of-the-tuning-parameters) that can be passed in using the syntax `WITH (var1=val1, var2=val2)` as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX geom_idx_2
  ON some_spatial_table USING GIST(geom)
  WITH (s2_max_cells = 20, s2_max_level = 12, s2_level_mod = 3);
~~~

{{site.data.alerts.callout_danger}}
Most users should not change the default spatial index settings. There is a risk that you will get worse performance by changing the default settings. For more information , see [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %}).
{{site.data.alerts.end}}

### Create vector indexes

You can create [vector indexes]({% link {{ page.version.version }}/vector-indexes.md %}) on [`VECTOR`]({% link {{ page.version.version }}/vector.md %}) columns.

To create a vector index on a `VECTOR` column named `embedding`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VECTOR INDEX ON items (embedding);
~~~

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

Normally, CockroachDB selects the index that it calculates will scan the fewest rows. However, you can override that selection and specify the name of the index you want to use. To find the name, use [`SHOW INDEX`]({% link {{ page.version.version }}/show-index.md %}).

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

- [Indexes]({% link {{ page.version.version }}/indexes.md %})
- [`SHOW INDEX`]({% link {{ page.version.version }}/show-index.md %})
- [`DROP INDEX`]({% link {{ page.version.version }}/drop-index.md %})
- [`ALTER INDEX ... RENAME TO`]({% link {{ page.version.version }}/alter-index.md %}#rename-to)
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
