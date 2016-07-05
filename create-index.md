---
title: CREATE INDEX
summary: The CREATE INDEX statement creates an index for a table. Indexes improve SQL's performance by helping it locate data without having to look through every row of a table.
toc: false
---

The `CREATE INDEX` [statement](sql-statements.html) creates an index for a table. [Indexes](indexes.html) improve SQL's performance by helping it locate data without having to look through every row of a table.

{{site.data.alerts.callout_info}}Indexes are automatically created for a table's <a href="constraints.html#primary-key"><code>PRIMARY KEY</code></a> and <a href="constraints.html#unique"><code>UNIQUE</code></a> columns.<br><br>When querying a table, CockroachDB uses the fastest collection of indexes. For more information about that process, see <a href="https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/">Index Selection in CockroachDB</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/create_index.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

| Parameter | Description |
|-----------|-------------|
|`UNIQUE` | Apply the [`UNIQUE`](constraints.html#unique) constraint to the indexed columns.<br><br>This also applies the `UNIQUE` constraint at the table level, similarly to <code><a href="alter-table.html">ALTER TABLE</a> &lt;table&gt; ADD CONSTRAINT &lt;name&gt; UNIQUE (&lt;columns&gt;)</code>.|
|`IF NOT EXISTS` | Create a new index only if an index of the same name does not already exist; if one does exist, do not return an error.|
|`name`<br>_(First instance)_ | The name of the index to create, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).<br><br>If you don't specify a name, CockroachDB uses the format `<table>_<columns>_key/idx`. `key` indicates the index applies the `UNIQUE` constraint; `idx` indicates it does not. Example: `accounts_balance_idx`|
|`qualified_name` | The name of the table you want to create the index on. |
|`name`<br>_(Second instance)_  | The name of the column you want to index.<br><br>When deciding to create indexes of multiple columns, see [Indexes: Best Practices](indexes.html#best-practices).|
|`ASC` or `DESC`| Sort the column in ascending (`ASC`) or descending (`DESC`) order in the index. How columns are sorted can affect query results, particularly when using `LIMIT`.<br><br>__Default:__ `ASC`|
|`STORING ...`| Store (but do not sort) each column whose `name` you include in the clause.<br><br>`COVERING` aliases `STORING` and works identically.<br><br>For information on when to use `STORING`, see [Indexes: Storing Columns](indexes.html#storing-columns).

## Usage

### Create Indexes

To create an index of one or more columns, use the following syntax:

~~~
CREATE INDEX ON <table> (<columns>);
~~~

- `<table>` is the table you want to use for the index.
- `<columns>` is a comma-separated list of column names you want to index.

When deciding to create indexes of multiple columns, see [Indexes: Best Practices](indexes.html#best-practices).

### Store Columns

To create an index that stores columns, use the following syntax:

~~~
CREATE INDEX ON <table> (<indexed columns>) STORING (<stored columns>);
~~~

- `<table>` is the table you want to use for the index.
- `<indexed columns>` is a comma-separated list of column names you want to index.
- `<stored columns>` is a comma-separated list of column names you want to store.

For information on when to use `STORING`, see [Indexes: Storing Columns](indexes.html#storing-columns).

### Query Specific Indexes

To query a specific index (instead of letting CockroachDB select the best set of indexes), use the following syntax:

~~~
... FROM <table>@<index> ...
~~~

- `<table>` is the name of the table the index is on.
- `<index>` is the name of the index you want to use. To find an index's name, use [`SHOW INDEX`](show-index.html).
- `...` is the rest of your statement.



## Examples

The goal of indexes is to reduce the number of rows SQL has to scan when querying tables, so we'll focus on doing that for some simple queries. To see indexes working, we'll use `EXPLAIN` with `SELECT`, which shows the indexes CockroachDB plans to use for the query.

Let's get started by creating a table with a few columns:

~~~sql
CREATE TABLE products (id INT PRIMARY KEY, name STRING, price DECIMAL, stock INT);
~~~

Because our table contains a [`PRIMARY KEY`](constraints.html#primary-key), CockroachDB automatically creates an index called `@primary`. Here's an example of what queries using the primary key look like:

~~~sql
EXPLAIN SELECT name, price FROM products WHERE id = 1;

+-------+------+------------------------+
| Level | Type |      Description       |
+-------+------+------------------------+
|     0 | scan | products@primary /1-/2 |
+-------+------+------------------------+
~~~

You can read the description as, "Scan through the product table's primary index for values starting at 1 but less than 2."

However, until we create additional indexes, `@primary` is the only index SQL can use regardless of the columns we search. For example, searching another column gives us...

~~~sql
EXPLAIN SELECT name FROM products WHERE stock > 0;

+-------+------+--------------------+
| Level | Type |    Description     |
+-------+------+--------------------+
|     0 | scan | products@primary - |
+-------+------+--------------------+
~~~

`@primary` only sorts the primary key, so SQL has to scan each row one-by-one (shown by `-` in the description) to find `stock` values matching the filter.

In terms of performance, scanning every row is the worst-case scenario. Every time we avoid it, we've probably done some optimization. We say _probably_ because it's possible to create indexes that actually slow down your database.

To improve the query's performance, let's create an index for `stock`. (You don't normally need to choose names for your indexes, but we will for our examples.)


~~~sql
CREATE INDEX byStock ON products (stock);

EXPLAIN SELECT name FROM products WHERE stock > 0;

+-------+------------+----------------------+
| Level |    Type    |     Description      |
+-------+------------+----------------------+
|     0 | index-join |                      |
|     1 | scan       | products@byStock /1- |
|     1 | scan       | products@primary     |
+-------+------------+----------------------+
~~~

SQL still had to use `@primary` to get values from `name`, which `@byStock` doesn't include. Despite that, CockroachDB calculates this plan is likely faster than scanning every row of `@primary`. Note that this scan of `@primary` doesn't examine every row (indicated by the absence of `-`), only those that `@byStock` returns.

If this is a common type of query, we can improve its performance by storing `name` in an index with `stock`, removing the need to use `@primary`. We want to _store_ instead of _index_ `name` because its values aren't filtered; sorting them won't improve the query's performance.

~~~sql
CREATE INDEX byStock_storeName ON products (stock) STORING (name);

EXPLAIN SELECT name FROM products WHERE stock>0;

+-------+------+----------------------------------+
| Level | Type |           Description            |
+-------+------+----------------------------------+
|     0 | scan | products@byStock_storeName /1-   |
+-------+------+----------------------------------+
~~~

Predictably, if we add another column to the `WHERE` clause (we'll use `price`), SQL is going to have to use `@primary` to find the values.

~~~sql
EXPLAIN SELECT name FROM products WHERE stock > 0 AND price >= 10;

+-------+------------+----------------------+
| Level |    Type    |     Description      |
+-------+------------+----------------------+
|     0 | index-join |                      |
|     1 | scan       | products@byStock /1- |
|     1 | scan       | products@primary     |
+-------+------------+----------------------+
~~~

Again, if this is a common query whose performance matters, we can index the column along with the others. This time we should _index_ `price` so it's sorted because the query filters its values.

~~~sql
CREATE INDEX byStockPrice_storeName ON products (stock, price) STORING (name);

EXPLAIN SELECT name FROM products WHERE stock>0 AND price >= 10;

+-------+------+------------------------------------------+
| Level | Type |               Description                |
+-------+------+------------------------------------------+
|     0 | scan | products@byStockPrice_storeName /1/10-   |
+-------+------+------------------------------------------+
~~~

Before planning your database's indexes, you should also review [Indexes: Best Practices](indexes.html#best-practices).

## See Also

- [Indexes](indexes.html)
- [`SHOW INDEX`](show-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [Other SQL Statements](sql-statements.html)