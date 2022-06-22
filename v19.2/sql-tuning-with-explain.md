---
title: SQL Tuning with EXPLAIN
summary: How to use `EXPLAIN to identify and resolve SQL performance issues
toc: true
---

This tutorial walks you through the common reasons for slow SQL statements and describes how to use [`EXPLAIN`](explain.html) to troubleshoot the issues.

The following examples use [MovR](movr.html), a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. Run [`cockroach demo movr`](cockroach-demo.html) to open an interactive SQL shell to a temporary, in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

## Issue: Full table scans

The most common reason for slow queries is sub-optimal `SELECT` statements that include full table scans and incorrect use of indexes.

You'll get generally poor performance when retrieving a single row based on a column that is not in the primary key or any secondary index:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
                   id                  | city  |      name      |      address      | credit_card  
+--------------------------------------+-------+----------------+-------------------+-------------+
  e147ae14-7ae1-4800-8000-00000000002c | paris | Cheyenne Smith | 8550 Kelsey Flats | 4374468739   
(1 row)

Time: 4.059ms
~~~

To understand why this query performs poorly, use [`EXPLAIN`](explain.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
  tree | field |  description
+------+-------+---------------+
  scan |       |
       | table | users@primary
       | spans | ALL
(3 rows)
~~~


<!--Output of EXPLAIN (OPT) for reference
~~~
                text                 
+-----------------------------------+
  select                             
   ├── scan users                    
   └── filters                       
        └── name = 'Cheyenne Smith'  
(4 rows)

Time: 2.633ms
~~~
-->

The row with `table | users@primary` indicates the index used (`primary`) to scan the table (`users`). The row with `spans | ALL` shows you that, without a secondary index on the `name` column, CockroachDB scans every row of the `users` table, ordered by the primary key (`city`/`id`), until it finds the row with the correct `name` value.

### Solution: Filter by a secondary index

To speed up this query, add a secondary index on `name`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX on users (name);
~~~

The query will now return much faster:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
                   id                  | city  |      name      |      address      | credit_card  
+--------------------------------------+-------+----------------+-------------------+-------------+
  e147ae14-7ae1-4800-8000-00000000002c | paris | Cheyenne Smith | 8550 Kelsey Flats | 4374468739   
(1 row)

Time: 1.457ms
~~~

To understand why the performance improved, use [`EXPLAIN`](explain.html) to see the new query plan:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
     tree    | field |                      description
+------------+-------+-------------------------------------------------------+
  index-join |       |
   ├── scan  |       |
   │         | table | users@users_name_idx
   │         | spans | /"Cheyenne Smith"-/"Cheyenne Smith"/PrefixEnd
   └── scan  |       |
             | table | users@primary
(6 rows)
~~~

<!--Output of EXPLAIN for reference
~~~
                                  text                                   
+-----------------------------------------------------------------------+
  index-join users                                                       
   └── scan users@users_name_idx                                         
        └── constraint: /3/2/1: [/'Cheyenne Smith' - /'Cheyenne Smith']  
(3 rows)

Time: 2.054ms
~~~
-->

This shows you that CockroachDB starts with the secondary index (`users@users_name_idx`). Because it is sorted by `name`, the query can jump directly to the relevant value (`/'Cheyenne Smith' - /'Cheyenne Smith'`). However, the query needs to return values not in the secondary index, so CockroachDB grabs the primary key (`city`/`id`) stored with the `name` value (the primary key is always stored with entries in a secondary index), jumps to that value in the primary index, and then returns the full row.

Because the `users` table is small (under 64 MiB), the primary index and all secondary indexes are contained in a single range with a single leaseholder. If the table were bigger, however, the primary index and secondary index could reside in separate ranges, each with its own leaseholder. In this case, if the leaseholders were on different nodes, the query would require more network hops, further increasing latency.

### Solution: Filter by a secondary index storing additional columns

When you have a query that filters by a specific column but retrieves a subset of the table's total columns, you can improve performance by [storing](indexes.html#storing-columns) those additional columns in the secondary index to prevent the query from needing to scan the primary index as well.

For example, let's say you frequently retrieve a user's name and credit card number:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
       name      | credit_card  
+----------------+-------------+
  Cheyenne Smith | 4374468739   
(1 row)

Time: 1.302ms
~~~

With the current secondary index on `name`, CockroachDB still needs to scan the primary index to get the credit card number:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~


~~~
     tree    | field |                      description
+------------+-------+-------------------------------------------------------+
  index-join |       |
   ├── scan  |       |
   │         | table | users@users_name_idx
   │         | spans | /"Cheyenne Smith"-/"Cheyenne Smith"/PrefixEnd
   └── scan  |       |
             | table | users@primary
(6 rows)
~~~


<!--Output of EXPLAIN (OPT) for reference
~~~
                                  text                                   
+-----------------------------------------------------------------------+
  index-join users                                                       
   └── scan users@users_name_idx                                         
        └── constraint: /3/2/1: [/'Cheyenne Smith' - /'Cheyenne Smith']  
(3 rows)

Time: 1.398ms
~~~
-->

Let's drop and recreate the index on `name`, this time storing the `credit_card` value in the index:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP INDEX users_name_idx;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name) STORING (credit_card);
~~~

Now that `credit_card` values are stored in the index on `name`, CockroachDB only needs to scan that index:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
  tree | field |                      description
+------+-------+-------------------------------------------------------+
  scan |       |
       | table | users@users_name_idx
       | spans | /"Cheyenne Smith"-/"Cheyenne Smith"/PrefixEnd
(3 rows)
~~~

<!--Output of EXPLAIN (OPT) for reference
~~~
                                text                                
+------------------------------------------------------------------+
  scan users@users_name_idx                                         
   └── constraint: /3/2/1: [/'Cheyenne Smith' - /'Cheyenne Smith']  
(2 rows)

Time: 4.093ms
~~~
-->

This results in even faster performance:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
       name      | credit_card  
+----------------+-------------+
  Cheyenne Smith | 4374468739   
(1 row)

Time: 906µs
~~~

To reset the database for following examples, let's drop the index on `name`:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP INDEX users_name_idx;
~~~

## Issue: Joining data from different tables

Secondary indexes are crucial when [joining](joins.html) data from different tables as well.

For example, let's say you want to count the number of users who started rides on a given day. To do this, you need to use a join to get the relevant rides from the `rides` table and then map the `rider_id` for each of those rides to the corresponding `id` in the `users` table, counting each mapping only once:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2018-12-20 00:00:00' AND '2018-12-21 00:00:00';
~~~

~~~
  count  
+-------+
     13  
(1 row)

Time: 3.625ms
~~~

To understand what's happening, use [`EXPLAIN`](explain.html) to see the query plan:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00';
~~~

~~~
         tree         |    field    |     description
+---------------------+-------------+----------------------+
  group               |             |
   │                  | aggregate 0 | count(DISTINCT id)
   │                  | scalar      |
   └── render         |             |
        └── join      |             |
             │        | type        | inner
             │        | equality    | (id) = (rider_id)
             ├── scan |             |
             │        | table       | users@users_name_idx
             │        | spans       | ALL
             └── scan |             |
                      | table       | rides@primary
                      | spans       | ALL
(13 rows)
~~~

<!--Output of EXPLAIN (OPT) for reference
~~~
                                                       text                                                        
+-----------------------------------------------------------------------------------------------------------------+
  scalar-group-by                                                                                                  
   ├── inner-join                                                                                                  
   │    ├── select                                                                                                 
   │    │    ├── scan rides                                                                                        
   │    │    └── filters                                                                                           
   │    │         └── (start_time >= '2018-07-20 00:00:00+00:00') AND (start_time <= '2018-07-21 00:00:00+00:00')  
   │    ├── scan users                                                                                             
   │    └── filters                                                                                                
   │         └── rider_id = users.id                                                                               
   └── aggregations                                                                                                
        └── count                                                                                                  
             └── agg-distinct                                                                                      
                  └── variable: users.id                                                                           
(13 rows)

Time: 1.671ms
~~~
-->

Reading from bottom up, you can see that CockroachDB does a full table scan first on `rides` to get all rows with a `start_time` in the specified range and then does another full table scan on `users` to find matching rows and calculate the count.

Given the `WHERE` condition of the join, the full table scan of `rides` is particularly wasteful.

### Solution: Create a secondary index on the `WHERE` condition storing the join key

To speed up the query, you can create a secondary index on the `WHERE` condition (`rides.start_time`) storing the join key (`rides.rider_id`):

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON rides (start_time) STORING (rider_id);
~~~

Adding the secondary index reduced the query time:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2018-12-20 00:00:00' AND '2018-12-21 00:00:00';
~~~

~~~
  count  
+-------+
     13  
(1 row)

Time: 2.367ms
~~~

To understand why performance improved, again use [`EXPLAIN`](explain.html) to see the new query plan:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2018-12-20 00:00:00' AND '2018-12-21 00:00:00';
~~~

~~~
         tree         |    field    |                      description
+---------------------+-------------+-------------------------------------------------------+
  group               |             |
   │                  | aggregate 0 | count(DISTINCT id)
   │                  | scalar      |
   └── render         |             |
        └── join      |             |
             │        | type        | inner
             │        | equality    | (id) = (rider_id)
             ├── scan |             |
             │        | table       | users@users_name_idx
             │        | spans       | ALL
             └── scan |             |
                      | table       | rides@rides_start_time_idx
                      | spans       | /2018-07-20T00:00:00Z-/2018-07-21T00:00:00.000000001Z
(13 rows)
~~~

<!--Output of EXPLAIN (OPT) for reference
~~~
                                                text                                                 
+---------------------------------------------------------------------------------------------------+
  scalar-group-by                                                                                    
   ├── inner-join                                                                                    
   │    ├── scan rides@rides_start_time_idx                                                          
   │    │    └── constraint: /13/7/6: [/'2018-12-20 00:00:00+00:00' - /'2018-12-21 00:00:00+00:00']  
   │    ├── scan users                                                                               
   │    └── filters                                                                                  
   │         └── rider_id = users.id                                                                 
   └── aggregations                                                                                  
        └── count                                                                                    
             └── agg-distinct                                                                        
                  └── variable: users.id                                                             
(11 rows)

Time: 2.996ms
~~~
-->

Notice that CockroachDB now starts by using `rides@rides_start_time_idx` secondary index to retrieve the relevant rides without needing to scan the full `rides` table.

## Issue: Inefficient joins

[Hash joins](joins.html#hash-joins) are more expensive and require more memory than [lookup joins](joins.html#lookup-joins). Hence the [cost-based optimizer](cost-based-optimizer.html) uses a lookup join whenever possible.

For the following query, the cost-based optimizer can’t perform a lookup join because the query doesn’t have a prefix of the `rides` table’s primary key available and thus has to read the entire table and search for a match, resulting in a slow query:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM VEHICLES JOIN rides on rides.vehicle_id = vehicles.id limit 1;
~~~

~~~
         tree         |  field   |     description      
+---------------------+----------+---------------------+
  render              |          |                      
   └── limit          |          |                      
        │             | count    | 1                    
        └── hash-join |          |                      
             │        | type     | inner                
             │        | equality | (vehicle_id) = (id)  
             ├── scan |          |                      
             │        | table    | rides@primary        
             │        | spans    | ALL                  
             └── scan |          |                      
                      | table    | vehicles@primary     
                      | spans    | ALL                  
(12 rows)
~~~

<!--Output of EXPLAIN (OPT) for reference
~~~
                   text
+-----------------------------------------+
  limit
   ├── inner-join
   │    ├── scan rides
   │    ├── scan vehicles
   │    └── filters
   │         └── vehicle_id = vehicles.id
   └── const: 1
(7 rows)

Time: 914µs
~~~
-->

### Solution: Provide primary key to allow lookup join

To speed up the query, you can provide the primary key to allow the cost-based optimizer to perform a lookup join instead of a hash join:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM vehicles JOIN rides ON rides.vehicle_id = vehicles.id and rides.city = vehicles.city limit 1;
~~~

~~~
        tree       | field |   description     
+------------------+-------+------------------+
  limit            |       |                   
   │               | count | 1                 
   └── lookup-join |       |                   
        │          | table | rides@primary     
        │          | type  | inner             
        │          | pred  | @13 = @1          
        └── scan   |       |                   
                   | table | vehicles@primary  
                   | spans | ALL               
(9 rows)
~~~

<!--Output of EXPLAIN (OPT) for reference
~~~
                   text
+-----------------------------------------+
  limit
   ├── inner-join (lookup rides)
   │    ├── scan vehicles
   │    └── filters
   │         └── vehicle_id = vehicles.id
   └── const: 1
(6 rows)

Time: 993µs
~~~
-->

## See also

- [SQL Best Practices](performance-best-practices-overview.html)
- [SQL Troubleshooting](query-behavior-troubleshooting.html)
