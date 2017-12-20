---
title: Indexes
summary: Indexes improve your database's performance by helping SQL locate data without having to look through every row of a table.
toc: false
toc_not_nested: true
---

Indexes improve your database's performance by helping SQL locate data without having to look through every row of a table.

<div id="toc"></div>

## How Do Indexes Work?

When you create an index, CockroachDB "indexes" the columns you specify, which creates a copy of the columns and then sorts their values (without sorting the values in the table itself).

After a column is indexed, SQL can easily filter its values using the index instead of scanning each row one-by-one. On large tables, this greatly reduces the number of rows SQL has to use, executing queries exponentially faster.

For example, if you index an `INT` column and then filter it <code>WHERE &lt;indexed column&gt; = 10</code>, SQL can use the index to find values starting at 10 but less than 11. In contrast, without an index, SQL would have to evaluate _every_ row in the column for values equaling 10.

### Creation

Each table automatically has an index created called `primary`, which indexes either its [primary key](primary-key.html) or&mdash;if there is no primary key&mdash;a unique value for each row known as `rowid`. We recommend always defining a primary key because the index it creates provides much better performance than letting CockroachDB use `rowid`.

The `primary` index helps filter a table's primary key but doesn't help SQL find values in any other columns. However, you can improve the performance of queries using columns besides the primary key with secondary indexes. You can create them:

- At the same time as the table with the `INDEX` clause of [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-indexes). In addition to explicitly defined indexes, CockroachDB automatically creates secondary indexes for columns with the [Unique constraint](unique.html).
- For existing tables with [`CREATE INDEX`](create-index.html).
- By applying the Unique constraint to columns with [`ALTER TABLE`](alter-table.html), which automatically creates an index of the constrained columns.

To create the most useful secondary indexes, you should also check out our [best practices](#best-practices).

### Selection

Because each query can use only a single index, CockroachDB selects the index it calculates will scan the fewest rows (i.e. the fastest). For more detail, check out our blog post [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

To override CockroachDB's index selection, you can also force [queries to use a specific index](select.html#force-index-selection-index-hints) (also known as "index hinting").

### Storage

CockroachDB stores indexes directly in your key-value store. You can find more information in our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

### Locking

Tables are not locked during index creation thanks to CockroachDB's [schema change procedure](https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/).

### Performance

Indexes create a trade-off: they greatly improve the speed of queries, but slightly slow down writes (because new values have to be copied and sorted). The first index you create has the largest impact, but additional indexes only introduce marginal overhead.

To maximize your indexes' performance, we recommend following a few [best practices](#best-practices).

## Best Practices

We recommend creating indexes for all of your common queries. To design the most useful indexes, look at each query's `WHERE` and `FROM` clauses, and create indexes that: 

- [Index all columns](#indexing-columns) in the `WHERE` clause.
- [Store columns](#storing-columns) that are _only_ in the `FROM` clause.

### Indexing Columns

When designing indexes, it's important to consider which columns you index and the order you list them. Here are a few guidelines to help you make the best choices:

- Each table's [primary key](primary-key.html) (which we recommend always [defining](create-table.html#create-a-table-primary-key-defined)) is automatically indexed. The index it creates (called `primary`) cannot be changed, nor can you change the primary key of a table after it's been created, so this is a critical decision for every table.
- Queries can benefit from an index even if they only filter a prefix of its columns. For example, if you create an index of columns `(A, B, C)`, queries filtering `(A)` or `(A, B)` can still use the index. However, queries that don't filter `(A)` won't benefit from the index.<br><br>This feature also lets you avoid using single-column indexes. Instead, use the column as the first column in a multiple-column index, which is useful to more queries.
- Columns filtered in the `WHERE` clause with the equality operators (`=` or `IN`) should come first in the index, before those referenced with inequality operators (`<`, `>`).
- Indexes of the same columns in different orders can produce different results for each query. For more information, see [our blog post on index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/)&mdash;specifically the section "Restricting the search space."

### Storing Columns

Storing a column optimizes the performance of queries that retrieve its values (i.e., in the `FROM` clause) but don’t filter them. This is because indexing values is only useful when they're filtered, but it's still faster for SQL to retrieve values in the index it's already scanning rather than reaching back to the table itself.

However, for SQL to use stored columns, queries must filter another column in the same index.

### Example

If you wanted to optimize the performance of the following queries:

~~~ sql
> SELECT col1 FROM tbl WHERE col1 = 10;

> SELECT col1, col2, col3 FROM tbl WHERE col1 = 10 AND col2 > 1;
~~~

You could create a single index of `col1` and `col2` that stores `col3`:

~~~ sql
> CREATE INDEX ON tbl (col1, col2) STORING (col3);
~~~

## See Also

- [`CREATE INDEX`](create-index.html)
- [`DROP INDEX`](drop-index.html) 
- [`RENAME INDEX`](rename-index.html) 
- [`SHOW INDEX`](show-index.html)
- [SQL Statements](sql-statements.html)
