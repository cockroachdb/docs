---
title: Window Functions
summary: A window function performs a calculation across a set of table rows that are somehow related to the current row.
toc: true
---

CockroachDB supports the application of a function over a subset of the rows returned by a [selection query][selection-query]. Such a function is known as a _window function_, and it allows you to compute values by operating on more than one row at a time. The subset of rows a window function operates on is known as a _window frame_.

For a complete list of supported window functions, see [Functions and Operators](functions-and-operators.html#window-functions).

{{site.data.alerts.callout_success}}
All [aggregate functions][aggregate-functions] can also be used as [window functions][window-functions]. For more information, see the [Examples](#examples) below.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
The examples on this page use the `users`, `rides`, and `vehicles` tables from our open-source fictional peer-to-peer ride-sharing application,[MovR](https://github.com/cockroachdb/movr).
{{site.data.alerts.end}}

## How window functions work

At a high level, window functions work by:

1. Creating a "virtual table" using a [selection query][selection-query].
2. Splitting that table into window frames using an `OVER (PARTITION BY ...)` clause.
3. Applying the window function to each of the window frames created in step 2

For example, consider this query:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT(city),
             SUM(revenue) OVER (PARTITION BY city) AS city_revenue
            FROM rides
        ORDER BY city_revenue DESC;
~~~

Its operation can be described as follows (numbered steps listed here correspond to the numbers in the diagram below):

1. The outer `SELECT DISTINCT(city) ... FROM rides` creates a "virtual table" on which the window functions will operate.
2. The window function `SUM(revenue) OVER ()` operates on a window frame containing all rows of the query output.
3. The window function `SUM(revenue) OVER (PARTITION BY city)` operates on several window frames in turn; each frame contains the `revenue` columns for a different city (Amsterdam, Boston, L.A., etc.).

<img src="{{ 'images/v19.1/window-functions.png' | relative_url }}" alt="Window function diagram" style="border:1px solid #eee;max-width:100%" />

## Caveats

The most important part of working with window functions is understanding what data will be in the frame that the window function will be operating on. By default, the window frame includes all of the rows of the partition. If you order the partition, the default frame includes all rows from the first row in the partition to the current row. In other words, adding an `ORDER BY` clause when you create the window frame (e.g., `PARTITION BY x ORDER by y`) has the following effects:

- It makes the rows inside the window frame ordered.
- It changes what rows the function is called on - no longer all of the rows in the window frame, but a subset between the "first" row and the current row.

Another way of saying this is that you can run a window function on either:

- All rows in the window frame created by the  `PARTITION BY` clause, e.g., `SELECT f(x) OVER () FROM z`.
- A subset of the rows in the window frame if the frame is created with `SELECT f(x) OVER (PARTITION BY x ORDER BY y) FROM z`.

Because of this, you should be aware of the behavior of any [aggregate function][aggregate-functions] you use as a [window function][window-functions]. If you are not seeing results you expect from a window function, this behavior may explain why. You may need to specify the frame boundaries explicitly using a *frame clause* such as `ROWS BETWEEN <start> <end> [exclusion]` (fully supported) or `RANGE BETWEEN <start> <end> [exclusion]` (only `UNBOUNDED PRECEDING`/`CURRENT ROW`/`UNBOUNDED FOLLOWING` supported).

## Examples

### Schema

The tables used in the examples are shown below.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
+-------+-------------------------------------------------------------+
| Table |                         CreateTable                         |
+-------+-------------------------------------------------------------+
| users | CREATE TABLE users (                                        |
|       |     id UUID NOT NULL,                                       |
|       |     city STRING NOT NULL,                                   |
|       |     name STRING NULL,                                       |
|       |     address STRING NULL,                                    |
|       |     credit_card STRING NULL,                                |
|       |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),    |
|       |     FAMILY "primary" (id, city, name, address, credit_card) |
|       | )                                                           |
+-------+-------------------------------------------------------------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE rides;
~~~

~~~
+-------+--------------------------------------------------------------------------+
| Table |                               CreateTable                                |
+-------+--------------------------------------------------------------------------+
| rides | CREATE TABLE rides (                                                     |
|       |     id UUID NOT NULL,                                                    |
|       |     city STRING NOT NULL,                                                |
|       |     vehicle_city STRING NULL,                                            |
|       |     rider_id UUID NULL,                                                  |
|       |     vehicle_id UUID NULL,                                                |
|       |     start_address STRING NULL,                                           |
|       |     end_address STRING NULL,                                             |
|       |     start_time TIMESTAMP NULL,                                           |
|       |     end_time TIMESTAMP NULL,                                             |
|       |     revenue FLOAT NULL,                                                  |
|       |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),                 |
|       |     CONSTRAINT fk_city_ref_users FOREIGN KEY (city, rider_id) REFERENCES |
|       | users (city, id),                                                        |
|       |     INDEX rides_auto_index_fk_city_ref_users (city ASC, rider_id ASC),   |
|       |     CONSTRAINT fk_vehicle_city_ref_vehicles FOREIGN KEY (vehicle_city,   |
|       | vehicle_id) REFERENCES vehicles (city, id),                              |
|       |     INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (vehicle_city    |
|       | ASC, vehicle_id ASC),                                                    |
|       |     FAMILY "primary" (id, city, vehicle_city, rider_id, vehicle_id,      |
|       | start_address, end_address, start_time, end_time, revenue),              |
|       |     CONSTRAINT check_vehicle_city_city CHECK (vehicle_city = city)       |
|       | )                                                                        |
+-------+--------------------------------------------------------------------------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles;
~~~

~~~
+----------+------------------------------------------------------------------------------------------------+
|  Table   |                                          CreateTable                                           |
+----------+------------------------------------------------------------------------------------------------+
| vehicles | CREATE TABLE vehicles (                                                                       +|
|          |         id UUID NOT NULL,                                                                     +|
|          |         city STRING NOT NULL,                                                                 +|
|          |         type STRING NULL,                                                                     +|
|          |         owner_id UUID NULL,                                                                   +|
|          |         creation_time TIMESTAMP NULL,                                                         +|
|          |         status STRING NULL,                                                                   +|
|          |         mycol STRING NULL,                                                                    +|
|          |         ext JSON NULL,                                                                        +|
|          |         CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),                                  +|
|          |         CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES users (city, id),+|
|          |         INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),                 +|
|          |         FAMILY "primary" (id, city, type, owner_id, creation_time, status, mycol, ext)        +|
|          | )                                                                                              |
+----------+------------------------------------------------------------------------------------------------+
(1 row)
~~~

