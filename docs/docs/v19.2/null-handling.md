---
title: NULL Handling
summary: Learn how NULL values are handled in CockroachDB SQL.
toc: true
---

This page summarizes how `NULL` values are handled in CockroachDB
SQL. Each topic is demonstrated via the [built-in SQL
client](cockroach-sql.html).

{{site.data.alerts.callout_info}}
When using the built-in client, `NULL` values are displayed using the word `NULL`. This distinguishes them from a character field that contains an empty string ("").
{{site.data.alerts.end}}

## NULLs and simple comparisons

Any simple comparison between a value and `NULL` results in
`NULL`. The remaining cases are described in the next section.

This behavior is consistent with PostgreSQL as well as all other major RDBMS's.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (customer_id, cust_name, cust_email) VALUES (1, 'Smith', NULL);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE t1(
  a INT,
  b INT,
  c INT
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t1 VALUES(1, 0, 0);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t1 VALUES(2, 0, 1);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t1 VALUES(3, 1, 0);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t1 VALUES(4, 1, 1);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t1 VALUES(5, NULL, 0);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t1 VALUES(6, NULL, 1);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t1 VALUES(7, NULL, NULL);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1;
~~~

~~~
+---+------+------+
| a |  b   |  c   |
+---+------+------+
| 1 |    0 |    0 |
| 2 |    0 |    1 |
| 3 |    1 |    0 |
| 4 |    1 |    1 |
| 5 | NULL |    0 |
| 6 | NULL |    1 |
| 7 | NULL | NULL |
+---+------+------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1 WHERE b < 10;
~~~

~~~
+---+---+---+
| a | b | c |
+---+---+---+
| 1 | 0 | 0 |
| 2 | 0 | 1 |
| 3 | 1 | 0 |
| 4 | 1 | 1 |
+---+---+---+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1 WHERE NOT b > 10;
~~~

~~~
+---+---+---+
| a | b | c |
+---+---+---+
| 1 | 0 | 0 |
| 2 | 0 | 1 |
| 3 | 1 | 0 |
| 4 | 1 | 1 |
+---+---+---+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1 WHERE b < 10 OR c = 1;
~~~

~~~
+---+------+---+
| a |  b   | c |
+---+------+---+
| 1 |    0 | 0 |
| 2 |    0 | 1 |
| 3 |    1 | 0 |
| 4 |    1 | 1 |
| 6 | NULL | 1 |
+---+------+---+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1 WHERE b < 10 AND c = 1;
~~~

~~~
+---+---+---+
| a | b | c |
+---+---+---+
| 2 | 0 | 1 |
| 4 | 1 | 1 |
+---+---+---+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1 WHERE NOT (b < 10 AND c = 1);
~~~

~~~
+---+------+---+
| a |  b   | c |
+---+------+---+
| 1 |    0 | 0 |
| 3 |    1 | 0 |
| 5 | NULL | 0 |
+---+------+---+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1 WHERE NOT (c = 1 AND b < 10);
~~~

~~~
+---+------+---+
| a |  b   | c |
+---+------+---+
| 1 |    0 | 0 |
| 3 |    1 | 0 |
| 5 | NULL | 0 |
+---+------+---+
~~~

Use the `IS NULL` or `IS NOT NULL` clauses when checking for `NULL` values.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1 WHERE b IS NULL AND c IS NOT NULL;
~~~

~~~
+---+------+---+
| a |  b   | c |
+---+------+---+
| 5 | NULL | 0 |
| 6 | NULL | 1 |
+---+------+---+
~~~

## NULLs and conditional operators

