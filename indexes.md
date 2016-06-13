---
title: Indexes
summary: Indexes improve SQL's performance by helping it locate data without having to look through every row of a table.
toc: false
---

Indexes improve SQL's performance by helping it locate data without having to look through every row of a table. You can create indexes at the same time as a table ([`CREATE TABLE`](create-table.html#create-a-table-with-secondary-indexes)) or after the table is created ([`CREATE INDEX`](create-index.html)).

{{site.data.alerts.callout_info}}Indexes are automatically created for a table's <a href="constraints.html#primary-key"><code>PRIMARY KEY</code></a> and <a href="constraints.html#unique"><code>UNIQUE</code></a> columns.{{site.data.alerts.end}}

## How do indexes work?

Indexes copy and sort a column's values (without sorting the values in the table itself). This way, when you filter indexed columns with `WHERE` clauses, SQL can easily search an index's sorted values instead of scanning each row individually. On large tables, indexes greatly reduce the number of rows SQL has to scan, executing queries exponentially faster.

For example, if you index an `INT` column and then search it for rows that equal 10:

```
SELECT * FROM <table> WHERE <column> = 10;
```

SQL can use the index to find values starting at 10 but less than 11. In contrast, without an index, SQL would have to evaluate _every_ row in the column for values equalling 10.

As rows change, CockroachDB automatically updates your indexes. This can consume a noticeable amount of resources, especially for large, write-heavy tables. To make sure updating your indexes doesn't harm your performance, we recommend a few best practices.

## Best Practices

Indexes are meant to optimize your database's performance, but poorly planned indexes can actually slow down your database. Plan your indexes well by following these guidelines:

- Design indexes to optimize specific, commonly used queries.
- Favor creating many indexes of single columns over a few indexes of multiple columns. If you do use multiple columns, follow the best practices for [indexing](#indexing-multiple-columns) or [storing](#storing-columns) them.
- Do not use more than 3 columns in an index.

You can find advanced guidance in our blog post [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

### Indexing Multiple Columns

If you decide to create indexes of multiple columns:

- Only index columns that queries filter with `WHERE` clauses. If you only want to retrieve their values (e.g. using `SELECT`), you should instead [store the columns](#storing-columns).
- Order columns to maximize your index's efficiency. Columns are sorted in the order you list them, so your index's first column should have the greatest number of distinct values. Only index additional columns if they would have many distinct values after sorting the index by the first column.

### Storing Columns

Stored columns are not sorted, unlike indexed columns, which are. This means you might consider storing columns when:

- Columns are retrieved but not filtered with `WHERE` clauses (because sorting the column's values won't improve a query's performance).
- Queries filter other columns you plan to include in the same index.

For example, to optimize the performance of the following query...

```
SELECT <column 1>, <column 2> FROM <table> WHERE <column 1> = 10;
```

...you would index `<column 1>` and store `<column 2>`:

```
CREATE INDEX ON <table> (<column 1>) STORING (<column 2>);
```


## Technical Details

- Indexes are created [in your key-value store](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).
- Tables are not locked while CockroachDB creates indexes.

## See Also

- [`CREATE INDEX`](create-index.html)
- [`DROP INDEX`](drop-index.html) 
- [`RENAME INDEX`](rename-index.html) 
- [`SHOW INDEX`](show-index.html)
- [Data Definition](data-definition.html)