### Customers taking the most rides

To see which customers have taken the most rides, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM
    (SELECT distinct(name) as "name",
            COUNT(*) OVER (PARTITION BY name) AS "number of rides"
     FROM users JOIN rides ON users.id = rides.rider_id)
  ORDER BY "number of rides" DESC LIMIT 10;
~~~

~~~
+-------------------+-----------------+
|       name        | number of rides |
+-------------------+-----------------+
| Michael Smith     |              53 |
| Michael Williams  |              37 |
| John Smith        |              36 |
| Jennifer Smith    |              32 |
| Michael Brown     |              31 |
| Michael Miller    |              30 |
| Christopher Smith |              29 |
| James Johnson     |              28 |
| Jennifer Johnson  |              27 |
| Amanda Smith      |              26 |
+-------------------+-----------------+
(10 rows)
~~~

### Customers generating the most revenue

To see which customers have generated the most revenue, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT name,
    SUM(revenue) OVER (PARTITION BY name) AS "total rider revenue"
    FROM users JOIN rides ON users.id = rides.rider_id
    ORDER BY "total rider revenue" DESC
    LIMIT 10;
~~~

~~~
+------------------+---------------------+
|       name       | total rider revenue |
+------------------+---------------------+
| Michael Smith    |             2251.04 |
| Jennifer Smith   |             2114.55 |
| Michael Williams |             2011.85 |
| John Smith       |             1826.43 |
| Robert Johnson   |             1652.99 |
| Michael Miller   |             1619.25 |
| Robert Smith     |             1534.11 |
| Jennifer Johnson |             1506.50 |
| Michael Brown    |             1478.90 |
| Michael Johnson  |             1405.68 |
+------------------+---------------------+
(10 rows)
~~~

