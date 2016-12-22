---
title: ADD CONSTRAINT
summary: Use the ADD CONSTRAINT statement to add constraints to columns.
toc: false
---

The `ADD CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and can add the following [constraints](constraints.html) to columns:

- [Check](check.html)
- [Foreign Keys](foreign-key.html)
- [Unique](unique.html)

{{site.data.alerts.callout_info}}
The <a href="default-value.html">Default</a> constraint is managed through <a href="alter-column.html"><code>ALTER COLUMN</code></a>.<br/><br/>
The <a href="primary-key.html">Primary Key</a> constraint can only be applied through <a href="create-table.html"><code>CREATE TABLE</code></a>.
{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/add_constraint.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table. 

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table containing the column you want to constrain. |
| `name` | The name of the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |
| `constraint_elem` | The [Check](check.html), [Foreign Keys](foreign-key.html), [Unique](unique.html) constraint you want to add. <br/><br/>Adding/changing a Default constraint is done through `ALTER COLUMN`. <br/><br/>Adding/changing the table's Primary Key is not supported through `ALTER TABLE`; it can only be specified during [table creation](create-table.html#create-a-table-primary-key-defined). |

## Examples

### Add the Unique Constraint

``` sql
> ALTER TABLE orders ADD CONSTRAINT id_customer_unique UNIQUE (id, customer);
```

### Add the Check Constraint

``` sql
> ALTER TABLE orders ADD CONSTRAINT total_0_check CHECK (total > 0);
```

### Add the Foreign Key Constraint

``` sql
> ALTER TABLE orders ADD CONSTRAINT customer_fk FOREIGN KEY (customer) REFERENCEs customers (id);
```

## See Also

- [Constraints](constraints.html)
- [`ALTER COLUMN`](alter-column.html)
- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
