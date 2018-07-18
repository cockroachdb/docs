---
title: Constraints
summary: Constraints offer additional data integrity by enforcing conditions on the data within a column.
toc: true
---

Constraints offer additional data integrity by enforcing conditions on the data within a column. Whenever values are manipulated (inserted, deleted, or updated), constraints are checked and modifications that violate constraints are rejected.

For example, the Unique constraint requires that all values in a column be unique from one another (except *NULL* values). If you attempt to write a duplicate value, the constraint rejects the entire statement.


## Supported constraints

 Constraint | Description
------------|-------------
 [Check](check.html) | Values must return `TRUE` or `NULL` for a Boolean expression.
 [Default Value](default-value.html) | If a value is not defined for the constrained column in an `INSERT` statement, the Default Value is written to the column.
 [Foreign Keys](foreign-key.html) | Values must exactly match existing values from the column it references.
 [Not Null](not-null.html) | Values may not be *NULL*.
 [Primary Key](primary-key.html) | Values must uniquely identify each row *(one per table)*. This behaves as if the Not Null and Unique constraints are applied, as well as automatically creates an [index](indexes.html) for the table using the constrained columns.
 [Unique](unique.html) | Each non-*NULL* value must be unique. This also automatically creates an [index](indexes.html) for the table using the constrained columns.

## Using constraints

### Add constraints

How you add constraints depends on the number of columns you want to constrain, as well as whether or not the table is new.

- **One column of a new table** has its constraints defined after the column's data type. For example, this statement applies the `PRIMARY KEY` constraint to `foo.a`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE foo (a INT PRIMARY KEY);
    ~~~
- **Multiple columns of a new table** have their constraints defined after the table's columns. For example, this statement applies the `PRIMARY KEY` constraint to `foo`'s columns `a` and `b`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bar (a INT, b INT, PRIMARY KEY (a, b));
    ~~~

  {{site.data.alerts.callout_info}}
  The `DEFAULT` and `NOT NULL` constraints cannot be applied to multiple columns.
  {{site.data.alerts.end}}

- **Existing tables** can have the following constraints added:
  - **Check**, **Foreign Key**, and **Unique** constraints can be added through [`ALTER TABLE...ADD CONSTRAINT`](add-constraint.html). For example, this statement adds the Unique constraint to `baz.id`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE baz ADD CONSTRAINT id_unique UNIQUE (id);
    ~~~

  - **Default Values** can be added through [`ALTER TABLE...ALTER COLUMN`](alter-column.html#set-or-change-a-default-value). For example, this statement adds the Default Value constraint to `baz.bool`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE baz ALTER COLUMN bool SET DEFAULT true;
    ~~~

  - **Primary Key** and **Not Null** constraints cannot be added or changed. However, you can go through [this process](#table-migrations-to-add-or-change-immutable-constraints) to migrate data from your current table to a new table with the constraints you want to apply.

#### Order of constraints

The order in which you list constraints is not important because constraints are applied to every modification of their respective tables or columns.

#### Name constraints on new tables

You can name constraints applied to new tables using the `CONSTRAINT` clause before defining the constraint:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE foo (a INT CONSTRAINT another_name PRIMARY KEY);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE bar (a INT, b INT, CONSTRAINT yet_another_name PRIMARY KEY (a, b));
~~~

### View constraints

To view a table's constraints, use [`SHOW CONSTRAINTS`](show-constraints.html) or [`SHOW CREATE`](show-create.html).

### Remove constraints

The procedure for removing a constraint depends on its type:

| Constraint Type | Procedure |
|-----------------|-----------|
| [Check](check.html) | Use [`DROP CONSTRAINT`](drop-constraint.html) |
| [Default Value](default-value.html) | Use [`ALTER COLUMN`](alter-column.html#remove-default-constraint) |
| [Foreign Keys](foreign-key.html) | Use [`DROP CONSTRAINT`](drop-constraint.html) |
| [Not Null](not-null.html) | Use [`ALTER COLUMN`](alter-column.html#remove-not-null-constraint) |
| [Primary Key](primary-key.html) | Primary Keys cannot be removed.  However, you can move the table's data to a new table with [this process](#table-migrations-to-add-or-change-immutable-constraints). |
| [Unique](unique.html) | The Unique constraint cannot be dropped directly. However, you can use [`DROP INDEX`](drop-index.html) to remove the index automatically created by the Unique constraint (whose name ends in `_key`) to remove the constraint. |

### Change constraints

The procedure for changing a constraint depends on its type:

| Constraint Type | Procedure |
|-----------------|-----------|
| [Check](check.html) | [Issue a transaction](transactions.html#syntax) that adds a new `CHECK` constraint ([`ADD CONSTRAINT`](add-constraint.html)), and then remove the existing one ([`DROP CONSTRAINT`](drop-constraint.html)). |
| [Default Value](default-value.html) | The Default Value can be changed through [`ALTER COLUMN`](alter-column.html). |
| [Foreign Keys](foreign-key.html) | [Issue a transaction](transactions.html#syntax) that adds a new Foreign Key constraint ([`ADD CONSTRAINT`](add-constraint.html)), and then remove the existing one ([`DROP CONSTRAINT`](drop-constraint.html)). |
| [Not Null](not-null.html) | The Not Null constraint cannot be changed, only removed. However, you can move the table's data to a new table with [this process](#table-migrations-to-add-or-change-immutable-constraints). |
| [Primary Key](primary-key.html) | Primary Keys cannot be modified.  However, you can move the table's data to a new table with [this process](#table-migrations-to-add-or-change-immutable-constraints). |
| [Unique](unique.html) | [Issue a transaction](transactions.html#syntax) that adds a new Unique constraint ([`ADD CONSTRAINT`](add-constraint.html)), and then remove the existing one ([`DROP CONSTRAINT`](drop-constraint.html)). |

#### Table migrations to add or change immutable constraints

If you want to make a change to an immutable constraint, you can use the following process:

1. [Create a new table](create-table.html) with the constraints you want to apply.
2. Move the data from the old table to the new one using [`INSERT` from a `SELECT` statement](insert.html#insert-from-a-select-statement).
3. [Drop the old table](drop-table.html), and then [rename the new table to the old name](rename-table.html). This cannot be done transactionally.

## See also

- [`CREATE TABLE`](create-table.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
