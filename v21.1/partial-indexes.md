---
title: Partial Indexes
summary: Partial indexes allow you to specify a subset of rows and columns to add to an index.
toc: true
---

 Partial indexes allow you to specify a subset of rows and columns to add to an [index](indexes.html). Partial indexes include the subset of rows in a table that evaluate to true on a boolean *predicate expression* (i.e., a `WHERE` filter) defined at [index creation](#creation).

## How do partial indexes work?

When you create a partial index, CockroachDB "indexes" the columns and rows that evaluate to true on the index's boolean predicate expression, creating a sorted copy of the subset of row values, without modifying the values in the table itself.

CockroachDB can use a partial index to efficiently execute queries on any subset of rows implied by the partial index. When possible, the [cost-based optimizer](cost-based-optimizer.html) creates a plan that limits table scans on rows implied by the partial index to just the rows in the index. It also limits index rewrites to fewer rows.

Partial indexes can improve cluster performance in a number of ways:

- They contain fewer rows than full indexes, making them less expensive to create and store on a cluster.
- Read queries on rows included in a partial index only scan the rows in the partial index. This contrasts with queries on columns in full indexes, which must scan all rows in the indexed column.
- Write queries on tables with a partial index only perform an index write when the rows inserted satisfy the partial index predicate. This contrasts with write queries on tables with full indexes, which incur the overhead of a full index write when the rows inserted modify an indexed column.

{{site.data.alerts.callout_info}}
When a query on a table with a partial index has a filter expression, the [cost-based optimizer](cost-based-optimizer.html) attempts to prove that the filter implies the partial index predicate. It is not guaranteed that the optimizer can prove the implication of arbitrarily complex expressions. Although unlikely, it is possible that a filter implies a predicate, but the optimizer cannot prove the implication.
{{site.data.alerts.end}}

## Creation

To create a partial index, use a [`CREATE INDEX`](create-index.html) statement, with a standard `WHERE` clause defining a predicate expression.

For example, to define a partial index on columns `a` and `b` of table `t`, filtering on rows in column `c` greater than 5:

~~~ sql
> CREATE INDEX ON t (a, b) WHERE c > 5;
~~~

The following queries use the partial index:

~~~ sql
> SELECT a, b FROM t WHERE c > 5;
~~~

~~~ sql
> SELECT * FROM t WHERE c = 10;
~~~

The following queries do *not* use the partial index:

~~~ sql
> SELECT a, b FROM t;
~~~

~~~ sql
> SELECT * FROM t WHERE c = 3;
~~~

When defining the predicate expression, note that:

- The predicate expression must result in a [boolean](bool.html).
- The predicate expression can only refer to columns in the table being indexed.
- [Functions](functions-and-operators.html) used in predicates must be immutable. For example, the `now()` function is not allowed in predicates because its value depends on more than its arguments.

## Unique partial indexes

You can enforce [uniqueness](unique.html) on a subset of rows with `CREATE UNIQUE INDEX ... WHERE ...`.

For example, to define a unique partial index on columns `a` and `b` for table `t`, filtering on rows in column `d` equal to `'x'`:

~~~ sql
> CREATE UNIQUE INDEX ON t (a, b) WHERE d = 'x';
~~~

This creates a partial index and a `UNIQUE` constraint on the subset of rows where `d` is equal to `'x'`.

For another example, see [Create a partial index that enforces uniqueness on a subset of rows](#create-a-partial-index-that-enforces-uniqueness-on-a-subset-of-rows).

{{site.data.alerts.callout_success}}
When [inserted values](insert.html) conflict with a `UNIQUE` constraint on one or more columns, CockroachDB normally returns an error. We recommend adding an [`ON CONFLICT`](insert.html#on-conflict-clause) clause to all `INSERT` statements that might conflict with rows in the unique index.
{{site.data.alerts.end}}

## Index hints

You can force queries [to use a specific partial index](table-expressions.html#force-index-selection) (also known as "index hinting"), like you can with full indexes. However, unlike full indexes, partial indexes cannot be used to satisfy all queries. If a query's filter implies the partial index predicate expression, the partial index will be used in the query plan. If not, an error will be returned.

## Known limitations

- CockroachDB does not currently support partial [inverted indexes](inverted-indexes.html). See [tracking issue](https://github.com/cockroachdb/cockroach/issues/50952).
- CockroachDB does not currently support [`IMPORT`](import.html) statements on tables with partial indexes. See [tracking issue](https://github.com/cockroachdb/cockroach/issues/50225).
- CockroachDB does not currently support multiple arbiter indexes for `INSERT ON CONFLICT DO UPDATE`, and will return an error if there are multiple unique or exclusion constraints matching the `ON CONFLICT DO UPDATE` specification. See [tracking issue](https://github.com/cockroachdb/cockroach/issues/53170).

## Examples

### Setup

The following examples use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).

To follow along, run [`cockroach demo`](cockroach-demo.html) to start a temporary, in-memory cluster with the `movr` workload:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --with-load
~~~

### Create an index on a subset of rows

Suppose that you want to query the subset of `rides` with a `revenue` greater than 80.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW TABLES] WHERE table_name='rides';
~~~

~~~
  schema_name | table_name | type  | estimated_row_count
--------------+------------+-------+---------------------
  public      | rides      | table |               29446
(1 row)
~~~

Without a partial index, querying the `rides` table with a `WHERE revenue > 80` clause will scan the entire table. To see the plan for such a query, you can use an [`EXPLAIN` statement](explain.html):

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM rides WHERE revenue > 80;
~~~

~~~
    tree    |        field        |  description
------------+---------------------+----------------
            | distribution        | full
            | vectorized          | true
  filter    |                     |
   │        | filter              | revenue > 80
   └── scan |                     |
            | estimated row count | 29446
            | table               | rides@primary
            | spans               | FULL SCAN
(8 rows)
~~~

The `description` column for the `estimated row count` lists the number of rows that the query plan will scan (in this case, the entire table row count of 31337). The `description` for the `table` lists the index used in the scan (in this case, the [primary key index](primary-key.html)).

To limit the number of rows scanned to just the rows that you are querying, you can create a partial index:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON rides (city, revenue) WHERE revenue > 80;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM rides;
~~~

~~~
  table_name |                  index_name                   | non_unique | seq_in_index | column_name  | direction | storing | implicit
-------------+-----------------------------------------------+------------+--------------+--------------+-----------+---------+-----------
  rides      | primary                                       |   false    |            1 | city         | ASC       |  false  |  false
  rides      | primary                                       |   false    |            2 | id           | ASC       |  false  |  false
...
  rides      | rides_city_revenue_idx                        |    true    |            1 | city         | ASC       |  false  |  false
  rides      | rides_city_revenue_idx                        |    true    |            2 | revenue      | ASC       |  false  |  false
  rides      | rides_city_revenue_idx                        |    true    |            3 | id           | ASC       |  false  |   true
(12 rows)
~~~

Another `EXPLAIN` statement shows that the number of rows scanned by the original query decreases significantly with a partial index on the `rides` table:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM rides WHERE revenue > 80;
~~~

~~~
     tree    |        field        |                 description
-------------+---------------------+-----------------------------------------------
             | distribution        | full
             | vectorized          | true
  index join |                     |
   │         | table               | rides@primary
   └── scan  |                     |
             | estimated row count | 5829
             | table               | rides@rides_city_revenue_idx (partial index)
             | spans               | FULL SCAN
(8 rows)
~~~

Note that the query's `SELECT` statement queries all columns in the `rides` table, not just the indexed columns. As a result, an "index join" is required on both the primary index and the partial index.

Querying only the columns in the index will make the query more efficient by removing the index join from the query plan:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT city, revenue FROM rides WHERE revenue > 80;
~~~

~~~
  tree |        field        |                 description
-------+---------------------+-----------------------------------------------
       | distribution        | full
       | vectorized          | true
  scan |                     |
       | estimated row count | 5829
       | table               | rides@rides_city_revenue_idx (partial index)
       | spans               | FULL SCAN
(6 rows)
~~~

Querying a subset of the rows implied by the partial index predicate expression (in this case, `revenue > 80`) will also use the partial index:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT city, revenue FROM rides WHERE revenue > 95;
~~~

~~~
    tree    |        field        |                 description
------------+---------------------+-----------------------------------------------
            | distribution        | full
            | vectorized          | true
  filter    |                     |
   │        | filter              | revenue > 95
   └── scan |                     |
            | estimated row count | 5829
            | table               | rides@rides_city_revenue_idx (partial index)
            | spans               | FULL SCAN
(8 rows)
~~~

The number of rows scanned is the same, and an additional filter is applied to the query plan so that only the subset specified by the filter is returned.

So far, all the query scans in this example have spanned the entire partial index (i.e., performed a `FULL SCAN` of the index). This is because the `WHERE` clause does not filter on the first column in the index prefix (`city`). Filtering the query on both columns in the partial index will limit the scan to just the rows that match the filter:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT city, revenue FROM rides WHERE city = 'new york' AND revenue > 80;
~~~

~~~
  tree |        field        |                 description
-------+---------------------+-----------------------------------------------
       | distribution        | local
       | vectorized          | false
  scan |                     |
       | estimated row count | 660
       | table               | rides@rides_city_revenue_idx (partial index)
       | spans               | [/'new york' - /'new york']
(6 rows)
~~~

Refining the `revenue` filter expression to match just a subset of the partial index will lower the scanned row count even more:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT city, revenue FROM rides WHERE city = 'new york' AND revenue >= 90 AND revenue < 95;
~~~

~~~
  tree |        field        |                 description
-------+---------------------+-----------------------------------------------
       | distribution        | local
       | vectorized          | false
  scan |                     |
       | estimated row count | 174
       | table               | rides@rides_city_revenue_idx (partial index)
       | spans               | [/'new york'/90 - /'new york'/95)
(6 rows)
~~~

### Create an index that excludes values

Suppose that you have a number of rows in a table with values that you regularly filter out of selection queries (e.g., `NULL` values).

A selection query on these values will require a full table scan, using the primary index, as shown by the [`EXPLAIN` statement](explain.html) below:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM rides WHERE end_time IS NOT NULL;
~~~

~~~
    tree    |        field        |     description
------------+---------------------+-----------------------
            | distribution        | full
            | vectorized          | true
  filter    |                     |
   │        | filter              | end_time IS NOT NULL
   └── scan |                     |
            | estimated row count | 31337
            | table               | rides@primary
            | spans               | FULL SCAN
(8 rows)
~~~

You can create a partial index that excludes these rows, making queries that filter out the non-`NULL` values more efficient.

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON rides (city, revenue) WHERE end_time IS NOT NULL;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM rides;
~~~

~~~
  table_name |                  index_name                   | non_unique | seq_in_index | column_name  | direction | storing | implicit
-------------+-----------------------------------------------+------------+--------------+--------------+-----------+---------+-----------
  rides      | primary                                       |   false    |            1 | city         | ASC       |  false  |  false
  rides      | primary                                       |   false    |            2 | id           | ASC       |  false  |  false
...
  rides      | rides_city_revenue_idx                        |    true    |            1 | city         | ASC       |  false  |  false
  rides      | rides_city_revenue_idx                        |    true    |            2 | revenue      | ASC       |  false  |  false
  rides      | rides_city_revenue_idx                        |    true    |            3 | id           | ASC       |  false  |   true
(12 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT (city, revenue) FROM rides WHERE end_time IS NOT NULL;
~~~

~~~
    tree    |        field        |                 description
------------+---------------------+-----------------------------------------------
            | distribution        | full
            | vectorized          | false
  render    |                     |
   └── scan |                     |
            | estimated row count | 5822
            | table               | rides@rides_city_revenue_idx (partial index)
            | spans               | FULL SCAN
(7 rows)
~~~


### Create a partial index that enforces uniqueness on a subset of rows

Suppose that you want to constrain a subset of the rows in a table, such that all values for a particular column in the subset are unique. For example, let's say that every user in New York City must have a unique name.

You can do this efficiently with a [unique partial index](#unique-partial-indexes):

{% include copy-clipboard.html %}
~~~ sql
> CREATE UNIQUE INDEX ON users (name) WHERE city='new york';
~~~

This creates a partial index and a [`UNIQUE` constraint](unique.html) on just the subset of rows where `city='new york'`.

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, name FROM users WHERE city='new york' LIMIT 3;
~~~

~~~
                   id                  |       name
---------------------------------------+-------------------
  8647a7cf-4af0-4c82-9344-224097f87b1a | Andre Sanchez
  598eaab2-5200-40cb-8e19-244d49f3f63a | Austin Meyer
  147ae147-ae14-4b00-8000-000000000004 | Catherine Nelson
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users(id, city, name) VALUES (gen_random_uuid(), 'new york', 'Andre Sanchez');
~~~

~~~
ERROR: duplicate key value (name)=('Andre Sanchez') violates unique constraint "users_name_key"
SQLSTATE: 23505
~~~

Because the unique partial index predicate only implies the rows where `city='new york'`, the `UNIQUE` constraint does not apply to all rows in the table.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users(id, city, name) VALUES (gen_random_uuid(), 'seattle', 'Andre Sanchez');
~~~

~~~
INSERT 1
~~~

## See also

- [Indexes](indexes.html)
- [`CREATE INDEX`](create-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [`SHOW INDEX`](show-index.html)
- [SQL Statements](sql-statements.html)
