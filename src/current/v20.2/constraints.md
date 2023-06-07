---
title: Constraints
summary: Constraints offer additional data integrity by enforcing conditions on the data within a column.
toc: true
---

Constraints offer additional data integrity by enforcing conditions on the data within a column. Whenever values are manipulated (inserted, deleted, or updated), constraints are checked and modifications that violate constraints are rejected.

For example, the `UNIQUE` constraint requires that all values in a column be unique from one another (except *NULL* values). If you attempt to write a duplicate value, the constraint rejects the entire statement.


## Supported constraints

 Constraint | Description
------------|-------------
 [`CHECK`](check.html) | Values must return `TRUE` or `NULL` for a Boolean expression.
 [`DEFAULT` value](default-value.html) | If a value is not defined for the constrained column in an `INSERT` statement, the `DEFAULT` value is written to the column.
 [`FOREIGN KEY`](foreign-key.html) | Values must exactly match existing values from the column it references.
 [`NOT NULL`](not-null.html) | Values may not be *NULL*.
 [`PRIMARY KEY`](primary-key.html) | Values must uniquely identify each row *(one per table)*. This behaves as if the `NOT NULL` and `UNIQUE` constraints are applied, as well as automatically creates an [index](indexes.html) for the table using the constrained columns.
 [`UNIQUE`](unique.html) | Each non-*NULL* value must be unique. This also automatically creates an [index](indexes.html) for the table using the constrained columns.

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
    > CREATE TABLE bar (a INT, b INT, PRIMARY KEY (a,b));
    ~~~

  {{site.data.alerts.callout_info}}
  The `DEFAULT` and `NOT NULL` constraints cannot be applied to multiple columns.
  {{site.data.alerts.end}}

- **Existing tables** can have the following constraints added:
  - `CHECK`, `FOREIGN KEY`, and `UNIQUE` constraints can be added through [`ALTER TABLE...ADD CONSTRAINT`](add-constraint.html). For example, this statement adds the `UNIQUE` constraint to `baz.id`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE baz ADD CONSTRAINT id_unique UNIQUE (id);
    ~~~

  - `DEFAULT` values and `NOT NULL` constraints can be added through [`ALTER TABLE...ALTER COLUMN`](alter-column.html#set-or-change-a-default-value). For example, this statement adds the Default Value constraint to `baz.bool`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE baz ALTER COLUMN bool SET DEFAULT true;
    ~~~

  -  [`PRIMARY KEY`](primary-key.html) constraints can be added with [`ADD CONSTRAINT`](add-constraint.html)/[`ADD PRIMARY KEY`](alter-table.html) in the following circumstances:

      - A [`DROP CONSTRAINT`](drop-constraint.html) statement precedes the `ADD CONSTRAINT`/`ADD PRIMARY KEY` statement in the same transaction. For examples, see the [`ADD CONSTRAINT`](add-constraint.html#examples) and [`DROP CONSTRAINT`](drop-constraint.html#examples) pages.
      - The current [primary key is on `rowid`](indexes.html#creation), the default primary key created if none is explicitly defined at table creation.
      - The `ADD CONSTRAINT`/`ADD PRIMARY KEY` is in the same transaction as a `CREATE TABLE` statement with no primary key defined.

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
> CREATE TABLE bar (a INT, b INT, CONSTRAINT yet_another_name PRIMARY KEY (a,b));
~~~

### View constraints

To view a table's constraints, use [`SHOW CONSTRAINTS`](show-constraints.html) or [`SHOW CREATE`](show-create.html).

### Remove constraints

The procedure for removing a constraint depends on its type:

Constraint Type | Procedure
-----------------|-----------
[`CHECK`](check.html) | Use [`DROP CONSTRAINT`](drop-constraint.html).
[`DEFAULT` value](default-value.html) | Use [`ALTER COLUMN`](alter-column.html#remove-default-constraint).
[`FOREIGN KEY`](foreign-key.html) | Use [`DROP CONSTRAINT`](drop-constraint.html).
[`NOT NULL`](not-null.html) | Use [`ALTER COLUMN`](alter-column.html#remove-not-null-constraint).
[`PRIMARY KEY`](primary-key.html) |   Primary key constraints can be dropped with [`DROP CONSTRAINT`](drop-constraint.html) if an [`ADD CONSTRAINT`](add-constraint.html) statement follows the `DROP CONSTRAINT` statement in the same transaction.
[`UNIQUE`](unique.html) | The `UNIQUE` constraint cannot be dropped directly.  To remove the constraint, [drop the index](drop-index.html) that was created by the constraint, e.g., `DROP INDEX my_unique_constraint`.

### Change constraints

The procedure for changing a constraint depends on its type:

Constraint Type | Procedure
-----------------|-----------
[`CHECK`](check.html) | [Issue a transaction](transactions.html#syntax) that adds a new `CHECK` constraint ([`ADD CONSTRAINT`](add-constraint.html)), and then remove the existing one ([`DROP CONSTRAINT`](drop-constraint.html)).
[`DEFAULT` value](default-value.html) | The `DEFAULT` value can be changed through [`ALTER COLUMN`](alter-column.html).
[`FOREIGN KEY`](foreign-key.html) | [Issue a transaction](transactions.html#syntax) that adds a new `FOREIGN KEY` constraint ([`ADD CONSTRAINT`](add-constraint.html)), and then remove the existing one ([`DROP CONSTRAINT`](drop-constraint.html)).
[`NOT NULL`](not-null.html) | The `NOT NULL` constraint cannot be changed, only added and removed with [`ALTER COLUMN`](alter-column.html).
[`PRIMARY KEY`](primary-key.html) |   To change a primary key, use an [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html) statement.<br><br>When you change a primary key with [`ALTER PRIMARY KEY`](alter-primary-key.html), the old primary key index becomes a secondary index. If you do not want the old primary key to become a secondary index, use [`DROP CONSTRAINT`](drop-constraint.html)/[`ADD CONSTRAINT`](add-constraint.html) to change the primary key.
[`UNIQUE`](unique.html) | [Issue a transaction](transactions.html#syntax) that adds a new `UNIQUE` constraint ([`ADD CONSTRAINT`](add-constraint.html)), and then remove the existing one ([`DROP CONSTRAINT`](drop-constraint.html)).


## See also

- [`CREATE TABLE`](create-table.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`ALTER PRIMARY KEY`](alter-primary-key.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER COLUMN`](alter-column.html)
