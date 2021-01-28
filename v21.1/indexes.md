---
title: Indexes
summary: Indexes improve your database's performance by helping SQL locate data without having to look through every row of a table.
toc: true
toc_not_nested: true
---

Indexes improve your database's performance by helping SQL locate data without having to look through every row of a table.

## How do indexes work?

When you create an index, CockroachDB "indexes" the columns you specify, which creates a copy of the columns and then sorts their values (without sorting the values in the table itself).

After a column is indexed, SQL can easily filter its values using the index instead of scanning each row one-by-one. On large tables, this greatly reduces the number of rows SQL has to use, executing queries exponentially faster.

For example, if you index an `INT` column and then filter it <code>WHERE &lt;indexed column&gt; = 10</code>, SQL can use the index to find values starting at 10 but less than 11. In contrast, without an index, SQL would have to evaluate _every_ row in the table for values equaling 10.  This is also known as a "full table scan", and it can be very bad for query performance.

 You can also create an index on a subset of rows. This type of index is called a partial index. For more information, see [Partial indexes](partial-indexes.html).

 To index [spatial data](spatial-data.html), CockroachDB uses *spatial indexes*. For more information about spatial indexes, see [Spatial Indexes](spatial-indexes.html).

### Creation

Each table automatically has an index created called `primary`, which indexes either its [primary key](primary-key.html) or&mdash;if there is no primary key&mdash;a unique value for each row known as `rowid`. We recommend always defining a primary key because the index it creates provides much better performance than letting CockroachDB use `rowid`.

The `primary` index helps filter a table's primary key but doesn't help SQL find values in any other columns. However, you can use secondary indexes to improve the performance of queries using columns not in a table's primary key. You can create them:

<a name="unique-secondary-indexes"></a>

- At the same time as the table with the `INDEX` clause of [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-and-inverted-indexes). In addition to explicitly defined indexes, CockroachDB automatically creates secondary indexes for columns with the [`UNIQUE` constraint](unique.html).
- For existing tables with [`CREATE INDEX`](create-index.html).
- By applying the `UNIQUE` constraint to columns with [`ALTER TABLE`](alter-table.html), which automatically creates an index of the constrained columns.

To create the most useful secondary indexes, you should also check out our [best practices](#best-practices).

### Selection

Because each query can use only a single index, CockroachDB selects the index it calculates will scan the fewest rows (i.e., the fastest). For more detail, check out our blog post [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/), which will show you how to use the [`EXPLAIN`](explain.html) statement for your query to see which index is being used.

To override CockroachDB's index selection, you can also force queries [to use a specific index](table-expressions.html#force-index-selection) (also known as "index hinting"). Index hinting is supported for [`SELECT`](select-clause.html#select-from-a-specific-index), [`DELETE`](delete.html#force-index-selection-for-deletes), and [`UPDATE`](update.html#force-index-selection-for-updates) statements.

### Storage

CockroachDB stores indexes directly in your key-value store. You can find more information in our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

### Locking

Tables are not locked during index creation thanks to CockroachDB's [schema change procedure](https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/).

### Performance

Indexes create a trade-off: they greatly improve the speed of queries, but may slightly slow down writes to an affected column (because new values have to be written for both the table _and_ the index).

To maximize your indexes' performance, we recommend following a few [best practices](#best-practices).

## Best practices

We recommend creating indexes for all of your common queries. To design the most useful indexes, look at each query's `WHERE` and `SELECT` clauses, and create indexes that:

- [Index all columns](#indexing-columns) in the `WHERE` clause.
- [Store columns](#storing-columns) that are _only_ in the `SELECT` clause.

{{site.data.alerts.callout_success}}
For more information about how to tune CockroachDB's performance, see [SQL Performance Best Practices](performance-best-practices-overview.html) and the [Performance Tuning](performance-tuning.html) tutorial.
{{site.data.alerts.end}}

### Indexing columns

When designing indexes, it's important to consider which columns you index and the order in which you list them. Here are a few guidelines to help you make the best choices:

- Queries can benefit from an index even if they only filter a prefix of its columns. For example, if you create an index of columns `(A, B, C)`, queries filtering `(A)` or `(A, B)` can still use the index. However, queries that do not filter `(A)` will not benefit from the index.<br><br>This feature also lets you avoid using single-column indexes. Instead, use the column as the first column in a multiple-column index, which is useful to more queries.
- Columns filtered in the `WHERE` clause with the equality operators (`=` or `IN`) should come first in the index, before those referenced with inequality operators (`<`, `>`).
- Indexes of the same columns in different orders can produce different results for each query. For more information, see [our blog post on index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/)&mdash;specifically the section "Restricting the search space."
- Avoid indexing on sequential values. Writes to indexes with sequential keys can result in range hotspots that negatively affect performance. Instead, use [randomly generated unique IDs](performance-best-practices-overview.html#unique-id-best-practices), or [multi-column keys](performance-best-practices-overview.html#use-multi-column-primary-keys).
- Avoid creating secondary indexes that you do not need, as they can slow down write performance and take up node memory. For example, if you want to [change a primary key](constraints.html#change-constraints), and you do not plan to filter queries on the old primary key column(s), do not use [`ALTER PRIMARY KEY`](alter-primary-key.html), which creates a secondary index from the old primary key. Instead, use [`DROP CONSTRAINT ... PRIMARY KEY`/`ADD CONSTRAINT ... PRIMARY KEY`](add-constraint.html#changing-primary-keys-with-add-constraint-primary-key), which does not create a secondary index.

### Storing columns

The `STORING` clause specifies columns which are not part of the index key but should be stored in the index. This optimizes queries which retrieve those columns without filtering on them, because it prevents the need to read the primary index.

### Example

Say we have a table with three columns, two of which are indexed:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE tbl (col1 INT, col2 INT, col3 INT, INDEX (col1, col2));
~~~

If we filter on the indexed columns but retrieve the unindexed column, this requires reading `col3` from the primary index via an "index join."

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT col3 FROM tbl WHERE col1 = 10 AND col2 > 1;
~~~

~~~
     tree    |     field     |      description
-------------+---------------+------------------------
             | distribution  | local
             | vectorized    | false
  index join |               |
   │         | table         | tbl@primary
   └── scan  |               |
             | missing stats |
             | table         | tbl@tbl_col1_col2_idx
             | spans         | [/10/2 - /10]
(8 rows)
~~~

However, if we store `col3` in the index, the index join is no longer necessary. This means our query only needs to read from the secondary index, so it will be more efficient.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE tbl (col1 INT, col2 INT, col3 INT, INDEX (col1, col2) STORING (col3));
~~~

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT col3 FROM tbl WHERE col1 = 10 AND col2 > 1;
~~~

~~~
  tree |     field     |      description
-------+---------------+------------------------
       | distribution  | local
       | vectorized    | false
  scan |               |
       | missing stats |
       | table         | tbl@tbl_col1_col2_idx
       | spans         | [/10/2 - /10]
(6 rows)
~~~

## See also

- [Inverted Indexes](inverted-indexes.html)
- [Spatial Indexes](spatial-indexes.html)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Select from a specific index](select-clause.html#select-from-a-specific-index)
- [`CREATE INDEX`](create-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [`SHOW INDEX`](show-index.html)
- [SQL Statements](sql-statements.html)
