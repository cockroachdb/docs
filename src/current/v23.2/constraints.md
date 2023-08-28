---
title: Constraints
summary: Constraints offer additional data integrity by enforcing conditions on the data within a column.
toc: true
docs_area: reference.sql
---

Constraints offer additional data integrity by enforcing conditions on the data within a column. Whenever values are manipulated (inserted, deleted, or updated), constraints are checked and modifications that violate constraints are rejected.

For example, the `UNIQUE` constraint requires that all values in a column be unique from one another (except `NULL` values). If you attempt to write a duplicate value, the constraint rejects the entire statement.


## Supported constraints

 Constraint | Description
------------|-------------
 [`CHECK`]({% link {{ page.version.version }}/check.md %}) | Values must return `TRUE` or `NULL` for a Boolean expression.
 [`DEFAULT` value]({% link {{ page.version.version }}/default-value.md %}) | If a value is not defined for the constrained column in an `INSERT` statement, the `DEFAULT` value is written to the column.
 [`FOREIGN KEY`]({% link {{ page.version.version }}/foreign-key.md %}) | Values must exactly match existing values from the column it references.
 [`NOT NULL`]({% link {{ page.version.version }}/not-null.md %}) | Values may not be `NULL`.
 [`PRIMARY KEY`]({% link {{ page.version.version }}/primary-key.md %}) | Values must uniquely identify each row *(one per table)*. This behaves as if the `NOT NULL` and `UNIQUE` constraints are applied, as well as automatically creates an [index]({% link {{ page.version.version }}/indexes.md %}) for the table using the constrained columns.
 [`UNIQUE`]({% link {{ page.version.version }}/unique.md %}) | Each non-`NULL` value must be unique. This also automatically creates an [index]({% link {{ page.version.version }}/indexes.md %}) for the table using the constrained columns.

## Using constraints

### Add constraints

How you add constraints depends on the number of columns you want to constrain, as well as whether or not the table is new.

- **One column of a new table** has its constraints defined after the column's data type. For example, this statement applies the `PRIMARY KEY` constraint to `foo.a`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE foo (a INT PRIMARY KEY);
    ~~~
- **Multiple columns of a new table** have their constraints defined after the table's columns. For example, this statement applies the `PRIMARY KEY` constraint to `foo`'s columns `a` and `b`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bar (a INT, b INT, PRIMARY KEY (a,b));
    ~~~

  {{site.data.alerts.callout_info}}
  The `DEFAULT` and `NOT NULL` constraints cannot be applied to multiple columns.
  {{site.data.alerts.end}}

