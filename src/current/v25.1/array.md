---
title: ARRAY
summary: The ARRAY data type stores one-dimensional, 1-indexed, homogeneous arrays of any non-array data types.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: reference.sql
---

The `ARRAY` data type stores one-dimensional, 1-indexed, homogeneous arrays of any non-array [data type]({{ page.version.version }}/data-types.md).

The `ARRAY` data type is useful for ensuring compatibility with ORMs and other tools. However, if such compatibility is not a concern, it's more flexible to design your schema with normalized tables.

 CockroachDB supports indexing array columns with [GIN indexes]({{ page.version.version }}/inverted-indexes.md). This permits accelerating containment queries ([`@>`]({{ page.version.version }}/functions-and-operators.md#supported-operations) and [`<@`]({{ page.version.version }}/functions-and-operators.md#supported-operations)) and overlap queries ([`&&`]({{ page.version.version }}/functions-and-operators.md#supported-operations)) on array columns by adding an index to them.

{{site.data.alerts.callout_info}}
CockroachDB does not support nested arrays.
{{site.data.alerts.end}}

## Syntax

A value of data type `ARRAY` can be expressed in the following ways:

- Appending square brackets (`[]`) to any non-array [data type]({{ page.version.version }}/data-types.md).
- Adding the term `ARRAY` to any non-array [data type]({{ page.version.version }}/data-types.md).

## Size

The size of an `ARRAY` value is variable, but it's recommended to keep values under 1 MB to ensure performance. Above that threshold, [write amplification]({{ page.version.version }}/architecture/storage-layer.md#write-amplification) and other considerations may cause significant performance degradation.  

## Functions

For the list of supported `ARRAY` functions, see [Functions and Operators]({{ page.version.version }}/functions-and-operators.md#array-functions).

## Examples

### Creating an array column by appending square brackets

~~~ sql
> CREATE TABLE a (b STRING[]);
~~~

~~~ sql
> INSERT INTO a VALUES (ARRAY['sky', 'road', 'car']);
~~~

~~~ sql
> SELECT * FROM a;
~~~

~~~
        b
------------------
  {sky,road,car}
(1 row)
~~~

### Creating an array column by adding the term `ARRAY`

~~~ sql
> CREATE TABLE c (d INT ARRAY);
~~~

~~~ sql
> INSERT INTO c VALUES (ARRAY[10,20,30]);
~~~

~~~ sql
> SELECT * FROM c;
~~~

~~~
      d
--------------
  {10,20,30}
(1 row)
~~~

### Accessing an array element using array index

{{site.data.alerts.callout_info}}
Arrays in CockroachDB are 1-indexed.
{{site.data.alerts.end}}

~~~ sql
> SELECT * FROM c;
~~~

~~~
      d
--------------
  {10,20,30}
(1 row)
~~~

~~~ sql
> SELECT d[2] FROM c;
~~~

~~~
  d
------
  20
(1 row)
~~~

### Accessing an array column using containment queries

You can use the [operators]({{ page.version.version }}/functions-and-operators.md#supported-operations) `<@` ("is contained by") and `@>` ("contains") to run containment queries on `ARRAY` columns.

~~~ sql
> SELECT * FROM c WHERE d <@ ARRAY[10,20,30,40,50];
~~~

~~~
      d
--------------
  {10,20,30}
(1 row)
~~~

~~~ sql
> SELECT * FROM c WHERE d @> ARRAY[10,20];
~~~

~~~
      d
--------------
  {10,20,30}
(1 row)
~~~

### Using the overlaps operator

You can use the `&&` (overlaps) [operator]({{ page.version.version }}/functions-and-operators.md#supported-operations) to select array columns by checking if another array overlaps the column array. Arrays overlap if they have any elements in common.

1. Create the table:

    ~~~ sql
    CREATE TABLE a (b STRING[]);
    ~~~

1. Insert two new arrays:

    ~~~ sql
    INSERT INTO a VALUES (ARRAY['runway', 'houses', 'city', 'clouds']);
    INSERT INTO a VALUES (ARRAY['runway', 'houses', 'city']);
    INSERT INTO a VALUES (ARRAY['sun','moon']);
    ~~~

1. Use the `&&` operator in a `WHERE` clause to a query:

    ~~~ sql
    SELECT * FROM a WHERE b && ARRAY['clouds','moon'];
    ~~~

    ~~~
                      b
    -------------------------------
      {runway,houses,city,clouds}
      {sun,moon}
    (2 rows)


    Time: 30ms total (execution 2ms / network 28ms)
    ~~~

### Appending an element to an array

#### Using the `array_append` function

~~~ sql
> SELECT * FROM c;
~~~

~~~
      d
--------------
  {10,20,30}
(1 row)
~~~

~~~ sql
> UPDATE c SET d = array_append(d, 40) WHERE d[3] = 30;
~~~

~~~ sql
> SELECT * FROM c;
~~~

~~~
        d
-----------------
  {10,20,30,40}
(1 row)
~~~

#### Using the append (`||`) operator

~~~ sql
> SELECT * FROM c;
~~~

~~~
        d
-----------------
  {10,20,30,40}
(1 row)
~~~

~~~ sql
> UPDATE c SET d = d || 50 WHERE d[4] = 40;
~~~

~~~ sql
> SELECT * FROM c;
~~~

~~~
         d
--------------------
  {10,20,30,40,50}
(1 row)
~~~

### Ordering by an array

~~~ sql
> CREATE TABLE t (a INT ARRAY, b STRING);
~~~

~~~ sql
> INSERT INTO t VALUES (ARRAY[3,4],'threefour'),(ARRAY[1,2],'onetwo');
~~~

~~~ sql
> SELECT * FROM t;
~~~

~~~
    a   |     b
--------+------------
  {3,4} | threefour
  {1,2} | onetwo
(2 rows)
~~~

~~~ sql
> SELECT * FROM t ORDER BY a;
~~~

~~~
    a   |     b
--------+------------
  {1,2} | onetwo
  {3,4} | threefour
(2 rows)
~~~

## Supported casting and conversion

[Casting]({{ page.version.version }}/data-types.md#data-type-conversions-and-casts) between `ARRAY` values is supported when the data types of the arrays support casting. For example, it is possible to cast from a `BOOL` array to an `INT` array but not from a `BOOL` array to a `TIMESTAMP` array:

~~~ sql
> SELECT ARRAY[true,false,true]::INT[];
~~~

~~~
   array
-----------
  {1,0,1}
(1 row)
~~~

~~~ sql
> SELECT ARRAY[true,false,true]::TIMESTAMP[];
~~~

~~~
pq: invalid cast: bool[] -> TIMESTAMP[]
~~~

You can cast an array to a `STRING` value, for compatibility with PostgreSQL:

~~~ sql
> SELECT ARRAY[1,NULL,3]::string;
~~~

~~~
    array
--------------
  {1,NULL,3}
(1 row)
~~~

~~~ sql
> SELECT ARRAY[(1,'a b'),(2,'c"d')]::string;
~~~

~~~
               array
------------------------------------
  {"(1,\"a b\")","(2,\"c\"\"d\")"}
(1 row)
~~~

### Implicit casting

CockroachDB supports implicit casting from string literals to arrays of all data types except the following:

- [`BYTES`]({{ page.version.version }}/bytes.md)
- [`ENUM`]({{ page.version.version }}/enum.md)
- [`JSONB`]({{ page.version.version }}/jsonb.md)
- [`SERIAL`]({{ page.version.version }}/serial.md)
- `Box2D` [(spatial type)]({{ page.version.version }}/architecture/glossary.md#data-types)
- `GEOGRAPHY` [(spatial type)]({{ page.version.version }}/architecture/glossary.md#data-types)
- `GEOMETRY` [(spatial type)]({{ page.version.version }}/architecture/glossary.md#data-types)

For example, if you create a table with a column of type `INT[]`:

~~~ sql
> CREATE TABLE x (a UUID DEFAULT gen_random_uuid() PRIMARY KEY, b INT[]);
~~~

And then insert a string containing a comma-delimited set of integers contained in brackets:

~~~ sql
> INSERT INTO x(b) VALUES ('{1,2,3}'), (ARRAY[4,5,6]);
~~~

CockroachDB implicitly casts the string literal as an `INT[]`:

~~~ sql
> SELECT * FROM x;
~~~

~~~
                   a                   |    b
---------------------------------------+----------
  2ec0ed91-8a82-4f2e-888e-ae86ece4fc60 | {4,5,6}
  a521d6e9-3a2a-490d-968c-1365cace038a | {1,2,3}
(2 rows)
~~~

## See also

- [Data Types]({{ page.version.version }}/data-types.md)
- [GIN Indexes]({{ page.version.version }}/inverted-indexes.md)