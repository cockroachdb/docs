---
title: Make Queries Fast
summary: How to make your queries run faster during application development
toc: true
---

This page describes how to get good SQL query performance from CockroachDB. To get good performance, you need to look at how you're accessing the database through several lenses:

- [SQL query performance](#sql-query-performance): This is the most common cause of performance problems, and where most developers should start.
- [Schema design](#schema-design): Depending on your SQL schema and the data access patterns of your workload, you may need to make changes to avoid creating "hotspots".
- [Cluster topology](#cluster-topology): As a distributed system, CockroachDB requires you to trade off latency vs. resiliency. This requires choosing the right cluster topology for your needs.

{{site.data.alerts.callout_info}}
If you aren't sure whether SQL query performance needs to be improved on your cluster, see [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-queries).
{{site.data.alerts.end}}

## SQL query performance

To get good SQL query performance, follow the rules below (in approximate order of importance):

{{site.data.alerts.callout_info}}
These rules apply to an environment where thousands of [OLTP](https://en.wikipedia.org/wiki/Online_transaction_processing) queries are being run per second, and each query needs to run in milliseconds. These rules are not intended to apply to analytical queries.
{{site.data.alerts.end}}

- [Rule 1. Scan as few rows as possible](#rule-1-scan-as-few-rows-as-possible). If your application is scanning more rows than necessary for a given query, it's going to be difficult to scale.
- [Rule 2. Use the right index](#rule-2-use-the-right-index): Your query should use an index on the columns in the `WHERE` clause. You want to avoid the performance hit of a full table scan.
- [Rule 3. Use the right join type](#rule-3-use-the-right-join-type): Depending on the relative sizes of the tables you are querying, the type of [join][joins] may be important. This should rarely be necessary because the [cost-based optimizer](cost-based-optimizer.html) should pick the best-performing join type if you add the right indexes as described in Rule 2.

To show each of these rules in action, we will optimize a query against the [MovR data set](movr.html) as follows:

1. Start a [local cluster](start-a-local-cluster.html).

2. Populate the cluster with data by running the following [`cockroach workload`](cockroach-workload.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach workload init movr --num-histories 250000 --num-promo-codes 250000 --num-rides 125000 --num-users 12500 --num-vehicles 3750 'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

It's common to offer users promo codes to increase usage and customer loyalty. In this scenario, we want to find the 10 users who have taken the highest number of rides on a given date, and offer them promo codes that provide a 10% discount.

To phrase it in the form of a question: "Who are the top 10 users by number of rides on a given date?"

### Rule 1. Scan as few rows as possible

First, let's study the schema so we understand the relationships between the tables.

Start a SQL shell:

{% include copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

Next, set `movr` as the current database and run [`SHOW TABLES`](show-tables.html):

{% include copy-clipboard.html %}
~~~ sql
USE movr;
SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | promo_codes                | table |              250000
  public      | rides                      | table |              125000
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |               12500
  public      | vehicle_location_histories | table |              250000
  public      | vehicles                   | table |                3750
(6 rows)
~~~

Let's look at the schema for the `users` table:

{% include copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE users;
~~~

~~~
  table_name |                      create_statement
-------------+--------------------------------------------------------------
  users      | CREATE TABLE public.users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
             | )
(1 row)
~~~

There's no information about the number of rides taken here, nor anything about the days on which rides occurred. Luckily, there is also a `rides` table. Let's look at it:

{% include copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE rides;
~~~

~~~
  table_name |                                                        create_statement
-------------+----------------------------------------------------------------------------------------------------------------------------------
  rides      | CREATE TABLE public.rides (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     vehicle_city VARCHAR NULL,
             |     rider_id UUID NULL,
             |     vehicle_id UUID NULL,
             |     start_address VARCHAR NULL,
             |     end_address VARCHAR NULL,
             |     start_time TIMESTAMP NULL,
             |     end_time TIMESTAMP NULL,
             |     revenue DECIMAL(10,2) NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     CONSTRAINT fk_city_ref_users FOREIGN KEY (city, rider_id) REFERENCES public.users(city, id),
             |     CONSTRAINT fk_vehicle_city_ref_vehicles FOREIGN KEY (vehicle_city, vehicle_id) REFERENCES public.vehicles(city, id),
             |     INDEX rides_auto_index_fk_city_ref_users (city ASC, rider_id ASC),
             |     INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (vehicle_city ASC, vehicle_id ASC),
             |     FAMILY "primary" (id, city, vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time, revenue),
             |     CONSTRAINT check_vehicle_city_city CHECK (vehicle_city = city)
             | )
(1 row)
~~~

There is a `rider_id` field that we can use to match each ride to a user. There is also a `start_time` field that we can use to filter the rides by date.

This means that to get the information we want, we'll need to do a [join][joins] on the `users` and `rides` tables.

Next, let's get the row counts for the tables that we'll be using in this query. We need to understand which tables are large, and which are small by comparison. We will need this later if we need to verify we are [using the right join type](#rule-3-use-the-right-join-type).

As specified above by our [`cockroach workload`](cockroach-workload.html) command, the `users` table has 12,500 records, and the `rides` table has 125,000 records. Because it's so large, we want to avoid scanning the entire `rides` table in our query. In this case, we can avoid scanning `rides` using an index, as shown in the next section.

### Rule 2. Use the right index

Below is a query that fetches the right answer to our question: "Who are the top 10 users by number of rides on a given date?"

{% include copy-clipboard.html %}
~~~ sql
SELECT
	name, count(rides.id) AS sum
FROM
	users JOIN rides ON users.id = rides.rider_id
WHERE
	rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2020-01-01 00:00:00'
GROUP BY
	name
ORDER BY
	sum DESC
LIMIT
	10;
~~~

~~~
        name       | sum
-------------------+------
  William Brown    |  14
  William Mitchell |  10
  Joseph Smith     |  10
  Paul Nelson      |   9
  Christina Smith  |   9
  Jennifer Johnson |   8
  Jeffrey Walker   |   8
  Joseph Jones     |   7
  James Williams   |   7
  Thomas Smith     |   7
(10 rows)

Server Execution Time: 103.41ms
Network Latency: 822µs
~~~

Unfortunately, this query is a bit slow. 160 milliseconds puts us [over the limit where a user feels the system is reacting instantaneously](https://www.nngroup.com/articles/response-times-3-important-limits/), and we're still down in the database layer. This data still needs to be shipped back out to your application and displayed to the user.

We can see why if we look at the output of [`EXPLAIN`](explain.html):

{% include copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT
	name, count(rides.id) AS sum
FROM
	users JOIN rides ON users.id = rides.rider_id
WHERE
	rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2019-01-01 00:00:00'
GROUP BY
	name
ORDER BY
	sum DESC
LIMIT
	10;
~~~

~~~
              tree              |        field        |                                   description
--------------------------------+---------------------+----------------------------------------------------------------------------------
                                | distribution        | full
                                | vectorized          | true
  limit                         |                     |
   │                            | count               | 10
   └── sort                     |                     |
        │                       | order               | -count_rows
        └── group               |                     |
             │                  | group by            | name
             └── hash join      |                     |
                  │             | equality            | (id) = (rider_id)
                  ├── scan      |                     |
                  │             | estimated row count | 12500
                  │             | table               | users@primary
                  │             | spans               | FULL SCAN
                  └── filter    |                     |
                       │        | filter              | (start_time >= '2018-12-31 00:00:00') AND (start_time <= '2019-01-01 00:00:00')
                       └── scan |                     |
                                | estimated row count | 125000
                                | table               | rides@primary
                                | spans               | FULL SCAN
(20 rows)
~~~

The main problem is that we are doing full table scans on both the `users` and `rides` tables (see `spans | FULL SCAN`). This tells us that we don't have indexes on the columns in our `WHERE` clause, which is [an indexing best practice](indexes.html#best-practices).

Therefore, we need to create an index on the column in our `WHERE` clause, in this case: `rides.start_time`.

It's also possible that there is not an index on the `rider_id` column that we are doing a join against, which will also hurt performance.

Before creating any more indexes, let's see what indexes already exist on the `rides` table by running [`SHOW INDEXES`](show-index.html):

{% include copy-clipboard.html %}
~~~ sql
SHOW INDEXES FROM rides;
~~~

~~~
  table_name |                  index_name                   | non_unique | seq_in_index | column_name  | direction | storing | implicit
-------------+-----------------------------------------------+------------+--------------+--------------+-----------+---------+-----------
  rides      | primary                                       |   false    |            1 | city         | ASC       |  false  |  false
  rides      | primary                                       |   false    |            2 | id           | ASC       |  false  |  false
  rides      | rides_auto_index_fk_city_ref_users            |    true    |            1 | city         | ASC       |  false  |  false
  rides      | rides_auto_index_fk_city_ref_users            |    true    |            2 | rider_id     | ASC       |  false  |  false
  rides      | rides_auto_index_fk_city_ref_users            |    true    |            3 | id           | ASC       |  false  |   true
  rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |    true    |            1 | vehicle_city | ASC       |  false  |  false
  rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |    true    |            2 | vehicle_id   | ASC       |  false  |  false
  rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |    true    |            3 | id           | ASC       |  false  |   true
  rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |    true    |            4 | city         | ASC       |  false  |   true
(9 rows)
~~~

As we suspected, there are no indexes on `start_time` or `rider_id`, so we'll need to create indexes on those columns.

Because another performance best practice is to [create an index on the `WHERE` condition storing the join key](sql-tuning-with-explain.html#solution-create-a-secondary-index-on-the-where-condition-storing-the-join-key), we will create an index on `start_time` that stores the join key `rider_id`:

{% include copy-clipboard.html %}
~~~ sql
CREATE INDEX ON rides (start_time) storing (rider_id);
~~~

Now that we have an index on the column in our `WHERE` clause that stores the join key, let's run the query again:

{% include copy-clipboard.html %}
~~~ sql
SELECT
	name, count(rides.id) AS sum
FROM
	users JOIN rides ON users.id = rides.rider_id
WHERE
	rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2019-01-01 00:00:00'
GROUP BY
	name
ORDER BY
	sum DESC
LIMIT
	10;
~~~

~~~
        name       | sum
-------------------+------
  William Brown    |   6
  Laura Marsh      |   5
  Joseph Smith     |   5
  David Martinez   |   4
  Michael Garcia   |   4
  David Mitchell   |   4
  Arthur Nielsen   |   4
  Michael Bradford |   4
  William Mitchell |   4
  Jennifer Johnson |   4
(10 rows)

Server Execution Time: 24.523ms
Network Latency: 325µs
~~~

This query is now running much faster than it was before we added the indexes (160ms vs. 25ms). This means we have an extra 135 milliseconds we can budget towards other areas of our application.

To see what changed, let's look at the [`EXPLAIN`](explain.html) output:

{% include copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT
	name, count(rides.id) AS sum
FROM
	users JOIN rides ON users.id = rides.rider_id
WHERE
	rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2019-01-01 00:00:00'
GROUP BY
	name
ORDER BY
	sum DESC
LIMIT
	10;
~~~

As you can see, this query is no longer scanning the entire (larger) `rides` table. Instead, it is now doing a much smaller range scan against only the values in `rides` that match the index we just created on the `start_time` column (3975 rows instead of 125000).

~~~
            tree           |        field        |                    description
---------------------------+---------------------+----------------------------------------------------
                           | distribution        | full
                           | vectorized          | true
  limit                    |                     |
   │                       | count               | 10
   └── sort                |                     |
        │                  | order               | -count_rows
        └── group          |                     |
             │             | group by            | name
             └── hash join |                     |
                  │        | equality            | (id) = (rider_id)
                  ├── scan |                     |
                  │        | estimated row count | 12500
                  │        | table               | users@primary
                  │        | spans               | FULL SCAN
                  └── scan |                     |
                           | estimated row count | 3975
                           | table               | rides@rides_start_time_idx
                           | spans               | [/'2018-12-31 00:00:00' - /'2019-01-01 00:00:00']
(18 rows)
~~~


### Rule 3. Use the right join type

Out of the box, the [cost-based optimizer](cost-based-optimizer.html) will select the right join type for your query in the majority of cases. This statement becomes more and more true with every new release of CockroachDB. Therefore, you should only provide [join hints](cost-based-optimizer.html#join-hints) in your query if you can **prove** to yourself through experimentation that the optimizer should be using a different [join type](joins.html#join-algorithms) than it is selecting.

We can confirm that in this case the optimizer has already found the right join type for this query by using a hint to force another join type.

For example, we might think that a [lookup join](joins.html#lookup-joins) could perform better in this instance, since one of the tables in the join is 10x smaller than the other.

In order to get CockroachDB to plan a lookup join in this case, we will need to add an explicit index on the join key for the right-hand-side table, in this case, `rides`.

{% include copy-clipboard.html %}
~~~ sql
CREATE INDEX ON rides (rider_id);
~~~

Next, we can specify the lookup join with a join hint:

{% include copy-clipboard.html %}
~~~ sql
SELECT
	name, count(rides.id) AS sum
FROM
	users INNER LOOKUP JOIN rides ON users.id = rides.rider_id
WHERE
	(rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2019-01-01 00:00:00')
GROUP BY
	name
ORDER BY
	sum DESC
LIMIT
	10;
~~~

~~~
        name       | sum
-------------------+------
  William Brown    |   6
  Laura Marsh      |   5
  Joseph Smith     |   5
  Michael Garcia   |   4
  David Mitchell   |   4
  David Martinez   |   4
  Arthur Nielsen   |   4
  Jennifer Johnson |   4
  William Mitchell |   4
  Michael Bradford |   4
(10 rows)

Server Execution Time: 881.797ms
Network Latency: 402µs
~~~

The results, however, are not good. The query is much slower using a lookup join than what CockroachDB planned for us earlier.

The query is a little faster when we force CockroachDB to use a merge join:

{% include copy-clipboard.html %}
~~~ sql
        name       | sum
-------------------+------
  William Brown    |   6
  Laura Marsh      |   5
  Joseph Smith     |   5
  David Martinez   |   4
  Michael Garcia   |   4
  David Mitchell   |   4
  Arthur Nielsen   |   4
  Jennifer Johnson |   4
  William Mitchell |   4
  Michael Bradford |   4
(10 rows)

Server Execution Time: 23.573ms
Network Latency: 623µs
~~~

~~~
        name        | sum
+-------------------+-----+
  William Brown     |   6
  Laura Marsh       |   5
  Joseph Smith      |   5
  Jennifer Ford     |   4
  David Mitchell    |   4
  William Mitchell  |   4
  Christopher Allen |   4
  Michael Bradford  |   4
  Michael Garcia    |   4
  Jennifer Johnson  |   4
(10 rows)

Time: 31.31ms
~~~

The results are consistently about 31-35ms with merge join vs. 25-27ms when we let CockroachDB choose the join type as shown in the previous section. In other words, forcing the merge join is slightly slower than if we had done nothing.

## Schema design

If you are following the instructions in [the SQL performance section](#sql-query-performance) and still not getting the performance you want, you may need to look at your schema design and data access patterns to make sure you are not creating "hotspots" in your cluster that will lead to performance problems due to transaction contention.

You can avoid contention with the following strategies:

- Use index keys with a more random distribution of values, as described in [Unique ID best practices](performance-best-practices-overview.html#unique-id-best-practices).
- Make transactions smaller by operating on less data per transaction. This will offer fewer opportunities for transactions' data access to overlap.
- [Split the table across multiple ranges](split-at.html) to distribute its data across multiple nodes for better load balancing of some write-heavy workloads.

For more information about how to avoid performance problems caused by contention, see [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

## Cluster topology

It's very important to make sure that the cluster topology you are using is the right one for your use case. Because CockroachDB is a distributed system that involves nodes communicating over the network, you need to choose the cluster topology that results in the right latency vs. resiliency tradeoff.

For more information about how to choose the cluster topology that is right for your application, see [this list of topology patterns](topology-patterns.html).

## See also

Reference information:

- [SQL Tuning with `EXPLAIN`](sql-tuning-with-explain.html)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Joins](joins.html)
- [CockroachDB Performance](performance.html)
- [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
- [Topology Patterns](topology-patterns.html)

Specific tasks:

- [Connect to the Database](connect-to-the-database.html)
- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-queries)
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Hello World Example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[joins]: joins.html
