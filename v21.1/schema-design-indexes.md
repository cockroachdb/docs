---
title: Add Secondary Indexes
summary: Index columns in your schema
toc: true
---

This page provides best-practice guidance on creating indexes, with some simple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `CREATE INDEX` statement, including additional examples, see the [`CREATE INDEX` syntax page](create-index.html).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="local">Local</button>
  <button class="filter-button" data-scope="cockroachcloud">CockroachCloud</button>
</div>

## Before you begin

Before reading this page, do the following:

- [Install CockroachDB](install-cockroachdb.html).
<div class="filter-content" markdown="1" data-scope="local">
- Start a [local CockroachDB cluster](secure-a-cluster.html).
</div>
<div class="filter-content" markdown="1" data-scope="cockroachcloud">
- Create a [CockroachCloud cluster](cockroachcloud/create-your-cluster.html).
</div>
- Review [the database schema objects](schema-design-overview.html).
- Create [a database](schema-design-database.html).
- Create [a user-defined schema](schema-design-schema.html).
- Create [a table](schema-design-table.html).

## Create a secondary index

Indexes are [logical objects in a cluster](schema-design-overview.html#database-schema-objects) that help CockroachDB queries find data more efficiently. When you create an index, CockroachDB creates a copy of the columns selected for the index, and then sorts the rows of data by indexed column values, without sorting the values in the table itself.

CockroachDB automatically creates an index on the table's [primary key](primary-key.html) key columns. This index is called the `primary` index. The `primary` index helps CockroachDB more efficiently scan rows, as sorted by the table's primary key columns, but it does not help find values as identified by any other columns.

To improve the performance of queries that use columns not in a table's primary key, use secondary indexes. To create a secondary index, do one of the following:

- Add an `INDEX` clause to the end of a [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-and-inverted-indexes) statement.
- Use a [`CREATE INDEX`](create-index.html) statement.

Note that CockroachDB automatically creates secondary indexes for columns with the [`UNIQUE` constraint](unique.html).



### Best practices

We recommend creating indexes for all of your common queries. To design the most useful indexes, look at each query's `WHERE` and `SELECT` clauses, and create indexes that:

- [Index all columns](#indexing-columns) in the `WHERE` clause.
- [Store columns](#storing-columns) that are _only_ in the `SELECT` clause.

{{site.data.alerts.callout_success}}
For more information about how to tune CockroachDB's performance, see [SQL Performance Best Practices](performance-best-practices-overview.html) and the [Performance Tuning](performance-tuning.html) tutorial.
{{site.data.alerts.end}}

### Selecting indexed columns

When designing indexes, it's important to consider which columns you index and the order in which you list them. Here are a few guidelines to help you make the best choices:

- Queries can benefit from an index even if they only filter a prefix of its columns. For example, if you create an index of columns `(A, B, C)`, queries filtering `(A)` or `(A, B)` can still use the index. However, queries that do not filter `(A)` will not benefit from the index.<br><br>This feature also lets you avoid using single-column indexes. Instead, use the column as the first column in a multiple-column index, which is useful to more queries.
- Columns filtered in the `WHERE` clause with the equality operators (`=` or `IN`) should come first in the index, before those referenced with inequality operators (`<`, `>`).
- Indexes of the same columns in different orders can produce different results for each query. For more information, see [our blog post on index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/)&mdash;specifically the section "Restricting the search space."
- Avoid indexing on sequential values. Writes to indexes with sequential keys can result in range hotspots that negatively affect performance. Instead, use [randomly generated unique IDs](performance-best-practices-overview.html#unique-id-best-practices), or [multi-column keys](performance-best-practices-overview.html#use-multi-column-primary-keys).
- Avoid creating secondary indexes that you do not need, as they can slow down write performance and take up node memory. For example, if you want to [change a primary key](constraints.html#change-constraints), and you do not plan to filter queries on the old primary key column(s), do not use [`ALTER PRIMARY KEY`](alter-primary-key.html), which creates a secondary index from the old primary key. Instead, use [`DROP CONSTRAINT ... PRIMARY KEY`/`ADD CONSTRAINT ... PRIMARY KEY`](add-constraint.html#changing-primary-keys-with-add-constraint-primary-key), which does not create a secondary index.

### Storing columns

The `STORING` clause specifies columns which are not part of the index key but should be stored in the index. This optimizes queries which retrieve those columns without filtering on them, because it prevents the need to read the primary index.

## Add `CREATE` statements to your initialization file

Let's add some example indexes to the tables in our `movr` schema, following some of the best practices listed above.

We can use the same `dbinit.sql` file that you created in [Create a Database and Schema](schema-design-database-schema.html) and added to in [Create a Table](schema-design-table.html).

Open `dbinit.sql`, and, under the `CREATE SCHEMA` statement, add the `CREATE` statement for the `users` table:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    email STRING UNIQUE
)
~~~

Now add a definition for the `vehicles` table.

This table needs to include information about vehicle's owner, the type of vehicle, when it was created, and what its status is.



{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.vehicles (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      owner_id UUID NOT NULL REFERENCES cockroachlabs.movr.users(id),
      type STRING,
      creation_time TIMESTAMP(TZ),
      status ENUM,
      last_location STRING
  )
~~~

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.rides (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      rider_id UUID NOT NULL REFERENCES cockroachlabs.movr.users(id),
      vehicle_id UUID NOT NULL REFERENCES cockroachlabs.movr.vehicles(id),
      start_address STRING,
      end_address STRING,
      start_time TIMESTAMP(TZ),
      end_time TIMESTAMP(TZ),
      revenue DECIMAL(10,2)
  )
~~~


## See also

- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
- [Schema Design Overview](schema-design-overview.html)
- [`CREATE DATABASE`](create-database.html)
- [`CREATE SCHEMA`](create-schema.html)
- [Inverted Indexes](inverted-indexes.html)
- [Spatial Indexes](spatial-indexes.html)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Select from a specific index](select-clause.html#select-from-a-specific-index)
