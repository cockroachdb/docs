---
title: NULL Handling
toc: true
---

This page summarizes how `NULL` values are handled in CockroachDB SQL.

By way of example it uses the following table and data.

~~~sql
CREATE TABLE t1(
  a INT, 
  b INT, 
  c INT
);

INSERT INTO t1 VALUES(1, 0, 0);
INSERT INTO t1 VALUES(2, 0, 1);
INSERT INTO t1 VALUES(3, 1, 0);
INSERT INTO t1 VALUES(4, 1, 1);
INSERT INTO t1 VALUES(5, NULL, 0);
INSERT INTO t1 VALUES(6, NULL, 1);
INSERT INTO t1 VALUES(7, NULL, NULL);

SELECT * FROM t1;
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
When using the CockroachDB built-in client, `NULL` values are displayed using the word **NULL** as opposed to an empty field. This distinguishes them from a character field that contains an empty string ("").


## NULLs and Logic

Any comparison between a value and `NULL` results in `NULL`. This behavior is consistent with PostgresSQL as well as all other major RDBMS's.

~~~sql
SELECT * FROM t1 WHERE b < 10;
+---+---+---+
| a | b | c |
+---+---+---+
| 1 | 0 | 0 |
| 2 | 0 | 1 |
| 3 | 1 | 0 |
| 4 | 1 | 1 |
+---+---+---+

SELECT * FROM t1 WHERE NOT b > 10;
+---+---+---+
| a | b | c |
+---+---+---+
| 1 | 0 | 0 |
| 2 | 0 | 1 |
| 3 | 1 | 0 |
| 4 | 1 | 1 |
+---+---+---+

SELECT * FROM t1 WHERE b < 10 OR c = 1;
+---+------+---+
| a |  b   | c |
+---+------+---+
| 1 |    0 | 0 |
| 2 |    0 | 1 |
| 3 |    1 | 0 |
| 4 |    1 | 1 |
| 6 | NULL | 1 |
+---+------+---+

SELECT * FROM t1 WHERE b < 10 AND c = 1;
+---+---+---+
| a | b | c |
+---+---+---+
| 2 | 0 | 1 |
| 4 | 1 | 1 |
+---+---+---+

SELECT * FROM t1 WHERE NOT (b < 10 AND c = 1);
+---+------+---+
| a |  b   | c |
+---+------+---+
| 1 |    0 | 0 |
| 3 |    1 | 0 |
| 5 | NULL | 0 |
+---+------+---+

SELECT * FROM t1 WHERE NOT (c = 1 AND b < 10);
+---+------+---+
| a |  b   | c |
+---+------+---+
| 1 |    0 | 0 |
| 3 |    1 | 0 |
| 5 | NULL | 0 |
+---+------+---+

~~~

Use the `IS NULL` or `IS NOT NULL` clauses when checking for `NULL` values.

~~~sql
SELECT * FROM t1 WHERE b IS NULL AND c IS NOT NULL;
+---+------+---+
| a |  b   | c |
+---+------+---+
| 5 | NULL | 0 |
| 6 | NULL | 1 |
+---+------+---+
~~~


## NULLs and Arithmetic 

Arithmetic operations involving a `NULL` value will yield a `NULL` result.

~~~sql
SELECT a, b, c, b*0, b*c, b+c FROM t1;
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


## NULLs and Aggregate Functions

Aggregate functions are those that operate on a set of rows and return a single value. The example data has been repeated here to make it easier to understand the results.

Note the following:

- `NULL` values are not included in the `COUNT()` of a column that contains `NULL` values. `COUNT(*)` returns 7 while `COUNT(b)` returns 4.

- `NULL` values are not considered as high or low values in `MIN()` or `MAX()`.

