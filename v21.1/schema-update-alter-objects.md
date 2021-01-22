---
title: Alter Objects in a Database Schema
summary: Modify a database object in a schema
toc: true
---

This page provides best-practice guidance on altering objects in a database schema, with some simple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

## Before you begin

Before reading this page, do the following:

<div class="filter-content" markdown="1" data-scope="local">
- Start a [local CockroachDB cluster](secure-a-cluster.html).
</div>
<div class="filter-content" markdown="1" data-scope="cockroachcloud">
- Create a [CockroachCloud cluster](cockroachcloud/create-your-cluster.html).
</div>
- Review [the database schema objects](schema-design-overview.html).
- Create [a database](schema-design-database.html), [a user-defined schema](schema-design-schema.html), [tables](schema-design-table.html), and some [secondary indexes](schema-design-indexes.html).
- Review [online schema changes](online-schema-changes.html).

## Alter an object

To change an object in a database schema, use the `ALTER` that corresponds to that object and the statement clause that corresponds to the change that you would like to make to that object.

For example, to rename a database, you would use the following statement:

`ALTER DATABASE`


## See also

- [`ALTER TABLE`](alter-table.html)
- [`CREATE TABLE`](create-table.html)