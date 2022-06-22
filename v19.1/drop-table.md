---
title: DROP TABLE
summary: The DROP TABLE statement removes a table and all its indexes from a database.
toc: true
---

The `DROP TABLE` [statement](sql-statements.html) removes a table and all its indexes from a database.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `DROP` [privilege](authorization.html#assign-privileges) on the specified table(s). If `CASCADE` is used, the user must have the privileges required to drop each dependent object as well.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_table.html %}</section>

## Parameters

Parameter | Description
----------|------------
`IF EXISTS`   | Drop the table if it exists; if it does not exist, do not return an error.
`table_name`  | A comma-separated list of table names. To find table names, use [`SHOW TABLES`](show-tables.html).
`CASCADE` | Drop all objects (such as [constraints](constraints.html) and [views](views.html)) that depend on the table.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.
`RESTRICT`    | _(Default)_ Do not drop the table if any objects (such as [constraints](constraints.html) and [views](views.html)) depend on it.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Remove a table (no dependencies)

In this example, other objects do not depend on the table being dropped.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM bank;
~~~

~~~
+--------------------+
| table_name         |
+--------------------+
| accounts           |
| branches           |
| user_accounts_view |
+--------------------+
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE bank.branches;
~~~

~~~
DROP TABLE
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM bank;
~~~

~~~
+--------------------+
| table_name         |
+--------------------+
| accounts           |
| user_accounts_view |
+--------------------+
(2 rows)
~~~

### Remove a table and dependent objects with `CASCADE`

In this example, a view depends on the table being dropped. Therefore, it's only possible to drop the table while simultaneously dropping the dependent view using `CASCADE`.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM bank;
~~~

~~~
+--------------------+
| table_name         |
+--------------------+
| accounts           |
| user_accounts_view |
+--------------------+
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE bank.accounts;
~~~

~~~
pq: cannot drop table "accounts" because view "user_accounts_view" depends on it
~~~

{% include_cached copy-clipboard.html %}
~~~sql
> DROP TABLE bank.accounts CASCADE;
~~~

~~~
DROP TABLE
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM bank;
~~~

~~~
+------------+
| table_name |
+------------+
+------------+
(0 rows)
~~~

## See also

- [`ALTER TABLE`](alter-table.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`RENAME TABLE`](rename-table.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW TABLES`](show-tables.html)
- [`UPDATE`](update.html)
- [`DELETE`](delete.html)
- [`DROP INDEX`](drop-index.html)
- [`DROP VIEW`](drop-view.html)
- [`SHOW JOBS`](show-jobs.html)
- [Online Schema Changes](online-schema-changes.html)