- The `AVG(b)` returns `SUM(b)/COUNT(b)` which is different than `AVG(*)` as `NULL` values are not considered in the `COUNT(b)` of rows.  Refer to the [NULLs as Other Values](#nulls-as-other-values) section below.

~~~sql
SELECT * FROM t1;
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

SELECT COUNT(*), COUNT(b), SUM(b), AVG(b), MIN(b), MAX(b) FROM t1;
+----------+----------+--------+--------------------+--------+--------+
| COUNT(*) | COUNT(b) | SUM(b) |       AVG(b)       | MIN(b) | MAX(b) |
+----------+----------+--------+--------------------+--------+--------+
|        7 |        4 |      2 | 0.5000000000000000 |      0 |      1 |
+----------+----------+--------+--------------------+--------+--------+
~~~


## NULL as a Distinct Value

`NULL` values are considered distinct from other values and are included in the list of distinct values from a column containing `NULL`s.

~~~sql
SELECT DISTINCT b FROM t1;
+------+
|  b   |
+------+
|    0 |
|    1 |
| NULL |
+------+
~~~

However, counting the number of distinct values excludes them, which is consistent with the `COUNT()` function.

~~~sql
SELECT COUNT(DISTINCT b) FROM t1;
+-------------------+
| count(DISTINCT b) |
+-------------------+
|                 2 |
+-------------------+
~~~


## NULLs as Other Values

You may want `NULL` values to be included in calculations like arithmetic or aggregate functions. For example, you may want to calculate the average value of column *b* as being the `SUM()` of all numbers in *b* divided by the total number of rows, regardless of whether *b*'s value is `NULL`. We can include `NULL` values in the calculation by substituting a value for the `NULL` during the calculation. In this case, a value of zero (0) is appropriate. CockroachDB provides a function called `IFNULL(arg1, arg2)` which returns *arg2* if *arg1* is `NULL`.

The example shows `IFNULL()` being used in the `AVG()` calculation.

~~~sql
 SELECT COUNT(*), COUNT(b), SUM(b), AVG(b), AVG(IFNULL(b, 0)), MIN(b), MAX(b) FROM t1;
+----------+----------+--------+--------------------+--------------------+--------+--------+
| COUNT(*) | COUNT(b) | SUM(b) |       AVG(b)       | AVG(IFNULL(b, 0))  | MIN(b) | MAX(b) |
+----------+----------+--------+--------------------+--------------------+--------+--------+
|        7 |        4 |      2 | 0.5000000000000000 | 0.2857142857142857 |      0 |      1 |
+----------+----------+--------+--------------------+--------------------+--------+--------+
~~~


## NULLs and Set Operations

`NULL` values are considered as part of a `UNION` set operation.

~~~sql
SELECT b FROM t1 UNION SELECT b FROM t1;
+------+
|  b   |
+------+
|    0 |
|    1 |
| NULL |
+------+
~~~


## NULL Values and Sorting

When sorting on a column containing `NULL` values, CockroachDB  orders `NULL`s lower than the first non-`NULL` value.

The `NULLS FIRST` and `NULLS LAST` options of the `ORDER BY` clause are not implemented in CockroachDB so you cannot currently change where `NULL` values appear in the sort order.

CockroachDB differs from PostgreSQL in that it orders `NULL` values higher than the last  non-`NULL` value.

~~~sql
SELECT * FROM t1 ORDER BY b;
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

SELECT * FROM t1 ORDER BY b DESC;
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


## NULLs and Unique Constraints 

As the example shows, `NULL` values are not considered unique as the `UNIQUE` constraint on column b was not violated when two rows with `NULL` values were inserted. If a table has a `UNIQUE` constraint on column(s) that are optional (nullable), it is still possible to insert duplicate rows that appear to violate the constraint if they contain a `NULL` value in at least one of the columns. This is because `NULL`s are never considered equal and hence don't violate the uniqueness constraint.


~~~sql
CREATE TABLE t2(a INT, b INT UNIQUE);

INSERT INTO t2 VALUES(1, 1);
INSERT INTO t2 VALUES(2, NULL);
INSERT INTO t2 VALUES(3, NULL);

SELECT * FROM t2;
+---+------+
| a |  b   |
+---+------+
| 1 |    1 |
| 2 | NULL |
| 3 | NULL |
+---+------+
~~~



## See Also

IFNULL()
