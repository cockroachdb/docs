---
title: ALTER COLUMN
summary: Use the ALTER COLUMN statement to set, change, or drop a column's DEFAULT constraint or to drop the NOT NULL constraint.
toc: true
---

The `ALTER COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and can be used to:

- Set, change, or drop a column's [`DEFAULT` constraint](default-value.html)
- Set or drop a column's [`NOT NULL` constraint](not-null.html)
- Increase the precision of the column's [data type](data-types.html)

{{site.data.alerts.callout_info}}
To manage other constraints, see [`ADD CONSTRAINT`](add-constraint.html) and [`DROP CONSTRAINT`](drop-constraint.html).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/alter_column.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table with the column you want to modify. |
| `column_name` | The name of the column you want to modify. |
| `SET DEFAULT a_expr` | The new [Default Value](default-value.html) you want to use. |
| `typename` | The new, altered type you want to use.<br>In CockroachDB versions < v20.2, support for altering column types is limited to increasing the precision of the current column type. For details, see [Altering column types](#altering-column-types).|

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Altering column types

In CockroachDB versions < v20.2, support for altering column types is limited to increasing the precision of the current type of a column. You cannot convert the column type to another data type, or decrease the precision of the column type. Changing the column type from its current type to the same type and precision will result in a no-op, with no error.

You can use `ALTER COLUMN TYPE` if the following conditions are met:

- The on-disk representation of the column remains unchanged. For example, you cannot change the column data type from `STRING` to an `INT`.
- The existing data remains valid. For example, you can change the column data type from `STRING[10]` to `STRING[20]`, but not to `STRING [5]` since that will invalidate the existing data.

The following are equivalent in CockroachDB:

- `ALTER TABLE ... ALTER ... TYPE`
- `ALTER TABLE ... ALTER COLUMN TYPE`
- `ALTER TABLE ... ALTER COLUMN SET DATA TYPE`

For an example of `ALTER COLUMN TYPE`, see [Increase a column type's precision](#increase-a-column-types-precision).

## Examples

### Set or change a `DEFAULT` value

Setting the [`DEFAULT` value constraint](default-value.html) inserts the value when data's written to the table without explicitly defining the value for the column. If the column already has a `DEFAULT` value set, you can use this statement to change it.

The below example inserts the Boolean value `true` whenever you inserted data to the `subscriptions` table without defining a value for the `newsletter` column.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter SET DEFAULT true;
~~~

### Remove `DEFAULT` constraint

If the column has a defined [`DEFAULT` value](default-value.html), you can remove the constraint, which means the column will no longer insert a value by default if one is not explicitly defined for the column.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP DEFAULT;
~~~

### Set `NOT NULL` constraint

Setting the  [`NOT NULL` constraint](not-null.html) specifies that the column cannot contain `NULL` values.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter SET NOT NULL;
~~~

### Remove `NOT NULL` constraint

If the column has the [`NOT NULL` constraint](not-null.html) applied to it, you can remove the constraint, which means the column becomes optional and can have *NULL* values written into it.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP NOT NULL;
~~~

### Convert a computed column into a regular column

{% include {{ page.version.version }}/computed-columns/convert-computed-column.md %}

### Increase a column type's precision

The [TPC-C](performance-benchmarking-with-tpc-c-1k-warehouses.html) database contains a `customer` table with a column `c_credit_lim` of type [`DECIMAL(10,2)`](decimal.html). Suppose you want to increase the precision of the column's data type to `DECIMAL (12,2)`:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE customer ALTER c_credit_lim type DECIMAL (12,2);
~~~

~~~
ALTER TABLE

Time: 80.814044ms
~~~

## See also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW JOBS`](show-jobs.html)
