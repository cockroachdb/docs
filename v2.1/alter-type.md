---
title: ALTER TYPE
summary: Use the ALTER TYPE statement to change a column's data type.
toc: true
---

The `ALTER TYPE` [statement](sql-statements.html) is part of [`ALTER TABLE`](alter-table.html) and changes a column's [data type](data-types.html).

## Considerations

You can use the `ALTER TYPE` subcommand if the following conditions are met:

- On-disk representation of the column remains unchanged (e.g., you can't change the column data type from `STRING` to an `INT`, even if the string is just a number).
- The existing data remains valid (e.g., you can change the column data type from `STRING[10]` to `STRING[20]`, but not to `STRING [5]` since that will invalidate the existing data).

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/alter_type.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table with the column whose data type you want to change. |
| `column_name` | The name of the column whose data type you want to change. |
| `typename` | The new [data type](data-types.html) you want to use. |

## Examples

The [TPC-C](performance-benchmarking-with-tpc-c.html) database has a `customer` table with a column `c_credit_lim DECIMAL (10,2)`. Suppose we want to change the data type to `DECIMAL (12,2)`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_credit_lim type DECIMAL (12,2);
~~~

~~~
ALTER TABLE

Time: 80.814044ms
~~~

### Error scenarios

Attempting to change the column data type from `DECIMAL` to `INT` will change the on-disk representation of the column, and hence will result in an error:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_credit_lim type INT;
~~~

~~~
pq: type conversion not yet implemented
~~~

Attempting to change the column data type from `DECIMAL (12,2)` to `DECIMAL (8,2)` will invalidate the existing data, and hence will result in an error:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_credit_lim type DECIMAL (8,2);
~~~

~~~
pq: type conversion not yet implemented
~~~

## See also

- [`ALTER TABLE`](alter-table.html)