The [conditional
operators](scalar-expressions.html#conditional-expressions)
(including `IF`, `COALESCE`, `IFNULL`) only evaluate some
operands depending on the value of a condition operand, so their
result is not always `NULL` depending on the given operands.

For example, `COALESCE(1, NULL)` will always return `1` even though
the second operand is `NULL`.

## NULLs and ternary logic

`AND`, `OR` and `IS` implement ternary logic, as follows.

| Expression       | Result |
-------------------|---------
 `FALSE AND FALSE` | `FALSE`
 `FALSE AND TRUE`  | `FALSE`
 `FALSE AND NULL`  | `FALSE`
 `TRUE AND FALSE`  | `FALSE`
 `TRUE AND TRUE`   | `TRUE`  
 `TRUE AND NULL`   | `NULL`  
 `NULL AND FALSE`  | `FALSE`
 `NULL AND TRUE`   | `NULL`  
 `NULL AND NULL`   | `NULL`  

| Expression      | Result |
------------------|---------
 `FALSE OR FALSE` | `FALSE`
 `FALSE OR TRUE`  | `TRUE`  
 `FALSE OR NULL`  | `NULL`  
 `TRUE OR FALSE`  | `TRUE`  
 `TRUE OR TRUE`   | `TRUE`  
 `TRUE OR NULL`   | `TRUE`  
 `NULL OR FALSE`  | `NULL`  
 `NULL OR TRUE`   | `TRUE`  
 `NULL OR NULL`   | `NULL`  

| Expression      | Result  |
------------------|---------
 `FALSE IS FALSE` | `TRUE`  
 `FALSE IS TRUE`  | `FALSE`
 `FALSE IS NULL`  | `FALSE`
 `TRUE IS FALSE`  | `FALSE`
 `TRUE IS TRUE`   | `TRUE`  
 `TRUE IS NULL`   | `FALSE`
 `NULL IS FALSE`  | `FALSE`
 `NULL IS TRUE`   | `FALSE`
 `NULL IS NULL`   | `TRUE`  

## NULLs and arithmetic

Arithmetic operations involving a `NULL` value will yield a `NULL` result.

{% include copy-clipboard.html %}
~~~ sql
> SELECT a, b, c, b*0, b*c, b+c FROM t1;
~~~

~~~
+---+------+------+-------+-------+-------+
| a |  b   |  c   | b * 0 | b * c | b + c |
+---+------+------+-------+-------+-------+
| 1 |    0 |    0 |     0 |     0 |     0 |
| 2 |    0 |    1 |     0 |     0 |     1 |
| 3 |    1 |    0 |     0 |     0 |     1 |
| 4 |    1 |    1 |     0 |     1 |     2 |
| 5 | NULL |    0 | NULL  | NULL  | NULL  |
| 6 | NULL |    1 | NULL  | NULL  | NULL  |
| 7 | NULL | NULL | NULL  | NULL  | NULL  |
+---+------+------+-------+-------+-------+
~~~

## NULLs and aggregate functions

Aggregate [functions](functions-and-operators.html) are those that operate on a set of rows and return a single value. The example data has been repeated here to make it easier to understand the results.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1;
~~~

~~~
+---+------+------+
| a |  b   |  c   |
+---+------+------+
| 1 |    0 |    0 |
| 2 |    0 |    1 |
| 3 |    1 |    0 |
| 4 |    1 |    1 |
| 5 | NULL |    0 |
| 6 | NULL |    1 |
| 7 | NULL | NULL |
+---+------+------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT COUNT(*), COUNT(b), SUM(b), AVG(b), MIN(b), MAX(b) FROM t1;
~~~

~~~
+----------+----------+--------+--------------------+--------+--------+
| COUNT(*) | COUNT(b) | SUM(b) |       AVG(b)       | MIN(b) | MAX(b) |
+----------+----------+--------+--------------------+--------+--------+
|        7 |        4 |      2 | 0.5000000000000000 |      0 |      1 |
+----------+----------+--------+--------------------+--------+--------+
~~~

Note the following:

- `NULL` values are not included in the `COUNT()` of a column. `COUNT(*)` returns 7 while `COUNT(b)` returns 4.

- `NULL` values are not considered as high or low values in `MIN()` or `MAX()`.

- `AVG(b)` returns `SUM(b)/COUNT(b)`, which is different than `AVG(*)` as `NULL` values are not considered in the `COUNT(b)` of rows. See [NULLs as Other Values](#nulls-as-other-values) for more details.


## NULL as a distinct value

`NULL` values are considered distinct from other values and are included in the list of distinct values from a column.

{% include copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT b FROM t1;
~~~

~~~
+------+
|  b   |
+------+
|    0 |
|    1 |
| NULL |
+------+
~~~

However, counting the number of distinct values excludes `NULL`s, which is consistent with the `COUNT()` function.

{% include copy-clipboard.html %}
~~~ sql
> SELECT COUNT(DISTINCT b) FROM t1;
~~~

~~~
+-------------------+
| count(DISTINCT b) |
+-------------------+
|                 2 |
+-------------------+
~~~

## NULLs as other values

In some cases, you may want to include `NULL` values in arithmetic or aggregate function calculations. To do so, use the `IFNULL()` function to substitute a value for `NULL` during calculations.

For example, let's say you want to calculate the average value of column `b` as being the `SUM()` of all numbers in `b` divided by the total number of rows, regardless of whether `b`'s value is `NULL`. In this case, you would use `AVG(IFNULL(b, 0))`, where `IFNULL(b, 0)` substitutes a value of zero (0) for `NULL`s during the calculation.

{% include copy-clipboard.html %}
~~~ sql
> SELECT COUNT(*), COUNT(b), SUM(b), AVG(b), AVG(IFNULL(b, 0)), MIN(b), MAX(b) FROM t1;
~~~

~~~
+----------+----------+--------+--------------------+--------------------+--------+--------+
| COUNT(*) | COUNT(b) | SUM(b) |       AVG(b)       | AVG(IFNULL(b, 0))  | MIN(b) | MAX(b) |
+----------+----------+--------+--------------------+--------------------+--------+--------+
|        7 |        4 |      2 | 0.5000000000000000 | 0.2857142857142857 |      0 |      1 |
+----------+----------+--------+--------------------+--------------------+--------+--------+
~~~

## NULLs and set operations

`NULL` values are considered as part of a `UNION` [set operation](selection-queries.html#set-operations).

{% include copy-clipboard.html %}
~~~ sql
> SELECT b FROM t1 UNION SELECT b FROM t1;
~~~

~~~
+------+
|  b   |
+------+
|    0 |
|    1 |
| NULL |
+------+
~~~


## NULLs and sorting

When [sorting a column](query-order.html) containing `NULL` values, CockroachDB sorts `NULL` values first with `ASC` and last with `DESC`. This differs from PostgreSQL, which sorts `NULL` values last with `ASC` and first with `DESC`.

Note that the `NULLS FIRST` and `NULLS LAST` options of the `ORDER BY` clause are not implemented in CockroachDB, so you cannot change where `NULL` values appear in the sort order.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1 ORDER BY b ASC;
~~~

~~~
+---+------+------+
| a |  b   |  c   |
+---+------+------+
| 6 | NULL |    1 |
| 5 | NULL |    0 |
| 7 | NULL | NULL |
| 1 |    0 |    0 |
| 2 |    0 |    1 |
| 4 |    1 |    1 |
| 3 |    1 |    0 |
+---+------+------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t1 ORDER BY b DESC;
~~~

~~~
+---+------+------+
| a |  b   |  c   |
+---+------+------+
| 4 |    1 |    1 |
| 3 |    1 |    0 |
| 2 |    0 |    1 |
| 1 |    0 |    0 |
| 7 | NULL | NULL |
| 6 | NULL |    1 |
| 5 | NULL |    0 |
+---+------+------+
~~~

## NULLs and unique constraints

`NULL` values are not considered unique. Therefore, if a table has a Unique constraint on one or more columns that are optional (nullable), it is possible to insert multiple rows with `NULL` values in those columns, as shown in the example below.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE t2(a INT, b INT UNIQUE);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t2 VALUES(1, 1);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t2 VALUES(2, NULL);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t2 VALUES(3, NULL);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t2;
~~~

~~~
+---+------+
| a |  b   |
+---+------+
| 1 |    1 |
| 2 | NULL |
| 3 | NULL |
+---+------+
~~~

## NULLs and CHECK Constraints

A [`CHECK` constraint](check.html) expression that evaluates to `NULL` is considered to pass, allowing for concise expressions like `discount < price` without worrying about adding `OR discount IS NULL` clauses. When non-null validation is desired, the usual `NOT NULL` constraint can be used along side a Check constraint.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE products (id STRING PRIMARY KEY, price INT NOT NULL CHECK (price > 0), discount INT, CHECK (discount <= price));
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO products (id, price) VALUES ('ncc-1701-d', 100);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO products (id, price, discount) VALUES ('ncc-1701-a', 100, 50);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM products;
~~~

~~~
+----------+-------+----------+
|    id    | price | discount |
+----------+-------+----------+
| ncc1701a |   100 |       50 |
| ncc1701d |   100 | NULL     |
+----------+-------+----------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO products (id, price) VALUES ('ncc-1701-b', -5);
~~~

~~~
failed to satisfy CHECK constraint (price > 0)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO products (id, price, discount) VALUES ('ncc-1701-b', 100, 150);
~~~

~~~
failed to satisfy CHECK constraint (discount <= price)
~~~
