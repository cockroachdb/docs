---
title: VALIDATE CONSTRAINT
summary: Use the ADD COLUMN statement to add columns to tables.
toc: true
---

The `VALIDATE CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and checks whether values in a column match a [constraint](constraints.html) on the column.

This statement is especially useful after applying a constraint to an existing column via [`ADD CONSTRAINT`](add-constraint.html). In this case, `VALIDATE CONSTRAINT` can be used to find values already in the column that do not match the constraint.


## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/validate_constraint.html %}

## Parameters

| Parameter         | Description                                                                 |
|-------------------+-----------------------------------------------------------------------------|
| `table_name`      | The name of the table in which the constraint you'd like to validate lives. |
| `constraint_name` | The name of the constraint on `table_name` you'd like to validate.          |

## Examples

In [`ADD CONSTRAINT`](add-constraint.html), we [added a foreign key constraint](add-constraint.html#add-the-foreign-key-constraint) like so:

~~~ sql
ALTER TABLE orders ADD CONSTRAINT customer_fk FOREIGN KEY (customer_id) REFERENCES customers (id);
~~~

In order to ensure that the data added to the `orders` table prior to the creation of the `customer_fk` constraint conforms to that constraint, run the following:

~~~ sql
ALTER TABLE orders VALIDATE CONSTRAINT customer_fk;
~~~

{{site.data.alerts.callout_info}}If present in a <a href="create-table.html"><code>CREATE TABLE</code></a> statement, the table is considered validated because an empty table trivially meets its constraints.{{site.data.alerts.end}}

## See Also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`CREATE TABLE`](create-table.html)
