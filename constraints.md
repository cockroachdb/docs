---
title: Constraints
summary: Constraints offer additional data integrity by enforcing conditions on the data within a column or row. They are checked during DML operations and restrict the data values within a column to those specified within the constraint.
toc: false
---

Constraints offer additional data integrity by enforcing conditions on the data within a column or row. They are checked during DML operations and restrict the data values within a column to those specified within the constraint.

If a constraint refers to only one column (column-level constraint), it can be defined against the column as part of its definition. If a constraint refers to more than one column (table-level constraint), it needs to be defined as a separate entry in the tables definition.

The order of the constraints within the table definition is not important and does not determine the order in which the constraints are checked. Use the [`SHOW CONSTRAINTS`](show-constraints.html) or [`SHOW CREATE TABLE`](show-create-table.html) statement to show the constraints defined on a table.

The different types of constraints are:

| Constraint Type | Description |
|-----------------|-------------|
| [Check](check.html) |  Specifies that the column value must satisfy a Boolean expression. |
| [Default Value](default-value.html) | Specifies a value to populate a column with if none is provided.|
| [Foreign Keys](foreign-key.html) | Specifies a column can only contain values exactly matching existing values from the column it references. |
| [Not Null](not-null.html) | Specifies the column **may not** contain *NULL* values.|
| [Primary Key](primary-key.html) | Specifies that the columns values are unique and that the columns **may not** contain *NULL* values. |
| [Unique](unique.html) | Specifies that the columns values are unique and that the columns **may** contain *NULL* values. |

## See Also
- [`ALTER TABLE`](alter-table.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`CREATE TABLE`](create-table.html)
