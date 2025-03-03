---
title: Computed Columns
summary: A computed column exposes data generated by an expression included in the column definition.
toc: true
docs_area: develop
---

A _computed column_ exposes data generated from other columns by a [scalar expression]({% link {{ page.version.version }}/scalar-expressions.md %}) included in the column definition.

<a name="stored-computed-columns"></a>

A _stored computed column_ (set with the `STORED` SQL keyword) is calculated when a row is inserted or updated, and stores the resulting value of the scalar expression in the primary index similar to a non-computed column.

<a name="virtual-computed-columns"></a>

A _virtual computed column_ (set with the `VIRTUAL` SQL keyword) is not stored, and the value of the scalar expression is computed at query-time as needed.

## Why use computed columns?

Computed columns are especially useful when used with [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) columns or [secondary indexes]({% link {{ page.version.version }}/indexes.md %}).

- **JSONB** columns are used for storing semi-structured `JSONB` data. When the table's primary information is stored in `JSONB`, it's useful to index a particular field of the `JSONB` document. In particular, computed columns allow for the following use case: a two-column table with a `PRIMARY KEY` column and a `payload` JSONB column, whose primary key is computed from a field of the `payload` column. This alleviates the need to manually separate your primary keys from your JSON blobs. For more information, see [Create a table with a `JSONB` column and a stored computed column](#create-a-table-with-a-jsonb-column-and-a-stored-computed-column).

- **Secondary indexes** can be created on computed columns, which is especially useful when a table is frequently sorted. See [Create a table with a secondary index on a computed column](#create-a-table-with-a-secondary-index-on-a-computed-column).

## Considerations

Computed columns:

- Cannot be used to generate other computed columns.
- Behave like any other column, with the exception that they cannot be written to directly.
- Are mutually exclusive with [`DEFAULT`]({% link {{ page.version.version }}/default-value.md %}) and [`ON UPDATE`]({% link {{ page.version.version }}/create-table.md %}#on-update-expressions) expressions.
- Can be used in [`FOREIGN KEY`]({% link {{ page.version.version }}/foreign-key.md %}) constraints, but are restricted to the following subset of supported options. This restriction is necessary because we cannot allow the computed column value to change.
  - `ON UPDATE (NO ACTION|RESTRICT)`
  - `ON DELETE (NO ACTION|RESTRICT|CASCADE)`

Virtual computed columns:

- Are not stored in the table's primary index.
- Are recomputed as the column data in the expression changes.
- Cannot be used as part of a `FAMILY` definition, in `CHECK` constraints, or in `FOREIGN KEY` constraints.
- Cannot be a [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) reference.
- Cannot be stored in indexes.
- Can be index columns.

Once a computed column is created, you cannot directly alter the formula. To make modifications to a computed column's formula, see [Alter the formula for a computed column](#alter-the-formula-for-a-computed-column).

## Define a computed column

To define a stored computed column, use the following syntax:

~~~
column_name <type> AS (<expr>) STORED
~~~

To define a virtual computed column, use the following syntax:

~~~
column_name <type> AS (<expr>) VIRTUAL
~~~

Parameter | Description
----------|------------
`column_name` | The [name]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers) of the computed column.
`<type>` | The [data type]({% link {{ page.version.version }}/data-types.md %}) of the computed column.
`<expr>` | The [immutable]({% link {{ page.version.version }}/functions-and-operators.md %}#function-volatility) [scalar expression]({% link {{ page.version.version }}/scalar-expressions.md %}) used to compute column values. You cannot use functions such as `now()` or `nextval()` that are not immutable.
`STORED` | _(Required for stored computed columns)_ The computed column is stored alongside other columns.
`VIRTUAL`| _(Required for virtual columns)_ The computed column is virtual, meaning the column data is not stored in the table's primary index.

For compatibility with PostgreSQL, CockroachDB also supports creating stored computed columns with the syntax `column_name <type> GENERATED ALWAYS AS (<expr>) STORED`.

## Examples

### Create a table with a stored computed column

{% include {{ page.version.version }}/computed-columns/simple.md %}

### Create a table with a `JSONB` column and a stored computed column

{% include {{ page.version.version }}/computed-columns/jsonb.md %}

### Create a virtual computed column using `JSONB` data

{% include {{ page.version.version }}/computed-columns/virtual.md %}

### Create a table with a secondary index on a computed column

{% include {{ page.version.version }}/computed-columns/secondary-index.md %}

### Add a computed column to an existing table

{% include {{ page.version.version }}/computed-columns/add-computed-column.md %}

For more information, see [`ADD COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#add-column).

### Convert a computed column into a regular column

{% include {{ page.version.version }}/computed-columns/convert-computed-column.md %}

### Alter the formula for a computed column

{% include {{ page.version.version }}/computed-columns/alter-computed-column.md %}

## See also

- [Scalar Expressions]({% link {{ page.version.version }}/scalar-expressions.md %})
- [Information Schema]({% link {{ page.version.version }}/information-schema.md %})
- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`JSONB`]({% link {{ page.version.version }}/jsonb.md %})
