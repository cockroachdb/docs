---
title: ARRAYS
summary: The ARRAYS data type stores 
toc: false
---

The `ARRAY` data type stores one-dimensional, 1-indexed, homogenous arrays of any non-array [data type](data-types.html).

<div id="toc"></div>

{{site.data.alerts.callout_info}} CockroachDB does not support nested arrays, creating database indexes on arrays, and ordering by arrays.{{site.data.alerts.end}}

## Syntax

A value of data type `ARRAY` can be expressed in the following ways:


- Appending square brackets (`[]`) to any non-array [data type](data-types.html).
- Adding the term `ARRAY` to any non-array [data type](data-types.html).

## Size

The size of a `ARRAY` value is variable, but it's recommended to keep values under 1 MB to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.  

## Examples

### Creating an array column by appending square brackets 

~~~ sql
> CREATE TABLE a (b STRING[]);

> INSERT INTO a VALUES (ARRAY['sky', 'road', 'car']);

> SELECT * FROM a;
~~~
~~~
+----------------------+
|          b           |
+----------------------+
| {"sky","road","car"} |
+----------------------+
(1 row)
~~~

### Creating an array column by adding the term `ARRAY`

~~~ sql
> CREATE TABLE c (d INT ARRAY);

> INSERT INTO c VALUES (ARRAY[10,20,30]);

> SELECT * FROM c;
~~~
~~~
+------------+
|     d      |
+------------+
| {10,20,30} |
+------------+
(1 row)
~~~

## See Also

[Data Types](data-types.html)
