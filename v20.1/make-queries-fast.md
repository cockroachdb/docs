---
title: Make Queries Fast
summary: How to make your queries run faster during application development
toc: true
---

This page describes how to get good SQL query performance from CockroachDB. To get good performance, you need to look at how you're accessing the database through several lenses:

- [SQL query performance](#sql-query-performance): This is the most common cause of performance problems, and where most developers should start.
- [Schema design](#schema-design): Depending on your SQL schema and the data access patterns of your workload, you may need to make changes to avoid creating "hotspots".
- [Cluster topology](#cluster-topology): As a distributed system, CockroachDB requires you to trade off latency vs. resiliency. This requires choosing the right cluster topology for your needs.

## SQL query performance

To get good SQL query performance, follow these rules (in approximate order of importance):

- [Rule 1. Scan at most a few dozen rows](#rule-1-scan-at-most-a-few-dozen-rows). If your application is scanning more than a few dozen rows (or maybe a few hundred at the upper end), it's going to be difficult to scale.
- [Rule 2. Use the right index](#rule-2-use-the-right-index): Your query should use an index on the columns in the `WHERE` clause. You want to avoid the performance hit of a full table scan.
- [Rule 3. Use the right join type](#rule-3-use-the-right-join-type): Depending on the relative sizes of the tables you are querying, the type of [join][joins] may be important. This should rarely be necessary because the [Cost-based optimizer](cost-based-optimizer.html) should pick the best-performing join type if you add the right indexes as described in Rule 2.

To show each of these rules in action, we will optimize a query against the [Employees data set](https://github.com/datacharmer/test_db). To import the data set, run:

{% include copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS employees;
USE employees;
IMPORT MYSQLDUMP 'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/mysqldump/employees-full.sql.gz';
~~~

The question we want to answer is: "Who are the top 25 highest-paid employees?"  Let's write a SQL query to find the answer.

### Rule 1. Scan at most a few dozen rows

First, let's study the schema so we understand the relationships between the tables. We'll start by running [`SHOW TABLES`](show-tables.html):

{% include copy-clipboard.html %}
~~~ sql
SHOW TABLES;
~~~

~~~
   table_name
+--------------+
  departments
  dept_emp
  dept_manager
  employees
  salaries
  titles
(6 rows)
~~~

Let's look at the schema for the `employees` table:

{% include copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE employees;
~~~

~~~
  table_name |                                    create_statement
+------------+-----------------------------------------------------------------------------------------+
  employees  | CREATE TABLE employees (
             |     emp_no INT4 NOT NULL,
             |     birth_date DATE NOT NULL,
             |     first_name VARCHAR(14) NOT NULL,
             |     last_name VARCHAR(16) NOT NULL,
             |     gender STRING NOT NULL,
             |     hire_date DATE NOT NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (emp_no ASC),
             |     FAMILY "primary" (emp_no, birth_date, first_name, last_name, gender, hire_date),
             |     CONSTRAINT imported_from_enum_gender CHECK (gender IN ('M':::STRING, 'F':::STRING))
             | )
(1 row)
~~~

There's no salary information here, but luckily there is also a `salaries` table. Let's look at it.

{% include copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE salaries;
~~~

~~~
  table_name |                                          create_statement
+------------+-----------------------------------------------------------------------------------------------------+
  salaries   | CREATE TABLE salaries (
             |     emp_no INT4 NOT NULL,
             |     salary INT4 NOT NULL,
             |     from_date DATE NOT NULL,
             |     to_date DATE NOT NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (emp_no ASC, from_date ASC),
             |     CONSTRAINT salaries_ibfk_1 FOREIGN KEY (emp_no) REFERENCES employees(emp_no) ON DELETE CASCADE,
             |     FAMILY "primary" (emp_no, salary, from_date, to_date)
             | )
(1 row)
~~~

There is a salary field here, and a foreign key on `emp_no`, which is also in the primary key of the `employees` table.

This means that to get the information we want, we'll need to do a [join][joins] on the `employees` and `salaries` tables.

Next, let's get the row counts for the tables that we'll be using in this query. We need to understand which tables are large, and which are small by comparison. We will need this later if we need to verify we are [using the right join type](#rule-3-use-the-right-join-type)

As shown below, the `employees` table has about 300k employee records, and the `salaries` table has about 2.8 million records.

```sql
SELECT COUNT(*) FROM employees;
```

```
   count
+--------+
  300024
```

```sql
SELECT COUNT(*) FROM salaries;
```

```
   count
+---------+
  2844047
```

### Rule 2. Use the right index

Below is a query that fetches the right answer to our question: "Who are the 25 highest-paid employees?"  Note that because the `salaries` table includes historical salaries for each employee, we needed to check that the salary is current by ensuring the salary record's `to_date` column is in the future in the `WHERE` clause.

Building this query also required exploring the data a bit with some test queries and discovering that $145k was the right lower bound to use on `salary` so we weren't scanning too many records.

{% include copy-clipboard.html %}
~~~ sql
SELECT
	e.last_name, s.salary
FROM
	employees AS e
    JOIN
    salaries AS s
    ON e.emp_no = s.emp_no
WHERE
	s.salary > 145000 AND s.to_date > now()
ORDER BY
	s.salary DESC LIMIT 25;
~~~

Unfortunately, this query is pretty slow.

~~~
   last_name  | salary
+-------------+--------+
  Pesch       | 158220
  Mukaidono   | 156286
  Whitcomb    | 155709
  Luders      | 155513
  Alameldin   | 155190
  Baca        | 154459
  Meriste     | 154376
  Griswold    | 153715
  Chenoweth   | 152710
  Hatcliff    | 152687
  Birdsall    | 152412
  Stanfel     | 152220
  Moehrke     | 150740
  Junet       | 150345
  Kambil      | 150052
  Thambidurai | 149440
  Minakawa    | 148820
  Birta       | 148212
  Sudbeck     | 147480
  Unni        | 147469
  Chinin      | 146882
  Gruenwald   | 146755
  Teitelbaum  | 146719
  Kobara      | 146655
  Worfolk     | 146507
(25 rows)

Time: 2.341862s
~~~

We can see why if we look at the output of `EXPLAIN`.

~~~
            tree            |       field       |               description
+---------------------------+-------------------+-----------------------------------------+
                            | distributed       | true
                            | vectorized        | false
  render                    |                   |
   └── limit                |                   |
        │                   | count             | 25
        └── sort            |                   |
             │              | order             | -salary
             └── merge-join |                   |
                  │         | type              | inner
                  │         | equality          | (emp_no) = (emp_no)
                  │         | left cols are key |
                  │         | mergeJoinOrder    | +"(emp_no=emp_no)"
                  ├── scan  |                   |
                  │         | table             | employees@primary
                  │         | spans             | ALL
                  └── scan  |                   |
                            | table             | salaries@primary
                            | spans             | ALL
                            | filter            | (salary > 145000) AND (to_date > now())
(19 rows)
~~~

There are 2 problems:

1. We are doing full table scans on both the `employees` and `salaries` tables (see `scan > spans=ALL`). That tells us that we don't have indexes on all of the columns in our `WHERE` clause, which is [an indexing best practice](indexes.html#best-practices).
2. We are using a merge join even though a lookup join is better when one of the tables is much smaller than the other, as it is in this case.

The first problem is more urgent. We need indexes on all of the columns in our `WHERE` clause. Specifically, we need to create indexes on:

- `salaries.salary`
- `salaries.to_date`

Let's verify what indexes exist on the `salaries` table by running [`SHOW INDEXES`](show-index.html):

{% include copy-clipboard.html %}
~~~ sql
SHOW INDEXES FROM salaries;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
  salaries   | primary    |   false    |            1 | emp_no      | ASC       |  false  |  false
  salaries   | primary    |   false    |            2 | from_date   | ASC       |  false  |  false
(2 rows)
~~~

As we suspected, there are no indexes on `salary` or `to_date`, so we'll need to create indexes on those columns.

First, we create the index on the `salaries.salary` column.

{% include copy-clipboard.html %}
~~~ sql
CREATE INDEX ON salaries (salary);
~~~

Depending on your environment, this may take a few seconds, since the salaries table has ~3 million rows.

~~~
CREATE INDEX

Time: 10.589462s
~~~

Next, let's create the index on `salaries.to_date`:

{% include copy-clipboard.html %}
~~~ sql
CREATE INDEX ON salaries (to_date);
~~~

This will also take a few seconds, again due to the table size.

~~~
CREATE INDEX

Time: 10.681537s
~~~

Now that we have indexes on all of the columns in our `WHERE` clause, let's run the query again.

{% include copy-clipboard.html %}
~~~ sql
 SELECT
	e.last_name, s.salary
FROM
	employees AS e
    JOIN
    salaries AS s
    ON e.emp_no = s.emp_no
WHERE
	s.salary > 145000 AND s.to_date > now()
ORDER BY
	s.salary DESC LIMIT 25;
~~~

~~~
        last  | salary
+-------------+--------+
  Pesch       | 158220
  Mukaidono   | 156286
  Whitcomb    | 155709
  Luders      | 155513
  Alameldin   | 155190
  Baca        | 154459
  Meriste     | 154376
  Griswold    | 153715
  Chenoweth   | 152710
  Hatcliff    | 152687
  Birdsall    | 152412
  Stanfel     | 152220
  Moehrke     | 150740
  Junet       | 150345
  Kambil      | 150052
  Thambidurai | 149440
  Minakawa    | 148820
  Birta       | 148212
  Sudbeck     | 147480
  Unni        | 147469
  Chinin      | 146882
  Gruenwald   | 146755
  Teitelbaum  | 146719
  Kobara      | 146655
  Worfolk     | 146507
(25 rows)

Time: 14.37ms
~~~

This query is now running about 140x faster than it was before we added the indexes (2000ms vs. 14ms).

### Rule 3. Use the right join type

Out of the box, the optimizer will select the right join type for your query in the majority of cases. This statement becomes more and more true with every new release of CockroachDB. Therefore, you should only provide [join hints](cost-based-optimizer.html#join-hints) in your query if you can **prove** to yourself through experimentation that the optimizer should be using a different join type than it is selecting.

Having said all of the above, here are some general guidelines for which types of joins should be used in which situations:

1. If one of the tables being joined is much smaller than the other, a [lookup join](joins.html#lookup-joins) is best. This will ensure that the query reads rows from the smaller table and matches them against the larger table.

2. Merge joins are used for tables that are roughly similar in size. They offer better performance than hash joins, but [have some additional requirements](joins.html#merge-joins).

3. [Hash joins](joins.html#hash-joins) are used when tables are roughly similar in size, if the requirements for a (faster) merge join are not met.

For more details, see the [join reference documentation](joins.html).

To get back to our example query, we can verify that it is using a lookup join as expected by checking the [`EXPLAIN`](explain.html) output. Remember that we expect the lookup join because one table (`employees`) is much smaller than the other (`salaries`).

{% include copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT
 e.last_name, s.salary
FROM
 employees AS e
    JOIN
    salaries AS s
    ON e.emp_no = s.emp_no
WHERE
 s.salary > 145000 AND s.to_date > now()
ORDER BY
 s.salary DESC LIMIT 25;
~~~

According to the output below, this query is indeed using the lookup join as expected. Once we [added the right indexes as described above](#rule-2-use-the-right-index), the optimizer chose the right join type.

~~~
                tree               |         field         |         description
+----------------------------------+-----------------------+------------------------------+
                                   | distributed           | true
                                   | vectorized            | false
  render                           |                       |
   └── limit                       |                       |
        │                          | count                 | 25
        └── lookup-join            |                       |
             │                     | table                 | employees@primary
             │                     | type                  | inner
             │                     | equality              | (emp_no) = (emp_no)
             │                     | equality cols are key |
             └── filter            |                       |
                  │                | filter                | to_date > now()
                  └── index-join   |                       |
                       │           | table                 | salaries@primary
                       └── revscan |                       |
                                   | table                 | salaries@salaries_salary_idx
                                   | spans                 | /145001-
(17 rows)
~~~

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

- [CockroachDB Performance](performance.html)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
- [Topology Patterns](topology-patterns.html)
- [SQL Tuning with `EXPLAIN`](sql-tuning-with-explain.html)
- [Joins](joins.html)

Specific tasks:

- [Connect to the Database](connect-to-the-database.html)
- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Hello World Example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[joins]: joins.html
