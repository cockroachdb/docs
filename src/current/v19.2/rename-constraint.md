---
title: RENAME CONSTRAINT
summary: The RENAME CONSTRAINT statement changes the name of a constraint on a column.
toc: true
---

The `RENAME CONSTRAINT` [statement](sql-statements.html) changes the name of a constraint on a column.

{{site.data.alerts.callout_info}}
It is not possible to rename a constraint for a column referenced by a view. For more details, see [View Dependencies](views.html#view-dependencies).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/rename_constraint.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS` | Rename the constraint only if a constraint of `current_name` exists; if one does not exist, do not return an error.
 `table_name` | The name of the table with the constraint you want to rename.
 `current_name` | The current name of the constraint.
 `name` | The new [`name`](sql-grammar.html#name) you want to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Example

### Rename a constraint

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE logon (
    login_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    sales_id INT,
    UNIQUE (customer_id, sales_id)
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM logon;
~~~

~~~
  table_name |        constraint_name         | constraint_type |                details                 | validated
+------------+--------------------------------+-----------------+----------------------------------------+-----------+
  logon      | logon_customer_id_sales_id_key | UNIQUE          | UNIQUE (customer_id ASC, sales_id ASC) |   true
  logon      | primary                        | PRIMARY KEY     | PRIMARY KEY (login_id ASC)             |   true
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE logon RENAME CONSTRAINT logon_customer_id_sales_id_key TO unique_customer_id_sales_id;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM logon;
~~~

~~~
  table_name |       constraint_name       | constraint_type |                details                 | validated
+------------+-----------------------------+-----------------+----------------------------------------+-----------+
  logon      | primary                     | PRIMARY KEY     | PRIMARY KEY (login_id ASC)             |   true
  logon      | unique_customer_id_sales_id | UNIQUE          | UNIQUE (customer_id ASC, sales_id ASC) |   true
(2 rows)
~~~

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`VALIDATE CONSTRAINT`](validate-constraint.html)
- [`RENAME DATABASE`](rename-database.html)
- [`RENAME TABLE`](rename-table.html)
- [`RENAME COLUMN`](rename-column.html)
