---
title: CREATE STATISTICS
summary: Use the CREATE STATISTICS statement to generate table statistics for the cost-based optimizer to use.
toc: true
---
<span class="version-tag">New in v2.1:</span> Use the `CREATE STATISTICS` [statement](sql-statements.html) to generate table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.

Once you [create a table](create-table.html) and load data into it (e.g., [`INSERT`](insert.html), [`IMPORT`](import.html)), table statistics can be generated. Table statistics help the cost-based optimizer determine the cardinality of the rows used in each query, which helps to predict more accurate costs.

{% include {{ page.version.version }}/misc/experimental-warning.md %}

## Considerations

Each time `CREATE STATISTICS` is used, a new statistic is created without removing any old statistics. To delete all statistics for all tables, use [`DELETE`](#delete-all-statistics).

## Synopsis

~~~ sql
> CREATE STATISTICS <stat_name>
    ON <colname> [, ...]
    FROM <tablename>
~~~

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database.

## Parameters

Parameter      | Description
---------------+---------------
`stat_name`    | The name of the statistic you are creating.
`col_name`     | The name of the column you want to create the statistic for.
`table_name`   | The name of the table you want to create the statistic for.

## Examples

### Create statistics

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS students ON id FROM students_by_list;
~~~

~~~
CREATE STATISTICS
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS student_names ON first_name, last_name FROM students_by_list;
~~~

~~~
CREATE STATISTICS
~~~

## Delete all statistics

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM system.table_statistics WHERE true;
~~~

~~~
DELETE 1
~~~

For more information, see [`DELETE`](delete.html).

## See Also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [SQL Statements](sql-statements.html)
