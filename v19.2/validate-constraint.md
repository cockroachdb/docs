---
title: VALIDATE CONSTRAINT
summary: Use the ADD COLUMN statement to add columns to tables.
toc: true
---

The `VALIDATE CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and checks whether values in a column match a [constraint](constraints.html) on the column. This statement is especially useful after applying a constraint to an existing column via [`ADD CONSTRAINT`](add-constraint.html). In this case, `VALIDATE CONSTRAINT` can be used to find values already in the column that do not match the constraint.

<span class="version-tag">New in v19.2:</span> Applying a foreign key constraint via `ADD CONSTRANT` now validates existing rows in addition to enforcing conformance for new rows. As such, it is no longer necessary to use [`VALIDATE CONSTRAINT`](validate-constraint.html) for foreign keys.

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/validate_constraint.html %}
</div>

## Parameters

 Parameter         | Description                                                                 
-------------------+-----------------------------------------------------------------------------
 `table_name`      | The name of the table in which the constraint you'd like to validate lives.
 `constraint_name` | The name of the constraint on `table_name` you'd like to validate.          

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Example

In [`ADD CONSTRAINT`](add-constraint.html), we [added a `CHECK` constraint](add-constraint.html#add-the-check-constraint) like so:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ADD CONSTRAINT check_id_non_zero CHECK (id > 0);
~~~

In order to ensure that the data added to the `orders` table prior to the creation of the `check_id_non_zer` constraint conforms to that constraint, run the following:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders VALIDATE CONSTRAINT check_id_non_zero;
~~~

{{site.data.alerts.callout_info}}
If present in a [`CREATE TABLE`](create-table.html) statement, the table is considered validated because an empty table trivially meets its constraints.
{{site.data.alerts.end}}

## See also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`RENAME CONSTRAINT`](rename-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`CREATE TABLE`](create-table.html)
- [`SHOW JOBS`](show-jobs.html)