- **Existing tables** can have the following constraints added:
  - `CHECK`, `FOREIGN KEY`, and `UNIQUE` constraints can be added through [`ALTER TABLE...ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint). For example, this statement adds the `UNIQUE` constraint to `baz.id`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE baz ADD CONSTRAINT id_unique UNIQUE (id);
    ~~~

  - `DEFAULT` values and `NOT NULL` constraints can be added through [`ALTER TABLE...ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#set-or-change-a-default-value). For example, this statement adds the [`DEFAULT` value constraint]({% link {{ page.version.version }}/default-value.md %}) to `baz.bool`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE baz ALTER COLUMN bool SET DEFAULT true;
    ~~~

  -  [`PRIMARY KEY`]({% link {{ page.version.version }}/primary-key.md %}) constraints can be added with [`ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint)/[`ADD PRIMARY KEY`]({% link {{ page.version.version }}/alter-table.md %}) in the following circumstances:

      - A [`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint) statement precedes the `ADD CONSTRAINT`/`ADD PRIMARY KEY` statement in the same transaction. For examples, see [Add constraints]({% link {{ page.version.version }}/alter-table.md %}#add-constraints) and [Drop constraints]({% link {{ page.version.version }}/alter-table.md %}#drop-constraints).
      - The current [primary key is on `rowid`]({% link {{ page.version.version }}/indexes.md %}#creation), the default primary key created if none is explicitly defined at table creation.
      - The `ADD CONSTRAINT`/`ADD PRIMARY KEY` is in the same transaction as a `CREATE TABLE` statement with no primary key defined.

#### Order of constraints

The order in which you list constraints is not important because constraints are applied to every modification of their respective tables or columns.

#### Name constraints on new tables

You can name constraints applied to new tables using the `CONSTRAINT` clause before defining the constraint:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE foo (a INT CONSTRAINT another_name PRIMARY KEY);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE bar (a INT, b INT, CONSTRAINT yet_another_name PRIMARY KEY (a,b));
~~~

### View constraints

To view a table's constraints, use [`SHOW CONSTRAINTS`]({% link {{ page.version.version }}/show-constraints.md %}) or [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %}).

### Remove constraints

The procedure for removing a constraint depends on its type:

Constraint Type | Procedure
-----------------|-----------
[`CHECK`]({% link {{ page.version.version }}/check.md %}) | Use [`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint).
[`DEFAULT` value]({% link {{ page.version.version }}/default-value.md %}) | Use [`ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#remove-default-constraint).
[`FOREIGN KEY`]({% link {{ page.version.version }}/foreign-key.md %}) | Use [`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint).
[`NOT NULL`]({% link {{ page.version.version }}/not-null.md %}) | Use [`ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#remove-not-null-constraint).
[`PRIMARY KEY`]({% link {{ page.version.version }}/primary-key.md %}) |   Primary key constraints can be dropped with [`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint) if an [`ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint) statement follows the `DROP CONSTRAINT` statement in the same transaction.
[`UNIQUE`]({% link {{ page.version.version }}/unique.md %}) | The `UNIQUE` constraint cannot be dropped directly.  To remove the constraint, [drop the index]({% link {{ page.version.version }}/drop-index.md %}) that was created by the constraint, e.g., `DROP INDEX my_unique_constraint`.

### Change constraints

The procedure for changing a constraint depends on its type:

Constraint Type | Procedure
-----------------|-----------
[`CHECK`]({% link {{ page.version.version }}/check.md %}) | [Issue a transaction]({% link {{ page.version.version }}/transactions.md %}#syntax) that adds a new `CHECK` constraint ([`ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint)), and then remove the existing one ([`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint)).
[`DEFAULT` value]({% link {{ page.version.version }}/default-value.md %}) | The `DEFAULT` value can be changed through [`ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#alter-column).
[`FOREIGN KEY`]({% link {{ page.version.version }}/foreign-key.md %}) | [Issue a transaction]({% link {{ page.version.version }}/transactions.md %}#syntax) that adds a new `FOREIGN KEY` constraint ([`ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint)), and then remove the existing one ([`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint)).
[`NOT NULL`]({% link {{ page.version.version }}/not-null.md %}) | The `NOT NULL` constraint cannot be changed, only added and removed with [`ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#alter-column).
[`PRIMARY KEY`]({% link {{ page.version.version }}/primary-key.md %}) |   To change a primary key, use an [`ALTER TABLE ... ALTER PRIMARY KEY`]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key) statement.<br><br>When you change a primary key with [`ALTER PRIMARY KEY`]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key), the old primary key index becomes a secondary index. If you do not want the old primary key to become a secondary index, use [`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint)/[`ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint) to change the primary key.
[`UNIQUE`]({% link {{ page.version.version }}/unique.md %}) | [Issue a transaction]({% link {{ page.version.version }}/transactions.md %}#syntax) that adds a new `UNIQUE` constraint ([`ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint)), and then remove the existing one ([`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint)).


## See also

- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint)
- [`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint)
- [`SHOW CONSTRAINTS`]({% link {{ page.version.version }}/show-constraints.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})
- [`ALTER PRIMARY KEY`]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key)
- [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %})
- [`ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#alter-column)
