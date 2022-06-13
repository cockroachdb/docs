---
title: Indexes
summary: Indexes improve your database's performance by helping SQL locate data without having to look through every row of a table.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: develop
---

Indexes improve your database's performance by helping SQL locate data without having to look through every row of a table.

## How do indexes work?

When you create an index, CockroachDB "indexes" the columns you specify, which creates a copy of the columns and then sorts their values (without sorting the values in the table itself).

After a column is indexed, SQL can easily filter its values using the index instead of scanning each row one-by-one. On large tables, this greatly reduces the number of rows SQL has to use, executing queries exponentially faster.

For example, if you index an `INT` column and then filter it `WHERE <indexed column> = 10`, SQL can use the index to find values starting at 10 but less than 11. In contrast, without an index, SQL would have to evaluate **every** row in the table for values equaling 10.  This is also known as a "full table scan", and it can be very bad for query performance.

You can also create an index on a subset of rows. This type of index is called a _partial index_. For more information, see [Partial Indexes](partial-indexes.html).

To index [spatial data](spatial-data.html), CockroachDB uses _spatial indexes_. For more information, see [Spatial Indexes](spatial-indexes.html).

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

### Creation

Each table automatically has an index created called `<tbl>_pkey`, which indexes either its [primary key](primary-key.html) or&mdash;if there is no primary key&mdash;a unique value for each row known as `rowid`. We recommend always defining a primary key because the index it creates provides much better performance than letting CockroachDB use `rowid`.

 To require an explicitly defined primary key for all tables created in your cluster, set the `sql.defaults.require_explicit_primary_keys.enabled` [cluster setting](cluster-settings.html) to `true`.

The `primary` index helps filter a table's primary key but doesn't help SQL find values in any other columns. However, you can use [secondary indexes](schema-design-indexes.html) to improve the performance of queries using columns not in a table's primary key. You can create them:

<a name="unique-secondary-indexes"></a>

- At the same time as the table with the `INDEX` clause of [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-and-gin-indexes). In addition to explicitly defined indexes, CockroachDB automatically creates secondary indexes for columns with the [`UNIQUE` constraint](unique.html).
- For existing tables with [`CREATE INDEX`](create-index.html).
- By applying the `UNIQUE` constraint to columns with [`ALTER TABLE`](alter-table.html), which automatically creates an index of the constrained columns.

To review guidelines for creating the most useful secondary indexes, see [Secondary Indexes: Best practices](schema-design-indexes.html#best-practices).

### Selection

In most cases CockroachDB selects the index it calculates will scan the fewest rows (i.e., the fastest). Cases where CockroachDB will use multiple indexes include certain queries that use disjunctions (i.e., predicates with `OR`), as well as [zigzag joins](cost-based-optimizer.html#zigzag-joins) for some other queries. To learn how to use  the [`EXPLAIN`](explain.html) statement for your query to see which index is being used, see [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

To override CockroachDB index selection, you can also force queries [to use a specific index](table-expressions.html#force-index-selection) (also known as "index hinting"). Index hinting is supported for [`SELECT`](select-clause.html#select-from-a-specific-index), [`DELETE`](delete.html#force-index-selection-for-deletes), and [`UPDATE`](update.html#force-index-selection-for-updates) statements.

### Storage

CockroachDB stores indexes directly in its key-value store. You can find more information in our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

### Locking

Tables are not locked during index creation due to CockroachDB support for [online schema changes](online-schema-changes.html).

### Performance

Indexes create a trade-off: they greatly improve the speed of queries, but may slightly slow down writes to an affected column (because new values have to be written for both the table _and_ the index).

To maximize your indexes' performance, Cockroach Labs recommends following the [secondary index best practices](schema-design-indexes.html#best-practices).

{{site.data.alerts.callout_success}}
For more information about how to tune CockroachDB performance, see [SQL Performance Best Practices](performance-best-practices-overview.html).
{{site.data.alerts.end}}

### Storing columns

The `STORING` clause specifies columns which are not part of the index key but should be stored in the index. This optimizes queries that retrieve those columns without filtering on them, because it prevents the need to read the [primary index](primary-key.html).

{% include {{page.version.version}}/sql/covering-index.md %}

The synonym `COVERING` is also supported.

#### Example

Suppose you have a table with three columns, two of which are indexed:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE tbl (col1 INT, col2 INT, col3 INT, INDEX (col1, col2));
~~~

If you filter on the indexed columns but retrieve the unindexed column, this requires reading `col3` from the primary index via an "index join."

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT col3 FROM tbl WHERE col1 = 10 AND col2 > 1;
~~~

~~~
  distribution: local
  vectorized: true

  • index join
  │ table: tbl@tbl_pkey
  │
  └── • scan
        missing stats
        table: tbl@tbl_col1_col2_idx
        spans: [/10/2 - /10]

  index recommendations: 1
  1. type: index replacement
     SQL commands: CREATE INDEX ON tbl (col1, col2) STORING (col3); DROP INDEX tbl@tbl_col1_col2_idx;
(14 rows)
~~~

However, if you store `col3` in the index as shown in the [index recommendation](explain.html#default-statement-plans), the index join is no longer necessary. This means your query only needs to read from the secondary index, so it will be more efficient.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE tbl (col1 INT, col2 INT, col3 INT, INDEX (col1, col2) STORING (col3));
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT col3 FROM tbl WHERE col1 = 10 AND col2 > 1;
~~~

~~~
               info
----------------------------------
  distribution: local
  vectorized: true

  • scan
    missing stats
    table: tbl@tbl_col1_col2_idx
    spans: [/10/2 - /10]
(7 rows)
~~~

## Best practices

For best practices, see [Secondary Indexes: Best practices](schema-design-indexes.html#best-practices).

## Indexes on `REGIONAL BY ROW` tables in multi-region databases

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

This behavior also applies to [GIN indexes](inverted-indexes.html).

For an example that uses unique indexes but applies to all indexes on `REGIONAL BY ROW` tables, see [Add a unique index to a `REGIONAL BY ROW` table](add-constraint.html#add-a-unique-index-to-a-regional-by-row-table).

## See also

- [`CREATE INDEX`](create-index.html)
- [Secondary Indexes](schema-design-indexes.html)
- [GIN Indexes](inverted-indexes.html)
- [Partial Indexes](partial-indexes.html)
- [Spatial Indexes](spatial-indexes.html)
- [Hash-sharded Indexes](hash-sharded-indexes.html)
- [Expression Indexes](expression-indexes.html)
- [Select from a specific index](select-clause.html#select-from-a-specific-index)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [`SHOW INDEX`](show-index.html)
- [SQL Statements](sql-statements.html)
