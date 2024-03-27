---
title: SQL
summary: CockroachDB's external API is Standard SQL with extensions.
toc: false
---

At the lowest level, CockroachDB is a distributed, strongly-consistent, transactional key-value store, but the external API is [Standard SQL with extensions](sql-feature-support.html). This provides developers familiar relational concepts such as schemas, tables, columns, and indexes, and the ability to structure, manipulate, and query data using well-established and time-proven tools and processes. Also, since CockroachDB supports the PostgreSQL wire protocol, it’s simple to get your application talking to Cockroach; just find your [PostgreSQL language-specific driver](install-client-drivers.html) and start building.  

## See Also

- [SQL Feature Support](sql-feature-support.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [Use the Built-In SQL Client](use-the-built-in-sql-client.html)
- [SQL in CockroachDB: Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/)
- [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/)