---
title: SHOW INDEX
summary: The SHOW INDEX statement returns index information for a table.
toc: true
---

The `SHOW INDEX` [statement](sql-statements.html) returns index information for a table.


## Required privileges

The user must have any [privilege](authorization.html#assign-privileges) on the target table.

## Aliases

In CockroachDB, the following are aliases for `SHOW INDEX`:

- `SHOW INDEXES`
- `SHOW KEYS`

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_index.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which you want to show indexes.

## Response

The following fields are returned for each column in each index.

Field | Description
----------|------------
`table_name` | The name of the table.
`index_name` | The name of the index.
`non_unique` | Whether or not values in the indexed column are unique. Possible values: `true` or `false`.
`seq_in_index` | The position of the column in the index, starting with 1.
`column_name` | The indexed column.
`direction` | How the column is sorted in the index. Possible values: `ASC` or `DESC` for indexed columns; `N/A` for stored columns.
`storing` | Whether or not the `STORING` clause was used to index the column during [index creation](create-index.html). Possible values: `true` or `false`.
`implicit` | Whether or not the column is part of the index despite not being explicitly included during [index creation](create-index.html). Possible values: `true` or `false`<br><br>At this time, [primary key](primary-key.html) columns are the only columns that get implicitly included in secondary indexes. The inclusion of primary key columns improves performance when retrieving columns not in the index.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE t1 (
    a INT PRIMARY KEY,
    b DECIMAL,
    c TIMESTAMP,
    d STRING
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX b_c_idx ON t1 (b, c) STORING (d);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM t1;
~~~

~~~
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| t1         | primary    |   false    |            1 | a           | ASC       |  false  |  false   |
| t1         | b_c_idx    |    true    |            1 | b           | ASC       |  false  |  false   |
| t1         | b_c_idx    |    true    |            2 | c           | ASC       |  false  |  false   |
| t1         | b_c_idx    |    true    |            3 | d           | N/A       |  true   |  false   |
| t1         | b_c_idx    |    true    |            4 | a           | ASC       |  false  |   true   |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
(5 rows)
~~~

## See also

- [`CREATE INDEX`](create-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
