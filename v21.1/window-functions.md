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

## Window definitions

Window frames are defined in [`OVER` clauses](sql-grammar.html#over_clause) or [`WINDOW` clauses](sql-grammar.html#window_clause).

### Syntax

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="basic">Basic</button>
  <button style="width: 15%" class="filter-button" data-scope="expanded">Expanded</button>
</div>

<br><br>

<div class="filter-content" markdown="1" data-scope="basic">

<div>
  {% include {{ page.version.version }}/sql/diagrams/window_definition.html %}
</div>

### Parameters

Parameter | Description
----------|-------------
`window_name` | The name of the new window frame.
`opt_existing_window_name` | An optional name of an existing window frame, defined in a different window definition.
`opt_partition_clause`  | An optional `PARTITION BY` clause.
`opt_sort_clause` | An optional `ORDER BY` clause. See [Ordering Query Results](query-order.html) for details.
`opt_frame_clause`  | An optional frame clause, which contains a frame boundary and/or an `EXCLUDE` clause.

</div>

<div class="filter-content" markdown="1" data-scope="expanded">

<div>
  {% include {{ page.version.version }}/sql/diagrams/window_definition.html %}
</div>

**opt_frame_clause ::=**

<div>
  {% include {{ page.version.version }}/sql/diagrams/opt_frame_clause.html %}
</div>

### Parameters

Parameter | Description
----------|-------------
`window_name` | The name of the new window frame.
`opt_existing_window_name` | An optional name of an existing window frame, defined in a different window definition.
`opt_partition_clause`  | An optional `PARTITION BY` clause.
`opt_sort_clause` | An optional `ORDER BY` clause. See [Ordering Query Results](query-order.html) for details.
`frame_bound` | An optional frame boundary.<br>Valid start boundaries include `UNBOUNDED PRECEDING`, `<offset> PRECEDING`, and `CURRENT ROW`.<br>Valid end boundaries include `UNBOUNDED FOLLOWING`, `<offset> FOLLOWING`, and `CURRENT ROW`.
`opt_frame_exclusion` | An optional frame `EXCLUDE` clause.<br>Valid exclusions include `CURRENT ROW`, `GROUP`, `TIES`, and `NO OTHERS`.

</div>

## How window functions work

At a high level, window functions work by:

1. Creating a "virtual table" using a [selection query][selection-query].
2. Splitting that table into window frames with [window definitions](#window-definitions). You can define window frames in an [`OVER` clause](sql-grammar.html#over_clause), directly after the window function, or in a [`WINDOW` clause](sql-grammar.html#window_clause), as a part of the selection query.
3. Applying the window function to each of the window frames.

For example, consider a query where the window frames are defined for each window function call:

{% include copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT(city),
             SUM(revenue) OVER () AS total_revenue,
             SUM(revenue) OVER (PARTITION BY city) AS city_revenue
            FROM rides
        ORDER BY city_revenue DESC;
~~~

Its operation can be described as follows (numbered steps listed here correspond to the numbers in the diagram below):

1. The outer `SELECT DISTINCT(city) ... FROM rides` creates a "virtual table" on which the window functions will operate.
2. The window function `SUM(revenue) OVER ()` operates on a window frame containing all rows of the query output.
3. The window function `SUM(revenue) OVER (PARTITION BY city)` operates on several window frames in turn; each frame contains the `revenue` columns for a different city [partition](partitioning.html) (Amsterdam, Boston, L.A., etc.).

<img src="{{ 'images/v21.1/window-functions.png' | relative_url }}" alt="Window function diagram" style="border:1px solid #eee;max-width:100%" />

### Caveats

The most important part of working with window functions is understanding what data will be in the frame that the window function will be operating on. By default, the window frame includes all of the rows of the partition. If you order the partition, the default frame includes all rows from the first row in the partition to the current row. In other words, adding an `ORDER BY` clause when you create the window frame (e.g., `PARTITION BY x ORDER by y`) has the following effects:

- It makes the rows inside the window frame ordered.
- It changes what rows the function is called on - no longer all of the rows in the window frame, but a subset between the "first" row and the current row.

Another way of saying this is that you can run a window function on either:

- All rows in the window frame created by the  `PARTITION BY` clause, e.g., `SELECT f(x) OVER () FROM z`.
- A subset of the rows in the window frame if the frame is created with `SELECT f(x) OVER (PARTITION BY x ORDER BY y) FROM z`.

Because of this, you should be aware of the behavior of any [aggregate function][aggregate-functions] you use as a [window function][window-functions]. If you are not seeing results you expect from a window function, this behavior may explain why. You may need to specify the frame boundaries explicitly in [the window definition](#window-definitions).

{{site.data.alerts.callout_success}}
If you are running separate window functions over the same window frame, you can define the window frame once in a `WINDOW` clause, and then refer to the window by its name when you call the window function. For an example, see [Customers taking the most rides and generating the most revenue](#customers-taking-the-most-rides-and-generating-the-most-revenue).
{{site.data.alerts.end}}

## Examples

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

### Customers taking the most rides

To see which customers have taken the most rides, run:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM
    (SELECT distinct(name) as "name",
            COUNT(*) OVER (PARTITION BY name) AS "number of rides"
     FROM users JOIN rides ON users.id = rides.rider_id)
  ORDER BY "number of rides" DESC LIMIT 10;
~~~

~~~
        name       | number of rides
+------------------+-----------------+
  Michael Brown    |              19
  Richard Bullock  |              17
  Judy White       |              15
  Patricia Herrera |              15
  Tony Ortiz       |              15
  Maria Weber      |              15
  Cindy Medina     |              14
  Samantha Coffey  |              13
  Nicole Mcmahon   |              13
  Amy Cobb         |              13
(10 rows)
~~~

### Customers generating the most revenue

To see which customers have generated the most revenue, run:

{% include copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT name,
    SUM(revenue) OVER (PARTITION BY name) AS "total rider revenue"
    FROM users JOIN rides ON users.id = rides.rider_id
    ORDER BY "total rider revenue" DESC
    LIMIT 10;
~~~

~~~
        name       | total rider revenue
+------------------+---------------------+
  Richard Bullock  |              952.00
  Patricia Herrera |              948.00
  Maria Weber      |              903.00
  Michael Brown    |              858.00
  Judy White       |              818.00
  Tyler Dalton     |              786.00
  Samantha Coffey  |              758.00
  Cindy Medina     |              740.00
  Tony Ortiz       |              724.00
  Nicole Mcmahon   |              696.00
(10 rows)
~~~

### Add row numbers to query output

To add row numbers to the output, kick the previous query down into a subquery and run the `row_number()` window function.

{% include copy-clipboard.html %}
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
  row_number |       name       | total rider revenue
+------------+------------------+---------------------+
           1 | Richard Bullock  |              952.00
           2 | Patricia Herrera |              948.00
           3 | Maria Weber      |              903.00
           4 | Michael Brown    |              858.00
           5 | Judy White       |              818.00
           6 | Tyler Dalton     |              786.00
           7 | Samantha Coffey  |              758.00
           8 | Cindy Medina     |              740.00
           9 | Tony Ortiz       |              724.00
          10 | Nicole Mcmahon   |              696.00
(10 rows)
~~~

### Customers taking the most rides and generating the most revenue

To see which customers have taken the most rides while generating the most revenue, run:

{% include copy-clipboard.html %}
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
        name       | number of rides | total rider revenue
+------------------+-----------------+---------------------+
  Michael Brown    |              19 |              858.00
  Richard Bullock  |              17 |              952.00
  Patricia Herrera |              15 |              948.00
  Maria Weber      |              15 |              903.00
  Judy White       |              15 |              818.00
  Tony Ortiz       |              15 |              724.00
  Cindy Medina     |              14 |              740.00
  Tyler Dalton     |              13 |              786.00
  Samantha Coffey  |              13 |              758.00
  Nicole Mcmahon   |              13 |              696.00
(10 rows)
~~~

Note that in the query above, a `WINDOW` clause defines the window frame, and the `OVER` clauses reuse the window frame.

### Customers with the highest average revenue per ride

To see which customers have the highest average revenue per ride, run:

{% include copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT name,
    COUNT(*)     OVER w AS "number of rides",
    AVG(revenue) OVER w AS "average revenue per ride"
    FROM users JOIN rides ON users.ID = rides.rider_id
    WINDOW w AS (PARTITION BY name)
    ORDER BY "average revenue per ride" DESC, "number of rides" ASC
    LIMIT 10;
~~~

~~~
         name         | number of rides | average revenue per ride
+---------------------+-----------------+--------------------------+
  Daniel Hernandez MD |               7 |    69.714285714285714286
  Pamela Morse        |               5 |                    68.40
  Mark Adams          |               7 |    66.571428571428571429
  Sarah Wang DDS      |               8 |                   63.375
  Patricia Herrera    |              15 |                    63.20
  Taylor Cunningham   |              10 |                    62.60
  Tyler Dalton        |              13 |    60.461538461538461538
  Maria Weber         |              15 |                    60.20
  James Hamilton      |               8 |                    60.00
  Deborah Carson      |              10 |                    59.70
(10 rows)
~~~

### Customers with the highest average revenue per ride, given ten or more rides

To see which customers have the highest average revenue per ride, given that they have taken at least 10 rides, run:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM (
    SELECT DISTINCT name,
      COUNT(*)     OVER w AS "number of rides",
      (AVG(revenue) OVER w)::DECIMAL(100,2) AS "average revenue per ride"
      FROM users JOIN rides ON users.ID = rides.rider_id
      WINDOW w AS (PARTITION BY name)
  )
  WHERE "number of rides" >= 10
  ORDER BY "average revenue per ride" DESC
  LIMIT 10;
~~~

~~~
        name        | number of rides | average revenue per ride
+-------------------+-----------------+--------------------------+
  Patricia Herrera  |              15 |                    63.20
  Taylor Cunningham |              10 |                    62.60
  Tyler Dalton      |              13 |                    60.46
  Maria Weber       |              15 |                    60.20
  Deborah Carson    |              10 |                    59.70
  Carl Russell      |              11 |                    58.36
  Samantha Coffey   |              13 |                    58.31
  Matthew Clay      |              11 |                    56.09
  Richard Bullock   |              17 |                    56.00
  Ryan Hickman      |              10 |                    55.70
(10 rows)
~~~

### Total number of riders, and total revenue

To find out the total number of riders and total revenue generated thus far by the app, run:

{% include copy-clipboard.html %}
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
  total # of riders | total revenue
+-------------------+---------------+
                 50 |      46523.00
(1 row)
~~~

### How many vehicles of each type

{% include copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT type, COUNT(*) OVER (PARTITION BY type) AS cnt FROM vehicles ORDER BY cnt DESC;
~~~

~~~
     type    | cnt
+------------+-----+
  scooter    |   7
  skateboard |   6
  bike       |   2
(3 rows)
~~~

### How much revenue per city

{% include copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT(city), SUM(revenue) OVER (PARTITION BY city) AS city_revenue FROM rides ORDER BY city_revenue DESC;
~~~

~~~
      city      | city_revenue
+---------------+--------------+
  boston        |      3019.00
  amsterdam     |      2966.00
  new york      |      2923.00
  san francisco |      2857.00
  paris         |      2849.00
  washington dc |      2797.00
  seattle       |      2792.00
  los angeles   |      2772.00
  rome          |      2653.00
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
