---
title: VECTOR
summary: The VECTOR data type stores fixed-length arrays of floating-point numbers, which represent data points in multi-dimensional space.
toc: true
docs_area: reference.sql
---

The `VECTOR` data type stores fixed-length arrays of floating-point numbers, which represent data points in multi-dimensional space. Vector search is often used in AI applications such as Large Language Models (LLMs) that rely on vector representations. 

For details on valid `VECTOR` comparison operators, refer to [Syntax](#syntax). For the list of supported `VECTOR` functions, refer to [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %}#pgvector-functions).

{{site.data.alerts.callout_info}}
`VECTOR` functionality is compatible with the [`pgvector`](https://github.com/pgvector/pgvector) extension for PostgreSQL.
{{site.data.alerts.end}}

## Syntax

A `VECTOR` value is expressed as an [array]({% link {{ page.version.version }}/array.md %}) of [floating-point numbers]({% link {{ page.version.version }}/float.md %}). The array size corresponds to the number of `VECTOR` dimensions. For example, the following `VECTOR` has 3 dimensions:

~~~
[1.0, 0.0, 0.0]
~~~

You can specify the dimensions when defining a `VECTOR` column. This will enforce the number of dimensions in the column values. For example:

~~~ sql
ALTER TABLE foo ADD COLUMN bar VECTOR(3);
~~~

The following `VECTOR` comparison operators are valid:

- `=` (equals). Compare vectors for equality in filtering and conditional queries.
- `<>` (not equal to). Compare vectors for inequality in filtering and conditional queries.
- `<->` (L2 distance). Calculate the Euclidean distance between two vectors, as used in [nearest neighbor search](https://en.wikipedia.org/wiki/Nearest_neighbor_search) and clustering algorithms.
- `<#>` (negative inner product). Calculate the [inner product](https://en.wikipedia.org/wiki/Inner_product_space) of two vectors, as used in similarity searches where the inner product can represent the similarity score.
- `<=>` (cosine distance). Calculate the [cosine distance](https://en.wikipedia.org/wiki/Cosine_similarity) between vectors, such as in text and image similarity measures where the orientation of vectors is more important than their magnitude.

## Size

The size of a `VECTOR` value is variable, but it's recommended to keep values under 1 MB to ensure performance. Above that threshold, [write amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#write-amplification) and other considerations may cause significant performance degradation.  

## Functions

For the list of supported `VECTOR` functions, refer to [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %}#pgvector-functions).

## Example

Create a table with a `VECTOR` column, specifying `3` dimensions:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE items (
    category STRING,
    vector VECTOR(3),
    INDEX (category)
);
~~~

Insert some sample data into the table:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO items (category, vector) VALUES
	('electronics', '[1.0, 0.0, 0.0]'),
	('electronics', '[0.9, 0.1, 0.0]'),
	('furniture', '[0.0, 1.0, 0.0]'),
	('furniture', '[0.0, 0.9, 0.1]'),
	('clothing', '[0.0, 0.0, 1.0]');
~~~

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/sql/vector-batch-inserts.md %}
{{site.data.alerts.end}}

Use the [`<->` operator](#syntax) to sort values with the `electronics` category by their similarity to `[1.0, 0.0, 0.0]`, based on geographic distance.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT category, vector FROM items WHERE category = 'electronics' ORDER BY vector <-> '[1.0, 0.0, 0.0]' LIMIT 5;
~~~

~~~
   category   |   vector
--------------+--------------
  electronics | [1,0,0]
  electronics | [0.9,0.1,0]
~~~

You can use a [vector index]({% link {{ page.version.version }}/vector-indexes.md %}) to make searches on large numbers of high-dimensional `VECTOR` rows more efficient.

## See also

- [Vector Indexes]({% link {{ page.version.version }}/vector-indexes.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %}#pgvector-functions)
- [Data Types]({% link {{ page.version.version }}/data-types.md %})
