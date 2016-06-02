---
title: Indexes
toc: false
---

Indexes are used to quickly locate data without having to look through every row of a table. They can be created during table creation ([`CREATE TABLE`](create-table.html)) or separately using the [`CREATE INDEX`](create-index.html) statement. During table creation, the primary key and columns with the `UNIQUE` constraint are automatically indexed.

Other index-related SQL statements:

- [`DROP INDEX`](drop-index.html) 
- [`RENAME INDEX`](rename-index.html) 
- [`SHOW INDEX`](show-index.html). 
 
To understand how CockroachDB chooses the best index for running a query, see [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

## See Also

[Data Definition](data-definition.html)