### Add row numbers to query output

To add row numbers to the output, kick the previous query down into a subquery and run the `row_number()` window function.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT row_number() OVER (), *
  FROM (
		  SELECT DISTINCT
		         name,
		         sum(revenue) OVER (
					PARTITION BY name
		         ) AS "total rider revenue"
		    FROM users JOIN rides ON users.id = rides.rider_id
		ORDER BY "total rider revenue" DESC
		   LIMIT 10
       );
~~~

~~~
+------------+------------------+---------------------+
| row_number |       name       | total rider revenue |
+------------+------------------+---------------------+
|          1 | Michael Smith    |             2251.04 |
|          2 | Jennifer Smith   |             2114.55 |
|          3 | Michael Williams |             2011.85 |
|          4 | John Smith       |             1826.43 |
|          5 | Robert Johnson   |             1652.99 |
|          6 | Michael Miller   |             1619.25 |
|          7 | Robert Smith     |             1534.11 |
|          8 | Jennifer Johnson |             1506.50 |
|          9 | Michael Brown    |             1478.90 |
|         10 | Michael Johnson  |             1405.68 |
+------------+------------------+---------------------+
(10 rows)
~~~

### Customers taking the most rides and generating the most revenue

To see which customers have taken the most rides while generating the most revenue, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM (
    SELECT DISTINCT name,
      COUNT(*)     OVER w AS "number of rides",
      (SUM(revenue) OVER w)::DECIMAL(100,2) AS "total rider revenue"
      FROM users JOIN rides ON users.ID = rides.rider_id
      WINDOW w AS (PARTITION BY name)
    )
  ORDER BY "number of rides" DESC,
           "total rider revenue" DESC
  LIMIT 10;
~~~

~~~
+-------------------+-----------------+---------------------+
|       name        | number of rides | total rider revenue |
+-------------------+-----------------+---------------------+
| Michael Smith     |              53 |             2251.04 |
| Michael Williams  |              37 |             2011.85 |
| John Smith        |              36 |             1826.43 |
| Jennifer Smith    |              32 |             2114.55 |
| Michael Brown     |              31 |             1478.90 |
| Michael Miller    |              30 |             1619.25 |
| Christopher Smith |              29 |             1380.18 |
| James Johnson     |              28 |             1378.78 |
| Jennifer Johnson  |              27 |             1506.50 |
| Robert Johnson    |              26 |             1652.99 |
+-------------------+-----------------+---------------------+
(10 rows)
~~~

### Customers with the highest average revenue per ride

To see which customers have the highest average revenue per ride, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name,
    COUNT(*)     OVER w AS "number of rides",
    AVG(revenue) OVER w AS "average revenue per ride"
    FROM users JOIN rides ON users.ID = rides.rider_id
    WINDOW w AS (PARTITION BY name)
    ORDER BY "average revenue per ride" DESC, "number of rides" ASC
    LIMIT 10;
~~~

~~~
+---------------------+-----------------+--------------------------+
|        name         | number of rides | average revenue per ride |
+---------------------+-----------------+--------------------------+
| Madison Jimenez     |               1 |                   100.00 |
| David Webster       |               1 |                   100.00 |
| Samantha Holmes     |               1 |                   100.00 |
| Charles Marquez     |               1 |                   100.00 |
| Briana Howell       |               1 |                    99.99 |
| Michelle Williamson |               1 |                    99.99 |
| Shannon Weiss       |               1 |                    99.98 |
| Justin Barry        |               1 |                    99.98 |
| Paul Key            |               1 |                    99.97 |
| Holly Gregory       |               1 |                    99.97 |
+---------------------+-----------------+--------------------------+
(10 rows)
~~~

