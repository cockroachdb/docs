---
title: DROP COLUMN
summary: Use the ALTER COLUMN statement to remove columns from tables.
toc: true
---

The `DROP COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and removes columns from a table.


## Synopsis

<section> {% include {{ page.version.version }}/sql/diagrams/drop_column.html %} </section>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table with the column you want to drop.
 `name` | The name of the column you want to drop.<br><br>When a column with a `CHECK` constraint is dropped, the `CHECK` constraint is also dropped.
 `CASCADE` | Drop the column even if objects (such as [views](views.html)) depend on it; drop the dependent objects, as well.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously. However, `CASCADE` will not drop dependent indexes; you must use [`DROP INDEX`](drop-index.html).<br><br>`CASCADE` will drop a column with a foreign key constraint if it is the only column in the reference.
 `RESTRICT` | *(Default)* Do not drop the column if any objects (such as [views](views.html)) depend on it.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Drop columns

If you no longer want a column in a table, you can drop it.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders DROP COLUMN billing_zip;
~~~

### Prevent dropping columns with dependent objects (`RESTRICT`)

If the column has dependent objects, such as [views](views.html), CockroachDB will not drop the column by default; however, if you want to be sure of the behavior you can include the `RESTRICT` clause.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders DROP COLUMN customer RESTRICT;
~~~
~~~
pq: cannot drop column "customer" because view "customer_view" depends on it
~~~

### Drop column and dependent objects (`CASCADE`)

If you want to drop the column and all of its dependent options, include the `CASCADE` clause.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> does not list objects it drops, so should be used cautiously.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE customer_view;
~~~

~~~
+---------------+----------------------------------------------------------------+
| table_name    | create_statement                                               |
+---------------+----------------------------------------------------------------+
| customer_view | CREATE VIEW customer_view AS SELECT customer FROM store.orders |
+---------------+----------------------------------------------------------------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders DROP COLUMN customer CASCADE;
~~~

{% include_cached copy-clipboard.html %}
~~~
> SHOW CREATE customer_view;
~~~

~~~
pq: view "customer_view" does not exist
~~~

## See also

- [`DROP CONSTRAINT`](drop-constraint.html)
- [`DROP INDEX`](drop-index.html)
- [`ALTER TABLE`](alter-table.html)