### Customers with the highest average revenue per ride, given more than five rides

To see which customers have the highest average revenue per ride, given that they have taken at least 3 rides, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM (
    SELECT DISTINCT name,
      COUNT(*)     OVER w AS "number of rides",
      (AVG(revenue) OVER w)::DECIMAL(100,2) AS "average revenue per ride"
      FROM users JOIN rides ON users.ID = rides.rider_id
      WINDOW w AS (PARTITION BY name)
  )
  WHERE "number of rides" >= 5
  ORDER BY "average revenue per ride" DESC
  LIMIT 10;
~~~

~~~
+------------------+-----------------+--------------------------+
|       name       | number of rides | average revenue per ride |
+------------------+-----------------+--------------------------+
| Richard Wilson   |               5 |                    88.22 |
| Rachel Johnson   |               6 |                    86.42 |
| Kenneth Wilson   |               5 |                    85.26 |
| Benjamin Avila   |               5 |                    85.23 |
| Katie Evans      |               5 |                    85.10 |
| Steven Griffith  |               5 |                    84.64 |
| Phillip Moore    |               5 |                    84.22 |
| Cheryl Adams     |               5 |                    83.85 |
| Patrick Baker    |               5 |                    83.63 |
| Stephen Gonzalez |               6 |                    83.59 |
+------------------+-----------------+--------------------------+
(10 rows)
~~~

### Total number of riders, and total revenue

To find out the total number of riders and total revenue generated thus far by the app, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT
    COUNT("name") AS "total # of riders",
    SUM("total rider revenue") AS "total revenue" FROM (
      SELECT name,
             SUM(revenue) OVER (PARTITION BY name) AS "total rider revenue"
        FROM users JOIN rides ON users.id = rides.rider_id
        ORDER BY "total rider revenue" DESC
        LIMIT (SELECT count(distinct(rider_id)) FROM rides)
  );
~~~

~~~
+-------------------+---------------+
| total # of riders | total revenue |
+-------------------+---------------+
|             63117 |   15772911.41 |
+-------------------+---------------+
(1 row)
~~~

### How many vehicles of each type

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT type, COUNT(*) OVER (PARTITION BY type) AS cnt FROM vehicles ORDER BY cnt DESC;
~~~

~~~
+------------+-------+
|    type    |  cnt  |
+------------+-------+
| bike       | 33377 |
| scooter    | 33315 |
| skateboard | 33307 |
+------------+-------+
(3 rows)
~~~

### How much revenue per city

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT(city), SUM(revenue) OVER (PARTITION BY city) AS city_revenue FROM rides ORDER BY city_revenue DESC;
~~~

~~~
+---------------+--------------+
|    (city)     | city_revenue |
+---------------+--------------+
| paris         |    567144.48 |
| washington dc |    567011.74 |
| amsterdam     |    564211.74 |
| new york      |    561420.67 |
| rome          |    560464.52 |
| boston        |    559465.75 |
| san francisco |    558807.13 |
| los angeles   |    558805.45 |
| seattle       |    555452.08 |
+---------------+--------------+
(9 rows)
~~~

## See also

- [Simple `SELECT` clause][simple-select]
- [Selection Queries][selection-query]
- [Aggregate functions][aggregate-functions]
- [Window Functions][window-functions]
- [CockroachDB 2.0 Demo][demo]

<!-- Links -->

[aggregate-functions]: functions-and-operators.html#aggregate-functions
[demo]: https://www.youtube.com/watch?v=v2QK5VgLx6E
[simple-select]: select-clause.html
[selection-query]: selection-queries.html
[window-functions]: functions-and-operators.html#window-functions
